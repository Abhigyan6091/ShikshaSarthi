const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');

let mainWindow;

// Helper to read .env manually since dotenv is not a dependency
function getEnv() {
    const isDev = !app.isPackaged;
    const envPath = isDev 
        ? path.join(__dirname, '..', '.env') 
        : path.join(process.resourcesPath, 'launcher-data', '.env');
    
    const env = {};
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) env[key.trim()] = value.trim();
        });
    }
    return env;
}

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                // Ignore docker and tailscale interfaces for LAN IP
                if (!devName.includes('docker') && !devName.includes('br-') && !devName.includes('tailscale')) {
                    return alias.address;
                }
            }
        }
    }
    return '0.0.0.0';
}

async function checkTailscale() {
    return new Promise((resolve) => {
        // Simple check if tailscale0 interface exists
        const interfaces = os.networkInterfaces();
        const hasTailscale = Object.keys(interfaces).some(name => name.includes('tailscale'));
        resolve(hasTailscale);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        resizable: true,
        icon: path.join(__dirname, 'icon.ico'),
        title: 'ShikshaSarthi Hub',
        show: false,
        backgroundColor: '#0f172a',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    const isDev = !app.isPackaged;
    const resourcesPath = isDev ? path.join(__dirname, '..') : path.join(process.resourcesPath, 'launcher-data');
    const execOptions = { cwd: resourcesPath, windowsHide: true, shell: true };

    // Set a timeout of 60 seconds to prevent hanging indefinitely
    exec(`docker compose up -d`, { ...execOptions, timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting Docker: ${error.message}`);
            // Send specific error details to UI if possible
            mainWindow.webContents.send('docker-status', 'error');
            return;
        }
        mainWindow.webContents.send('docker-status', 'running');
    });
}
ipcMain.on('open-external', (event, url) => {
    const { shell } = require('electron');
    shell.openExternal(url);
});

app.whenReady().then(() => {
    createWindow();
});

ipcMain.handle('get-server-info', async () => {
    const env = getEnv();
    const isTailscaleActive = await checkTailscale();
    return {
        ip: getLocalIp(),
        port: env.PORT || 6091,
        role: env.NODE_ROLE || 'SCHOOL',
        tailscale: isTailscaleActive
    };
});
