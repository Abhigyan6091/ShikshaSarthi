const express = require("express");
const router = express.Router();
const Class = require("../models/Class");
const Quiz = require("../models/Quiz");
const Student = require("../models/Student");
const StudentReport = require("../models/StudentReport");
const ClassAnnouncement = require("../models/ClassAnnouncement");

function notification(type, title, message, createdAt, link, meta = {}) {
  return {
    id: `${type}-${meta.id || createdAt || Math.random()}`,
    type,
    title,
    message,
    createdAt,
    link,
    meta,
  };
}

router.get("/student/:studentId", async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId }).lean();
    if (!student) return res.status(404).json({ error: "Student not found" });

    const classes = await Class.find({
      $or: [
        { students: student.studentId },
        { classId: { $in: student.classes || [] } },
      ],
    }).lean();
    const classIds = classes.map((classDoc) => classDoc.classId);
    const classById = Object.fromEntries(classes.map((classDoc) => [classDoc.classId, classDoc]));

    const [announcements, quizzes] = await Promise.all([
      ClassAnnouncement.find({ classId: { $in: classIds } }).sort({ createdAt: -1 }).limit(30).lean(),
      Quiz.find({
        $or: [
          { "audience.type": "global" },
          { "audience.classIds": { $in: classIds } },
          { audience: { $exists: false } },
        ],
      }).sort({ startTime: -1, createdAt: -1 }).limit(30).lean(),
    ]);

    const notifications = [
      ...announcements.map((announcement) => {
        const classDoc = classById[announcement.classId] || {};
        return notification(
          "announcement",
          announcement.title,
          `Class ${classDoc.className || ""} ${classDoc.subject || ""}: ${announcement.message}`.trim(),
          announcement.createdAt,
          "/student/my-classes",
          { id: announcement.announcementId, classId: announcement.classId }
        );
      }),
      ...quizzes.map((quiz) =>
        notification(
          "quiz",
          `Quiz posted: ${quiz.quizId}`,
          quiz.audience?.type === "classes" ? "Assigned to one of your classes." : "Global quiz available.",
          quiz.startTime || quiz.createdAt,
          `/student/take-advanced-quiz?quizId=${encodeURIComponent(quiz.quizId)}`,
          { id: quiz.quizId }
        )
      ),
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacherId: req.params.teacherId }).select("quizId").lean();
    const quizIds = quizzes.map((quiz) => quiz.quizId);
    const reports = await StudentReport.find({
      quizId: { $in: quizIds },
      submissionStatus: { $ne: "draft" },
    }).sort({ updatedAt: -1 }).limit(40).lean();

    const notifications = reports.map((report) =>
      notification(
        "submission",
        `Quiz submitted: ${report.quizId}`,
        `${report.studentId} submitted the quiz. Score: ${report.correct || 0} correct, ${report.incorrect || 0} incorrect.`,
        report.updatedAt || report.createdAt,
        `/teacher/quiz-analytics/${encodeURIComponent(report.quizId)}`,
        { id: String(report._id), quizId: report.quizId, studentId: report.studentId }
      )
    );

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
