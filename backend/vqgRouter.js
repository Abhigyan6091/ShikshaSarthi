const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');
const net = require('net');

const VQG_DIR = path.resolve(__dirname, '..', 'QuestionGenerator', 'VQG');
const FRONTEND_DIR = path.join(VQG_DIR, 'frontend');
const BACKEND_DIR = path.join(VQG_DIR, 'backend');

let vqgProcess = null;
let vqgPort = null;
let modifiedAppJs = null;

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

function readModifiedAppJs(vqgApiPrefix) {
  const appJsPath = path.join(FRONTEND_DIR, 'app.js');
  if (!fs.existsSync(appJsPath)) return null;
  let content = fs.readFileSync(appJsPath, 'utf8');
  content = content.replace(
    /const API\s*=\s*['"]\/api['"]/,
    `const API = '${vqgApiPrefix}'`
  );
  content = content.replace(
    /function playExplanation\(path, btn\)/,
    `function playExplanation(path, btn) {\n    if (path && path.startsWith('/explanations/')) path = '/vqg/explanations' + path.substring('/explanations'.length);`
  );
  return content;
}

async function startVqgBackend() {
  const mainPy = path.join(BACKEND_DIR, 'main.py');
  if (!fs.existsSync(mainPy)) {
    console.warn('[VQG] backend/main.py not found – VQG will not be available');
    return null;
  }

  vqgPort = await findFreePort();
  console.log(`[VQG] Starting FastAPI backend on 127.0.0.1:${vqgPort} ...`);

  const env = {
    ...process.env,
    APP_HOST: '127.0.0.1',
    APP_PORT: String(vqgPort),
  };

  vqgProcess = spawn('uvicorn', ['backend.main:app', '--host', '127.0.0.1', '--port', String(vqgPort)], {
    cwd: VQG_DIR,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  vqgProcess.stdout.on('data', (data) => {
    process.stdout.write(`[VQG] ${data}`);
  });

  vqgProcess.stderr.on('data', (data) => {
    process.stderr.write(`[VQG] ${data}`);
  });

  vqgProcess.on('exit', (code) => {
    console.log(`[VQG] Process exited with code ${code}`);
    vqgProcess = null;
    vqgPort = null;
  });

  // Wait for the server to be ready
  const maxRetries = 30;
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${vqgPort}/api/videos`, (res) => {
          resolve();
        });
        req.on('error', reject);
        req.setTimeout(2000, () => { req.destroy(); reject(new Error('timeout')); });
      });
      console.log(`[VQG] FastAPI backend ready on 127.0.0.1:${vqgPort}`);
      return vqgPort;
    } catch {
      // not ready yet
    }
  }

  console.error('[VQG] FastAPI backend failed to start within 30 seconds');
  return null;
}

function stopVqgBackend() {
  if (vqgProcess) {
    console.log('[VQG] Stopping FastAPI backend...');
    vqgProcess.kill('SIGTERM');
    setTimeout(() => {
      if (vqgProcess) vqgProcess.kill('SIGKILL');
    }, 5000);
    vqgProcess = null;
    vqgPort = null;
  }
}

// ── Proxy ─────────────────────────────────────────────────────────

function proxyToVqg(req, res) {
  if (!vqgPort) {
    return res.status(502).json({ error: 'VQG backend not available' });
  }

  const targetPath = req.originalUrl.replace('/vqg', '') || '/';
  const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';

  const options = {
    hostname: '127.0.0.1',
    port: vqgPort,
    path: targetPath + queryString,
    method: req.method,
    headers: { ...req.headers },
    timeout: 300000,
  };
  delete options.headers.host;

  const proxyReq = http.request(options, (proxyRes) => {
    if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400) {
      const location = proxyRes.headers.location || '';
      if (location && !location.startsWith('http')) {
        proxyRes.headers.location = '/vqg' + location;
      }
    }
    const h = { ...proxyRes.headers };
    if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
      delete h['content-encoding'];
    }
    res.writeHead(proxyRes.statusCode || 502, h);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[VQG] Proxy error: ${err.message}`);
    if (!res.headersSent) {
      if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
        res.writeHead(502, { 'Content-Type': 'text/event-stream' });
        res.end(`data: ${JSON.stringify({ step: 'error', percent: -1, detail: 'VQG backend unavailable' })}\n\n`);
      } else {
        res.status(502).json({ error: 'VQG backend unavailable', detail: err.message });
      }
    }
  });

  proxyReq.on('timeout', () => { proxyReq.destroy(); if (!res.headersSent) res.status(504).json({ error: 'VQG timeout' }); });

  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body) && Object.keys(req.body).length > 0) {
    const body = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
    proxyReq.write(body);
    proxyReq.end();
  } else if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}

// ── Router ────────────────────────────────────────────────────────

const router = express.Router();

// Initialize on first use
let initialized = false;
async function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  const apiPrefix = '/vqg/api';
  modifiedAppJs = readModifiedAppJs(apiPrefix);
  if (modifiedAppJs) {
    console.log('[VQG] Frontend app.js prepared with API prefix:', apiPrefix);
  }
  // Start backend asynchronously
  startVqgBackend().then(port => {
    if (port) console.log(`[VQG] Backend ready on 127.0.0.1:${port}`);
  });
}

// ── Static frontend ───────────────────────────────────────────────

router.use((req, res) => {

  const p = req.path;

  // Serve modified app.js
  if (p === '/app.js' && modifiedAppJs) {
    res.setHeader('Content-Type', 'application/javascript');
    return res.send(modifiedAppJs);
  }

  // Serve index.html directly from VQG frontend (relative paths resolve correctly)
  if (p === '' || p === '/') {
    return res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
  }

  // Serve other static frontend files
  const staticFile = path.join(FRONTEND_DIR, p === '/styles.css' ? 'styles.css' : path.basename(p));
  if (fs.existsSync(staticFile)) {
    return res.sendFile(staticFile);
  }

  // Proxy API and explanations to VQG backend
  if (p.startsWith('/api') || p.startsWith('/explanations')) {
    return proxyToVqg(req, res);
  }

  proxyToVqg(req, res);
});

// ── Lifecycle ─────────────────────────────────────────────────────

process.on('exit', stopVqgBackend);
process.on('SIGINT', () => { stopVqgBackend(); process.exit(); });
process.on('SIGTERM', () => { stopVqgBackend(); process.exit(); });

// Initialize immediately
ensureInitialized();

module.exports = router;

