const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec, execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const http = require('http');

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
    const defaultInterface = getDefaultRouteInterface();
    const candidates = [];

    for (const [devName, iface] of Object.entries(interfaces)) {
        for (const alias of iface || []) {
            if (alias.family !== 'IPv4' || alias.internal || alias.address === '127.0.0.1') continue;
            if (isIgnoredInterface(devName) || isIgnoredAddress(alias.address)) continue;

            candidates.push({
                devName,
                address: alias.address,
                score: scoreInterfaceAddress(devName, alias.address, defaultInterface)
            });
        }
    }

    candidates.sort((left, right) => right.score - left.score);
    return candidates[0] ? candidates[0].address : '0.0.0.0';
}

function getDefaultRouteInterface() {
    if (process.platform !== 'linux') return null;

    try {
        const output = execSync('ip route show default', { encoding: 'utf8', timeout: 2000 });
        const match = output.match(/\bdev\s+(\S+)/);
        return match ? match[1] : null;
    } catch (_error) {
        return null;
    }
}

function isIgnoredInterface(name = '') {
    const normalized = name.toLowerCase();
    return (
        normalized.includes('docker') ||
        normalized.startsWith('br-') ||
        normalized.startsWith('veth') ||
        normalized.startsWith('virbr') ||
        normalized.startsWith('tailscale') ||
        normalized.startsWith('zt') ||
        normalized.startsWith('wg') ||
        normalized.startsWith('tun') ||
        normalized.startsWith('tap') ||
        normalized.startsWith('ogstun')
    );
}

function isIgnoredAddress(address = '') {
    if (address.startsWith('169.254.')) return true; // link-local, not classroom LAN
    if (address.startsWith('100.')) return true; // tailscale / carrier-grade NAT
    return false;
}

function isPrivateLanAddress(address = '') {
    const parts = address.split('.').map((part) => Number(part));
    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;

    const [a, b] = parts;
    return (
        a === 10 ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168)
    );
}

function scoreInterfaceAddress(devName, address, defaultInterface) {
    let score = 0;
    if (isPrivateLanAddress(address)) score += 100;
    if (defaultInterface && devName === defaultInterface) score += 1000;
    if (/^(wl|wlan|wifi|en|eth)/i.test(devName)) score += 50;
    return score;
}

function checkLocalHealth(port, callback) {
    const request = http.get({
        host: '127.0.0.1',
        port,
        path: '/health',
        timeout: 3000
    }, (response) => {
        response.resume();
        callback(response.statusCode >= 200 && response.statusCode < 500);
    });

    request.on('timeout', () => {
        request.destroy();
        callback(false);
    });
    request.on('error', () => callback(false));
}

function dockerErrorMessage(error, stderr) {
    const details = String(stderr || error?.message || '').trim();
    const linuxHint = 'Docker Engine/Compose is not reachable. On Linux, install Docker Engine and run: sudo systemctl start docker';
    const windowsHint = 'Docker Engine/Compose is not reachable. Install/start Docker Engine or Docker Desktop with WSL2 backend.';
    const macHint = 'Docker Engine/Compose is not reachable. Start Docker Engine or Docker Desktop.';

    const hint = process.platform === 'linux'
        ? linuxHint
        : process.platform === 'win32'
            ? windowsHint
            : macHint;

    return details ? `${hint}\n${details}` : hint;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        resizable: true,
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

    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('docker-status', { state: 'starting' });
    });

    exec(`docker compose up -d`, { ...execOptions, timeout: 180000 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting Docker: ${error.message}`);
            const env = getEnv();
            checkLocalHealth(env.FRONTEND_PORT || '6050', (isHealthy) => {
                if (isHealthy) {
                    mainWindow.webContents.send('docker-status', { state: 'running' });
                    return;
                }

                mainWindow.webContents.send('docker-status', {
                    state: 'error',
                    message: dockerErrorMessage(error, stderr)
                });
            });
            return;
        }
        mainWindow.webContents.send('docker-status', { state: 'running' });
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
