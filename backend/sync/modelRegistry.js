const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const School = require("../models/School");
const SchoolAdmin = require("../models/SchoolAdmin");
const SuperAdmin = require("../models/SuperAdmin");
const ClassModel = require("../models/Class");
const VideoQuestion = require("../models/VideoQuestion");
const AudioQuestion = require("../models/AudioQuestion");
const AudioQuizAttempt = require("../models/AudioQuizAttempt");
const PuzzleResult = require("../models/PuzzleResult");
const MATQuestion = require("../models/MATQuestion");
const MATTest = require("../models/MATTest");
const MATProgress = require("../models/MATProgress");
const ExperimentQuestion = require("../models/ExperimentQuestion");
const ExperimentAttempt = require("../models/ExperimentAttempt");
const FeedbackForm = require("../models/FeedbackForm");
const FeedbackResponse = require("../models/FeedbackResponse");
const StudentReport = require("../models/StudentReport");
const QuizReport = require("../models/QuizReport");
const VocabularyChapter = require("../models/VocabularyChapter");
const ClassDocument = require("../models/ClassDocument");
const ClassAnnouncement = require("../models/ClassAnnouncement");

const SYNC_MODELS = {
  questions: Question,
  quizzes: Quiz,
  students: Student,
  teachers: Teacher,
  schools: School,
  schoolAdmins: SchoolAdmin,
  superAdmins: SuperAdmin,
  classes: ClassModel,
  videoQuestions: VideoQuestion,
  audioQuestions: AudioQuestion,
  audioQuizAttempts: AudioQuizAttempt,
  puzzleResults: PuzzleResult,
  matQuestions: MATQuestion,
  matTests: MATTest,
  matProgress: MATProgress,
  experimentQuestions: ExperimentQuestion,
  experimentAttempts: ExperimentAttempt,
  feedbackForms: FeedbackForm,
  feedbackResponses: FeedbackResponse,
  studentReports: StudentReport,
  quizReports: QuizReport,
  vocabularyChapters: VocabularyChapter,
  classDocuments: ClassDocument,
  classAnnouncements: ClassAnnouncement,
};

const SYNC_COLLECTIONS = Object.keys(SYNC_MODELS);

module.exports = {
  SYNC_MODELS,
  SYNC_COLLECTIONS,
};
