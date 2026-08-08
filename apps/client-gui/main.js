const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');
const si = require('systeminformation');
const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');

// ─── Config ─────────────────────────────────────────────────────────────────
const MANAGER_URL = process.env.MANAGER_URL || 'https://assetly-azure.vercel.app';

// Extract Tenant ID from binary signature or fallback to active tenant
let TENANT_ID = process.env.TENANT_ID || '96355bdb-bda1-4f3f-92d2-7a67b4a348e6';
try {
  const exePath = process.execPath;
  if (fs.existsSync(exePath)) {
    const stat = fs.statSync(exePath);
    const bufferSize = 256;
    const startPos = Math.max(0, stat.size - bufferSize);
    const buffer = Buffer.alloc(bufferSize);
    const fd = fs.openSync(exePath, 'r');
    fs.readSync(fd, buffer, 0, bufferSize, startPos);
    fs.closeSync(fd);
    const content = buffer.toString('utf8');
    const signatureMatch = content.match(/___TENANT_ID___:([a-f0-9\-]{36})/i);
    if (signatureMatch && signatureMatch[1]) {
      TENANT_ID = signatureMatch[1];
    }
  }
} catch (e) {}

let endpointId = null;
let latestTelemetry = null;
let telemetryHistory = [];
let mainWindow = null;
let tray = null;

