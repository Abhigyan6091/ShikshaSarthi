const express = require("express");
const fs = require("fs");
const router = express.Router();
const Class = require("../models/Class");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Quiz = require("../models/Quiz");
const ClassDocument = require("../models/ClassDocument");
const ClassAnnouncement = require("../models/ClassAnnouncement");
const { saveBase64Media, resolveLocalAbsolutePath } = require("../utils/localMediaStore");

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function publicClassPayload(classData, extras = {}) {
  return {
    ...classData.toObject ? classData.toObject() : classData,
    ...extras,
  };
}

async function getClassWithContent(classId) {
  const classData = await Class.findOne({ classId });
  if (!classData) return null;

  const [studentDetails, documents, announcements, quizzes] = await Promise.all([
    Student.find({ studentId: { $in: classData.students || [] } }).select("studentId name class batch phone schoolId"),
    ClassDocument.find({ classId }).sort({ createdAt: -1 }),
    ClassAnnouncement.find({ classId }).sort({ createdAt: -1 }),
    Quiz.find({
      $or: [
        { "audience.type": "global" },
        { "audience.classIds": classId },
      ],
    }).sort({ startTime: -1, createdAt: -1 }),
  ]);

  return publicClassPayload(classData, { studentDetails, documents, announcements, quizzes });
}

function assertTeacherOwnsClass(classData, teacherId) {
  return classData && String(classData.teacherId) === String(teacherId);
}

