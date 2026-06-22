const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define embedded question schema
const embeddedQuestionSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    class: { type: String, required: true },
    topic: { type: String, required: true },
    question: { type: String, required: true },
    questionImage: { type: String },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    hint: {
      text: { type: String },
      image: { type: String },
      video: { type: String },
    },
  },
  { _id: false }
); // disable _id for subdocuments if you prefer

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true },
  username: { type: String }, // Make optional, will default to teacherId
  name: { type: String, required: true },
  phone: String,
  profilePhoto: { type: String },
  schoolId: { type: String, ref: "School", required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  must_change_password: { type: Boolean, default: false },
  classes: [{ type: String, ref: "Class" }], // Classes assigned to teacher
  quizzesCreated: [{ type: String, ref: "Quiz" }],
  questionAdded: [embeddedQuestionSchema], // ✅ Embed questions directly
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to set username to teacherId if not provided
teacherSchema.pre('save', async function (next) {
  if (!this.username) {
    this.username = this.teacherId;
  }

  // Hash password if it's modified or new
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Method to compare password for login
teacherSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("Teacher", teacherSchema);
