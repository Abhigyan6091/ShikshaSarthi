const express = require('express');
const router = express.Router();
const ExperimentQuestion = require('../models/ExperimentQuestion');
const ExperimentAttempt = require('../models/ExperimentAttempt');

// Get questions for a specific experiment
router.get('/questions/:experimentName', async (req, res) => {
    try {
        const { experimentName } = req.params;
        const decodedName = decodeURIComponent(experimentName);
        console.log(`Fetching questions for experiment: ${decodedName}`);
        const questions = await ExperimentQuestion.find({ experimentName: decodedName });
        res.json(questions);
    } catch (error) {
        console.error("Error fetching experiment questions:", error);
        res.status(500).json({ error: error.message });
    }
});

// Submit an attempt
router.post('/attempt', async (req, res) => {
    try {
        const attemptData = req.body;
        const attempt = new ExperimentAttempt(attemptData);
        await attempt.save();
        res.status(201).json({ message: "Attempt saved successfully", attemptId: attempt._id });
    } catch (error) {
        console.error("Error saving attempt:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get analytics for a student
router.get('/analytics/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const attempts = await ExperimentAttempt.find({ studentId }).sort({ attemptedAt: -1 });
        res.json(attempts);
    } catch (error) {
         console.error("Error fetching analytics:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
