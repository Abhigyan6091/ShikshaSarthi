const express = require("express");
const router = express.Router();
const AudioQuestion = require("../models/AudioQuestion");
const AudioQuizAttempt = require("../models/AudioQuizAttempt");
const audioCache = require("../utils/audioCache");
const path = require('path');
const fs = require('fs');

// Test route to create a sample attempt
router.post("/test-attempt", async (req, res) => {
  try {
    const testAttempt = new AudioQuizAttempt({
      studentId: "STU001",
      studentName: "Test Student",
      class: "5",
      subject: "mathematics",
      topic: "addition",
      score: 8,
      totalQuestions: 10,
      correctAnswers: 8,
      wrongAnswers: 2,
      skippedQuestions: 0,
      timeTaken: 120,
      audioAnalytics: {
        totalListenTime: 180,
        averageListenPercentage: 85,
        totalReplayCount: 5,
        questionsWithReplays: 3,
        averageAttentionScore: 85
      },
      questionAnalytics: [],
      learningMetrics: {
        audioComprehensionScore: 75,
        listeningEngagementScore: 85,
        audioFocusScore: 68,
        processingEfficiency: 80,
        strategicUsage: 10,
        learningPotential: 82
      }
    });

    await testAttempt.save();
    res.json({ message: "Test attempt created", id: testAttempt._id });
  } catch (error) {
    console.error("Error creating test attempt:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all audio questions
router.get("/", async (req, res) => {
  try {
    const audioQuestions = await AudioQuestion.find();
    res.status(200).json(audioQuestions);
  } catch (error) {
    console.error("Error fetching all audio questions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all audio questions topics for a class
router.get("/topics/:class", async (req, res) => {
  try {
    const { class: className } = req.params;

    // Aggregate to get subjects and topics with question counts
    const result = await AudioQuestion.aggregate([
      { $match: { class: className } },
      {
        $group: {
          _id: { subject: "$subject", topic: "$topic" },
          questionCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.subject",
          topics: {
            $push: {
              topic: "$_id.topic",
              questionCount: "$questionCount"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          subject: "$_id",
          topics: 1
        }
      },
      { $sort: { subject: 1 } }
    ]);

    res.json(result);
  } catch (error) {
    console.error("Error fetching audio topics:", error);
    res.status(500).json({ message: "Error fetching audio question topics", error: error.message });
  }
});

// Get topics for a specific subject in a class
router.get("/topics/:class/:subject", async (req, res) => {
  try {
    const { class: className, subject } = req.params;
    const decodedSubject = decodeURIComponent(subject);

    console.log("Fetching audio topics for:", { className, subject: decodedSubject });

    // Get distinct topics for the subject
    const topics = await AudioQuestion.distinct("topic", {
      class: className,
      subject: decodedSubject
    });

    console.log(`Found ${topics.length} topics for ${decodedSubject}`);

    res.json({ topics });
  } catch (error) {
    console.error("Error fetching audio topics for subject:", error);
    res.status(500).json({ message: "Error fetching audio topics", error: error.message });
  }
});

// Get a single audio question by ID
router.get("/question/:id", async (req, res) => {
  try {
    const question = await AudioQuestion.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: "Audio question not found" });
    }

    res.json(question);
  } catch (error) {
    console.error("Error fetching audio question:", error);
    res.status(500).json({ message: "Error fetching audio question", error: error.message });
  }
});

// Get audio questions by class, subject, and topic
router.get("/:class/:subject/:topic", async (req, res) => {
  try {
    const { class: className, subject, topic } = req.params;

    console.log("Fetching audio questions for:", { className, subject, topic });

    const questions = await AudioQuestion.find({
      class: className,
      subject: decodeURIComponent(subject),
      topic: decodeURIComponent(topic)
    });

    console.log(`Found ${questions.length} audio questions`);

    // Cache audio files in background and update URLs
    const audioUrls = questions.map(q => q.audio).filter(Boolean);
    
    // Start caching in background (don't wait for it)
    if (audioUrls.length > 0) {
      audioCache.batchDownload(audioUrls).then(results => {
        console.log(`Audio caching complete: ${results.success.length} cached, ${results.failed.length} failed`);
      }).catch(err => {
        console.error('Error caching audio files:', err);
      });
    }

    // Return questions with local audio URLs if cached, otherwise Cloudinary URLs
    const questionsWithCachedAudio = questions.map(question => {
      const questionObj = question.toObject();
      if (questionObj.audio) {
        const filename = audioCache.getFilenameFromUrl(questionObj.audio);
        // Use local URL if file will be cached
        questionObj.audioLocal = `/api/audio-questions/audio/${filename}`;
        questionObj.audioOriginal = questionObj.audio;
        // Set audio to local URL for immediate use (will fallback to Cloudinary if not cached yet)
        questionObj.audio = questionObj.audioLocal;
      }
      return questionObj;
    });

    res.json(questionsWithCachedAudio);
  } catch (error) {
    console.error("Error fetching audio questions:", error);
    res.status(500).json({ message: "Error fetching audio questions", error: error.message });
  }
});

// Serve cached audio files
// Frontend may request: /api/audio-questions/audio/<filename> (proxied to backend /audio-questions/audio/:filename)
router.get('/audio/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'data', 'audio-cache', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Audio file not found' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate');
    audioCache.scheduleDeleteByFilename(filename);
    res.sendFile(filePath);
  } catch (err) {
    console.error('Error serving cached audio file:', err);
    res.status(500).json({ message: 'Error serving audio file' });
  }
});

// Create a new audio question (for admin/teacher)
router.post("/", async (req, res) => {
  try {
    const audioQuestion = new AudioQuestion(req.body);
    await audioQuestion.save();
    res.status(201).json({ message: "Audio question created successfully", question: audioQuestion });
  } catch (error) {
    console.error("Error creating audio question:", error);
    res.status(500).json({ message: "Error creating audio question", error: error.message });
  }
});

// Update an audio question
router.put("/:id", async (req, res) => {
  try {
    const audioQuestion = await AudioQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!audioQuestion) {
      return res.status(404).json({ message: "Audio question not found" });
    }

    res.json({ message: "Audio question updated successfully", question: audioQuestion });
  } catch (error) {
    console.error("Error updating audio question:", error);
    res.status(500).json({ message: "Error updating audio question", error: error.message });
  }
});

// Delete an audio question
router.delete("/:id", async (req, res) => {
  try {
    const audioQuestion = await AudioQuestion.findByIdAndDelete(req.params.id);

    if (!audioQuestion) {
      return res.status(404).json({ message: "Audio question not found" });
    }

    res.json({ message: "Audio question deleted successfully" });
  } catch (error) {
    console.error("Error deleting audio question:", error);
    res.status(500).json({ message: "Error deleting audio question", error: error.message });
  }
});

// Save audio quiz attempt
router.post("/attempt", async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      class: className,
      subject,
      topic,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      skippedQuestions,
      timeTaken,
      audioAnalytics,
      questionAnalytics,
      learningMetrics
    } = req.body;

    console.log("Received audio quiz attempt:", { studentId, subject, topic, score });

    const attempt = new AudioQuizAttempt({
      studentId,
      studentName,
      class: className,
      subject,
      topic,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      skippedQuestions,
      timeTaken,
      audioAnalytics,
      questionAnalytics,
      learningMetrics,
      attemptedAt: new Date()
    });

    await attempt.save();

    console.log("Audio quiz attempt saved successfully:", attempt._id);

    res.status(201).json({
      message: "Audio quiz attempt saved successfully",
      attemptId: attempt._id
    });
  } catch (error) {
    console.error("Error saving audio quiz attempt:", error);
    res.status(500).json({
      message: "Error saving audio quiz attempt",
      error: error.message
    });
  }
});

// Get ALL audio quiz attempts from the database
router.get("/attempts", async (req, res) => {
  try {
    console.log("🔍 Fetching all audio quiz attempts from database");
    
    const attempts = await AudioQuizAttempt.find({})
      .sort({ attemptedAt: -1 })
      .limit(100); // Limit to most recent 100 attempts

    console.log("✅ Found total attempts in DB:", attempts.length);
    
    if (attempts.length > 0) {
      console.log("📊 Sample data:", {
        firstAttempt: {
          studentId: attempts[0].studentId,
          subject: attempts[0].subject,
          topic: attempts[0].topic,
          score: attempts[0].score,
          attemptedAt: attempts[0].attemptedAt
        }
      });
    }

    res.json(attempts);
  } catch (error) {
    console.error("Error fetching all audio quiz attempts:", error);
    res.status(500).json({
      message: "Error fetching all audio quiz attempts",
      error: error.message
    });
  }
});

// Get student's audio quiz attempts
router.get("/attempts/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, topic } = req.query;

    console.log("🔍 Fetching attempts for studentId:", studentId);

    const filter = { studentId };
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;

    console.log("🔍 Filter:", filter);

    const attempts = await AudioQuizAttempt.find(filter)
      .sort({ attemptedAt: -1 })
      .limit(50);

    console.log("✅ Found attempts:", attempts.length);
    
    // Also check ALL attempts in database
    const allAttempts = await AudioQuizAttempt.find({});
    console.log("📊 Total attempts in DB:", allAttempts.length);
    if (allAttempts.length > 0) {
      console.log("📊 Sample studentIds in DB:", allAttempts.map(a => a.studentId));
    }

    res.json(attempts);
  } catch (error) {
    console.error("Error fetching audio quiz attempts:", error);
    res.status(500).json({
      message: "Error fetching audio quiz attempts",
      error: error.message
    });
  }
});

