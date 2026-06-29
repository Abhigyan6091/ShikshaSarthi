const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const targetRoot = path.join(repoRoot, 'shikshasarthi-launcher', 'desktop-wrapper', 'launcher-data');

const excluded = new Set([
  '.git',
  '.codex',
  'node_modules',
  'backend/node_modules',
  'backend/backups',
  'backend/uploads',
  'backend/data/audio-cache',
  'backend/updates/downloaded',
  'uploads',
  'dist-release',
  'releases',
  'shikshasarthi-launcher/data',
  'shikshasarthi-launcher/desktop-wrapper/node_modules',
  'shikshasarthi-launcher/desktop-wrapper/dist',
  'shikshasarthi-launcher/desktop-wrapper/launcher-data',
  'QuestionGenerator/VQG',
  'question_bank/textbooks',
  'infra/aws/.aws-sam'
]);

const excludedFiles = new Set([
  '.env',
  'backend/.env',
  'backend/data/sync-state.json',
  'backend/data/media-map.json',
  'backend/updates/update-state.json',
  'infra/aws/samconfig.toml'
]);

function toRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

function shouldSkip(filePath) {
  const rel = toRelative(filePath);
  return excluded.has(rel) || excludedFiles.has(rel);
}

function copyTree(source, destination) {
  if (shouldSkip(source)) return;

  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) return;

  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyTree(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

fs.rmSync(targetRoot, { recursive: true, force: true });
copyTree(repoRoot, targetRoot);

const frontendIndex = path.join(targetRoot, 'dist', 'index.html');
if (!fs.existsSync(frontendIndex)) {
  throw new Error('Frontend build is missing. Run npm run build before preparing desktop resources.');
}

const backendRoot = path.join(targetRoot, 'backend');
const backendLock = path.join(backendRoot, 'package-lock.json');
if (!fs.existsSync(backendLock)) {
  throw new Error('Backend package-lock.json is missing; cannot bundle backend production dependencies.');
}

if (process.env.SKIP_BACKEND_NPM_CI !== 'true') {
  console.log('Installing backend production dependencies for desktop bundle...');
  execFileSync('npm', ['ci', '--omit=dev'], {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
  });
}

console.log(`Prepared desktop resources at ${path.relative(repoRoot, targetRoot)}`);
