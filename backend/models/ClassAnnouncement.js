const mongoose = require("mongoose");

const classAnnouncementSchema = new mongoose.Schema({
  announcementId: { type: String, required: true, unique: true },
  classId: { type: String, required: true, index: true },
  teacherId: { type: String, required: true, index: true },
  schoolId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

classAnnouncementSchema.index({ classId: 1, createdAt: -1 });

module.exports = mongoose.model("ClassAnnouncement", classAnnouncementSchema);