// Get audio quiz statistics for a student
router.get("/stats/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const stats = await AudioQuizAttempt.aggregate([
      { $match: { studentId: mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: "$subject",
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$score" },
          avgAudioListenTime: { $avg: "$audioAnalytics.totalListenTime" },
          avgListenPercentage: { $avg: "$audioAnalytics.avgListenPercentage" },
          totalQuizzes: { $sum: 1 }
        }
      },
      { $sort: { totalAttempts: -1 } }
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Error fetching audio quiz stats:", error);
    res.status(500).json({
      message: "Error fetching audio quiz statistics",
      error: error.message
    });
  }
});

// Serve cached audio files
router.get("/audio/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = require('path').join(audioCache.CACHE_DIR, filename);
    
    // Check if file exists in cache
    if (require('fs').existsSync(filePath)) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate');
      audioCache.scheduleDeleteByFilename(filename);
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'Audio file not found in cache' });
    }
  } catch (error) {
    console.error("Error serving cached audio:", error);
    res.status(500).json({ message: "Error serving audio file", error: error.message });
  }
});

// Get cache statistics
router.get("/cache/stats", (req, res) => {
  try {
    const stats = audioCache.getCacheStats();
    res.json(stats);
  } catch (error) {
    console.error("Error getting cache stats:", error);
    res.status(500).json({ message: "Error getting cache statistics", error: error.message });
  }
});

// Clear audio cache (admin only - add authentication in production)
router.delete("/cache/clear", (req, res) => {
  try {
    const result = audioCache.clearCache();
    res.json(result);
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({ message: "Error clearing cache", error: error.message });
  }
});

module.exports = router;
