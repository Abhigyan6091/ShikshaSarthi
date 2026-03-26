const express = require("express");
const router = express.Router();
const SuperAdmin = require("../models/SuperAdmin");
const SchoolAdmin = require("../models/SchoolAdmin");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const School = require("../models/School");
const { ensureRecordWithBootstrap } = require("../sync/bootstrapGuard");
const { repairLocalPasswordFromAtlas } = require("../sync/authPasswordRepair");

// SuperAdmin Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const superAdmin = await ensureRecordWithBootstrap(
      () => SuperAdmin.findOne({ username }),
      { trigger: "superadmin-login" }
    );

    if (!superAdmin) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Use bcrypt to compare password
    let isPasswordValid = await superAdmin.comparePassword(password);

    if (!isPasswordValid) {
      const repaired = await repairLocalPasswordFromAtlas({
        model: SuperAdmin,
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
        _id: superAdmin._id,
        username: superAdmin.username,
        name: superAdmin.name,
        role: "superadmin"
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create SuperAdmin (for initial setup only)
router.post("/", async (req, res) => {
  try {
    const superAdmin = new SuperAdmin(req.body);
    await superAdmin.save();
    res.status(201).json(superAdmin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Register School
router.post("/register/school", async (req, res) => {
  try {
    const school = new School(req.body);
    await school.save();
    res.status(201).json(school);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Register SchoolAdmin
router.post("/register/schooladmin", async (req, res) => {
  try {
    const { username, name, password, phone, schoolId } = req.body;
    
    if (!username || !name || !password || !schoolId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify school exists
    const school = await School.findOne({ schoolId });
    if (!school) {
      return res.status(404).json({ error: "School not found" });
    }

    // Create the school admin
    const schoolAdmin = new SchoolAdmin({
      username,
      name,
      password,
      phone,
      schoolId
    });
    await schoolAdmin.save();

    res.status(201).json({ schoolAdmin, school });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Register Teacher
router.post("/register/teacher", async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Register Student
router.post("/register/student", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all schools
router.get("/schools", async (req, res) => {
  try {
    const schools = await School.find();
    res.status(200).json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get total counts
router.get("/stats", async (req, res) => {
  try {
    const schoolCount = await School.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const studentCount = await Student.countDocuments();
    const schoolAdminCount = await SchoolAdmin.countDocuments();

    res.status(200).json({
      schools: schoolCount,
      teachers: teacherCount,
      students: studentCount,
      schoolAdmins: schoolAdminCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get teachers by school
router.get("/schools/:schoolId/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find({ schoolId: req.params.schoolId });
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get students by school
router.get("/schools/:schoolId/students", async (req, res) => {
  try {
    const students = await Student.find({ schoolId: req.params.schoolId });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get school admins by school
router.get("/schools/:schoolId/admins", async (req, res) => {
  try {
    const admins = await SchoolAdmin.find({ schoolId: req.params.schoolId });
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get students by school and class
router.get("/schools/:schoolId/class/:className/students", async (req, res) => {
  try {
    const students = await Student.find({ 
      schoolId: req.params.schoolId,
      class: req.params.className
    });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
