const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const Version = require("../models/Version");

function timingSafeEqualStrings(a, b) {
  const bufferA = Buffer.from(String(a || ""));
  const bufferB = Buffer.from(String(b || ""));
  if (bufferA.length !== bufferB.length) {
    // Still run a comparison of equal length to avoid leaking length via timing.
    crypto.timingSafeEqual(bufferA, Buffer.alloc(bufferA.length));
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
}

// GET Manifest (public - used by school servers in later phases).
router.get("/manifest", async (_req, res) => {
  try {
    const latest = await Version.findOne().sort({ createdAt: -1 });
    if (!latest) {
      return res.json({
        version: "1.0.0",
        releaseDate: new Date(),
        releaseNotes: "Initial version",
      });
    }
    res.json({
      version: latest.version,
      releaseDate: latest.releaseDate,
      releaseNotes: latest.releaseNotes,
      forceUpdate: latest.forceUpdate,
    });
  } catch (_err) {
    res.status(500).json({ error: "Failed to fetch manifest" });
  }
});

// Publish New Version (restricted - used by CI/CD or Admin in later phases).
router.post("/publish", async (req, res) => {
  const { version, releaseNotes, forceUpdate, apiKey } = req.body;
  const masterApiKey = process.env.UPDATE_API_KEY;

  if (!masterApiKey) {
    return res.status(500).json({
      error: "UPDATE_API_KEY is not configured. Refusing to publish with an insecure fallback key.",
    });
  }

  if (!timingSafeEqualStrings(apiKey, masterApiKey)) {
    return res.status(401).json({ error: "Unauthorized: Invalid API Key" });
  }

  try {
    if (!version) {
      return res.status(400).json({ error: "Version is required" });
    }

    const newVersion = new Version({
      version,
      releaseNotes: releaseNotes || "Bug fixes and improvements",
      forceUpdate: forceUpdate || false,
    });

    await newVersion.save();
    res.status(201).json({ message: "Version published successfully", version: newVersion });
  } catch (err) {
    res.status(500).json({ error: `Failed to publish version: ${err.message}` });
  }
});

module.exports = router;
