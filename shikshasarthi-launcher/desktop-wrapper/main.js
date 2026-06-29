const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const http = require('http');
const net = require('net');

let mainWindow;
let mongoProcess = null;
let backendProcess = null;

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

function readEnvFile(resourcesPath) {
    const envPath = path.join(resourcesPath, '.env');
    const env = {};

    if (!fs.existsSync(envPath)) return env;

    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) return;

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim();
        if (key) env[key] = value;
    });

    return env;
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

function getRuntimePaths(resourcesPath) {
    const runtimeRoot = path.join(app.getPath('userData'), 'runtime');
    const dataRoot = path.join(app.getPath('userData'), 'data');
    const mongoPort = process.env.SHIKSHA_MONGO_PORT || '27018';

    return {
        runtimeRoot,
        dataRoot,
        dbPath: path.join(dataRoot, 'mongodb'),
        uploadRoot: path.join(dataRoot, 'uploads'),
        backupDir: path.join(dataRoot, 'backups'),
        updateDir: path.join(dataRoot, 'updates'),
        audioCacheDir: path.join(dataRoot, 'audio-cache'),
        mongoPort,
        mongoUri: `mongodb://127.0.0.1:${mongoPort}/app`,
        frontendDistDir: path.join(resourcesPath, 'dist'),
        seedPath: path.join(resourcesPath, 'backend', 'data', 'school-seed.ejson'),
    };
}

function findMongoBinary(resourcesPath) {
    const binaryName = process.platform === 'win32' ? 'mongod.exe' : 'mongod';
    const candidates = [
        path.join(resourcesPath, 'mongodb', 'bin', binaryName),
        path.join(resourcesPath, 'mongodb-runtime', 'bin', binaryName),
        binaryName,
    ];

    return candidates.find((candidate) => {
        if (candidate === binaryName) return true;
        return fs.existsSync(candidate);
    });
}

function ensureRuntimeDirectories(paths) {
    [
        paths.runtimeRoot,
        paths.dataRoot,
        paths.dbPath,
        paths.uploadRoot,
        paths.backupDir,
        paths.updateDir,
        paths.audioCacheDir,
    ].forEach((directory) => fs.mkdirSync(directory, { recursive: true }));
}

function waitForTcpPort(port, timeoutMs = 30000) {
    const startedAt = Date.now();

    return new Promise((resolve, reject) => {
        const probe = () => {
            const socket = net.createConnection({ host: '127.0.0.1', port: Number(port) });

            socket.once('connect', () => {
                socket.destroy();
                resolve();
            });
            socket.once('error', () => {
                socket.destroy();
                if (Date.now() - startedAt > timeoutMs) {
                    reject(new Error(`Timed out waiting for MongoDB on port ${port}`));
                    return;
                }
                setTimeout(probe, 500);
            });
        };

        probe();
    });
}

function runNodeScript(scriptPath, args, env) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [scriptPath, ...args], {
            cwd: path.dirname(scriptPath),
            env: {
                ...process.env,
                ...env,
                ELECTRON_RUN_AS_NODE: '1',
            },
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
        child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
        child.on('error', reject);
        child.on('exit', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
                return;
            }
            reject(new Error(stderr || stdout || `Node script failed with exit code ${code}`));
        });
    });
}