// Create a new class
router.post("/", async (req, res) => {
  try {
    const { className, subject, teacherId, schoolId, description } = req.body;

    if (!className || !subject || !teacherId || !schoolId) {
      return res.status(400).json({ error: "Missing required fields: className, subject, teacherId, schoolId" });
    }

    const classId = `${schoolId}-${teacherId}-${className}-${subject}-${Date.now()}`.replace(/\s+/g, "-");
    const newClass = new Class({ classId, className, subject, teacherId, schoolId, description: description || "" });
    await newClass.save();

    await Teacher.findOneAndUpdate(
      { teacherId },
      { $addToSet: { classes: newClass.classId } }
    );

    res.status(201).json(newClass);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get students by school (for filtering) -- specific routes must stay above /:classId.
router.get("/school/:schoolId/students", async (req, res) => {
  try {
    const students = await Student.find({ schoolId: req.params.schoolId })
      .select("studentId name class batch phone schoolId")
      .sort({ batch: 1, class: 1, name: 1 });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/school/:schoolId/class/:className/subjects", async (req, res) => {
  try {
    const classes = await Class.find({
      schoolId: req.params.schoolId,
      className: req.params.className,
    });

    const subjects = [...new Set(classes.map((c) => c.subject))];
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all classes for a teacher
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.params.teacherId }).sort({ createdAt: -1 });
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full teacher workspace data for classes, documents, announcements and targeted quizzes.
router.get("/teacher/:teacherId/workspace", async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.params.teacherId }).sort({ createdAt: -1 });
    const classIds = classes.map((item) => item.classId);
    const [documents, announcements, quizzes] = await Promise.all([
      ClassDocument.find({ classId: { $in: classIds } }).sort({ createdAt: -1 }),
      ClassAnnouncement.find({ classId: { $in: classIds } }).sort({ createdAt: -1 }),
      Quiz.find({
        teacherId: req.params.teacherId,
        $or: [
          { "audience.type": "global" },
          { "audience.classIds": { $in: classIds } },
          { audience: { $exists: false } },
        ],
      }).sort({ startTime: -1, createdAt: -1 }),
    ]);

    res.status(200).json({ classes, documents, announcements, quizzes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student class workspace with only enrolled class content.
router.get("/student/:studentId", async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId }).select("-password");
    if (!student) return res.status(404).json({ error: "Student not found" });

    const classes = await Class.find({
      $or: [
        { students: student.studentId },
        { classId: { $in: student.classes || [] } },
      ],
    }).sort({ createdAt: -1 });
    const classIds = classes.map((item) => item.classId);

    // Earliest join date per class this student belongs to. Falls back to the
    // class creation date for legacy enrollments recorded before we tracked
    // per-student join timestamps.
    const joinedAtByClassId = new Map(
      classes.map((c) => [
        c.classId,
        (c.studentJoinedAt && c.studentJoinedAt.get(student.studentId)) || c.createdAt || new Date(0),
      ])
    );

    const [documents, announcements, quizzesRaw] = await Promise.all([
      ClassDocument.find({ classId: { $in: classIds } }).sort({ createdAt: -1 }),
      ClassAnnouncement.find({ classId: { $in: classIds } }).sort({ createdAt: -1 }),
      Quiz.find({
        $or: [
          { "audience.type": "global" },
          { "audience.classIds": { $in: classIds } },
          { audience: { $exists: false } },
        ],
      }).sort({ startTime: -1, createdAt: -1 }),
    ]);

    // Only show class-targeted quizzes created after the student joined that
    // class. Global quizzes remain visible to everyone regardless of join date.
    const quizzes = quizzesRaw.filter((quiz) => {
      const targetClassIds = quiz.audience?.classIds || [];
      const isClassTargeted = quiz.audience?.type !== "global" && targetClassIds.length > 0;
      if (!isClassTargeted) return true;

      const quizCreatedAt = quiz.createdAt || quiz.startTime || new Date(0);
      return targetClassIds.some((classId) => {
        const joinedAt = joinedAtByClassId.get(classId);
        return !joinedAt || quizCreatedAt >= joinedAt;
      });
    });

    res.status(200).json({ student, classes, documents, announcements, quizzes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific class with student/content details
router.get("/:classId", async (req, res) => {
  try {
    const payload = await getClassWithContent(req.params.classId);
    if (!payload) return res.status(404).json({ message: "Class not found" });
    res.status(200).json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add student to class
router.post("/:classId/students", async (req, res) => {
  try {
    const { studentId } = req.body;
    const classData = await Class.findOne({ classId: req.params.classId });
    if (!classData) return res.status(404).json({ error: "Class not found" });

    if (!classData.students.includes(studentId)) {
      classData.students.push(studentId);
      classData.studentJoinedAt.set(studentId, new Date());
      await classData.save();
      await Student.findOneAndUpdate({ studentId }, { $addToSet: { classes: classData.classId } });
    }

    res.status(200).json(await getClassWithContent(req.params.classId));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove student from class
router.delete("/:classId/students/:studentId", async (req, res) => {
  try {
    const classData = await Class.findOne({ classId: req.params.classId });
    if (!classData) return res.status(404).json({ error: "Class not found" });

    classData.students = classData.students.filter((studentId) => studentId !== req.params.studentId);
    await classData.save();
    await Student.findOneAndUpdate({ studentId: req.params.studentId }, { $pull: { classes: classData.classId } });

    res.status(200).json({ message: "Student removed from class" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher posts an announcement to a class.
router.post("/:classId/announcements", async (req, res) => {
  try {
    const classData = await Class.findOne({ classId: req.params.classId });
    if (!classData) return res.status(404).json({ error: "Class not found" });
    if (!assertTeacherOwnsClass(classData, req.body.teacherId)) {
      return res.status(403).json({ error: "Only the class teacher can post announcements." });
    }

    const title = String(req.body.title || "").trim();
    const message = String(req.body.message || "").trim();
    if (!title || !message) {
      return res.status(400).json({ error: "title and message are required" });
    }

    const announcement = new ClassAnnouncement({
      announcementId: id("ANN"),
      classId: classData.classId,
      teacherId: classData.teacherId,
      schoolId: classData.schoolId,
      title,
      message,
    });
    await announcement.save();

    res.status(201).json(announcement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:classId/announcements/:announcementId", async (req, res) => {
  try {
    const classData = await Class.findOne({ classId: req.params.classId });
    if (!classData) return res.status(404).json({ error: "Class not found" });
    if (req.query.teacherId && !assertTeacherOwnsClass(classData, req.query.teacherId)) {
      return res.status(403).json({ error: "Only the class teacher can delete announcements." });
    }

    const deleted = await ClassAnnouncement.findOneAndUpdate(
      { announcementId: req.params.announcementId, classId: req.params.classId },
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) return res.status(404).json({ error: "Announcement not found" });
    res.status(200).json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:classId/documents/:documentId/download", async (req, res) => {
  try {
    const document = await ClassDocument.findOne({
      classId: req.params.classId,
      documentId: req.params.documentId,
    });
    if (!document) return res.status(404).json({ error: "Document not found" });

    try {
      const absolutePath = resolveLocalAbsolutePath(document.localPath);
      if (fs.existsSync(absolutePath)) {
        return res.download(absolutePath, document.originalName);
      }
    } catch (_error) {
      // Fall through to synced inline payload.
    }

    if (document.dataUrl && document.dataUrl.includes(",")) {
      const base64 = document.dataUrl.slice(document.dataUrl.indexOf(",") + 1);
      const buffer = Buffer.from(base64, "base64");
      res.setHeader("Content-Type", document.mimeType || "application/octet-stream");
      res.setHeader("Content-Disposition", `inline; filename="${String(document.originalName || "document").replace(/"/g, "")}"`);
      return res.send(buffer);
    }

    if (document.cloudUrl) {
      return res.redirect(document.cloudUrl);
    }

    return res.status(404).json({ error: "Document file is not available on this server yet." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher uploads a local-first document to a class. Frontend sends base64 so
// the packaged LAN server needs no multipart dependency.
router.post("/:classId/documents", async (req, res) => {
  try {
    const classData = await Class.findOne({ classId: req.params.classId });
    if (!classData) return res.status(404).json({ error: "Class not found" });
    if (!assertTeacherOwnsClass(classData, req.body.teacherId)) {
      return res.status(403).json({ error: "Only the class teacher can upload documents." });
    }

    const { base64Data, fileName, mimeType } = req.body || {};
    const title = String(req.body.title || fileName || "").trim();
    if (!base64Data || !fileName || !title) {
      return res.status(400).json({ error: "title, fileName and base64Data are required" });
    }
    if (!DOCUMENT_MIME_TYPES.has(String(mimeType || ""))) {
      return res.status(400).json({ error: "Only PDF, Word, and PowerPoint files are allowed." });
    }

    const saved = saveBase64Media({
      base64Data,
      fileName,
      mimeType,
      mediaType: "documents",
    });

    const document = new ClassDocument({
      documentId: id("DOC"),
      classId: classData.classId,
      teacherId: classData.teacherId,
      schoolId: classData.schoolId,
      title,
      originalName: fileName,
      mimeType,
      fileSize: saved.byteSize,
      localPath: saved.localPath,
      localUrl: saved.localUrl,
      dataUrl: base64Data,
      description: String(req.body.description || ""),
    });
    await document.save();

    res.status(201).json(document);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:classId/documents/:documentId", async (req, res) => {
  try {
    const classData = await Class.findOne({ classId: req.params.classId });
    if (!classData) return res.status(404).json({ error: "Class not found" });
    if (req.query.teacherId && !assertTeacherOwnsClass(classData, req.query.teacherId)) {
      return res.status(403).json({ error: "Only the class teacher can delete documents." });
    }

    const deleted = await ClassDocument.findOneAndUpdate(
      { documentId: req.params.documentId, classId: req.params.classId },
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) return res.status(404).json({ error: "Document not found" });
    res.status(200).json({ message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
