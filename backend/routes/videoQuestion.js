const express = require("express");
const router = express.Router();
const VideoQuestion = require("../models/VideoQuestion");

function toAbsoluteMediaUrl(value, req) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const requestOrigin = `${req.protocol}://${req.get("host")}`;

  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/videos/")) {
    return `${requestOrigin}${trimmed}`;
  }

  if (trimmed.startsWith("uploads/") || trimmed.startsWith("videos/")) {
    return `${requestOrigin}/${trimmed}`;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = String(parsed.hostname || "")
      .replace(/^\[|\]$/g, "")
      .toLowerCase();

    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return `${requestOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch (_error) {
    return trimmed;
  }

  return trimmed;
}

function normalizeVideoQuestionForResponse(videoQuestion, req) {
  if (!videoQuestion) {
    return videoQuestion;
  }

  const plainVideoQuestion =
    typeof videoQuestion.toObject === "function"
      ? videoQuestion.toObject()
      : { ...videoQuestion };

  plainVideoQuestion.videoUrl = toAbsoluteMediaUrl(plainVideoQuestion.videoUrl, req);
  return plainVideoQuestion;
}

// Get all unique topics for a class and subject (video questions)
router.get("/topics/:class/:subject", async (req, res) => {
  try {
    const { class: className, subject } = req.params;
    
    console.log("📥 Topics request received:");
    console.log("   Class:", className);
    console.log("   Subject:", subject);
    console.log("   Query:", { class: className, subject: subject });
    
    const topics = await VideoQuestion.distinct("topic", {
      class: className,
      subject: subject,
    });
    
    console.log("   Topics found:", topics);
    
    res.status(200).json({ class: className, subject, topics });
  } catch (err) {
    console.error("Error fetching video topics:", err);
    res.status(500).json({ error: err.message });
  }
});

// Class-agnostic: all unique topics for a subject across every class.
// Defined BEFORE /:class/:subject/:topic so "all" isn't captured as a class.
router.get("/all/topics/:subject", async (req, res) => {
  try {
    const subject = decodeURIComponent(req.params.subject);
    const topics = await VideoQuestion.distinct("topic", { subject });
    res.status(200).json({ subject, topics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Class-agnostic: all video questions for a subject + topic across every class.
router.get("/all/questions/:subject/:topic", async (req, res) => {
  try {
    const subject = decodeURIComponent(req.params.subject);
    const topic = decodeURIComponent(req.params.topic);
    const videoQuestions = await VideoQuestion.find({ subject, topic });
    res.status(200).json(videoQuestions.map((v) => normalizeVideoQuestionForResponse(v, req)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get video questions for a specific class, subject, and topic
router.get("/:class/:subject/:topic", async (req, res) => {
  try {
    const { class: className, subject, topic } = req.params;
    const videoQuestions = await VideoQuestion.find({
      class: className,
      subject,
      topic,
    });

    const normalizedVideoQuestions = videoQuestions.map((videoQuestion) =>
      normalizeVideoQuestionForResponse(videoQuestion, req)
    );

    res.status(200).json(normalizedVideoQuestions);
  } catch (err) {
    console.error("Error fetching video questions:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new video question (for admin/teacher)
router.post("/", async (req, res) => {
  try {
    const newVideoQuestion = new VideoQuestion(req.body);
    await newVideoQuestion.save();
    res.status(201).json(normalizeVideoQuestionForResponse(newVideoQuestion, req));
  } catch (err) {
    console.error("Error creating video question:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get all video questions
router.get("/", async (req, res) => {
  try {
    const videoQuestions = await VideoQuestion.find();
    const normalizedVideoQuestions = videoQuestions.map((videoQuestion) =>
      normalizeVideoQuestionForResponse(videoQuestion, req)
    );
    res.status(200).json(normalizedVideoQuestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single video question by ID
router.get("/single/:id", async (req, res) => {
  try {
    const videoQuestion = await VideoQuestion.findById(req.params.id);
    if (!videoQuestion) {
      return res.status(404).json({ message: "Video question not found" });
    }
    res.status(200).json(normalizeVideoQuestionForResponse(videoQuestion, req));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific question from a video question set by parent ID and question index
// Format: /video-questions/single/:parentId/question/:questionIndex
router.get("/single/:parentId/question/:questionIndex", async (req, res) => {
  try {
    const { parentId, questionIndex } = req.params;
    const index = parseInt(questionIndex);
    
    const videoQuestion = await VideoQuestion.findById(parentId);
    if (!videoQuestion) {
      return res.status(404).json({ message: "Video question set not found" });
    }
    
    if (!videoQuestion.questions || index < 0 || index >= videoQuestion.questions.length) {
      return res.status(404).json({ message: "Question index out of range" });
    }
    
    // Return the specific question with video metadata
    const specificQuestion = {
      _id: `${parentId}_q${index}`,
      parentVideoId: parentId,
      questionIndex: index,
      subject: videoQuestion.subject,
      class: videoQuestion.class,
      topic: videoQuestion.topic,
      videoUrl: toAbsoluteMediaUrl(videoQuestion.videoUrl, req),
      videoTitle: videoQuestion.videoTitle,
      videoDescription: videoQuestion.videoDescription,
      videoDuration: videoQuestion.videoDuration,
      question: videoQuestion.questions[index].question,
      options: videoQuestion.questions[index].options,
      correctAnswer: videoQuestion.questions[index].correctAnswer,
      hint: videoQuestion.questions[index].hint,
      solution: videoQuestion.questions[index].solution,
      type: 'video'
    };
    
    res.status(200).json(specificQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update video question
router.put("/:id", async (req, res) => {
  try {
    const updated = await VideoQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Video question not found" });
    }
    res.status(200).json(normalizeVideoQuestionForResponse(updated, req));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete video question
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await VideoQuestion.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) {
      return res.status(404).json({ message: "Video question not found" });
    }
    res.status(200).json({ message: "Video question deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