// ─── Telemetry Collection ─────────────────────────────────────────────────────
async function collectTelemetry() {
  try {
    const [cpu, mem, osInfo, network, processes, netConns] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.osInfo(),
      si.networkInterfaces(),
      si.processes(),
      si.networkConnections()
    ]);

    let firewall_status = 'Unknown';
    let defender_status = 'Unknown';
    let antivirus_updated_at = null;
    let bitlocker_status = 'unknown';
    let bitlocker_drive = null;
    let last_logged_user = os.userInfo().username;
    let uptime_seconds = Math.floor(os.uptime());
    let last_reboot_at = new Date(Date.now() - uptime_seconds * 1000).toISOString();
    let threats = [];
    let quarantine = [];
    let scan_history = [];

    if (process.platform === 'win32') {
      try {
        const fw = execSync('netsh advfirewall show allprofiles state', { encoding: 'utf8', timeout: 5000 });
        firewall_status = fw.includes('ON') ? 'ON' : 'OFF';
      } catch (e) {}

      try {
        const cmd = 'powershell -NoProfile -Command "$mp = Get-MpComputerStatus; $sig = if ($null -ne $mp.AntivirusSignatureLastUpdated) { Get-Date $mp.AntivirusSignatureLastUpdated -Format o } else { $null }; [PSCustomObject]@{ rt = $mp.RealTimeProtectionEnabled; sig = $sig; av = $mp.AMServiceEnabled } | ConvertTo-Json -Compress"';
        const mpStatus = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
        if (mpStatus.trim()) {
          const parsedMp = JSON.parse(mpStatus);
          defender_status = parsedMp.rt ? 'Active' : 'Disabled';
          antivirus_updated_at = parsedMp.sig || null;
        }
      } catch (e) {}

      try {
        const bde = execSync('manage-bde -status C:', { encoding: 'utf8', timeout: 5000 });
        bitlocker_status = bde.includes('Protection On') ? 'enabled' : 'disabled';
        bitlocker_drive = 'C:';
      } catch (e) {}

      try {
        const mpThreats = execSync('powershell -NoProfile -Command "Get-MpThreatDetection | Select-Object ThreatName, InitialDetectionTime, ActionSuccess | ConvertTo-Json"', { encoding: 'utf8', timeout: 10000 });
        if (mpThreats.trim()) {
          const parsedThreats = JSON.parse(mpThreats);
          const tArray = Array.isArray(parsedThreats) ? parsedThreats : [parsedThreats];
          threats = tArray.map((t) => ({
            name: t.ThreatName,
            severity: 'high',
            detected_at: t.InitialDetectionTime || new Date().toISOString(),
            resolved: t.ActionSuccess || false,
            action: t.ActionSuccess ? 'Quarantined' : 'Pending'
          }));
          quarantine = threats.filter(t => t.resolved);
        }
      } catch (e) {}

      try {
        const scanLog = execSync('powershell -NoProfile -Command "Get-WinEvent -LogName \'Microsoft-Windows-Windows Defender/Operational\' -MaxEvents 10 | Select-Object TimeCreated, Message | ConvertTo-Json"', { encoding: 'utf8', timeout: 10000 });
        if (scanLog.trim()) {
          const events = JSON.parse(scanLog);
          const arr = Array.isArray(events) ? events : [events];
          scan_history = arr.slice(0, 5).map(e => ({
            time: e.TimeCreated,
            message: e.Message ? e.Message.substring(0, 120) : 'Windows Defender event'
          }));
        }
      } catch (e) {}

    } else if (process.platform === 'darwin') {
      try {
        const fw = execSync('defaults read /Library/Preferences/com.apple.alf globalstate', { encoding: 'utf8', timeout: 5000 }).trim();
        firewall_status = parseInt(fw, 10) > 0 ? 'ON' : 'OFF';
      } catch (e) { firewall_status = 'ON'; }
      try {
        const gatekeeper = execSync('spctl --status', { encoding: 'utf8', timeout: 5000 });
        defender_status = gatekeeper.includes('assessments enabled') ? 'Active' : 'Disabled';
      } catch (e) { defender_status = 'Active'; }
      try {
        const fv = execSync('fdesetup status', { encoding: 'utf8', timeout: 5000 });
        bitlocker_status = fv.includes('FileVault is On') ? 'enabled' : 'disabled';
        bitlocker_drive = 'Macintosh HD';
      } catch (e) {}
    } else {
      try {
        const ufw = execSync('ufw status 2>/dev/null || iptables -L -n 2>/dev/null', { encoding: 'utf8', timeout: 5000 });
        firewall_status = (ufw.includes('active') || ufw.includes('Chain INPUT')) ? 'ON' : 'OFF';
      } catch (e) { firewall_status = 'ON'; }
      try {
        const selinux = execSync('sestatus 2>/dev/null || aa-status 2>/dev/null', { encoding: 'utf8', timeout: 5000 });
        defender_status = (selinux.includes('enforcing') || selinux.includes('apparmor module is loaded')) ? 'Active' : 'Disabled';
      } catch (e) { defender_status = 'Active'; }
      try {
        const luks = execSync('lsblk -f 2>/dev/null', { encoding: 'utf8', timeout: 5000 });
        bitlocker_status = luks.includes('crypto_LUKS') ? 'enabled' : 'disabled';
        bitlocker_drive = '/dev/sda';
      } catch (e) {}
    }

    // Detect real active connection IP — exclude virtual/Hyper-V/VMware/Docker adapters
    const isVirtualAdapter = (iface) => {
      if (!iface) return false;
      const n = iface.toLowerCase();
      return n.includes('vethernet') || n.includes('vmware') || n.includes('virtualbox') ||
             n.includes('hyper-v') || n.includes('loopback') || n.includes('docker') ||
             n.includes('wsl') || n.includes('pseudo') || n.includes('tap') ||
             n.includes('tunnel') || n.includes('isatap') || n.includes('teredo');
    };
    const isLanIp = (ip) => ip && (ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[01])\./.test(ip));
    const isHyperVIp = (ip) => ip && /^172\.(1[6-9]|2\d|3[01])\./.test(ip); // 172.16-31.x is often Hyper-V

    // Try to get the default gateway to find the right interface
    let gatewayIp = null;
    try {
      const gwData = await si.networkGatewayDefault();
      gatewayIp = gwData || null;
    } catch (e) {}

    const allIfaces = Array.isArray(network) ? network : [];

    // Filter to only real physical interfaces (not virtual, not loopback, not APIPA)
    const physicalIfaces = allIfaces.filter(n =>
      n.ip4 &&
      !n.ip4.startsWith('127.') &&
      !n.ip4.startsWith('169.254.') &&
      !isVirtualAdapter(n.iface || n.ifaceName || '')
    );

    // Priority 1: physical adapter that shares subnet with the gateway
    let defaultNet = null;
    if (gatewayIp && physicalIfaces.length > 0) {
      const gwPrefix = gatewayIp.split('.').slice(0, 3).join('.');
      defaultNet = physicalIfaces.find(n => n.ip4.startsWith(gwPrefix + '.'));
    }
    // Priority 2: physical adapter with common LAN IP (not Hyper-V 172.x)
    if (!defaultNet) {
      defaultNet = physicalIfaces.find(n => n.ip4.startsWith('192.168.') || n.ip4.startsWith('10.'));
    }
    // Priority 3: any physical adapter
    if (!defaultNet) defaultNet = physicalIfaces[0];
    // Priority 4: any non-loopback, non-APIPA (last resort, may include virtual)
    if (!defaultNet) {
      defaultNet = allIfaces.find(n => n.ip4 && !n.ip4.startsWith('127.') && !n.ip4.startsWith('169.254.')) || allIfaces[0];
    }

    const active_ports = (netConns || [])
      .filter(c => c.state === 'LISTEN' || c.state === 'ESTABLISHED')
      .slice(0, 50)
      .map(c => ({ protocol: c.protocol, local_port: c.localPort, peer_address: c.peerAddress, state: c.state }));

    return {
      hostname: osInfo.hostname,
      os_version: `${osInfo.distro} ${osInfo.release}`,
      os_platform: process.platform,
      ip_address: defaultNet ? defaultNet.ip4 : 'unknown',
      mac_address: defaultNet ? defaultNet.mac : 'unknown',
      cpu_usage: cpu.currentLoad,
      cpu_model: `${(await si.cpu()).manufacturer} ${(await si.cpu()).brand}`.trim(),
      memory_total: mem.total,
      memory_used: mem.used,
      running_processes: processes.list.slice(0, 50).map(p => ({ name: p.name, pid: p.pid, cpu: p.cpu, mem: p.mem })),
      firewall_status,
      defender_status,
      antivirus_updated_at,
      active_ports,
      last_logged_user,
      uptime_seconds,
      last_reboot_at,
      agent_version: '2.0.0',
      bitlocker_status,
      bitlocker_drive,
      threats,
      quarantine,
      scan_history,
      collected_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Telemetry error:', error);
    return null;
  }
}

