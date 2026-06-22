const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getServerInfo: () => ipcRenderer.invoke('get-server-info'),
    onDockerStatus: (callback) => ipcRenderer.on('docker-status', (event, status) => callback(status))
});
