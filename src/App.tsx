import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { QuizProvider } from "@/contexts/QuizContext";
import { startSyncManager } from "@/services/syncManager";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import NotAuthorized from "./pages/NotAuthorized";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ForceChangePassword from "./pages/ForceChangePassword";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentGiveFeedback from "./pages/student/GiveFeedback";
import StudentPractice from "./pages/student/Practice";
import PracticeQuiz from "./pages/student/PracticeQuiz";
import QuizById from "./pages/student/QuizById";
import GroupQuiz from "./pages/student/GroupQuiz";
import StudentReport from "./pages/student/StudentReport";
import SingleQuizReport from "./pages/student/SingleQuizReport";
import SubjectTopics from "./pages/student/SubjectTopics";
import VocabularyQuizPage from "./pages/student/VocalbularyQuizPage";
import StudentProfile from "./pages/student/StudentProfile";
import MultimediaAssessment from "./pages/student/MultimediaAssessment";
import AudioQuestions from "./pages/student/AudioQuestions";
import AudioSubjectTopics from "./pages/student/AudioSubjectTopics";
import AudioQuizPlayer from "./pages/student/AudioQuizPlayer";
import AudioQuizHistory from "./pages/student/AudioQuizHistory";
import VideoQuestions from "./pages/student/VideoQuestions";
import VideoSubjectTopics from "./pages/student/VideoSubjectTopics";
import VideoQuizPlayer from "./pages/student/VideoQuizPlayer";
import Puzzles from "./pages/student/Puzzles";
import PuzzleHistory from "./pages/student/PuzzleHistory";
import MAT from "./pages/student/MAT";
import MATPractice from "./pages/student/MATPractice";
import MATTopicTest from "./pages/student/MATTopicTest";
import MATTestResults from "./pages/student/MATTestResults";
import MATAnimatedDemo from "./pages/student/MATAnimatedDemo";
import TakeAdvancedQuiz from "./pages/student/TakeAdvancedQuiz";
import AdvancedQuizPlayer from "./pages/student/AdvancedQuizPlayer";
import AdvancedQuizResults from "./pages/student/AdvancedQuizResults";
import AdvancedQuizPastReports from "./pages/student/AdvancedQuizPastReports";
import DemoTest from "./pages/DemoTest";
import ExperimentSimulation from "./pages/student/experimentSimulation/ExperimentSimulation";
import ExperimentList from "./pages/student/experimentSimulation/ExperimentList";
import ExperimentPage from "./pages/student/experimentSimulation/ExperimentPage";
import LabQuiz from "./pages/student/experimentSimulation/LabQuiz";
import ExperimentAnalytics from "./pages/student/experimentSimulation/ExperimentAnalytics";
import GyanKiYatra from "./pages/student/GyanKiYatra";
import AdaptiveTest from "./pages/student/AdaptiveTest";
import AdaptiveTestHistoryReview from "./pages/student/AdaptiveTestHistoryReview";
import MyClasses from "./pages/student/MyClasses";

// Question Page
import Upload_question from "./components/questions/Upload_question";
import LoginStudent from "./pages/LoginStudent";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/Dashboard";
import CreateQuiz from "./pages/teacher/CreateQuiz";
import CreateQuizNew from "./pages/teacher/CreateQuizNewFixed";
import QuizAnalytics from "./pages/teacher/QuizAnalyticsFinal"; // Updated to final version
import Analytics from "./pages/teacher/Analytics";
import AddMyQuestion from "./pages/teacher/AddMyquestion";
import QuizDetails from "./pages/teacher/QuizDetails";
import QuizAnalyticsPage from "./pages/teacher/QuizAnalyticsPage";
import ManageClasses from "./pages/teacher/ManageClasses";
import ClassStudents from "./pages/teacher/ClassStudents";
import TeacherProfile from "./pages/TeacherProfileFixed";

// Admin Pages
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import SuperadminQuestionBankManagement from "./pages/superadmin/QuestionBankManagement";
import SchoolAdminDashboard from "./pages/schooladmin/Dashboard";
import SchoolAdminProfile from "./pages/schooladmin/Profile";
import TeacherProfileView from "./pages/schooladmin/TeacherProfileView";
import FeedbackManagement from "./pages/schooladmin/FeedbackManagement";
import CreateFeedbackForm from "./pages/schooladmin/CreateFeedbackForm";
import EditFeedbackForm from "./pages/schooladmin/EditFeedbackForm";
import AnalyzeFeedback from "./pages/schooladmin/AnalyzeFeedback";
import GiveFeedback from "./pages/teacher/GiveFeedbackFixed";
import AllQuestions from "./pages/teacher/AllQuestionsFixed";

// Settings
import Settings from "./pages/SettingsFixed";

//Quiz

