const express = require("express");
const router = express.Router();
const SuperAdmin = require("../models/SuperAdmin");
const SchoolAdmin = require("../models/SchoolAdmin");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const School = require("../models/School");
const { ensureRecordWithBootstrap } = require("../sync/bootstrapGuard");
const { requireAuth, signAuthToken } = require("../middleware/auth");
const { checkLoginRateLimit } = require("../middleware/loginRateLimiter");

// SuperAdmin Login
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
    const superAdmin = await ensureRecordWithBootstrap(
      () => SuperAdmin.findOne({ username }),
      { trigger: "superadmin-login" }
    );

    if (!superAdmin) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Use bcrypt to compare password
    const isPasswordValid = await superAdmin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    res.status(200).json({
      message: "Login successful",
      token: signAuthToken({ id: superAdmin._id, role: "superadmin", identifier: superAdmin.username }),
      user: {
        _id: superAdmin._id,
        username: superAdmin.username,
        name: superAdmin.name,
        role: "superadmin",
        must_change_password: superAdmin.must_change_password || false
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

// Register School with its admin (1 school = 1 admin)
router.post("/register/school", async (req, res) => {
  try {
    const { schoolId, schoolName, location, adminName, adminUsername, adminPassword, adminPhone } = req.body;

    if (!schoolId || !schoolName || !location) {
      return res.status(400).json({ error: "School ID, name, and location are required" });
    }

    if (!adminName || !adminUsername || !adminPassword) {
      return res.status(400).json({ error: "Admin name, username, and password are required" });
    }

    // Check if schoolId already exists
    const existingSchool = await School.findOne({ schoolId });
    if (existingSchool) {
      return res.status(409).json({ error: "A school with this ID already exists" });
    }

    // Check if adminUsername is taken
    const existingAdmin = await SchoolAdmin.findOne({ username: adminUsername });
    if (existingAdmin) {
      return res.status(409).json({ error: "A school admin with this username already exists" });
    }

    // Create school
    const school = new School({ schoolId, schoolName, location });
    await school.save();

    // Create school admin for this school (enforce 1 admin per school)
    const schoolAdmin = new SchoolAdmin({
      username: adminUsername,
      name: adminName,
      password: adminPassword,
      phone: adminPhone,
      schoolId
    });
    await schoolAdmin.save();

    res.status(201).json({ school, schoolAdmin });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Register SchoolAdmin (enforce 1 admin per school)
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

    // Enforce 1 admin per school
    const existingAdmin = await SchoolAdmin.findOne({ schoolId });
    if (existingAdmin) {
      return res.status(409).json({ error: "This school already has an admin. Each school can have only one admin." });
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

// Superadmin can delete any school profile.
router.delete("/schools/:schoolId", requireAuth("superadmin"), async (req, res) => {
  try {
    const school = await School.findOneAndUpdate(
      { schoolId: req.params.schoolId },
      { isDeleted: true },
      { new: true }
    );
    if (!school) return res.status(404).json({ message: "School not found" });
    res.status(200).json({ message: "School deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Superadmin can delete any school admin profile.
router.delete("/schooladmins/:username", requireAuth("superadmin"), async (req, res) => {
  try {
    const schoolAdmin = await SchoolAdmin.findOneAndUpdate(
      { username: req.params.username },
      { isDeleted: true },
      { new: true }
    );
    if (!schoolAdmin) return res.status(404).json({ message: "School admin not found" });
    res.status(200).json({ message: "School admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Superadmin can delete any teacher profile.
router.delete("/teachers/:teacherId", requireAuth("superadmin"), async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndUpdate(
      { teacherId: req.params.teacherId },
      { isDeleted: true },
      { new: true }
    );
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    await SchoolAdmin.updateMany(
      { schoolId: teacher.schoolId },
      { $pull: { teachers: teacher.teacherId } }
    );

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Superadmin can delete any student profile.
router.delete("/students/:studentId", requireAuth("superadmin"), async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { studentId: req.params.studentId },
      { isDeleted: true },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: "Student not found" });

    await SchoolAdmin.updateMany(
      { schoolId: student.schoolId },
      { $pull: { students: student.studentId } }
    );

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
