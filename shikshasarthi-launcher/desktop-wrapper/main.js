const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

let mainWindow;

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '0.0.0.0';
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Remove menu bar
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile('index.html');

    // Identify paths
    const isDev = !app.isPackaged;
    const resourcesPath = isDev ? path.join(__dirname, '..') : path.join(process.resourcesPath, 'launcher-data');
    const composePath = path.join(resourcesPath, 'docker-compose.yml');

    console.log(`Starting Docker Compose from: ${composePath}`);

    // In production, we change the working directory to where the compose file is
    const execOptions = { cwd: resourcesPath };

    exec(`docker compose up -d`, execOptions, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting Docker: ${error.message}`);
            mainWindow.webContents.send('docker-status', 'error');
            return;
        }
        console.log('Docker containers started successfully.');
        mainWindow.webContents.send('docker-status', 'running');
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    // Optional: Stop containers on close? 
    // Usually school servers should stay up, but we follow the UI lifecycle here.
    // exec('docker compose down');
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-server-info', async () => {
    return {
        ip: getLocalIp(),
        port: 6091
    };
});
