const si = require('systeminformation');
const axios = require('axios');
const { execSync } = require('child_process');

const MANAGER_URL = process.env.MANAGER_URL || 'https://asset-management-245s-bxpt7v82l-pavan-kumar-v-projects.vercel.app';
const TENANT_ID = process.env.TENANT_ID || '11111111-1111-1111-1111-111111111111';
let endpointId = process.env.ENDPOINT_ID || null;
let command_results = [];

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
    let antivirus_updated_at = 'Unknown';
    let bitlocker_status = 'unknown';
    let bitlocker_drive = null;
    let last_logged_user = require('os').userInfo().username;
    let uptime_seconds = Math.floor(require('os').uptime());
    let last_reboot_at = new Date(Date.now() - uptime_seconds * 1000).toISOString();
    let agent_version = '1.0.0';
    let threats = [];

    if (process.platform === 'win32') {
      try {
        const fw = execSync('netsh advfirewall show allprofiles state', { encoding: 'utf8' });
        firewall_status = fw.includes('ON') ? 'ON' : 'OFF';
      } catch(e) {}
      
      try {
        const cmd = 'powershell -NoProfile -Command "$mp = Get-MpComputerStatus; $sig = if ($null -ne $mp.AntivirusSignatureLastUpdated) { Get-Date $mp.AntivirusSignatureLastUpdated -Format o } else { $null }; [PSCustomObject]@{ rt = $mp.RealTimeProtectionEnabled; sig = $sig } | ConvertTo-Json -Compress"';
        const mpStatus = execSync(cmd, { encoding: 'utf8' });
        if (mpStatus.trim()) {
          const parsedMp = JSON.parse(mpStatus);
          defender_status = parsedMp.rt ? 'Active' : 'Disabled';
          antivirus_updated_at = parsedMp.sig || 'Unknown';
        }
      } catch(e) {}

      try {
        const bde = execSync('manage-bde -status C:', { encoding: 'utf8' });
        if (bde.includes('Protection On')) {
          bitlocker_status = 'enabled';
        } else if (bde.includes('Protection Off')) {
          bitlocker_status = 'disabled';
        }
        bitlocker_drive = 'C:';
      } catch(e) {}

      try {
        const mpThreats = execSync('powershell -NoProfile -Command "Get-MpThreatDetection | Select-Object ThreatName, InitialDetectionTime, ActionSuccess | ConvertTo-Json"', { encoding: 'utf8' });
        if (mpThreats.trim()) {
          const parsedThreats = JSON.parse(mpThreats);
          const tArray = Array.isArray(parsedThreats) ? parsedThreats : [parsedThreats];
          threats = tArray.map((t) => ({
            threat_type: t.ThreatName,
            severity: 'high',
            description: 'Detected by Windows Defender',
            detected_at: t.InitialDetectionTime || new Date().toISOString(),
            resolved: t.ActionSuccess || false
          }));
        }
      } catch(e) {}
    }

    const active_ports = netConns
      .filter(c => c.state === 'LISTEN' || c.state === 'ESTABLISHED')
      .slice(0, 50)
      .map(c => ({
        protocol: c.protocol,
        local_address: c.localAddress,
        local_port: c.localPort,
        peer_address: c.peerAddress,
        peer_port: c.peerPort,
        state: c.state
      }));

    // Get default network interface MAC and IP
    const defaultNet = Array.isArray(network) ? network.find(n => n.ip4) || network[0] : network;

    return {
      hostname: osInfo.hostname,
      os_version: `${osInfo.distro} ${osInfo.release}`,
      ip_address: defaultNet ? defaultNet.ip4 : 'unknown',
      mac_address: defaultNet ? defaultNet.mac : 'unknown',
      cpu_usage: cpu.currentLoad,
      memory_total: mem.total,
      memory_used: mem.used,
      running_processes: processes.list.slice(0, 50).map(p => ({
        name: p.name,
        pid: p.pid,
        cpu: p.cpu,
        mem: p.mem
      })),
      firewall_status,
      defender_status,
      antivirus_updated_at,
      active_ports,
      last_logged_user,
      uptime_seconds,
      last_reboot_at,
      agent_version,
      bitlocker_status,
      bitlocker_drive,
      threats
    };
  } catch (error) {
    console.error('Error collecting telemetry:', error);
    return null;
  }
}

