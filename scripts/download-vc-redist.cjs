const fs = require('fs');
const path = require('path');
const https = require('https');

// Visual C++ 2015-2022 x64 redistributable. The bundled MongoDB 7.0 mongod.exe
// fails to start on a clean Windows machine without it, which is the most common
// cause of "cannot connect to database" on a freshly installed school server.
const VC_REDIST_URL = process.env.VC_REDIST_URL || 'https://aka.ms/vs/17/release/vc_redist.x64.exe';

const repoRoot = path.resolve(__dirname, '..');
const targetPath = path.resolve(
  process.argv[2] ||
    path.join(repoRoot, 'shikshasarthi-launcher', 'desktop-wrapper', 'launcher-data', 'vc_redist.x64.exe')
);

function download(url, destination, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    const request = https.get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        // Drain the redirect response so its socket is released; an unconsumed
        // response keeps Node's event loop alive and hangs the process (and the
        // CI step) forever after the real download finishes.
        response.resume();
        file.close();
        fs.rmSync(destination, { force: true });
        if (redirectsLeft <= 0) {
          reject(new Error('vc_redist download exceeded redirect limit'));
          return;
        }
        download(response.headers.location, destination, redirectsLeft - 1).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        file.close();
        fs.rmSync(destination, { force: true });
        reject(new Error(`vc_redist download failed with HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    });

    // Fail fast instead of hanging the CI job if the connection stalls.
    request.setTimeout(120000, () => {
      request.destroy(new Error('vc_redist download timed out'));
    });

    request.on('error', (error) => {
      file.close();
      fs.rmSync(destination, { force: true });
      reject(error);
    });
  });
}

async function main() {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  if (fs.existsSync(targetPath)) {
    const existing = fs.statSync(targetPath);
    if (existing.size >= 1024 * 1024) {
      console.log(`Visual C++ redistributable already present at ${path.relative(repoRoot, targetPath)}`);
      return;
    }
    fs.rmSync(targetPath, { force: true });
  }

  console.log(`Downloading Visual C++ redistributable from ${VC_REDIST_URL}`);
  await download(VC_REDIST_URL, targetPath);

  const stat = fs.statSync(targetPath);
  if (stat.size < 1024 * 1024) {
    throw new Error(`vc_redist.x64.exe looks too small (${stat.size} bytes)`);
  }
  console.log(`Visual C++ redistributable ready at ${path.relative(repoRoot, targetPath)}`);
}

main()
  .then(() => {
    // Force exit so a lingering keep-alive socket can never hang the CI step.
    process.exit(0);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
