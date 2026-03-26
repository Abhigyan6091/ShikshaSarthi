const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
require("dotenv").config();
 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Create question with Gemini-generated hint
router.post("/", async (req, res) => {
  try {
    let { subject, topic, class: className, question, options, hint } = req.body;

    if (!hint?.text || hint.text.trim() === "") {
      const prompt = `Provide a helpful hint (max 50 words) for this multiple-choice question in hindi:\nQuestion: ${question}\nOptions: ${options.join(", ")}\nHint:`;

      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
      };

      const geminiResponse = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const geminiData = await geminiResponse.json();

      const generatedHint = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      hint = { ...hint, text: generatedHint };
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
router.get("/", async (req, res) => {
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


router.get("/topics/:class/:subject", async (req, res) => {
  try {
    const { class: className, subject } = req.params;
    const topics = await Question.distinct("topic", {
      class: className,
      subject: subject,
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
