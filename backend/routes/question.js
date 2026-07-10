const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const { appConfig } = require("../config/appConfig");
const { requireAuth } = require("../middleware/auth");
const { flattenQuestionBank } = require("../services/marsAdaptiveEngine");
const { loadLocalQuestionBank } = require("../utils/localQuestionBank");
require("dotenv").config();

const OFFLINE_HINT_MESSAGE = "AI hints are unavailable in offline mode.";

const SUBJECT_ALIASES = {
  "गणित": "maths",
  maths: "maths",
  mathematics: "maths",
  "विज्ञान": "science",
  science: "science",
  "सामाजिक विज्ञान": "social",
  social: "social",
  "social science": "social",
};

const QUESTION_SORT = { class: 1, subject: 1, topic: 1, question: 1 };
const NUMERIC_COLLATION = { locale: "en", numericOrdering: true, strength: 2 };

function naturalSort(values) {
  return values
    .filter(Boolean)
    .sort((left, right) => String(left).localeCompare(String(right), "en", { numeric: true, sensitivity: "base" }));
}

function normalizeSubject(subject = "") {
  return SUBJECT_ALIASES[decodeURIComponent(String(subject)).trim().toLowerCase()] || decodeURIComponent(String(subject)).trim();
}

async function getLocalQuestions(className, subject) {
  const bankModule = loadLocalQuestionBank();
  const normalizedSubject = normalizeSubject(subject);
  return flattenQuestionBank(bankModule, className).filter((question) => question.subject === normalizedSubject);
}

function toPracticeQuestion(question) {
  return {
    _id: question.id,
    question: question.questionHindi || question.question,
    questionImage: "",
    options: question.optionsHindi?.length ? question.optionsHindi : question.options,
    correctAnswer: question.optionsHindi?.[question.correctAnswerIndex] || question.correctAnswer,
    hint: {
      text: question.hintsHindi?.[0] || question.hints?.[0] || "",
      image: "",
      video: "",
    },
  };
}

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

function normalizeQuestionPayload(payload) {
  const question = String(payload.question || "").trim();
  const subject = String(payload.subject || "").trim();
  const className = String(payload.class || "").trim();
  const topic = String(payload.topic || "").trim();
  const options = Array.isArray(payload.options)
    ? payload.options.map((option) => String(option).trim()).filter(Boolean)
    : [];
  const correctAnswer = String(payload.correctAnswer || "").trim();

  // class is optional now (students are grouped by batch, not grade).
  if (!subject || !topic || !question) {
    throw new Error("subject, topic, and question are required");
  }

  if (options.length < 2) {
    throw new Error("options must contain at least two answers");
  }

  if (!correctAnswer || !options.includes(correctAnswer)) {
    throw new Error("correctAnswer must exactly match one of the options");
  }

  // Hindi translation (optional). Missing → "NA" so single-lingual questions
  // are explicitly tagged; a filled Hindi field lets the UI toggle language.
  const questionHindi = String(payload.questionHindi || "").trim() || "NA";
  const optionsHindi = Array.isArray(payload.optionsHindi) && payload.optionsHindi.some((o) => String(o || "").trim())
    ? options.map((_, i) => String(payload.optionsHindi[i] || "").trim() || "NA")
    : options.map(() => "NA");

  return {
    subject,
    class: className,
    topic,
    question,
    questionHindi,
    optionsHindi,
    questionImage: payload.questionImage || "",
    options,
    correctAnswer,
    hint: {
      text: typeof payload.hint === "string" ? payload.hint : payload.hint?.text || "",
      image: payload.hint?.image || "",
      video: payload.hint?.video || "",
    },
  };
}