import MemoryMatchGrid from "./components/puzzles/memoryMatchGrid/MemoryMatchGrid";
import MatchPieces from "./components/puzzles/matchPieces/MatchPieces";

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />
      <Route path="/uploadquestion" element={<Upload_question />} />
      <Route path="/demo-test" element={<DemoTest />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/change-password" element={<ForceChangePassword />} />


      {/* Admin Routes */}
      <Route path="/superadmin" element={<SuperAdminDashboard />} />
      <Route path="/superadmin/question-bank" element={<SuperadminQuestionBankManagement />} />
      <Route path="/schooladmin" element={<SchoolAdminDashboard />} />
      <Route path="/schooladmin/profile" element={<SchoolAdminProfile />} />
      <Route path="/schooladmin/teacher-profile/:teacherId" element={<TeacherProfileView />} />
      <Route path="/schooladmin/feedback-management" element={<FeedbackManagement />} />
      <Route path="/schooladmin/create-feedback-form" element={<CreateFeedbackForm />} />
      <Route path="/schooladmin/edit-feedback-form/:formId" element={<EditFeedbackForm />} />
      <Route path="/schooladmin/analyze-feedback" element={<AnalyzeFeedback />} />

      {/* Settings Routes */}
      <Route path="/student/settings" element={<Settings />} />
      <Route path="/teacher/settings" element={<Settings />} />
      <Route path="/schooladmin/settings" element={<Settings />} />

      {/* Student Routes */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/feedback" element={<StudentGiveFeedback />} />
      <Route path="/student/profile" element={<StudentProfile />} />
      <Route path="/student/profile/:id" element={<StudentProfile />} />
      <Route path="/student/assessment/:id" element={<StudentProfile />} />
      <Route path="/student/experiments" element={<ExperimentSimulation />} />
      <Route path="/student/experiments/:subject" element={<ExperimentList />} />
      <Route path="/student/experiment/:experimentName" element={<ExperimentPage />} />
      <Route path="/student/experiments/analytics" element={<ExperimentAnalytics />} />
      <Route path="/student/experiments/:subject/quiz" element={<LabQuiz />} />
      <Route path="/student/practice" element={<StudentPractice />} />
      <Route path="/student/adaptive-test" element={<AdaptiveTest />} />
      <Route path="/student/adaptive-test/history/:attemptId" element={<AdaptiveTestHistoryReview />} />
      <Route path="/student/my-classes" element={<MyClasses />} />
      <Route path="/student/practice/:subject" element={<SubjectTopics />} />
      <Route path="/student/practice/vocab" element={<VocabularyQuizPage />} />
      <Route path="/student/practice/:subject/:topic" element={<PracticeQuiz />} />
      <Route path="/student/quiz" element={<QuizById />} />
      <Route path="/student/group-quiz" element={<GroupQuiz />} />
      <Route path="/student/multimedia-assessment" element={<MultimediaAssessment />} />
      <Route path="/student/multimedia/audio-questions" element={<AudioQuestions />} />
      <Route path="/student/audio-questions/:subject" element={<AudioSubjectTopics />} />
      <Route path="/student/multimedia/audio-quiz/:subject/:topic" element={<AudioQuizPlayer />} />
      <Route path="/student/audio-quiz-history" element={<AudioQuizHistory />} />
      <Route path="/student/multimedia/video-questions" element={<VideoQuestions />} />
      <Route path="/student/video-questions" element={<VideoQuestions />} />
      <Route path="/student/video-questions/:subject" element={<VideoSubjectTopics />} />
      <Route path="/student/video-quiz/:subject/:topic" element={<VideoQuizPlayer />} />
      <Route path="/student/multimedia/puzzles" element={<Puzzles />} />
      <Route path="/student/puzzle-history" element={<PuzzleHistory />} />
      <Route path="/student/puzzles/memory-match" element={<MemoryMatchGrid />} />
      <Route path="/student/puzzles/match-pieces" element={<MatchPieces />} />
      <Route path="/student/multimedia/miscellaneous" element={<MAT />} />
      <Route path="/student/mat" element={<MAT />} />
      <Route path="/student/mat/:module" element={<MATPractice />} />
      <Route path="/student/mat-test/:module" element={<MATTopicTest />} />
      <Route path="/student/mat-test-results/:testId" element={<MATTestResults />} />
      <Route path="/student/mat-animated-demo" element={<MATAnimatedDemo />} />
      <Route path="/student/take-advanced-quiz" element={<TakeAdvancedQuiz />} />
      <Route path="/student/advanced-quiz-player" element={<AdvancedQuizPlayer />} />
      <Route path="/student/advanced-quiz-results" element={<AdvancedQuizResults />} />
      <Route path="/student/advanced-quiz-past-reports" element={<AdvancedQuizPastReports />} />
      <Route path='/studentreport/:id' element={<StudentReport></StudentReport>}></Route>
      <Route path='/singlequiz/:id' element={<SingleQuizReport></SingleQuizReport>}></Route>
      <Route path='/login/student' element={<LoginStudent></LoginStudent>}></Route>
      <Route path="/student/puzzles/gyan-ki-yatra" element={<GyanKiYatra />} />

      {/* Quiz - redirect old route to merged Take Quiz page */}
      <Route path="/attemptquiz/:id" element={<Navigate to={"/student/take-advanced-quiz?quizId=" + window.location.pathname.split('/').pop()} replace />} />

      {/* Teacher Routes */}
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/teacher/profile" element={<TeacherProfile />} />
      <Route path="/teacher/create-quiz" element={<Navigate to="/teacher/create-quiz-new" replace />} />
      <Route path="/teacher/create-quiz-new" element={<CreateQuizNew />} />
      <Route path="/teacher/quiz-analytics" element={<QuizAnalytics />} />
      <Route path="/teacher/analytics" element={<Analytics />} />
      <Route path="/teacher/manage-classes" element={<ManageClasses />} />
      <Route path="/teacher/class/:classId/students" element={<ClassStudents />} />
      <Route path="/teacher/give-feedback" element={<GiveFeedback />} />
      <Route path="/addmyquestion" element={<AddMyQuestion></AddMyQuestion>}></Route>
      <Route path="/teacher/quiz-details/:quizId" element={<QuizDetails />} />
      <Route path="/teacher/quiz-analytics/:quizId" element={<QuizAnalyticsPage />} />
      <Route path="/teacher/all-questions" element={<AllQuestions />} />


      {/* 404 - Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  useEffect(() => {
    const cleanup = startSyncManager();
    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <QuizProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </QuizProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
