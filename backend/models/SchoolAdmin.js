const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const schoolAdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  must_change_password: { type: Boolean, default: false },
  profilePhoto: { type: String },
  schoolId: { type: String, ref: "School", required: true },
  phone: String,
  teachers: [{ type: String, ref: "Teacher" }],
  students: [{ type: String, ref: "Student" }],
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to hash password
schoolAdminSchema.pre('save', async function (next) {
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
schoolAdminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("SchoolAdmin", schoolAdminSchema);
