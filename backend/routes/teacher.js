const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Teacher = require("../models/Teacher");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const School = require("../models/School");
const Student = require("../models/Student");
const Class = require("../models/Class");
const SchoolAdmin = require("../models/SchoolAdmin");
const { ensureRecordWithBootstrap } = require("../sync/bootstrapGuard");
const { requireAuth, signAuthToken } = require("../middleware/auth");
const { checkLoginRateLimit } = require("../middleware/loginRateLimiter");
const { saveBase64Media } = require("../utils/localMediaStore");

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

function teacherIdentifierValues(teacher) {
  return [
    teacher.teacherId,
    teacher._id ? teacher._id.toString() : null,
  ].filter(Boolean);
}

async function findQuizzesForTeacher(teacher) {
  const identifiers = teacherIdentifierValues(teacher);
  const createdRefs = (teacher.quizzesCreated || []).map((quizId) => quizId.toString());
  const objectRefs = createdRefs.filter((quizId) => mongoose.isValidObjectId(quizId));
  const or = [{ teacherId: { $in: identifiers } }];

  if (objectRefs.length) {
    or.push({ _id: { $in: objectRefs } });
  }

  if (createdRefs.length) {
    or.push({ quizId: { $in: createdRefs } });
  }

  return Quiz.find({ $or: or }).sort({ createdAt: -1, updatedAt: -1 });
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
  const teacherId = typeof req.body.teacherId === "string" ? req.body.teacherId : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!teacherId || !password) {
    return res
      .status(400)
      .json({ error: "Teacher ID and password are required." });
  }

  const rateLimited = await checkLoginRateLimit(req, teacherId);
  if (rateLimited) {
    return res.status(429).json(rateLimited);
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
    const isPasswordValid = await teacher.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Teacher ID or password." });
    }

    res.status(200).json({
      message: "Login successful",
      token: signAuthToken({ id: teacher._id, role: "teacher", schoolId: teacher.schoolId, identifier: teacher.teacherId }),
      teacher: {
        _id: teacher._id,
        teacherId: teacher.teacherId,
        username: teacher.username,
        name: teacher.name,
        schoolId: teacher.schoolId,
        phone: teacher.phone,
        classes: teacher.classes,
        profilePhoto: teacher.profilePhoto,
        must_change_password: teacher.must_change_password || false
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
    const { password: _password, ...teacherWithoutPassword } = teacher.toObject();
    res.status(200).json(teacherWithoutPassword);
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
router.delete("/:id", requireAuth("superadmin", "schooladmin"), async (req, res) => {
  try {
    const identifier = req.params.id;
    const query = mongoose.isValidObjectId(identifier)
      ? { _id: identifier }
      : { teacherId: identifier };
    const teacher = await Teacher.findOne(query);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    if (
      req.auth?.role === "schooladmin" &&
      req.auth.schoolId &&
      teacher.schoolId !== req.auth.schoolId
    ) {
      return res.status(403).json({ error: "You can delete only teachers from your school." });
    }

    const deleted = await Teacher.findOneAndUpdate(
      query,
      { isDeleted: true },
      { new: true }
    );

    await SchoolAdmin.updateMany(
      { schoolId: deleted.schoolId },
      { $pull: { teachers: deleted.teacherId } }
    );

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

    const quizzes = await findQuizzesForTeacher(teacher);
    res.status(200).json(quizzes);
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
    const teacher = await findTeacherByIdentifier(req.params.teacherId);
    const identifiers = teacher ? teacherIdentifierValues(teacher) : [req.params.teacherId];
    const classes = await Class.find({ teacherId: { $in: identifiers } });
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get students enrolled in this teacher's classes
router.get("/:teacherId/students", async (req, res) => {
  try {
    const teacher = await findTeacherByIdentifier(req.params.teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const identifiers = teacherIdentifierValues(teacher);
    const assignedClassRefs = (teacher.classes || []).map((value) => value.toString());
    const validClassObjectIds = assignedClassRefs.filter((value) => mongoose.isValidObjectId(value));

    const classQuery = {
      $or: [
        { teacherId: { $in: identifiers } },
        { classId: { $in: assignedClassRefs } },
        { className: { $in: assignedClassRefs } },
      ],
    };

    if (validClassObjectIds.length) {
      classQuery.$or.push({ _id: { $in: validClassObjectIds } });
    }

    const classes = await Class.find(classQuery).lean();
    const studentIds = new Set();
    const studentClassMap = new Map();

    classes.forEach((classDoc) => {
      const className = classDoc.className || "Unassigned";
      (classDoc.students || []).forEach((studentId) => {
        const normalizedStudentId = studentId.toString();
        studentIds.add(normalizedStudentId);
        if (!studentClassMap.has(normalizedStudentId)) {
          studentClassMap.set(normalizedStudentId, new Set());
        }
        studentClassMap.get(normalizedStudentId).add(className);
      });
    });

    const students = studentIds.size
      ? await Student.find({ studentId: { $in: Array.from(studentIds) } }).select("-password").lean()
      : [];

    const seen = new Set();
    const uniqueStudents = students.filter((student) => {
      const key = student.studentId || student._id.toString();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const groupedByClass = {};
    uniqueStudents.forEach((student) => {
      const classNames = studentClassMap.get(student.studentId) || new Set([student.class || "Unassigned"]);
      classNames.forEach((className) => {
        if (!groupedByClass[className]) groupedByClass[className] = [];
        groupedByClass[className].push({
          _id: student._id,
          studentId: student.studentId,
          name: student.name,
          phone: student.phone,
          class: className,
          schoolId: student.schoolId,
        });
      });
    });

    res.status(200).json({
      students: uniqueStudents,
      groupedByClass,
      classes,
    });
  } catch (err) {
    console.error("Error fetching teacher students:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update teacher profile (name, profilePhoto)
router.patch("/:id/profile", async (req, res) => {
  try {
    const { name, profilePhoto } = req.body;
    const updateFields = {};

    if (name !== undefined && name.trim()) updateFields.name = name.trim();
    if (profilePhoto !== undefined) {
      if (profilePhoto.startsWith("data:")) {
        const mimeMatch = profilePhoto.match(/^data:(image\/\w+);base64,/);
        if (mimeMatch) {
          const base64Data = profilePhoto;
          const ext = mimeMatch[1].split("/")[1];
          const saved = saveBase64Media({
            base64Data,
            fileName: `profile_${req.params.id}.${ext}`,
            mimeType: mimeMatch[1],
            mediaType: "images",
          });
          updateFields.profilePhoto = saved.localUrl;
        } else {
          return res.status(400).json({ error: "Invalid image format" });
        }
      } else {
        updateFields.profilePhoto = profilePhoto;
      }
    }

    const identifier = req.params.id;
    const query = mongoose.isValidObjectId(identifier)
      ? { _id: identifier }
      : { teacherId: identifier };

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updated = await Teacher.findOneAndUpdate(query, { $set: updateFields }, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
