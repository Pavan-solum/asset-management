const { desktopCapturer, ipcMain } = require('electron');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// ─── Enterprise Remote Desktop Daemon ─────────────────────────────────────────
class RemoteDaemon {
  constructor() {
    this.activeSession = false;
    this.sessionInterval = null;
    this.quality = '720p'; // '1080p' | '720p' | '480p'
    this.fps = 15;
    this.mainWindow = null;
    this.managerUrl = null;
    this.tenantId = null;
    this.endpointId = null;
    this.overlayWindow = null;
  }

  init({ mainWindow, managerUrl, tenantId, endpointId }) {
    this.mainWindow = mainWindow;
    this.managerUrl = managerUrl;
    this.tenantId = tenantId;
    this.endpointId = endpointId;

    // Listen for IPC remote control events from main process or renderer
    ipcMain.handle('remote:start-session', async (event, params) => {
      return this.startSession(params);
    });

    ipcMain.handle('remote:stop-session', async () => {
      return this.stopSession();
    });

    ipcMain.handle('remote:inject-input', async (event, inputData) => {
      return this.injectInput(inputData);
    });

    ipcMain.handle('remote:execute-cmd', async (event, command) => {
      return this.executeRemoteCmd(command);
    });

    console.log('[RemoteDaemon] Enterprise Remote Desktop service initialized in background.');
    this.startRelayPolling();
  }

  startRelayPolling() {
    const axios = require('axios');

    const poll = async () => {
      if (!this.endpointId || !this.managerUrl) {
        setTimeout(poll, 3000);
        return;
      }

      try {
        const url = `${this.managerUrl}/api/endpoints/${this.endpointId}/remote-relay?role=agent`;
        const headers = {};
        if (process.env.AGENT_SECRET) {
          headers['X-Agent-Token'] = process.env.AGENT_SECRET;
        }

        // GET current state and queued inputs
        const res = await axios.get(url, { headers, timeout: 5000 });
        const { is_active, input_queue } = res.data;

        if (is_active && !this.activeSession) {
          console.log('[RemoteDaemon] Web relay active. Initiating remote session.');
          this.activeSession = true;
        } else if (!is_active && this.activeSession) {
          console.log('[RemoteDaemon] Web relay inactive. Terminating remote session.');
          this.activeSession = false;
        }

        if (this.activeSession) {
          if (Array.isArray(input_queue) && input_queue.length > 0) {
            for (const input of input_queue) {
              if (input.type === 'command') {
                const cmdRes = await this.executeRemoteCmd(input.command);
                await axios.post(url, { commandResult: cmdRes.output || cmdRes.error }, { headers, timeout: 5000 });
              } else {
                await this.injectInput(input);
              }
            }
          }

          const frame = await this.captureScreenFrame();
          if (frame) {
            await axios.post(url, { frame }, { headers, timeout: 5000 });
          }
        }
      } catch (err) {
        console.error('[RemoteDaemon] Relay poll warning:', err.message);
      }

      const nextDelay = this.activeSession ? 500 : 3000;
      setTimeout(poll, nextDelay);
    };

    poll();
  }

  async captureScreenFrame() {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: this.getThumbnailDimensions()
      });

      if (sources && sources.length > 0) {
        const primarySource = sources[0];
        // Convert screen image to JPEG data URL for low-latency transmission
        const jpegDataUrl = primarySource.thumbnail.toDataURL({ imageFormat: 'jpeg', quality: 70 });
        return jpegDataUrl;
      }
      return null;
    } catch (e) {
      console.error('[RemoteDaemon] Frame capture error:', e.message);
      return null;
    }
  }

  getThumbnailDimensions() {
    switch (this.quality) {
      case '1080p': return { width: 1920, height: 1080 };
      case '480p':  return { width: 854, height: 480 };
      case '720p':
      default:      return { width: 1280, height: 720 };
    }
  }

  async startSession(params = {}) {
    if (params.quality) this.quality = params.quality;
    this.activeSession = true;
    console.log(`[RemoteDaemon] Remote session started. Quality: ${this.quality}`);

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('remote:status-changed', { active: true, quality: this.quality });
    }

    return { success: true, message: 'Remote control session active' };
  }

  async stopSession() {
    this.activeSession = false;
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
      this.sessionInterval = null;
    }
    console.log('[RemoteDaemon] Remote control session terminated.');

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('remote:status-changed', { active: false });
    }

    return { success: true };
  }

  async injectInput(input) {
    if (!this.activeSession) return { success: false, reason: 'No active session' };

    const { type, xPct, yPct, button, key } = input;

    try {
      if (type === 'click' || type === 'move' || type === 'rightclick' || type === 'dblclick') {
        if (process.platform === 'win32') {
          // Calculate screen coordinates using PowerShell Windows API mouse simulator
          const psScript = `
            $w = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width
            $h = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height
            $posX = [int]($w * ${xPct})
            $posY = [int]($h * ${yPct})
            Add-Type -TypeDefinition @"
            using System;
            using System.Runtime.InteropServices;
            public class Mouse {
              [DllImport("user32.dll")] public static extern bool SetCursorPos(int X, int Y);
              [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
            }
"@
            [Mouse]::SetCursorPos($posX, $posY)
            ${type === 'click' ? '[Mouse]::mouse_event(0x02, 0, 0, 0, 0); [Mouse]::mouse_event(0x04, 0, 0, 0, 0);' : ''}
            ${type === 'rightclick' ? '[Mouse]::mouse_event(0x08, 0, 0, 0, 0); [Mouse]::mouse_event(0x10, 0, 0, 0, 0);' : ''}
            ${type === 'dblclick' ? '[Mouse]::mouse_event(0x02, 0, 0, 0, 0); [Mouse]::mouse_event(0x04, 0, 0, 0, 0); [Mouse]::mouse_event(0x02, 0, 0, 0, 0); [Mouse]::mouse_event(0x04, 0, 0, 0, 0);' : ''}
          `;
          execAsync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, ' ')}"`, { timeout: 1500 }).catch(() => {});
        }
      } else if (type === 'keydown' && key) {
        if (process.platform === 'win32') {
          const psKey = `
            $wshell = New-Object -ComObject wscript.shell;
            $wshell.SendKeys('${key.replace(/'/g, "''")}');
          `;
          execAsync(`powershell -NoProfile -Command "${psKey.replace(/\n/g, ' ')}"`, { timeout: 1000 }).catch(() => {});
        }
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async executeRemoteCmd(command) {
    if (!command) return { error: 'Empty command' };

    try {
      const shellCmd = process.platform === 'win32'
        ? `powershell -NoProfile -Command "${command.replace(/"/g, '\"')}"`
        : command;

      const { stdout, stderr } = await execAsync(shellCmd, { timeout: 10000, encoding: 'utf8' });
      return { output: stdout || stderr || 'Command executed successfully.' };
    } catch (e) {
      return { error: e.message || 'Execution error' };
    }
  }
}

module.exports = new RemoteDaemon();
