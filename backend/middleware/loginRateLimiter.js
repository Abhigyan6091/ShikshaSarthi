const { RateLimiterMemory } = require("rate-limiter-flexible");

// Shared across all four login routes (superadmin/schooladmin/teacher/student).
// Keyed by ip+identifier so one slow typist on shared LAN can't lock out others,
// while still blocking brute force against a single account.
const loginLimiter = new RateLimiterMemory({
  points: 10,
  duration: 15 * 60, // 15 minutes
});

async function checkLoginRateLimit(req, identifier) {
  const key = `${req.ip}:${String(identifier || "").toLowerCase()}`;
  try {
    await loginLimiter.consume(key);
    return null;
  } catch (rateLimiterRes) {
    const retryAfterSeconds = Math.ceil((rateLimiterRes.msBeforeNext || 60000) / 1000);
    return { error: "Too many login attempts. Please try again later.", retryAfterSeconds };
  }
}

module.exports = { checkLoginRateLimit };
