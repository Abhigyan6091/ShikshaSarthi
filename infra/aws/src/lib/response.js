const crypto = require("crypto");

function timingSafeEqualStrings(a, b) {
  const bufferA = Buffer.from(String(a || ""));
  const bufferB = Buffer.from(String(b || ""));
  if (bufferA.length !== bufferB.length) {
    // Still run a comparison of equal length so a length mismatch doesn't
    // return faster than a same-length mismatch (timing side-channel).
    crypto.timingSafeEqual(bufferA, Buffer.alloc(bufferA.length));
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type,x-api-key",
      "access-control-allow-methods": "GET,POST,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function readJsonBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  return JSON.parse(raw);
}

function requireApiKey(event) {
  const configured = process.env.CONTROL_API_KEY;
  if (!configured) {
    return { ok: false, response: json(500, { ok: false, error: "Server configuration error" }) };
  }

  const headers = event.headers || {};
  const provided = headers["x-api-key"] || headers["X-Api-Key"] || headers["X-API-Key"];
  if (!timingSafeEqualStrings(provided, configured)) {
    return { ok: false, response: json(401, { ok: false, error: "Unauthorized" }) };
  }

  return { ok: true };
}

function sanitizeFileName(fileName) {
  const value = String(fileName || "upload.bin").split(/[\\/]/).pop();
  const sanitized = value.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
  return sanitized || "upload.bin";
}

function sanitizeSchoolId(schoolId) {
  const sanitized = String(schoolId || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!sanitized) {
    throw new Error("schoolId is required");
  }
  return sanitized;
}

function nowIso() {
  return new Date().toISOString();
}

module.exports = {
  json,
  nowIso,
  readJsonBody,
  requireApiKey,
  sanitizeFileName,
  sanitizeSchoolId,
};