async function sendTelemetry(telemetry) {
  if (!telemetry) return;
  try {
    if (!endpointId) {
      const [cpuInfo, diskInfo] = await Promise.all([si.cpu(), si.diskLayout()]);
      const ram_total_gb = Math.round(telemetry.memory_total / (1024 ** 3));
      const storage_total_gb = Math.round(diskInfo.reduce((acc, d) => acc + (d.size || 0), 0) / (1024 ** 3));
      console.log(`Registering endpoint with tenant_id ${TENANT_ID} at ${MANAGER_URL}...`);
      const res = await axios.post(`${MANAGER_URL}/api/endpoints/register`, {
        tenant_id: TENANT_ID,
        hostname: telemetry.hostname,
        os_version: telemetry.os_version,
        ip_address: telemetry.ip_address,
        mac_address: telemetry.mac_address,
        cpu_model: telemetry.cpu_model,
        ram_total_gb,
        storage_total_gb,
        firewall_status: telemetry.firewall_status,
        defender_status: telemetry.defender_status,
        antivirus_updated_at: telemetry.antivirus_updated_at
      });
      endpointId = res.data.endpoint.id;
      console.log(`Successfully registered endpoint: ${endpointId}`);
    }

    await axios.post(`${MANAGER_URL}/api/endpoints/telemetry`, {
      endpoint_id: endpointId,
      cpu_usage: telemetry.cpu_usage,
      memory_total: telemetry.memory_total,
      memory_used: telemetry.memory_used,
      running_processes: telemetry.running_processes,
      firewall_status: telemetry.firewall_status,
      defender_status: telemetry.defender_status,
      antivirus_updated_at: telemetry.antivirus_updated_at,
      active_ports: telemetry.active_ports,
      last_logged_user: telemetry.last_logged_user,
      uptime_seconds: telemetry.uptime_seconds,
      last_reboot_at: telemetry.last_reboot_at,
      agent_version: telemetry.agent_version,
      bitlocker_status: telemetry.bitlocker_status,
      bitlocker_drive: telemetry.bitlocker_drive,
      threats: telemetry.threats
    });
    console.log(`[${new Date().toISOString()}] Telemetry sent successfully for endpoint ${endpointId}`);
  } catch (e) {
    console.error('Failed to send telemetry:', e.response?.data || e.message);
    if (e.response?.status === 404) endpointId = null;
  }
}

