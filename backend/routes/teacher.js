const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Teacher = require("../models/Teacher");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const School = require("../models/School");
const Student = require("../models/Student");
const { ensureRecordWithBootstrap } = require("../sync/bootstrapGuard");
const { repairLocalPasswordFromAtlas } = require("../sync/authPasswordRepair");

// Create a new teacher
router.post("/", async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Helper: find a teacher by either their custom teacherId or their MongoDB _id
async function findTeacherByIdentifier(identifier) {
  if (!identifier) return null;
  // if it's a valid ObjectId, try by _id first
  if (mongoose.isValidObjectId(identifier)) {
    const byId = await Teacher.findById(identifier);
    if (byId) return byId;
  }
  // fallback to teacherId field
  return await Teacher.findOne({ teacherId: identifier });
}

router.post("/addquestion", async (req, res) => {
  const { teacherId, questionData } = req.body;

  try {
    const teacher = await findTeacherByIdentifier(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Push questionData directly to the embedded array
    teacher.questionAdded.push(questionData);
    await teacher.save();

    res
      .status(201)
      .json({
        message: "Question added to teacher successfully",
        question: questionData,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { teacherId, password } = req.body;

  if (!teacherId || !password) {
    return res
      .status(400)
      .json({ error: "Teacher ID and password are required." });
  }

  try {
    // support logging in by either teacherId or _id
    const teacher = await ensureRecordWithBootstrap(
      () => findTeacherByIdentifier(teacherId),
      { trigger: "teacher-login" }
    );

    if (!teacher) {
      return res.status(401).json({ error: "Invalid Teacher ID or password." });
    }

    // Use bcrypt to compare password
    let isPasswordValid = await teacher.comparePassword(password);

    if (!isPasswordValid) {
      const repaired = await repairLocalPasswordFromAtlas({
        model: Teacher,
        lookupQuery: { teacherId: teacher.teacherId },
        candidatePassword: password,
      });

      if (repaired) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Teacher ID or password." });
    }

    res.status(200).json({
      message: "Login successful",
      teacher: {
        _id: teacher._id,
        teacherId: teacher.teacherId,
        username: teacher.username,
        name: teacher.name,
        schoolId: teacher.schoolId,
        phone: teacher.phone,
        classes: teacher.classes
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// Get all teachers
router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get teacher by ID (with quizzesCreated populated)
router.get("/:id", async (req, res) => {
  try {
    const teacher = await findTeacherByIdentifier(req.params.id);
    if (teacher) await teacher.populate("quizzesCreated");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update teacher by ID
router.put("/:id", async (req, res) => {
  try {
    const identifier = req.params.id;
    // try update by _id or teacherId
    const query = mongoose.isValidObjectId(identifier)
      ? { _id: identifier }
      : { teacherId: identifier };
    const updated = await Teacher.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete teacher by ID
router.delete("/:id", async (req, res) => {
  try {
    const identifier = req.params.id;
    const query = mongoose.isValidObjectId(identifier)
      ? { _id: identifier }
      : { teacherId: identifier };
    const deleted = await Teacher.findOneAndUpdate(
      query,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:teacherId/create-quiz", async (req, res) => {
  try {
    const teacher = await findTeacherByIdentifier(req.params.teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const quizData = {
      ...req.body,
      teacherId: teacher.teacherId || teacher._id.toString(),
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    teacher.quizzesCreated.push(quiz._id);
    await teacher.save();

    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /teachers/:teacherId/quizzes
router.get("/:teacherId/quizzes", async (req, res) => {
  try {
    const teacher = await findTeacherByIdentifier(req.params.teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    await teacher.populate("quizzesCreated");

    res.status(200).json(teacher.quizzesCreated);
  } catch (err) {
    console.error("Error fetching teacher quizzes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Register Student by Teacher
router.post("/register/student", async (req, res) => {
  try {
    const { teacherId, ...studentData } = req.body;
    
    const teacher = await findTeacherByIdentifier(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const student = new Student({ ...studentData, schoolId: teacher.schoolId });
    await student.save();

    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get teacher's classes
router.get("/:teacherId/classes", async (req, res) => {
  try {
    const Class = require("../models/Class");
    const classes = await Class.find({ teacherId: req.params.teacherId });
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
