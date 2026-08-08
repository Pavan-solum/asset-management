const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('securityAPI', {
  getTelemetry: () => ipcRenderer.invoke('get-telemetry'),
  getHistory: () => ipcRenderer.invoke('get-history'),
  getTenantId: () => ipcRenderer.invoke('get-tenant-id'),
  getEndpointId: () => ipcRenderer.invoke('get-endpoint-id'),
  getManagerUrl: () => ipcRenderer.invoke('get-manager-url'),
  runScan: () => ipcRenderer.invoke('run-scan'),
  runFullScan: () => ipcRenderer.invoke('run-full-scan'),
  runLiveUpdate: () => ipcRenderer.invoke('run-liveupdate'),
  refreshTelemetry: () => ipcRenderer.invoke('refresh-telemetry'),
  openWindowsSecurity: () => ipcRenderer.invoke('open-windows-security'),
  onTelemetryUpdate: (callback) => {
    ipcRenderer.on('telemetry-update', (_, data) => callback(data));
  },
  removeTelemetryListeners: () => {
    ipcRenderer.removeAllListeners('telemetry-update');
  }
});
