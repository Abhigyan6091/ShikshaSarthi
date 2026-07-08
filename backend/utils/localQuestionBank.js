const fs = require("fs");
const path = require("path");
const vm = require("vm");

let cachedBank = null;

function loadBankFile(filePath) {
  let code = fs.readFileSync(filePath, "utf8");
  const exportMatch = code.match(/export\s+\{\s*([A-Za-z0-9_$]+)\s*\}/);
  if (!exportMatch) {
    throw new Error(`No named export found in ${filePath}`);
  }

  code = code.replace(
    /^\s*export\s+\{\s*([A-Za-z0-9_$]+)\s*\};?\s*$/gm,
    "module.exports = { $1 };"
  );

  const sandbox = {
    module: { exports: {} },
    exports: {},
    console: { log() {}, warn() {}, error() {} },
  };
  vm.runInNewContext(code, sandbox, { filename: filePath, timeout: 5000 });

  const exportName = exportMatch[1];
  const bank = sandbox.module.exports[exportName];
  if (!Array.isArray(bank)) {
    throw new Error(`Export ${exportName} in ${filePath} is not a question bank array`);
  }

  return bank;
}

function parseIndexExports(indexPath) {
  const indexCode = fs.readFileSync(indexPath, "utf8");
  const exports = [];
  const exportPattern = /export\s+\{\s*([A-Za-z0-9_$]+)\s*\}\s+from\s+["'](.+?)["'];?/g;
  let match;

  while ((match = exportPattern.exec(indexCode)) !== null) {
    exports.push({ exportName: match[1], relativeFile: match[2] });
  }

  if (!exports.length) {
    throw new Error(`No question bank exports found in ${indexPath}`);
  }
  return exports;
}

function loadLocalQuestionBank({ forceReload = false } = {}) {
  if (cachedBank && !forceReload) return cachedBank;

  const bankDir = path.resolve(__dirname, "../../question_bank");
  const indexPath = path.join(bankDir, "index.js");
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Question bank index not found: ${indexPath}`);
  }

  const bankModule = {};
  for (const { exportName, relativeFile } of parseIndexExports(indexPath)) {
    const filePath = path.resolve(bankDir, relativeFile);
    if (!filePath.startsWith(bankDir + path.sep)) {
      throw new Error(`Question bank export escapes directory: ${relativeFile}`);
    }
    bankModule[exportName] = loadBankFile(filePath);
  }

  cachedBank = bankModule;
  return bankModule;
}

module.exports = {
  loadLocalQuestionBank,
  parseIndexExports,
};
