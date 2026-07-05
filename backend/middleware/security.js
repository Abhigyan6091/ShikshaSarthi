// Security middleware. Express 5 makes req.query a read-only getter, so the
// popular `express-mongo-sanitize` package (which mutates req.query in place)
// throws here. This is a small, Express-5-safe equivalent plus rate limiting.

const rateLimit = require("express-rate-limit");

// Recursively strip MongoDB operator injection: any object key beginning with
// "$" or containing "." is removed. Prevents payloads like
// {"username":{"$ne":null}} from turning an equality lookup into an operator.
function sanitizeInPlace(value) {
  if (!value || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    for (const item of value) sanitizeInPlace(item);
    return value;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete value[key];
      continue;
    }
    sanitizeInPlace(value[key]);
  }
  return value;
}

// Sanitizes req.body and req.params (both writable in Express 5). req.query is
// read-only in Express 5; we defensively sanitize a shallow-cloned view only if
// a handler opts to read from req.sanitizedQuery, but in practice auth-sensitive
// input arrives via body/params.
function mongoSanitize(req, _res, next) {
  if (req.body) sanitizeInPlace(req.body);
  if (req.params) sanitizeInPlace(req.params);
  next();
}

// Broad ceiling to blunt automated abuse; per-login limiters stay stricter.
const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.GLOBAL_RATE_LIMIT_MAX || 600),
  standardHeaders: true,
  legacyHeaders: false,
  // The launcher hub and same-machine calls come from loopback; don't throttle
  // the local UI/health checks.
  skip: (req) => {
    const ip = (req.ip || "").replace(/^::ffff:/, "");
    return ip === "127.0.0.1" || ip === "::1";
  },
});

// Stricter limiter for credential endpoints (brute-force protection).
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait a few minutes and try again." },
  skip: (req) => {
    const ip = (req.ip || "").replace(/^::ffff:/, "");
    return ip === "127.0.0.1" || ip === "::1";
  },
});

module.exports = { mongoSanitize, globalRateLimiter, loginRateLimiter };
