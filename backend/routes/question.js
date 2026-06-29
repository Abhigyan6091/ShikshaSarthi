const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const { appConfig } = require("../config/appConfig");
require("dotenv").config();

const OFFLINE_HINT_MESSAGE = "AI hints are unavailable in offline mode.";

async function generateAiHint({ question, options }) {
  if (!appConfig.aiHintsEnabled) {
    return OFFLINE_HINT_MESSAGE;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return OFFLINE_HINT_MESSAGE;
  }

  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
  const prompt = `Provide a helpful hint (max 50 words) for this multiple-choice question in hindi:\nQuestion: ${question}\nOptions: ${(options || []).join(", ")}\nHint:`;

  try {
    const geminiResponse = await fetch(geminiApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!geminiResponse.ok) {
      console.warn(`Gemini hint generation failed with status ${geminiResponse.status}`);
      return OFFLINE_HINT_MESSAGE;
    }

    const geminiData = await geminiResponse.json();
    return geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || OFFLINE_HINT_MESSAGE;
  } catch (error) {
    console.warn("Gemini hint generation skipped:", error.message);
    return OFFLINE_HINT_MESSAGE;
  }
}

// Create question with optional Gemini-generated hint.
router.post("/", async (req, res) => {
  try {
    let { question, options, hint } = req.body;

    if (!hint?.text || hint.text.trim() === "") {
      hint = { ...hint, text: await generateAiHint({ question, options }) };
    }

    const questionToSave = new Question({ ...req.body, hint });
    await questionToSave.save();

    res.status(201).json(questionToSave);
  } catch (err) {
    console.error("Error saving question:", err);
    res.status(400).json({ error: err.message });
  }
});

// Create question from teacher
router.post("/teacher", async (req, res) => {
  try {
    const { teacherId, questionData } = req.body;
    if (!teacherId || !questionData) {
      return res.status(400).json({ error: "Missing teacherId or questionData" });
    }

    const newQuestion = new Question({ ...questionData, teacherId });
    await newQuestion.save();

    res.status(201).json(newQuestion);
  } catch (err) {
    console.error("Error saving question:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all questions
router.get("/", async (_req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single question
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update question
router.put("/:id", async (req, res) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete question
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Question.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) return res.status(404).json({ message: "Question not found" });
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all/topics/:subject", async (req, res) => {
  try {
    const { subject } = req.params;
    const topics = await Question.distinct("topic", {
      subject: decodeURIComponent(subject),
    });
    res.status(200).json({ subject, topics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all/questions/:subject/:topic", async (req, res) => {
  try {
    const { subject, topic } = req.params;
    const questions = await Question.find({
      subject: decodeURIComponent(subject),
      topic: decodeURIComponent(topic),
    });
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/topics/:class/:subject", async (req, res) => {
  try {
    const { class: className, subject } = req.params;
    const topics = await Question.distinct("topic", {
      class: className,
      subject,
    });
    res.status(200).json({ class: className, subject, topics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:class/:subject/:topic", async (req, res) => {
  try {
    const { class: className, subject, topic } = req.params;
    const questions = await Question.find({
      class: className,
      subject,
      topic,
    });
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
