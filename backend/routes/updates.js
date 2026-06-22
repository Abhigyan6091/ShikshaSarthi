const express = require('express');
const router = express.Router();
const Version = require('../models/Version');

// 1. GET Manifest (Public - used by School Servers)
// Endpoint: GET /api/updates/manifest
router.get('/manifest', async (req, res) => {
    try {
        const latest = await Version.findOne().sort({ createdAt: -1 });
        if (!latest) {
            return res.json({
                version: "1.0.0",
                releaseDate: new Date(),
                releaseNotes: "Initial version"
            });
        }
        res.json({
            version: latest.version,
            releaseDate: latest.releaseDate,
            releaseNotes: latest.releaseNotes,
            forceUpdate: latest.forceUpdate
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch manifest" });
    }
});

// 2. Publish New Version (Restricted - used by CI/CD or Admin)
// In a production environment, this should be protected by an API Key
router.post('/publish', async (req, res) => {
    const { version, releaseNotes, forceUpdate, apiKey } = req.body;

    // Basic protection (Ideally use a better secret management system)
    const MASTER_API_KEY = process.env.UPDATE_API_KEY || "shiksha-sarthi-secret-2026";

    if (apiKey !== MASTER_API_KEY) {
        return res.status(401).json({ error: "Unauthorized: Invalid API Key" });
    }

    try {
        if (!version) {
            return res.status(400).json({ error: "Version is required" });
        }

        const newVersion = new Version({
            version,
            releaseNotes: releaseNotes || "Bug fixes and improvements",
            forceUpdate: forceUpdate || false
        });

        await newVersion.save();
        res.status(201).json({ message: "Version published successfully", version: newVersion });
    } catch (err) {
        res.status(500).json({ error: "Failed to publish version: " + err.message });
    }
});

module.exports = router;
