const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const targetRoot = path.resolve(
  process.argv[2] || path.join(repoRoot, 'shikshasarthi-launcher', 'desktop-wrapper', 'launcher-data', 'mongodb')
);

const version = process.env.MONGODB_RUNTIME_VERSION || '7.0.15';
const platform = process.platform;

function runtimeUrl() {
  if (platform === 'win32') {
    return `https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-${version}.zip`;
  }

  if (platform === 'linux') {
    return `https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-${version}.tgz`;
  }

  throw new Error(`Unsupported MongoDB bundled runtime platform: ${platform}`);
}

function download(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    const request = https.get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        // Drain the redirect response so its socket is released; an unconsumed
        // response keeps Node's event loop alive and can hang the CI step.
        response.resume();
        file.close();
        fs.rmSync(destination, { force: true });
        download(response.headers.location, destination).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        file.close();
        fs.rmSync(destination, { force: true });
        reject(new Error(`MongoDB download failed with HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    });

    request.setTimeout(300000, () => {
      request.destroy(new Error('MongoDB download timed out'));
    });

    request.on('error', (error) => {
      file.close();
      fs.rmSync(destination, { force: true });
      reject(error);
    });
  });
}

function findExtractedRoot(directory) {
  return fs.readdirSync(directory)
    .map((entry) => path.join(directory, entry))
    .find((entryPath) => {
      const stat = fs.statSync(entryPath);
      return stat.isDirectory() && fs.existsSync(path.join(entryPath, 'bin'));
    });
}

async function main() {
  const url = runtimeUrl();
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'shiksha-mongodb-'));
  const archivePath = path.join(tempRoot, platform === 'win32' ? 'mongodb.zip' : 'mongodb.tgz');

  console.log(`Downloading MongoDB runtime ${version} from ${url}`);
  await download(url, archivePath);

  const extractRoot = path.join(tempRoot, 'extract');
  fs.mkdirSync(extractRoot, { recursive: true });

  if (platform === 'win32') {
    execFileSync('powershell', ['-NoProfile', '-Command', `Expand-Archive -LiteralPath '${archivePath}' -DestinationPath '${extractRoot}' -Force`], {
      stdio: 'inherit',
    });
  } else {
    execFileSync('tar', ['-xzf', archivePath, '-C', extractRoot], {
      stdio: 'inherit',
    });
  }

  const extractedRoot = findExtractedRoot(extractRoot);
  if (!extractedRoot) {
    throw new Error('Could not find extracted MongoDB runtime root.');
  }

  fs.rmSync(targetRoot, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(targetRoot), { recursive: true });
  fs.cpSync(extractedRoot, targetRoot, { recursive: true });

  const binaryName = platform === 'win32' ? 'mongod.exe' : 'mongod';
  const binaryPath = path.join(targetRoot, 'bin', binaryName);
  if (!fs.existsSync(binaryPath)) {
    throw new Error(`MongoDB binary was not found at ${binaryPath}`);
  }

  fs.rmSync(tempRoot, { recursive: true, force: true });
  console.log(`MongoDB runtime ready at ${path.relative(repoRoot, targetRoot)}`);
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
