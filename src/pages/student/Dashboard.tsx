import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  BookOpen, 
  ListChecks, 
  Users, 
  Lock, 
  TrendingUp, 
  Award,
  Target,
  Calendar,
  BarChart3,
  Zap,
  Trophy,
  User,
  School,
  Hash,
  Headphones,
  Video,
  Puzzle,
  Sparkles,
  FlaskConical,
  BrainCircuit,
  ArrowRight,
  TrendingDown,
  Minus,
  MessageSquare
} from "lucide-react";
import SubjectIcon from "@/components/SubjectIcon";
import { getCurrentUser } from "@/lib/session";

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState<null | {
    _id: string;
    studentId: string;
    class: string;
    name: string;
    schoolId: string;
    phone?: string;
    username?: string;
    createdAt?: string;
    profilePhoto?: string;
    adaptiveRating?: {
      rating?: number;
    };
    quizAttempted: {
      quizId: string;
      score: {
        correct: number;
        incorrect: number;
        unattempted: number;
      };
      attemptedAt: string;
    }[];
    adaptiveTestAttempts?: {
      className: string;
      ratingBefore: number;
      ratingAfter: number;
      ratingChange: number;
      correct: number;
      incorrect: number;
      total: number;
      weakTopics: string[];
      startedAt: string;
      completedAt: string;
    }[];
  }>(null);

  const [quizId, setQuizId] = useState("");
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(() => localStorage.getItem("appLanguage") || "hi");

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setLanguage(detail?.language || localStorage.getItem("appLanguage") || "hi");
    };

    window.addEventListener("appLanguageChanged", handleLanguageChange);
    return () => window.removeEventListener("appLanguageChanged", handleLanguageChange);
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    const localData = localStorage.getItem("student");

    if (currentUser?.studentId || localData) {
      try {
        const parsedData = localData ? JSON.parse(localData) : {};
        const studentId = currentUser?.studentId || parsedData.student?.studentId || parsedData.studentId;

        if (studentId) {
          setLoading(true);
          axios
            .get(`${API_URL}/students/${studentId}`)
            .then((res) => {
              setStudent(res.data);
              setLoading(false);
            })
            .catch((error) => {
              console.error("Failed to fetch student data:", error);
              setLoading(false);
            });
        }
      } catch (e) {
        console.error("Failed to parse student local storage data", e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);
  

  const handleStartQuiz = () => {
    const trimmedQuizId = quizId.trim();

    if (!trimmedQuizId) {
      alert("Please enter a Quiz ID");
      return;
    }

    navigate(`/student/take-advanced-quiz?quizId=${trimmedQuizId}`);
  };

  // Calculate statistics from actual quiz data
  const calculateStats = () => {
    if (!student?.quizAttempted || student.quizAttempted.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalUnattempted: 0,
        totalQuestions: 0,
        accuracy: 0,
        streak: 0
      };
    }

    const totalQuizzes = student.quizAttempted.length;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnattempted = 0;

    student.quizAttempted.forEach(quiz => {
      totalCorrect += quiz.score.correct;
      totalIncorrect += quiz.score.incorrect;
      totalUnattempted += quiz.score.unattempted;
    });

    const totalQuestions = totalCorrect + totalIncorrect + totalUnattempted;
    const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Calculate streak (number of recent quizzes)
    const recentQuizzes = student.quizAttempted.slice(-7).length;

    return {
      totalQuizzes,
      averageScore,
      totalCorrect,
      totalIncorrect,
      totalUnattempted,
      totalQuestions,
      accuracy,
      streak: recentQuizzes
    };
  };

  const stats = calculateStats();
  const isHindi = language === "hi";
  

  const subjectProgress = [
    {
      subject: "mathematics",
      name: "Mathematics",
      completed: 12,
      total: 20,
      percentage: 60,
    },
    {
      subject: "science",
      name: "Science",
      completed: 8,
      total: 15,
      percentage: 53,
    },
    {
      subject: "social",
      name: "Social Science",
      completed: 5,
      total: 15,
      percentage: 33,
    },
    {
      subject: "mat",
      name: "Mental Ability",
      completed: 7,
      total: 10,
      percentage: 70,
    },
  ];

  // Create real recent activity from quizAttempted - Show ALL quizzes
  const recentActivity =
    student?.quizAttempted
      .slice()
      .reverse()
      .map((attempt) => ({
        quizId: attempt.quizId,
        type: "quiz",
        title: `Quiz ${attempt.quizId}`,
        score: `${attempt.score.correct} Correct / ${attempt.score.incorrect} Incorrect`,
        correct: attempt.score.correct,
        incorrect: attempt.score.incorrect,
        unattempted: attempt.score.unattempted,
        date: attempt.attemptedAt,
        percentage: Math.round(
          (attempt.score.correct / 
          (attempt.score.correct + attempt.score.incorrect + attempt.score.unattempted)) * 100
        ) || 0
      })) || [];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }


  if (!student) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading student data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="flex-1 py-6 md:py-8">
        <div className="edu-container">
          {/* Welcome Section with Student Info */}
          <div className="mb-8 rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm backdrop-blur md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Avatar className="h-16 w-16 ring-4 ring-edu-blue/20">
                <AvatarImage src={student.profilePhoto ? `${API_URL}/${student.profilePhoto.replace(/^\//, '')}` : ''} alt={student.name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-edu-blue to-edu-purple text-white text-2xl font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {isHindi ? "नमस्ते" : "Welcome back"}, {student.name}!
                </h1>
                <p className="text-gray-600">
                  {isHindi ? "आज की तैयारी के लिए अपना अभ्यास, टेस्ट और रिपोर्ट यहीं से शुरू करें।" : "Start practice, tests, and reports from one focused workspace."}
                </p>
              </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 px-5 py-4 text-white shadow-md">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-100">{isHindi ? "Adaptive Rating" : "Adaptive Rating"}</p>
                <p className="text-3xl font-bold">{student?.adaptiveRating?.rating || "Start"}</p>
                <p className="text-xs text-blue-100">{isHindi ? "टेस्ट देकर rating पाएं" : "Take a test to calibrate"}</p>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-l-4 border-l-edu-blue">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Student ID</p>
                      <p className="text-lg font-bold text-gray-900">{student.studentId}</p>
                    </div>
                    <Hash className="h-8 w-8 text-edu-blue/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-edu-green">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Class</p>
                      <p className="text-lg font-bold text-gray-900">{student.class}</p>
                    </div>
                    <User className="h-8 w-8 text-edu-green/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-edu-purple">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">School ID</p>
                      <p className="text-lg font-bold text-gray-900 truncate">{student.schoolId}</p>
                    </div>
                    <School className="h-8 w-8 text-edu-purple/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-edu-yellow">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="text-lg font-bold text-gray-900">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-edu-yellow/30" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions - Moved to Top */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isHindi ? "आज क्या करना है?" : "What do you want to do today?"}</h2>
              <p className="text-sm text-gray-600">{isHindi ? "तेज access के लिए मुख्य learning tools." : "Main learning tools with quick access."}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 mb-12">
            <Card className="group border-0 bg-white shadow-sm ring-1 ring-blue-100 transition hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle>{isHindi ? "Practice Questions" : "Practice Questions"}</CardTitle>
                <CardDescription>
                  {isHindi ? "विषय के अनुसार अभ्यास करें" : "Attempt subject-specific practice questions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {isHindi ? "विषय चुनें और NMMS तैयारी के लिए MCQ अभ्यास करें।" : "Select a subject and practice MCQ questions to improve your NMMS skills."}
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/student/practice" className="w-full">
                  <Button className="w-full">{isHindi ? "Practice शुरू करें" : "Start Practice"}</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="group border-0 bg-white shadow-sm ring-1 ring-emerald-100 transition hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white">
                  <School className="h-6 w-6" />
                </div>
                <CardTitle>{isHindi ? "My Classes" : "My Classes"}</CardTitle>
                <CardDescription>
                  {isHindi ? "कक्षा announcements, documents और quizzes देखें" : "See class announcements, documents, and quizzes"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {isHindi ? "आप जिन classes में enrolled हैं, उनका पूरा class work एक जगह देखें।" : "Open the classroom feed for the classes you are enrolled in."}
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/student/my-classes" className="w-full">
                  <Button variant="outline" className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                    {isHindi ? "Classes खोलें" : "Open Classes"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="group border-0 bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-md transition hover:-translate-y-1 hover:shadow-xl md:col-span-2 xl:col-span-1">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
                  <BrainCircuit className="h-7 w-7" />
                </div>
                <CardTitle>{isHindi ? "Adaptive Test" : "Adaptive Test"}</CardTitle>
                <CardDescription className="text-cyan-50">
                  {isHindi ? "Subject-wise या mixed MARS test" : "Subject-wise or mixed MARS test"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-cyan-50">
                  {isHindi ? "10, 20, 30 या 40 questions चुनें। हर question आपके answer के हिसाब से adapt होगा।" : "Choose 10, 20, 30, or 40 questions. Each next question adapts to your answers."}
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/student/adaptive-test" className="w-full">
                  <Button className="w-full bg-white text-blue-700 hover:bg-cyan-50">
                    {isHindi ? "Adaptive Test शुरू करें" : "Start Adaptive Test"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-2 border-blue-300/20 hover:border-blue-400/40 transition-colors bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <ListChecks className="h-10 w-10 text-blue-600 mb-2" />
                    <CardTitle className="flex items-center gap-2">
                      Take Quiz
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500">New</Badge>
                    </CardTitle>
                    <CardDescription>
                      Enter a Quiz ID to start. Supports MCQ, Audio, Video & Puzzles
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-3">
                  Enter the Quiz ID provided by your teacher to attempt the quiz.
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Enter Quiz ID"
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStartQuiz()}
                    className="flex-1 px-4 py-2 border rounded-md text-sm border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  />
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    onClick={handleStartQuiz}
                  >
                    Start Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-edu-purple/20 hover:border-edu-purple/40 transition-colors">
              <CardHeader>
                <Users className="h-10 w-10 text-edu-purple mb-2" />
                <CardTitle>Group Quiz</CardTitle>
                <CardDescription>
                  Study with two friends in group mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Enter your ID and your friends' IDs to attempt a quiz together
                  as a group.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/student/group-quiz" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-edu-purple text-edu-purple hover:bg-edu-purple/10"
                  >
                    Start Group Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-2 border-orange-300/20 hover:border-orange-400/40 transition-colors">
              <CardHeader>
                <Sparkles className="h-10 w-10 text-orange-500 mb-2" />
                <CardTitle>Multimedia Assessment</CardTitle>
                <CardDescription>
                  Interactive learning with audio, video & puzzles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Explore diverse assessment types including audio, video
                  questions, puzzles and more.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/student/multimedia-assessment" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-orange-500 text-orange-500 hover:bg-orange-500/10"
                  >
                    Explore Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-2 border-edu-blue/20 hover:border-edu-blue/40 transition-colors">
              <CardHeader>
                <FlaskConical className="h-10 w-10 text-edu-blue mb-2" />
                <CardTitle>Experiment Simulation</CardTitle>
                <CardDescription>
                  Engage with interactive lab simulations for Physics, Chemistry, and Biology.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Engage with interactive lab simulations for Physics, Chemistry, and Biology.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/student/experiments">
                  <Button
                    className="w-full bg-gradient-to-r from-edu-blue to-edu-purple"
                  >
                    Start Experiment Simulation
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-2 border-teal-500/20 hover:border-teal-500/40 transition-colors">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-teal-600 mb-2" />
                <CardTitle>Give Feedback</CardTitle>
                <CardDescription>
                  Share your feedback — it goes directly to your school administrator.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Fill out active feedback forms from your school to help improve teaching and facilities.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/student/feedback" className="w-full">
                  <Button variant="outline" className="w-full border-teal-500 text-teal-600 hover:bg-teal-500/10">
                    Give Feedback
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* All Quizzes List with Scrolling - Shows 8 at a time */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-edu-blue" />
                <CardTitle>All Quiz Attempts</CardTitle>
              </div>
              <CardDescription>
                {recentActivity.length > 0 
                  ? `You have attempted ${recentActivity.length} quiz${recentActivity.length > 1 ? 'zes' : ''}`
                  : 'No quizzes attempted yet'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  {recentActivity.map((activity, index) => (
                    <Link 
                      key={index} 
                      to={`/singlequiz/${activity.quizId}`}
                      className="block"
                    >
                      <div className="p-4 border rounded-lg hover:shadow-md transition-all hover:border-edu-blue group">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                          <div className="flex items-start sm:items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              activity.percentage >= 75 ? 'bg-green-100' : 
                              activity.percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                            }`}>
                              <ListChecks className={`h-5 w-5 ${
                                activity.percentage >= 75 ? 'text-green-600' : 
                                activity.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-edu-blue transition-colors">
                                {activity.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.date).toLocaleDateString('en-IN', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${
                            activity.percentage >= 75 ? 'bg-green-500' : 
                            activity.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {activity.percentage}%
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                          <span className="flex items-center text-green-600">
                            <span className="font-semibold mr-1">{activity.correct}</span> Correct
                          </span>
                          <span className="flex items-center text-red-600">
                            <span className="font-semibold mr-1">{activity.incorrect}</span> Incorrect
                          </span>
                          <span className="flex items-center text-gray-600">
                            <span className="font-semibold mr-1">{activity.unattempted}</span> Unattempted
                          </span>
                        </div>
                        
                        <Progress 
                          value={activity.percentage} 
                          className="mt-3 h-2" 
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Lock className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    No Quiz Activity Yet
                  </p>
                  <p className="text-gray-500 mb-6 max-w-md">
                    Start practicing or attempt a quiz to see your performance history here
                  </p>
                  <Link to="/student/practice">
                    <Button className="bg-gradient-to-r from-edu-blue to-edu-purple">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Start Practice Now
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Adaptive Test History ─────────────────────────────── */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="h-6 w-6 text-blue-600" />
                  <CardTitle>Adaptive Test History</CardTitle>
                </div>
                <Link to="/student/adaptive-test">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    Take New Test <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardDescription>
                {student?.adaptiveTestAttempts && student.adaptiveTestAttempts.length > 0
                  ? `You have completed ${student.adaptiveTestAttempts.length} adaptive test${student.adaptiveTestAttempts.length > 1 ? "s" : ""}`
                  : "No adaptive tests attempted yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student?.adaptiveTestAttempts && student.adaptiveTestAttempts.length > 0 ? (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {[...student.adaptiveTestAttempts].reverse().map((attempt, index) => {
                    const ratingUp = attempt.ratingChange > 0;
                    const ratingDown = attempt.ratingChange < 0;
                    const accuracy = attempt.total > 0 ? Math.round((attempt.correct / attempt.total) * 100) : 0;
                    return (
                      <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-all hover:border-blue-300 bg-gradient-to-r from-white to-blue-50/30">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              accuracy >= 75 ? "bg-green-100" :
                              accuracy >= 50 ? "bg-yellow-100" : "bg-red-100"
                            }`}>
                              <BrainCircuit className={`h-5 w-5 ${
                                accuracy >= 75 ? "text-green-600" :
                                accuracy >= 50 ? "text-yellow-600" : "text-red-600"
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                Class {attempt.className} Adaptive Test
                              </p>
                              <p className="text-xs text-gray-500">
                                {attempt.completedAt
                                  ? new Date(attempt.completedAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              accuracy >= 75 ? "bg-green-500" :
                              accuracy >= 50 ? "bg-yellow-500" : "bg-red-500"
                            }`}>
                              {accuracy}% Accuracy
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-3">
                          <span className="flex items-center gap-1 text-green-600">
                            <span className="font-semibold">{attempt.correct}</span> Correct
                          </span>
                          <span className="flex items-center gap-1 text-red-600">
                            <span className="font-semibold">{attempt.incorrect}</span> Incorrect
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            Total: <span className="font-semibold">{attempt.total}</span>
                          </span>
                        </div>

                        {/* Rating change */}
                        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                          <span className="text-xs text-slate-500">Rating</span>
                          <span className="font-bold text-slate-700">{attempt.ratingBefore}</span>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                          <span className="font-bold text-slate-900">{attempt.ratingAfter}</span>
                          <span className={`ml-auto flex items-center gap-1 text-sm font-semibold ${
                            ratingUp ? "text-green-600" : ratingDown ? "text-red-600" : "text-slate-500"
                          }`}>
                            {ratingUp ? <TrendingUp className="h-4 w-4" /> : ratingDown ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                            {ratingUp ? "+" : ""}{attempt.ratingChange}
                          </span>
                        </div>

                        {/* Weak topics */}
                        {attempt.weakTopics && attempt.weakTopics.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-xs text-orange-600 font-medium">Weak:</span>
                            {attempt.weakTopics.slice(0, 3).map((topic) => (
                              <Badge key={topic} variant="outline" className="text-xs border-orange-300 text-orange-600 px-1.5 py-0">{topic}</Badge>
                            ))}
                          </div>
                        )}

                        <Progress value={accuracy} className="mt-3 h-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="p-4 bg-blue-50 rounded-full mb-4">
                    <BrainCircuit className="h-12 w-12 text-blue-400" />
                  </div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">No Adaptive Tests Yet</p>
                  <p className="text-gray-500 mb-6 max-w-md">
                    Take an adaptive test to see your rating progress and performance history here.
                  </p>
                  <Link to="/student/adaptive-test">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                      <BrainCircuit className="h-4 w-4 mr-2" />
                      Start Adaptive Test
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