async function startLocalRuntime(resourcesPath) {
    const paths = getRuntimePaths(resourcesPath);
    const fileEnv = readEnvFile(resourcesPath);
    const mongoBinary = findMongoBinary(resourcesPath);

    if (!mongoBinary) {
        throw new Error('Bundled MongoDB runtime is missing. Reinstall ShikshaSarthi using the latest installer.');
    }

    ensureRuntimeDirectories(paths);

    mongoProcess = spawn(mongoBinary, [
        '--dbpath', paths.dbPath,
        '--bind_ip', '127.0.0.1',
        '--port', String(paths.mongoPort),
        '--quiet',
    ], {
        cwd: paths.runtimeRoot,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    mongoProcess.on('exit', (code) => {
        if (code !== 0 && mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('runtime-status', {
                state: 'error',
                message: `Local MongoDB process exited with code ${code}.`,
            });
        }
    });

    await waitForTcpPort(paths.mongoPort);

    const runtimeEnv = {
        ...fileEnv,
        NODE_ENV: 'production',
        APP_MODE: fileEnv.APP_MODE || 'local-school',
        USE_LOCAL_DB: 'true',
        PORT: fileEnv.FRONTEND_PORT || '6050',
        FRONTEND_PORT: fileEnv.FRONTEND_PORT || '6050',
        FRONTEND_DIST_DIR: paths.frontendDistDir,
        MONGO_URI: paths.mongoUri,
        MONGO_URI_LOCAL: paths.mongoUri,
        SYNC_AUTO_ENABLED: fileEnv.SYNC_AUTO_ENABLED || 'true',
        SYNC_NODE_ROLE: fileEnv.SYNC_NODE_ROLE || 'local',
        SYNC_SOURCE_URI: fileEnv.SYNC_SOURCE_URI || fileEnv.MONGO_URI_REMOTE || '',
        SYNC_SOURCE_DB_NAME: fileEnv.SYNC_SOURCE_DB_NAME || 'app',
        UPLOAD_ROOT: paths.uploadRoot,
        BACKUP_DIR: paths.backupDir,
        UPDATE_DOWNLOAD_DIR: path.join(paths.updateDir, 'downloaded'),
        UPDATE_INSTALL_DIR: path.join(paths.updateDir, 'staged'),
        UPDATE_ROLLBACK_DIR: path.join(paths.updateDir, 'rollback'),
        AUDIO_CACHE_DIR: paths.audioCacheDir,
        LOCAL_UPLOADS_ENABLED: 'true',
        BACKUP_ENABLED: 'true',
        AWS_SYNC_MARK_UPLOADED_RECORDS: fileEnv.AWS_SYNC_MARK_UPLOADED_RECORDS || 'true',
        AWS_SYNC_SCOPE: fileEnv.AWS_SYNC_SCOPE || 'global',
    };

    const importScript = path.join(resourcesPath, 'backend', 'scripts', 'importSchoolSeed.js');
    if (fs.existsSync(paths.seedPath) && fs.existsSync(importScript)) {
        await runNodeScript(importScript, [paths.seedPath], runtimeEnv);
    }

    const backendScript = path.join(resourcesPath, 'backend', 'index.js');
    backendProcess = spawn(process.execPath, [backendScript], {
        cwd: path.join(resourcesPath, 'backend'),
        env: {
            ...process.env,
            ...runtimeEnv,
            ELECTRON_RUN_AS_NODE: '1',
        },
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    backendProcess.on('exit', (code) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('runtime-status', {
                state: 'error',
                message: `Local backend process exited with code ${code}.`,
            });
        }
    });

    await waitForHttpHealth(runtimeEnv.PORT);
}

function waitForHttpHealth(port, timeoutMs = 45000) {
    const startedAt = Date.now();

    return new Promise((resolve, reject) => {
        const probe = () => {
            checkLocalHealth(port, (ok) => {
                if (ok) {
                    resolve();
                    return;
                }
                if (Date.now() - startedAt > timeoutMs) {
                    reject(new Error(`Timed out waiting for backend health on port ${port}`));
                    return;
                }
                setTimeout(probe, 750);
            });
        };

        probe();
    });
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
    ensureEnvFile(resourcesPath);

    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('runtime-status', { state: 'starting' });
    });

    startLocalRuntime(resourcesPath)
        .then(() => {
            mainWindow.webContents.send('runtime-status', { state: 'running' });
        })
        .catch((error) => {
            console.error(`Error starting local runtime: ${error.message}`);
            mainWindow.webContents.send('runtime-status', {
                state: 'error',
                message: error.message,
            });
        });
}
ipcMain.on('open-external', (event, url) => {
    const { shell } = require('electron');
    shell.openExternal(url);
});

app.whenReady().then(() => {
    createWindow();
});

app.on('before-quit', () => {
    if (backendProcess && !backendProcess.killed) backendProcess.kill();
    if (mongoProcess && !mongoProcess.killed) mongoProcess.kill();
});

ipcMain.handle('get-server-info', async () => {
    const env = getEnv();
    return {
        ip: getLocalIp(),
        port: env.FRONTEND_PORT || '6050',
        role: env.NODE_ROLE || 'SCHOOL'
    };
});