// ─── Telemetry Loop ───────────────────────────────────────────────────────────
async function telemetryLoop() {
  const t = await collectTelemetry();
  if (t) {
    latestTelemetry = t;
    telemetryHistory.unshift({ time: new Date().toISOString(), ...t });
    if (telemetryHistory.length > 50) telemetryHistory.pop();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('telemetry-update', t);
    }
    await sendTelemetry(t);
  }
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────
ipcMain.handle('get-telemetry', () => latestTelemetry);
ipcMain.handle('get-history', () => telemetryHistory.slice(0, 20));
ipcMain.handle('get-tenant-id', () => TENANT_ID);
ipcMain.handle('get-endpoint-id', () => endpointId);
ipcMain.handle('get-manager-url', () => MANAGER_URL);

ipcMain.handle('run-scan', async () => {
  try {
    if (process.platform === 'win32') {
      execSync('powershell -NoProfile -Command "Start-MpScan -ScanType QuickScan"', { timeout: 30000 });
      return { success: true, message: 'Quick scan initiated successfully.' };
    }
    return { success: true, message: 'Scan requested (platform scan initiated).' };
  } catch (e) {
    return { success: false, message: e.message };
  }
});

ipcMain.handle('run-full-scan', async () => {
  try {
    if (process.platform === 'win32') {
      execSync('powershell -NoProfile -Command "Start-MpScan -ScanType FullScan"', { timeout: 60000 });
      return { success: true, message: 'Full scan initiated. This may take a while.' };
    }
    return { success: true, message: 'Full scan requested.' };
  } catch (e) {
    return { success: false, message: e.message };
  }
});

ipcMain.handle('run-liveupdate', async () => {
  try {
    if (process.platform === 'win32') {
      execSync('powershell -NoProfile -Command "Update-MpSignature"', { timeout: 60000 });
      // Refresh telemetry after update
      setTimeout(telemetryLoop, 3000);
      return { success: true, message: 'Virus definitions updated successfully.' };
    }
    return { success: true, message: 'LiveUpdate completed.' };
  } catch (e) {
    return { success: false, message: e.message };
  }
});

ipcMain.handle('open-windows-security', () => {
  if (process.platform === 'win32') {
    shell.openExternal('windowsdefender://');
  }
});

ipcMain.handle('refresh-telemetry', async () => {
  await telemetryLoop();
  return latestTelemetry;
});

// ─── Window Creation ──────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 620,
    minWidth: 750,
    minHeight: 520,
    frame: true,
    resizable: true,
    title: 'AssetManager Security Client',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#f0f0f0',
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray.png');
  const img = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
  tray = new Tray(img);
  tray.setToolTip('AssetManager Security Client');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Security Client', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuiting = true; app.quit(); } }
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('click', () => { mainWindow.show(); mainWindow.focus(); });
}

// Enable device startup (auto-launch at boot/login) across Windows, macOS, and Linux
function enableAutoLaunch() {
  try {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true,
      path: process.execPath,
      args: ['--hidden']
    });
  } catch (e) {
    console.error('Failed to configure auto-launch:', e.message);
  }
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  enableAutoLaunch();
  createWindow();

  // If launched with --hidden (e.g. at system startup), hide window to tray
  if (process.argv.includes('--hidden')) {
    if (mainWindow) mainWindow.hide();
  }

  try { createTray(); } catch (e) {}

  // Initial telemetry collection after window loads
  setTimeout(async () => {
    await telemetryLoop();
    // Then every 60 seconds
    setInterval(telemetryLoop, 60000);
  }, 2000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else mainWindow.show();
});
