const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getServerInfo: () => ipcRenderer.invoke('get-server-info'),
    onRuntimeStatus: (callback) => ipcRenderer.on('runtime-status', (event, status) => callback(status)),
    openExternal: (url) => ipcRenderer.send('open-external', url),
    installUpdate: (installerPath) => ipcRenderer.invoke('install-update', installerPath)
});
