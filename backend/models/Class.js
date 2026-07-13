const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  classId: { type: String, required: true, unique: true }, // Auto-generated unique ID
  className: { type: String, required: true }, // Class number: "1" to "12"
  subject: { type: String, required: true }, // e.g., "Mathematics", "Science"
  teacherId: { type: String, ref: "Teacher", required: true },
  schoolId: { type: String, ref: "School", required: true },
  students: [{ type: String, ref: "Student" }],
  // Per-student enrollment timestamps, keyed by studentId. Used to scope quiz
  // visibility to content posted after a student joined the class.
  studentJoinedAt: { type: Map, of: Date, default: {} },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Class", classSchema);
