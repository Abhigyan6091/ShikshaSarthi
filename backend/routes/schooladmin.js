const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const SchoolAdmin = require("../models/SchoolAdmin");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Class = require("../models/Class");
const { ensureRecordWithBootstrap } = require("../sync/bootstrapGuard");
const { repairLocalPasswordFromAtlas } = require("../sync/authPasswordRepair");

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
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
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
    let isPasswordValid = await schoolAdmin.comparePassword(password);

    if (!isPasswordValid) {
      const repaired = await repairLocalPasswordFromAtlas({
        model: SchoolAdmin,
        lookupQuery: { username },
        candidatePassword: password,
      });

      if (repaired) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: schoolAdmin._id,
        username: schoolAdmin.username,
        name: schoolAdmin.name,
        schoolId: schoolAdmin.schoolId,
        role: "schooladmin"
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

module.exports = router;
