const express = require("express");
const router = express.Router();
const School = require("../models/School");
const { requireAuth } = require("../middleware/auth");

// Create a new school
router.post("/", async (req, res) => {
  try {
    const school = new School(req.body);
    await school.save();
    res.status(201).json(school);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all schools
router.get("/", async (req, res) => {
  try {
    const schools = await School.find();
    res.status(200).json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get school by schoolId (custom ID)
router.get("/by-school-id/:schoolId", async (req, res) => {
  try {
    const school = await School.findOne({ schoolId: req.params.schoolId });
    if (!school) return res.status(404).json({ message: "School not found" });
    res.status(200).json(school);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get school by ID
router.get("/:id", async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: "School not found" });
    res.status(200).json(school);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update school by ID
router.put("/:id", async (req, res) => {
  try {
    const updated = await School.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "School not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete school by ID
router.delete("/:id", requireAuth("superadmin"), async (req, res) => {
  try {
    const deleted = await School.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) return res.status(404).json({ message: "School not found" });
    res.status(200).json({ message: "School deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
