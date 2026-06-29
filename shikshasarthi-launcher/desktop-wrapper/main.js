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
        ? path.join(__dirname, '..', '..', '.env')
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

function ensureEnvFile(resourcesPath) {
    const envPath = path.join(resourcesPath, '.env');
    const examplePath = path.join(resourcesPath, '.env.local-school.example');

    if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
    }
}

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                // Ignore carrier-grade NAT and private overlay ranges for the classroom LAN URL.
                if (alias.address.startsWith('100.')) continue;
                
                // Ignore docker/bridge interfaces
                if (devName.includes('docker') || devName.includes('br-') || devName.includes('veth')) continue;
                
                return alias.address;
            }
        }
    }
    return '0.0.0.0';
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
    const resourcesPath = isDev ? path.join(__dirname, '..', '..') : path.join(process.resourcesPath, 'launcher-data');
    const execOptions = { cwd: resourcesPath, windowsHide: true, shell: true };
    ensureEnvFile(resourcesPath);

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
    return {
        ip: getLocalIp(),
        port: env.FRONTEND_PORT || '6050',
        role: env.NODE_ROLE || 'SCHOOL'
    };
});
