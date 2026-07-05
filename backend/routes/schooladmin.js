const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const SchoolAdmin = require("../models/SchoolAdmin");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Class = require("../models/Class");
const { ensureRecordWithBootstrap } = require("../sync/bootstrapGuard");
const { requireAuth, signAuthToken } = require("../middleware/auth");
const { checkLoginRateLimit } = require("../middleware/loginRateLimiter");
const { saveBase64Media } = require("../utils/localMediaStore");

async function findSchoolAdminByIdentifier(identifier) {
  if (!identifier) return null;

  let schoolAdmin = await SchoolAdmin.findOne({ username: identifier });
  if (schoolAdmin) return schoolAdmin;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    schoolAdmin = await SchoolAdmin.findById(identifier);
    if (schoolAdmin) return schoolAdmin;
  }

  return null;
}

// SchoolAdmin Login
router.post("/login", async (req, res) => {
  const username = typeof req.body.username === "string" ? req.body.username : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const rateLimited = await checkLoginRateLimit(req, username);
  if (rateLimited) {
    return res.status(429).json(rateLimited);
  }

  try {
    const schoolAdmin = await ensureRecordWithBootstrap(
      () => SchoolAdmin.findOne({ username }),
      { trigger: "schooladmin-login" }
    );

    if (!schoolAdmin) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Use bcrypt to compare password
    const isPasswordValid = await schoolAdmin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    res.status(200).json({
      message: "Login successful",
      token: signAuthToken({ id: schoolAdmin._id, role: "schooladmin", schoolId: schoolAdmin.schoolId, identifier: schoolAdmin.username }),
      user: {
        _id: schoolAdmin._id,
        username: schoolAdmin.username,
        name: schoolAdmin.name,
        schoolId: schoolAdmin.schoolId,
        profilePhoto: schoolAdmin.profilePhoto,
        role: "schooladmin",
        must_change_password: schoolAdmin.must_change_password || false
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get SchoolAdmin by username
router.get("/:username", async (req, res) => {
  try {
    const schoolAdmin = await SchoolAdmin.findOne({ username: req.params.username });
    if (!schoolAdmin) return res.status(404).json({ message: "SchoolAdmin not found" });
    res.status(200).json(schoolAdmin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register Teacher
router.post("/register/teacher", async (req, res) => {
  try {
    const { adminUsername, adminId, adminIdentifier, ...teacherData } = req.body;
    const adminLookupKey = adminUsername || adminId || adminIdentifier;

    const schoolAdmin = await findSchoolAdminByIdentifier(adminLookupKey);
    if (!schoolAdmin) {
      return res.status(404).json({ error: "SchoolAdmin not found" });
    }

    const teacher = new Teacher({ ...teacherData, schoolId: schoolAdmin.schoolId });
    await teacher.save();

    schoolAdmin.teachers.push(teacher.teacherId);
    await schoolAdmin.save();

    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Register Student
router.post("/register/student", async (req, res) => {
  try {
    const { adminUsername, adminId, adminIdentifier, ...studentData } = req.body;
    const adminLookupKey = adminUsername || adminId || adminIdentifier;

    const schoolAdmin = await findSchoolAdminByIdentifier(adminLookupKey);
    if (!schoolAdmin) {
      return res.status(404).json({ error: "SchoolAdmin not found" });
    }

    const student = new Student({ ...studentData, schoolId: schoolAdmin.schoolId });
    await student.save();

    schoolAdmin.students.push(student.studentId);
    await schoolAdmin.save();

    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get stats for school
router.get("/:username/stats", async (req, res) => {
  try {
    const schoolAdmin = await SchoolAdmin.findOne({ username: req.params.username });
    if (!schoolAdmin) {
      return res.status(404).json({ error: "SchoolAdmin not found" });
    }

    const teacherCount = await Teacher.countDocuments({ schoolId: schoolAdmin.schoolId });
    const studentCount = await Student.countDocuments({ schoolId: schoolAdmin.schoolId });

    res.status(200).json({
      teachers: teacherCount,
      students: studentCount,
      schoolId: schoolAdmin.schoolId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get teachers in school
router.get("/:username/teachers", async (req, res) => {
  try {
    const schoolAdmin = await SchoolAdmin.findOne({ username: req.params.username });
    if (!schoolAdmin) {
      return res.status(404).json({ error: "SchoolAdmin not found" });
    }

    const teachers = await Teacher.find({ schoolId: schoolAdmin.schoolId });
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get students in school
router.get("/:username/students", async (req, res) => {
  try {
    const schoolAdmin = await SchoolAdmin.findOne({ username: req.params.username });
    if (!schoolAdmin) {
      return res.status(404).json({ error: "SchoolAdmin not found" });
    }

    const students = await Student.find({ schoolId: schoolAdmin.schoolId });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get students by class
router.get("/:username/class/:className/students", async (req, res) => {
  try {
    const schoolAdmin = await SchoolAdmin.findOne({ username: req.params.username });
    if (!schoolAdmin) {
      return res.status(404).json({ error: "SchoolAdmin not found" });
    }

    const students = await Student.find({
      schoolId: schoolAdmin.schoolId,
      class: req.params.className
    });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete teacher in this school
router.delete("/:username/teachers/:teacherId", requireAuth("schooladmin", "superadmin"), async (req, res) => {
  try {
    const schoolAdmin = await findSchoolAdminByIdentifier(req.params.username);
    if (!schoolAdmin) {
      return res.status(404).json({ error: "SchoolAdmin not found" });
    }

    if (
      req.auth?.role === "schooladmin" &&
      req.auth.schoolId &&
      schoolAdmin.schoolId !== req.auth.schoolId
    ) {
      return res.status(403).json({ error: "You can manage only your own school." });
    }

    const teacher = await Teacher.findOne({
      teacherId: req.params.teacherId,
      schoolId: schoolAdmin.schoolId,
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found in this school" });
    }

    teacher.isDeleted = true;
    await teacher.save();
    await SchoolAdmin.updateOne(
      { _id: schoolAdmin._id },
      { $pull: { teachers: teacher.teacherId } }
    );

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student in this school
router.delete("/:username/students/:studentId", requireAuth("schooladmin", "superadmin"), async (req, res) => {
  try {
    const schoolAdmin = await findSchoolAdminByIdentifier(req.params.username);
    if (!schoolAdmin) {
      return res.status(404).json({ error: "SchoolAdmin not found" });
    }

    if (
      req.auth?.role === "schooladmin" &&
      req.auth.schoolId &&
      schoolAdmin.schoolId !== req.auth.schoolId
    ) {
      return res.status(403).json({ error: "You can manage only your own school." });
    }

    const student = await Student.findOne({
      studentId: req.params.studentId,
      schoolId: schoolAdmin.schoolId,
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found in this school" });
    }

    student.isDeleted = true;
    await student.save();
    await SchoolAdmin.updateOne(
      { _id: schoolAdmin._id },
      { $pull: { students: student.studentId } }
    );
    await Class.updateMany(
      { schoolId: schoolAdmin.schoolId },
      { $pull: { students: student.studentId } }
    );

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update school admin profile (name, profilePhoto)
router.patch("/:username/profile", async (req, res) => {
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
            fileName: `profile_${req.params.username}.${ext}`,
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

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updated = await SchoolAdmin.findOneAndUpdate(
      { username: req.params.username },
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "SchoolAdmin not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
