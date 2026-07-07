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

function getPackagedAppVersion() {
    try {
        return app.getVersion();
    } catch (_error) {
        return '1.0.20';
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

function getDataBaseDir() {
    // School data (local DB, uploads, synced audio/video, backups, update cache)
    // lives under a shared, upgrade-safe location separate from the app code in
    // Program Files. On Windows that is ProgramData so every account on a lab PC
    // shares one database and updates never touch it.
    if (process.platform === 'win32') {
        const programData = process.env.PROGRAMDATA || 'C:\\ProgramData';
        return path.join(programData, 'ShikshaSarthi');
    }
    return app.getPath('userData');
}

function getRuntimePaths(resourcesPath) {
    const baseDir = getDataBaseDir();
    const runtimeRoot = path.join(baseDir, 'runtime');
    const dataRoot = path.join(baseDir, 'data');
    const mongoPort = process.env.SHIKSHA_MONGO_PORT || '27018';

    return {
        baseDir,
        runtimeRoot,
        dataRoot,
        dbPath: path.join(dataRoot, 'mongodb'),
        uploadRoot: path.join(dataRoot, 'uploads'),
        backupDir: path.join(dataRoot, 'backups'),
        updateDir: path.join(dataRoot, 'updates'),
        audioCacheDir: path.join(dataRoot, 'audio-cache'),
        logDir: path.join(dataRoot, 'logs'),
        mongoPort,
        mongoUri: `mongodb://127.0.0.1:${mongoPort}/app`,
        frontendDistDir: path.join(resourcesPath, 'dist'),
        seedPath: path.join(resourcesPath, 'backend', 'data', 'school-seed.ejson'),
    };
}

// If a previous build kept its database under the per-user userData path,
// copy it once into the new shared data root so testers don't lose data.
function migrateLegacyData(paths) {
    try {
        if (fs.existsSync(paths.dbPath) && fs.readdirSync(paths.dbPath).length > 0) return;
        const legacyDbPath = path.join(app.getPath('userData'), 'data', 'mongodb');
        if (legacyDbPath === paths.dbPath) return;
        if (fs.existsSync(legacyDbPath) && fs.readdirSync(legacyDbPath).length > 0) {
            fs.mkdirSync(paths.dbPath, { recursive: true });
            fs.cpSync(legacyDbPath, paths.dbPath, { recursive: true });
        }
    } catch (error) {
        console.error(`Legacy data migration skipped: ${error.message}`);
    }
}

// ----- Delta ("app-bundle") updates -----
// The app (React dist + backend JS) can be swapped without reinstalling the
// heavy runtime (Electron/MongoDB/VC++). Bundles are extracted into a writable,
// versioned folder under ProgramData; a pointer file selects the active one.
// The baseline shipped inside the installer (resourcesPath) is always the
// fallback, so a bad/missing bundle can never prevent the app from starting.

function getAppBundleRoot() {
    return path.join(getDataBaseDir(), 'app');
}

function getAppPointerFile() {
    return path.join(getAppBundleRoot(), 'current.json');
}

function readAppPointer() {
    try {
        const file = getAppPointerFile();
        if (!fs.existsSync(file)) return null;
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (_error) {
        return null;
    }
}

function isValidAppDir(dir) {
    return Boolean(
        dir &&
        fs.existsSync(path.join(dir, 'dist', 'index.html')) &&
        fs.existsSync(path.join(dir, 'backend', 'index.js'))
    );
}

// Directory the running app code should load from: the pointed-to bundle if it
// is present and structurally valid, else the installer baseline.
function resolveActiveAppRoot(resourcesPath) {
    const pointer = readAppPointer();
    if (pointer && pointer.path && isValidAppDir(pointer.path)) {
        return { dir: pointer.path, version: pointer.version || null, isBaseline: false };
    }
    return { dir: resourcesPath, version: null, isBaseline: true };
}

// Drop the active bundle pointer so the next start falls back to the baseline.
// Used to self-heal when a bundle fails to boot.
function revertToBaselineAppRoot() {
    try {
        const file = getAppPointerFile();
        if (fs.existsSync(file)) fs.rmSync(file, { force: true });
    } catch (_error) {
        // ignore
    }
}

function extractZip(zipPath, destDir) {
    fs.mkdirSync(destDir, { recursive: true });
    if (process.platform === 'win32') {
        execSync(
            `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${destDir}' -Force"`,
            { windowsHide: true }
        );
    } else {
        execSync(`unzip -o '${zipPath}' -d '${destDir}'`);
    }
}

function safeRemoveDir(dir) {
    try {
        if (dir && fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 250 });
        return null;
    } catch (error) {
        // Windows can hold recently-used backend files briefly. Cleanup should
        // not make an otherwise valid quick update fall back to the full installer.
        return error;
    }
}

// Extract a downloaded app bundle into app/<version>, validate it, flip the
// pointer, and relaunch so the new code loads. Never touches the database.
async function applyAppBundle(zipPath, version) {
    if (!zipPath || !fs.existsSync(zipPath)) {
        return { ok: false, error: 'Update bundle file was not found. Please download again.' };
    }
    const safeVersion = String(version || `bundle-${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const root = getAppBundleRoot();
    const stagingDir = path.join(root, `.staging-${safeVersion}-${Date.now()}`);
    // Extract into a UNIQUE directory. Never reuse/delete app/<version>: on
    // Windows the currently-running backend locks its own app dir, so deleting
    // it fails with EBUSY. A fresh dir sidesteps the lock entirely; the old dir
    // is pruned on the next startup once nothing is running from it.
    const targetDir = path.join(root, `${safeVersion}-${Date.now()}`);

    try {
        fs.mkdirSync(root, { recursive: true });
        safeRemoveDir(stagingDir);
        extractZip(zipPath, stagingDir);

        // Bundles may wrap contents in a top-level folder; find the real app root.
        let appSource = stagingDir;
        if (!isValidAppDir(appSource)) {
            const entries = fs.readdirSync(stagingDir).map((e) => path.join(stagingDir, e));
            appSource = entries.find((e) => fs.statSync(e).isDirectory() && isValidAppDir(e)) || appSource;
        }
        if (!isValidAppDir(appSource)) {
            throw new Error('Update bundle is missing dist/ or backend/ — refusing to apply.');
        }

        fs.cpSync(appSource, targetDir, { recursive: true });
        const cleanupError = safeRemoveDir(stagingDir);

        fs.writeFileSync(
            getAppPointerFile(),
            JSON.stringify({
                version: safeVersion,
                path: targetDir,
                appliedAt: new Date().toISOString(),
                cleanupWarning: cleanupError ? cleanupError.message : null,
            }, null, 2)
        );

        setTimeout(() => {
            app.relaunch();
            app.exit(0);
        }, 800);
        return { ok: true, applied: true, version: safeVersion };
    } catch (error) {
        safeRemoveDir(stagingDir);
        safeRemoveDir(targetDir);
        return { ok: false, error: error.message };
    }
}

// Delete stale bundle directories that aren't the active one, best-effort. Runs
// at startup when nothing is executing from the old dirs (so no EBUSY).
function pruneOldAppDirs(activeDir) {
    try {
        const root = getAppBundleRoot();
        if (!fs.existsSync(root)) return;
        for (const entry of fs.readdirSync(root)) {
            const full = path.join(root, entry);
            if (entry === 'current.json') continue;
            if (activeDir && path.resolve(full) === path.resolve(activeDir)) continue;
            try {
                if (fs.statSync(full).isDirectory()) safeRemoveDir(full);
            } catch (_e) { /* a dir may still be locked briefly; skip it */ }
        }
    } catch (_error) {
        // ignore
    }
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
        paths.logDir,
    ].forEach((directory) => fs.mkdirSync(directory, { recursive: true }));
}

// Tee a child process's stdout/stderr to a log file and keep the last few KB
// in memory so we can surface the real failure reason to the UI.
function attachProcessLogging(child, logFilePath) {
    const tail = { text: '' };
    let stream = null;
    try {
        stream = fs.createWriteStream(logFilePath, { flags: 'a' });
        stream.write(`\n----- started ${new Date().toISOString()} -----\n`);
    } catch (_error) {
        stream = null;
    }

    const onChunk = (chunk) => {
        const text = chunk.toString();
        if (stream) stream.write(text);
        tail.text = (tail.text + text).slice(-4000);
    };

    if (child.stdout) child.stdout.on('data', onChunk);
    if (child.stderr) child.stderr.on('data', onChunk);
    return tail;
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

    // App code (dist + backend) loads from the active bundle if one is installed,
    // else the baseline. mongod, the seed, .env and node_modules always come from
    // the baseline install.
    const activeApp = resolveActiveAppRoot(resourcesPath);
    const appRoot = activeApp.dir;
    const baselineNodeModules = path.join(resourcesPath, 'backend', 'node_modules');

    // Remove superseded delta-update bundle dirs now that nothing runs from them.
    pruneOldAppDirs(activeApp.isBaseline ? null : appRoot);

    if (!mongoBinary) {
        throw new Error('Bundled MongoDB runtime is missing. Reinstall ShikshaSarthi using the latest installer.');
    }

    ensureRuntimeDirectories(paths);
    migrateLegacyData(paths);

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

    const mongoLog = attachProcessLogging(mongoProcess, path.join(paths.logDir, 'mongod.log'));

    mongoProcess.on('exit', (code) => {
        if (code !== 0 && mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('runtime-status', {
                state: 'error',
                message: `Local MongoDB process exited with code ${code}.${mongoLog.text ? `\n\n${mongoLog.text.trim()}` : ''}`,
            });
        }
    });

    try {
        await waitForTcpPort(paths.mongoPort);
    } catch (error) {
        const detail = mongoLog.text ? `\n\nMongoDB log:\n${mongoLog.text.trim()}` : '';
        throw new Error(`${error.message}. The bundled database engine did not start. This often means the Visual C++ runtime is missing; reinstall using the official installer.${detail}`);
    }

    const runtimeEnv = {
        ...fileEnv,
        NODE_ENV: 'production',
        APP_VERSION_OVERRIDE: getPackagedAppVersion(),
        APP_MODE: fileEnv.APP_MODE || 'local-school',
        USE_LOCAL_DB: 'true',
        PORT: fileEnv.FRONTEND_PORT || '6050',
        FRONTEND_PORT: fileEnv.FRONTEND_PORT || '6050',
        FRONTEND_DIST_DIR: path.join(appRoot, 'dist'),
        // Let a bundle's backend resolve dependencies from the baseline install
        // so app-only bundles don't need to ship node_modules.
        NODE_PATH: baselineNodeModules,
        MONGO_URI: paths.mongoUri,
        MONGO_URI_LOCAL: paths.mongoUri,
        SYNC_AUTO_ENABLED: fileEnv.SYNC_AUTO_ENABLED || 'false',
        SYNC_NODE_ROLE: fileEnv.SYNC_NODE_ROLE || 'local',
        SYNC_SOURCE_URI: fileEnv.SYNC_SOURCE_URI || fileEnv.MONGO_URI_REMOTE || '',
        SYNC_SOURCE_DB_NAME: fileEnv.SYNC_SOURCE_DB_NAME || 'app',
        UPLOAD_ROOT: paths.uploadRoot,
        BACKUP_DIR: paths.backupDir,
        UPDATE_DOWNLOAD_DIR: path.join(paths.updateDir, 'downloaded'),
        UPDATE_INSTALL_DIR: path.join(paths.updateDir, 'staged'),
        UPDATE_ROLLBACK_DIR: path.join(paths.updateDir, 'rollback'),
        AUDIO_CACHE_DIR: paths.audioCacheDir,
        APP_STATE_DIR: path.join(paths.dataRoot, 'state'),
        SYNC_EXPORT_DIR: path.join(paths.dataRoot, 'sync-exports'),
        SYNC_EXPORT_PATH: path.join(paths.dataRoot, 'state', 'sync-export.json'),
        LOCAL_UPLOADS_ENABLED: 'true',
        BACKUP_ENABLED: 'true',
        AWS_SYNC_MARK_UPLOADED_RECORDS: fileEnv.AWS_SYNC_MARK_UPLOADED_RECORDS || 'true',
        AWS_SYNC_SCOPE: fileEnv.AWS_SYNC_SCOPE || 'global',
    };

    // Seed import runs from whichever backend code is active, but the seed file
    // itself lives in the baseline install.
    let importScript = path.join(appRoot, 'backend', 'scripts', 'importSchoolSeed.js');
    if (!fs.existsSync(importScript)) {
        importScript = path.join(resourcesPath, 'backend', 'scripts', 'importSchoolSeed.js');
    }
    if (fs.existsSync(paths.seedPath) && fs.existsSync(importScript)) {
        await runNodeScript(importScript, [paths.seedPath], runtimeEnv);
    }

    const backendDir = path.join(appRoot, 'backend');
    const backendScript = path.join(backendDir, 'index.js');
    backendProcess = spawn(process.execPath, [backendScript], {
        cwd: backendDir,
        env: {
            ...process.env,
            ...runtimeEnv,
            ELECTRON_RUN_AS_NODE: '1',
        },
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    const backendLog = attachProcessLogging(backendProcess, path.join(paths.logDir, 'backend.log'));

    backendProcess.on('exit', (code) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('runtime-status', {
                state: 'error',
                message: `Local backend process exited with code ${code}.${backendLog.text ? `\n\n${backendLog.text.trim()}` : ''}`,
            });
        }
    });

    try {
        await waitForHttpHealth(runtimeEnv.PORT);
    } catch (error) {
        // Self-heal: if a delta-update bundle fails to boot, drop it and relaunch
        // on the baseline so the app is never bricked by a bad update.
        if (!activeApp.isBaseline) {
            revertToBaselineAppRoot();
            if (backendProcess && !backendProcess.killed) backendProcess.kill();
            if (mongoProcess && !mongoProcess.killed) mongoProcess.kill();
            app.relaunch();
            app.exit(0);
            return;
        }
        const detail = backendLog.text ? `\n\nBackend log:\n${backendLog.text.trim()}` : '';
        throw new Error(`${error.message}.${detail}`);
    }
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

function getAppIconPath() {
    const isDev = !app.isPackaged;
    const candidates = isDev
        ? [path.join(__dirname, '..', '..', 'public', 'favicon.ico')]
        : [
            path.join(process.resourcesPath, 'launcher-data', 'dist', 'favicon.ico'),
            path.join(process.resourcesPath, 'launcher-data', 'public', 'favicon.ico'),
        ];
    return candidates.find((candidate) => fs.existsSync(candidate));
}

function createWindow() {
    const iconPath = getAppIconPath();
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        resizable: true,
        title: 'ShikshaSarthi Hub',
        show: false,
        backgroundColor: '#0f172a',
        ...(iconPath ? { icon: iconPath } : {}),
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

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.whenReady().then(() => {
        createWindow();
    });
}

app.on('before-quit', () => {
    if (backendProcess && !backendProcess.killed) backendProcess.kill();
    if (mongoProcess && !mongoProcess.killed) mongoProcess.kill();
});

ipcMain.handle('get-server-info', async () => {
    const env = getEnv();
    return {
        ip: getLocalIp(),
        port: env.FRONTEND_PORT || '6050',
        role: env.SYNC_NODE_ROLE || env.NODE_ROLE || 'SCHOOL'
    };
});

// Apply a downloaded delta ("app bundle") update: swap the app code in place and
// relaunch. No installer, no UAC, database untouched. Self-heals to baseline if
// the new bundle fails to boot.
ipcMain.handle('apply-app-bundle', async (_event, payload) => {
    const bundlePath = payload && payload.filePath;
    const version = payload && payload.version;
    return applyAppBundle(bundlePath, version);
});

// Run a downloaded installer and quit so it can replace the app in place.
// The NSIS (Windows) installer stops this app, overwrites Program Files, and
// preserves all ProgramData (database, media, backups). On Linux we reveal the
// .deb for the operator to install with their package manager.
ipcMain.handle('install-update', async (_event, installerPath) => {
    const { shell } = require('electron');

    if (!installerPath || !fs.existsSync(installerPath)) {
        return { ok: false, error: 'Installer file was not found. Download the update again.' };
    }

    try {
        if (process.platform === 'win32') {
            const openError = await shell.openPath(installerPath);
            if (openError) {
                return { ok: false, error: openError };
            }
            setTimeout(() => app.quit(), 1500);
            return { ok: true, launched: true };
        }

        // Linux: best-effort reveal; operator installs the .deb.
        shell.showItemInFolder(installerPath);
        return { ok: true, launched: false, revealed: true, message: 'Installer downloaded. Open it to finish updating.' };
    } catch (error) {
        return { ok: false, error: error.message };
    }
});
