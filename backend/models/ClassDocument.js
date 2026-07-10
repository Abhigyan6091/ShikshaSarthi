const mongoose = require("mongoose");

const classDocumentSchema = new mongoose.Schema({
  documentId: { type: String, required: true, unique: true },
  classId: { type: String, required: true, index: true },
  teacherId: { type: String, required: true, index: true },
  schoolId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  localPath: { type: String, required: true },
  localUrl: { type: String, required: true },
  cloudUrl: { type: String, default: null },
  dataUrl: { type: String, default: "" },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

classDocumentSchema.index({ classId: 1, createdAt: -1 });

module.exports = mongoose.model("ClassDocument", classDocumentSchema);