// Create question with optional Gemini-generated hint.
router.post("/", async (req, res) => {
  try {
    const normalized = normalizeQuestionPayload(req.body);
    let { question, options, hint } = normalized;

    if (!hint?.text || hint.text.trim() === "") {
      hint = { ...hint, text: await generateAiHint({ question, options }) };
    }

    const questionToSave = new Question({ ...normalized, hint });
    await questionToSave.save();

    res.status(201).json(questionToSave);
  } catch (err) {
    console.error("Error saving question:", err);
    res.status(400).json({ error: err.message });
  }
});

// Bulk create questions from JSON upload.
router.post("/bulk", async (req, res) => {
  try {
    const incoming = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body.questions)
        ? req.body.questions
        : null;

    if (!incoming || incoming.length === 0) {
      return res.status(400).json({ error: "Upload a non-empty question array." });
    }

    const saved = [];
    const failed = [];

    for (const [index, rawQuestion] of incoming.entries()) {
      try {
        const normalized = normalizeQuestionPayload(rawQuestion);
        let hint = normalized.hint;

        if (!hint?.text || hint.text.trim() === "") {
          hint = { ...hint, text: await generateAiHint(normalized) };
        }

        const questionToSave = new Question({ ...normalized, hint });
        await questionToSave.save();
        saved.push(questionToSave);
      } catch (error) {
        failed.push({ index, error: error.message });
      }
    }

    if (saved.length === 0) {
      return res.status(400).json({ error: "No questions were saved.", failed });
    }

    res.status(201).json({
      message: `${saved.length} question${saved.length === 1 ? "" : "s"} uploaded`,
      saved,
      failed,
    });
  } catch (err) {
    console.error("Error bulk uploading questions:", err);
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
    const questions = await Question.find().sort(QUESTION_SORT).collation(NUMERIC_COLLATION);
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
router.delete("/:id", requireAuth("superadmin"), async (req, res) => {
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

router.delete("/topic/:className/:subject/:topic", requireAuth("superadmin"), async (req, res) => {
  try {
    const { className, subject, topic } = req.params;
    const result = await Question.updateMany(
      {
        class: decodeURIComponent(className),
        subject: decodeURIComponent(subject),
        topic: decodeURIComponent(topic),
      },
      { $set: { isDeleted: true, synced: false, updatedAt: new Date() } }
    );
    res.status(200).json({
      message: "Topic deleted successfully",
      modifiedCount: result.modifiedCount || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/subject/:className/:subject", requireAuth("superadmin"), async (req, res) => {
  try {
    const { className, subject } = req.params;
    const result = await Question.updateMany(
      {
        class: decodeURIComponent(className),
        subject: decodeURIComponent(subject),
      },
      { $set: { isDeleted: true, synced: false, updatedAt: new Date() } }
    );
    res.status(200).json({
      message: "Subject deleted successfully",
      modifiedCount: result.modifiedCount || 0,
    });
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
    res.status(200).json({ subject, topics: naturalSort(topics) });
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
    }).sort(QUESTION_SORT).collation(NUMERIC_COLLATION);
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
    if (topics.length > 0) {
      return res.status(200).json({ class: className, subject, topics: naturalSort(topics) });
    }

    const localQuestions = await getLocalQuestions(className, subject);
    const localTopics = Array.from(
      new Map(
        localQuestions.map((question) => [
          question.topicId,
          question.chapterTitleHindi || question.chapterTitle || question.topicId,
        ])
      ).values()
    );

    res.status(200).json({ class: className, subject, topics: naturalSort(localTopics) });
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
    }).sort(QUESTION_SORT).collation(NUMERIC_COLLATION);
    if (questions.length > 0) {
      return res.status(200).json(questions);
    }

    const decodedTopic = decodeURIComponent(topic);
    const localQuestions = await getLocalQuestions(className, subject);
    const matchingQuestions = localQuestions.filter(
      (question) =>
        question.topicId === decodedTopic ||
        question.chapterTitle === decodedTopic ||
        question.chapterTitleHindi === decodedTopic
    );

    res.status(200).json(matchingQuestions.map(toPracticeQuestion));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
