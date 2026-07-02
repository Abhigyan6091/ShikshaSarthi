const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Honor APP_STATE_DIR (writable ProgramData) when packaged; backend code dir
// is read-only under Program Files. Mirrors the pattern already used by
// awsCloudSyncClient.js / autoSyncService.js / mediaSyncService.js.
const DATA_DIR = process.env.APP_STATE_DIR
  ? path.resolve(process.env.APP_STATE_DIR)
  : path.join(__dirname, "..", "data");
const SECRET_FILE = path.join(DATA_DIR, "jwt-secret.txt");
const TOKEN_TTL = process.env.AUTH_TOKEN_TTL || "12h";

function loadOrCreateSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  try {
    if (fs.existsSync(SECRET_FILE)) {
      const existing = fs.readFileSync(SECRET_FILE, "utf8").trim();
      if (existing) return existing;
    }
  } catch (_error) {
    // fall through to regenerate
  }

  const generated = crypto.randomBytes(48).toString("hex");
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SECRET_FILE, generated, { mode: 0o600 });
  } catch (_error) {
    // If we can't persist it, still return an in-memory secret so auth keeps
    // working for this process lifetime (tokens just won't survive a restart).
  }
  return generated;
}

const JWT_SECRET = loadOrCreateSecret();

function signAuthToken({ id, role, schoolId, identifier }) {
  return jwt.sign({ id, role, schoolId, identifier }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function isLoopbackAddress(address) {
  if (!address) return false;
  const normalized = address.replace(/^::ffff:/, "");
  return normalized === "127.0.0.1" || normalized === "::1" || normalized === "localhost";
}

function isLoopbackRequest(req) {
  return isLoopbackAddress(req.ip) || isLoopbackAddress(req.socket && req.socket.remoteAddress);
}

// Requires a valid bearer token for requests arriving over the LAN/internet.
// Requests from 127.0.0.1 (the Electron launcher hub, or a shell on the same
// machine) are trusted implicitly, matching the app's existing trust boundary:
// physical/OS access to the school PC is already equivalent to admin access.
function requireAuth(...allowedRoles) {
  return function authMiddleware(req, res, next) {
    if (isLoopbackRequest(req)) {
      req.auth = { role: "local-trusted" };
      return next();
    }

    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Authentication required." });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: "You do not have permission to perform this action." });
      }
      req.auth = payload;
      return next();
    } catch (_error) {
      return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
    }
  };
}

module.exports = { requireAuth, signAuthToken };