async function registerEndpoint(telemetry) {
  try {
    // Collect static hardware info and updates once per registration
    const [cpuInfo, diskInfo] = await Promise.all([
      si.cpu(),
      si.diskLayout()
    ]);

    let windows_updates = [];
    let installed_apps = [];
    try {
      if (process.platform === 'win32') {
        const out = execSync('systeminfo', { encoding: 'utf8' });
        windows_updates = out.split('\n')
          .filter(l => l.includes('[') && l.includes(']: KB'))
          .map(l => l.split(']: ')[1].trim());
          
        const appsOut = execSync('powershell -NoProfile -Command "Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, DisplayVersion, Publisher, InstallDate | Where-Object { $_.DisplayName } | ConvertTo-Json"', { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
        if (appsOut.trim()) {
          const parsedApps = JSON.parse(appsOut);
          const aArray = Array.isArray(parsedApps) ? parsedApps : [parsedApps];
          installed_apps = aArray.map((a) => ({
            app_name: a.DisplayName,
            version: a.DisplayVersion || null,
            publisher: a.Publisher || null,
            install_date: a.InstallDate ? `${a.InstallDate.substring(0,4)}-${a.InstallDate.substring(4,6)}-${a.InstallDate.substring(6,8)}` : null,
            cve_count: 0,
            cve_ids: []
          }));
        }
      }
    } catch (e) {
      console.log('Could not fetch updates or apps:', e.message);
    }

    const ram_total_gb = Math.round(telemetry.memory_total / (1024 * 1024 * 1024));
    const storage_total_gb = Math.round(diskInfo.reduce((acc, disk) => acc + (disk.size || 0), 0) / (1024 * 1024 * 1024));

    const response = await axios.post(`${MANAGER_URL}/api/endpoints/register`, {
      tenant_id: TENANT_ID,
      hostname: telemetry.hostname,
      os_version: telemetry.os_version,
      ip_address: telemetry.ip_address,
      mac_address: telemetry.mac_address,
      cpu_model: `${cpuInfo.manufacturer} ${cpuInfo.brand}`.trim(),
      ram_total_gb,
      storage_total_gb,
      windows_updates,
      installed_apps
    });
    
    endpointId = response.data.endpoint.id;
    console.log(`Registered as endpoint: ${endpointId}`);
  } catch (error) {
    console.error('Failed to register:', error.message);
  }
}

async function sendTelemetry() {
  const telemetry = await collectTelemetry();
  if (!telemetry) return;

  if (!endpointId) {
    await registerEndpoint(telemetry);
    if (!endpointId) return; // Still failed
  }

  const currentResults = [...command_results];
  command_results = [];

  try {
    const response = await axios.post(`${MANAGER_URL}/api/endpoints/telemetry`, {
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
      threats: telemetry.threats,
      command_results: currentResults
    });
    console.log(`[${new Date().toISOString()}] Telemetry sent successfully.`);

    if (response.data && Array.isArray(response.data.pending_commands)) {
      for (const cmd of response.data.pending_commands) {
        console.log(`[!] Executing received command: ${cmd.command}`);
        let status = 'completed';
        let result = '';
        try {
          if (cmd.command === 'force-scan') {
            result = execSync('powershell -NoProfile -Command "Start-MpScan -ScanType QuickScan"', { encoding: 'utf8' });
          } else if (cmd.command === 'isolate') {
            result = execSync('netsh advfirewall firewall add rule name="Assetly_Isolate_Demo" dir=out action=block remoteport=9999 protocol=TCP', { encoding: 'utf8' });
            console.log('Safe Demo Isolation applied (blocked port 9999)');
          } else if (cmd.command === 'sync') {
            await registerEndpoint(telemetry);
            result = 'Sync completed successfully';
          } else {
            throw new Error(`Unknown command: ${cmd.command}`);
          }
        } catch (e) {
          status = 'failed';
          result = e.message || String(e);
          console.error(`Command ${cmd.command} failed:`, result);
        }
        command_results.push({ id: cmd.id, status, result: String(result).substring(0, 1000) });
      }
    }
  } catch (error) {
    console.error('Failed to send telemetry:', error.message);
    // restore results so we don't drop them
    command_results = [...currentResults, ...command_results];
    if (error.response && error.response.status === 404) {
       // Endpoint might have been deleted, re-register
       endpointId = null;
    }
  }
}

console.log('Starting Endpoint Security Client...');
sendTelemetry();
setInterval(sendTelemetry, 60000); // Every minute
