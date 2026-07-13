import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import { 
  BarChart3, Users, Trophy, Clock, Target, Medal, Crown, 
  BookOpen, Volume2, Video, Puzzle, AlertCircle, CheckCircle2, XCircle, Layers,
  MinusCircle, ChevronDown, ChevronUp, Award
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_URL = import.meta.env.VITE_API_URL;

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

interface SectionWise {
  correct: number;
  incorrect: number;
  unattempted: number;
  total: number;
  percentage: string;
}

interface StudentAnalytics {
  studentId: string;
  correct: number;
  incorrect: number;
  unattempted: number;
  totalQuestions: number;
  percentage: string;
  timeTaken?: number;
  submittedAt: Date;
  sectionWise?: {
    mcq: SectionWise;
    audio: SectionWise;
    video: SectionWise;
    puzzle: SectionWise;
  };
}

interface QuestionAnalytics {
  questionId: string;
  questionType: string;
  correct: number;
  incorrect: number;
  skipped: number;
  totalAttempts: number;
  correctPercentage: string;
  incorrectPercentage: string;
  skippedPercentage: string;
  questionData?: {
    question: string;
    options?: string[];
    correctAnswer?: string | number;
    questionImage?: string;
    audio?: string;
    videoUrl?: string;
    puzzleType?: string;
    description?: string;
    hint?: {
      text?: string;
      image?: string;
      video?: string;
    };
    solution?: {
      text?: string;
      steps?: string[];
    };
  };
}

interface TeacherQuiz {
  _id?: string;
  quizId: string;
  totalQuestions?: number;
  timeLimit?: number;
  questionTypes?: {
    mcq?: number;
    audio?: number;
    video?: number;
    puzzle?: number;
  };
  startTime?: Date | string;
  endTime?: Date | string;
  createdAt?: Date | string;
}

interface QuizAnalytics {
  quizInfo: {
    quizId: string;
    totalQuestions: number;
    timeLimit: number;
    questionTypes: {
      mcq: number;
      audio: number;
      video: number;
      puzzle: number;
    };
    startTime: Date;
    endTime: Date;
    questions: string[];
  };
  totalAttempts: number;
  studentReports: StudentAnalytics[];
  sectionRankings?: {
    mcq: StudentAnalytics[];
    audio: StudentAnalytics[];
    video: StudentAnalytics[];
    puzzle: StudentAnalytics[];
  };
  questionAnalytics: QuestionAnalytics[];
  sectionAverages?: {
    mcq: string;
    audio: string;
    video: string;
    puzzle: string;
  };
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export default function QuizAnalyticsFinal() {
  const [quizId, setQuizId] = useState("");
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [advancedQuizzes, setAdvancedQuizzes] = useState<TeacherQuiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [showQuizSelector, setShowQuizSelector] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const { toast } = useToast();

  const getTeacherIdentifier = () => {
    const currentUser = localStorage.getItem("currentUser");
    const teacherCookie = Cookies.get("teacher");
    let teacherData: any = null;

    if (currentUser) {
      try {
        teacherData = JSON.parse(currentUser);
      } catch (error) {
        console.error("Failed to parse currentUser:", error);
      }
    }

    if (teacherCookie && (!teacherData || !teacherData.teacherId)) {
      try {
        const cookieData = JSON.parse(teacherCookie);
        teacherData = cookieData.teacher || cookieData;
      } catch (error) {
        console.error("Failed to parse teacher cookie:", error);
      }
    }

    if (teacherData?.teacher) {
      teacherData = teacherData.teacher;
    }

    return teacherData?.teacherId || teacherData?._id || teacherData?.id || teacherData?.username || "";
  };

  const isAdvancedQuiz = (quiz: TeacherQuiz) => {
    const mcq = Number(quiz?.questionTypes?.mcq || 0);
    const audio = Number(quiz?.questionTypes?.audio || 0);
    const video = Number(quiz?.questionTypes?.video || 0);
    const puzzle = Number(quiz?.questionTypes?.puzzle || 0);
    const configuredQuestionCount = mcq + audio + video + puzzle;

    return (
      configuredQuestionCount > 0 &&
      Number(quiz?.totalQuestions || 0) > 0 &&
      Number(quiz?.timeLimit || 0) > 0 &&
      Boolean(quiz?.startTime) &&
      Boolean(quiz?.endTime)
    );
  };

  useEffect(() => {
    const fetchAdvancedQuizzes = async () => {
      const teacherIdentifier = getTeacherIdentifier();
      if (!teacherIdentifier) {
        toast({
          title: "Error",
          description: "Teacher session not found. Please login again.",
          variant: "destructive"
        });
        return;
      }

      setQuizzesLoading(true);
      try {
        const response = await axios.get(`${API_URL}/quizzes/teacher/${teacherIdentifier}`);
        const quizzes = Array.isArray(response.data) ? response.data : [];
        const filtered = quizzes
          .filter(isAdvancedQuiz)
          .sort((a: TeacherQuiz, b: TeacherQuiz) => {
            const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          });

        setAdvancedQuizzes(filtered);
      } catch (error: any) {
        console.error("Error fetching advanced quizzes:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load quiz list",
          variant: "destructive"
        });
      } finally {
        setQuizzesLoading(false);
      }
    };

    fetchAdvancedQuizzes();
  }, [toast]);

  const loadAnalytics = async (targetQuizId?: string) => {
    const selectedQuizId = (targetQuizId ?? quizId).trim();
    if (!selectedQuizId) {
      toast({
        title: "Error",
        description: "Please enter a quiz ID",
        variant: "destructive"
      });
      return;
    }

    if (selectedQuizId !== quizId) {
      setQuizId(selectedQuizId);
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/quizzes/analytics/${selectedQuizId}`);
      console.log('Analytics data received:', response.data);
      setAnalytics(response.data);
      setShowQuizSelector(false);
      
      toast({
        title: "✅ Success",
        description: `Loaded analytics for ${response.data.totalAttempts} students`
      });
    } catch (error: any) {
      console.error('Analytics error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load analytics",
        variant: "destructive"
      });
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelectorToggle = () => {
    const nextState = !showQuizSelector;
    setShowQuizSelector(nextState);

    if (nextState) {
      // Re-open selector in "pick quiz" mode
      setAnalytics(null);
      setQuizId("");
    }
  };

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100 border-green-300";
    if (percentage >= 60) return "bg-blue-100 border-blue-300";
    if (percentage >= 40) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const formatShortDate = (date?: Date | string) => {
    if (!date) return "N/A";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq': return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'audio': return <Volume2 className="h-4 w-4 text-green-600" />;
      case 'video': return <Video className="h-4 w-4 text-purple-600" />;
      case 'puzzle': return <Puzzle className="h-4 w-4 text-orange-600" />;
      default: return null;
    }
  };

  const getAnswerDistribution = () => {
    if (!analytics) return [];
    
    const totalCorrect = analytics.studentReports.reduce((sum, s) => sum + s.correct, 0);
    const totalIncorrect = analytics.studentReports.reduce((sum, s) => sum + s.incorrect, 0);
    const totalUnattempted = analytics.studentReports.reduce((sum, s) => sum + s.unattempted, 0);
    
    return [
      { name: 'Correct', value: totalCorrect, color: '#10b981' },
      { name: 'Incorrect', value: totalIncorrect, color: '#ef4444' },
      { name: 'Skipped', value: totalUnattempted, color: '#94a3b8' }
    ];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 border border-white/70 rounded-xl shadow-lg">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('%') || entry.name.includes('Percentage') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-page-bg min-h-screen">
      <Header />
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <BarChart3 className="h-7 w-7 sm:h-9 sm:w-9 text-blue-600 shrink-0" />
          Quiz Analytics
        </h1>
        <p className="text-gray-600">Deep insights into student performance and quiz effectiveness</p>
      </div>

      {/* Quiz ID Input */}
      <Card className="glass-card border-0 mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Enter Quiz ID (e.g., QUIZ001)"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadAnalytics()}
              className="flex-1 text-lg bg-white/70"
            />
            <Button onClick={loadAnalytics} disabled={loading} size="lg" className="px-8 w-full sm:w-auto">
              {loading ? (
                <>
                  <div className="animate-spin mr-2">⏳</div>
                  Loading...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Load Analytics
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleQuizSelectorToggle}
              disabled={loading || quizzesLoading}
              className="w-full sm:w-auto bg-white/50"
            >
              <Layers className="mr-2 h-5 w-5" />
              {showQuizSelector ? "Hide Quiz List" : "Select Advanced Quiz"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Quiz Cards */}
      {showQuizSelector && (
        <Card className="glass-card border-0 mb-6">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-lg sm:text-xl">
              <Layers className="h-5 w-5 text-indigo-600" />
              Select Advanced/Comprehensive Quiz
            </CardTitle>
            <CardDescription>
              Click any quiz box to load analytics instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quizzesLoading ? (
              <div className="text-sm text-gray-500">Loading advanced quiz list...</div>
            ) : advancedQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {advancedQuizzes.map((quiz) => {
                  const mcq = Number(quiz?.questionTypes?.mcq || 0);
                  const audio = Number(quiz?.questionTypes?.audio || 0);
                  const video = Number(quiz?.questionTypes?.video || 0);
                  const puzzle = Number(quiz?.questionTypes?.puzzle || 0);
                  const isSelected = quizId === quiz.quizId;

                  return (
                    <button
                      key={quiz._id || quiz.quizId}
                      type="button"
                      onClick={() => loadAnalytics(quiz.quizId)}
                      disabled={loading}
                      className={`w-full rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-blue-400 bg-blue-50/80 shadow-md"
                          : "border-white/60 bg-white/50 hover:border-blue-300 hover:bg-white/70 hover:shadow-md"
                      } ${loading ? "cursor-not-allowed opacity-70" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">Quiz ID</p>
                          <p className="font-bold text-blue-700 break-all">{quiz.quizId}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 bg-white/60">
                          {Number(quiz.totalQuestions || 0)} Qs
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div className="rounded-md bg-blue-50/80 px-2 py-1 text-blue-700">MCQ: {mcq}</div>
                        <div className="rounded-md bg-green-50/80 px-2 py-1 text-green-700">Audio: {audio}</div>
                        <div className="rounded-md bg-purple-50/80 px-2 py-1 text-purple-700">Video: {video}</div>
                        <div className="rounded-md bg-orange-50/80 px-2 py-1 text-orange-700">Puzzle: {puzzle}</div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                        <span>Time Limit: {Number(quiz.timeLimit || 0)} min</span>
                        <span>Created: {formatShortDate(quiz.createdAt)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white/40 p-4 text-sm text-gray-600">
                No advanced/comprehensive quizzes found for your account.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {analytics && (
        <div className="space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="glass-pill flex w-full flex-wrap justify-start gap-1 h-auto p-1.5 sm:inline-flex sm:w-auto">
              <TabsTrigger value="overview" className="gap-1.5">
                <Target className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="questions" className="gap-1.5">
                <BarChart3 className="h-4 w-4" />
                Question Analytics
              </TabsTrigger>
              <TabsTrigger value="rankings" className="gap-1.5">
                <Award className="h-4 w-4" />
                Rankings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Quiz Overview */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="h-6 w-6 text-blue-600" />
                Quiz Overview
              </CardTitle>
              <CardDescription>Basic quiz information and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass-pill p-4 rounded-xl">
                  <div className="text-sm text-gray-500 mb-1">Quiz ID</div>
                  <div className="font-bold text-xl text-blue-600 break-all">{analytics.quizInfo.quizId}</div>
                </div>
                <div className="glass-pill p-4 rounded-xl">
                  <div className="text-sm text-gray-500 mb-1">Total Questions</div>
                  <div className="font-bold text-xl text-purple-600">{analytics.quizInfo.totalQuestions}</div>
                </div>
                <div className="glass-pill p-4 rounded-xl">
                  <div className="text-sm text-gray-500 mb-1">Time Limit</div>
                  <div className="font-bold text-xl text-orange-600">{analytics.quizInfo.timeLimit} min</div>
                </div>
                <div className="glass-pill p-4 rounded-xl">
                  <div className="text-sm text-gray-500 mb-1">Total Attempts</div>
                  <div className="font-bold text-xl text-green-600">{analytics.totalAttempts}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <Badge variant="outline" className="justify-center py-3 text-base bg-blue-50/80 border-blue-200">
                  <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                  MCQ: {analytics.quizInfo.questionTypes.mcq}
                </Badge>
                <Badge variant="outline" className="justify-center py-3 text-base bg-green-50/80 border-green-200">
                  <Volume2 className="mr-2 h-5 w-5 text-green-600" />
                  Audio: {analytics.quizInfo.questionTypes.audio}
                </Badge>
                <Badge variant="outline" className="justify-center py-3 text-base bg-purple-50/80 border-purple-200">
                  <Video className="mr-2 h-5 w-5 text-purple-600" />
                  Video: {analytics.quizInfo.questionTypes.video}
                </Badge>
                <Badge variant="outline" className="justify-center py-3 text-base bg-orange-50/80 border-orange-200">
                  <Puzzle className="mr-2 h-5 w-5 text-orange-600" />
                  Puzzle: {analytics.quizInfo.questionTypes.puzzle}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4 text-green-600" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{analytics.totalAttempts}</div>
                <p className="text-xs text-gray-500 mt-1">Attempted this quiz</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  Class Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{analytics.averageScore}%</div>
                <p className="text-xs text-gray-500 mt-1">Mean score</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  Highest Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{analytics.highestScore}%</div>
                <p className="text-xs text-gray-500 mt-1">Top performance</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-600">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Lowest Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{analytics.lowestScore}%</div>
                <p className="text-xs text-gray-500 mt-1">Needs attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Answer Distribution */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Overall Answer Distribution
              </CardTitle>
              <CardDescription>Total responses across all students</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const answerDistribution = getAnswerDistribution();
                const totalResponses = answerDistribution.reduce((sum, item) => sum + item.value, 0);

                return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={answerDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={45}
                      minAngle={2}
                      paddingAngle={2}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {answerDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col justify-center space-y-3">
                  {answerDistribution.map((item, idx) => {
                    const percentage = totalResponses > 0 ? ((item.value / totalResponses) * 100).toFixed(1) : "0.0";
                    return (
                    <div key={idx} className="glass-pill flex items-center justify-between p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                        <span className="font-semibold text-base text-gray-800">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
                        <div className="text-xs text-gray-600">{percentage}%</div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
                );
              })()}
            </CardContent>
          </Card>
            </TabsContent>

            <TabsContent value="questions" className="mt-6">
          {/* Question-wise Analytics */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Question-wise Analytics
              </CardTitle>
              <CardDescription>Detailed breakdown for each question</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.questionAnalytics && analytics.questionAnalytics.length > 0 ? (
                analytics.questionAnalytics.map((q, index) => {
                  const correctPct = parseFloat(q.correctPercentage);
                  const accentColor = correctPct >= 70 ? '#10b981' : correctPct >= 50 ? '#f59e0b' : '#ef4444';
                  return (
                  <Collapsible
                    key={q.questionId}
                    open={expandedQuestion === q.questionId}
                    onOpenChange={() => setExpandedQuestion(expandedQuestion === q.questionId ? null : q.questionId)}
                  >
                    <Card
                      className="glass-card border-0 overflow-hidden"
                      style={{ borderLeft: `4px solid ${accentColor}` }}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 hover:bg-white/40 cursor-pointer transition-colors">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <Badge variant="outline" className="text-base px-3 py-1 bg-white/60">
                              Q{index + 1}
                            </Badge>
                            <div className="flex items-center gap-2">
                              {getQuestionTypeIcon(q.questionType)}
                              <span className="font-medium capitalize">{q.questionType}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              ID: {q.questionId.slice(-8)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-auto">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="flex items-center gap-1 text-green-700 font-medium"><CheckCircle2 className="h-3.5 w-3.5" />{q.correct}</span>
                              <span className="flex items-center gap-1 text-red-600 font-medium"><XCircle className="h-3.5 w-3.5" />{q.incorrect}</span>
                              <span className="flex items-center gap-1 text-gray-500 font-medium"><MinusCircle className="h-3.5 w-3.5" />{q.skipped}</span>
                            </div>
                            {expandedQuestion === q.questionId ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 border-t border-white/60 pt-4">
                          {/* Question Content Display */}
                          {q.questionData && (
                            <div className="mb-6 p-4 bg-blue-50/60 rounded-lg border border-blue-100">
                              <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                {getQuestionTypeIcon(q.questionType)}
                                Question Content
                              </h4>
                              
                              {/* Question Text */}
                              <div className="mb-3">
                                <p className="text-base font-medium text-gray-800 mb-2">{q.questionData.question}</p>
                                {q.questionData.description && (
                                  <p className="text-sm text-gray-600 italic">{q.questionData.description}</p>
                                )}
                              </div>
                              
                              {/* Puzzle Info */}
                              {q.questionType === 'puzzle' && q.questionData.puzzleType && (
                                <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                                  <p className="text-sm">
                                    <span className="font-semibold text-orange-800">Puzzle Type: </span>
                                    <span className="text-gray-700 capitalize">{q.questionData.puzzleType.replace('_', ' ')}</span>
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Interactive game - Performance evaluated based on completion time and accuracy
                                  </p>
                                </div>
                              )}
                              
                              {/* Video Info */}
                              {q.questionType === 'video' && (
                                <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                                  <p className="text-sm text-gray-700">
                                    Video-based question with multiple-choice options
                                  </p>
                                </div>
                              )}
                              
                              {/* Question Image (for MCQ) */}
                              {q.questionData.questionImage && (
                                <div className="mb-3">
                                  <img 
                                    src={q.questionData.questionImage} 
                                    alt="Question"
                                    className="w-full max-w-md h-auto rounded-lg border shadow-sm object-contain"
                                  />
                                </div>
                              )}
                              
                              {/* Audio Player (for Audio questions) */}
                              {q.questionData.audio && (
                                <div className="mb-3">
                                  <audio controls className="w-full max-w-md">
                                    <source src={q.questionData.audio} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                  </audio>
                                </div>
                              )}
                              
                              {/* Video Player (for Video questions) */}
                              {q.questionData.videoUrl && (
                                <div className="mb-3">
                                  <video controls className="w-full max-w-md rounded-lg border shadow-sm">
                                    <source src={q.questionData.videoUrl} type="video/mp4" />
                                    Your browser does not support the video element.
                                  </video>
                                </div>
                              )}
                              
                              {/* Options (for MCQ, Audio, and Video) */}
                              {q.questionData.options && q.questionData.options.length > 0 && (
                                <div className="space-y-2 mb-3">
                                  <p className="text-sm font-semibold text-gray-700">Options:</p>
                                  {q.questionData.options.map((option, idx) => (
                                    <div 
                                      key={idx}
                                      className={`p-3 rounded-md border ${
                                        q.questionData?.correctAnswer === option || 
                                        (typeof q.questionData?.correctAnswer === 'number' && q.questionData.correctAnswer === idx)
                                          ? 'bg-green-100 border-green-400 font-semibold'
                                          : 'bg-white border-gray-300'
                                      }`}
                                    >
                                      <span className="mr-2 font-medium text-gray-600">{String.fromCharCode(65 + idx)}.</span>
                                      {option}
                                      {(q.questionData?.correctAnswer === option || 
                                        (typeof q.questionData?.correctAnswer === 'number' && q.questionData.correctAnswer === idx)) && (
                                        <Badge className="ml-2 bg-green-600">Correct Answer</Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Correct Answer display (if not shown in options) */}
                              {q.questionData.correctAnswer && !q.questionData.options && q.questionType !== 'puzzle' && (
                                <div className="p-3 bg-green-100 border border-green-400 rounded-md">
                                  <span className="font-semibold text-green-800">Correct Answer: </span>
                                  <span className="text-gray-800">{q.questionData.correctAnswer}</span>
                                </div>
                              )}
                              
                              {/* Note for puzzles */}
                              {q.questionType === 'puzzle' && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                  <p className="text-xs text-gray-700">
                                    <strong>Note:</strong> Puzzle performance is evaluated dynamically based on student interaction patterns, 
                                    completion time, and accuracy. There is no single "correct answer" - success is measured through gameplay metrics.
                                  </p>
                                </div>
                              )}
                              
                              {/* Solution (for MCQ, Audio, Video) */}
                              {q.questionData.solution && q.questionType !== 'puzzle' && (
                                <div className="mt-3 p-4 bg-green-50 border border-green-300 rounded-md">
                                  <h5 className="font-semibold text-sm text-green-800 mb-2">📚 Solution:</h5>
                                  {q.questionData.solution.text && (
                                    <p className="text-sm text-gray-700 mb-2">{q.questionData.solution.text}</p>
                                  )}
                                  {q.questionData.solution.steps && q.questionData.solution.steps.length > 0 && (
                                    <div className="mt-2">
                                      <p className="font-semibold text-xs text-gray-700 mb-1">Steps:</p>
                                      <ol className="list-decimal list-inside space-y-1">
                                        {q.questionData.solution.steps.map((step, idx) => (
                                          <li key={idx} className="text-sm text-gray-700">{step}</li>
                                        ))}
                                      </ol>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Statistics */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm text-gray-700 mb-3">Response Statistics</h4>
                              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  <span className="font-medium">Correct</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-green-600">{q.correct}</div>
                                  <div className="text-xs text-gray-600">{q.correctPercentage}%</div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-5 w-5 text-red-600" />
                                  <span className="font-medium">Incorrect</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-red-600">{q.incorrect}</div>
                                  <div className="text-xs text-gray-600">{q.incorrectPercentage}%</div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                  <MinusCircle className="h-5 w-5 text-gray-600" />
                                  <span className="font-medium">Skipped</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-600">{q.skipped}</div>
                                  <div className="text-xs text-gray-600">{q.skippedPercentage}%</div>
                                </div>
                              </div>
                            </div>

                            {/* Chart */}
                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-3">Visual Breakdown</h4>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={[
                                  { name: 'Correct', value: parseFloat(q.correctPercentage), fill: '#10b981' },
                                  { name: 'Incorrect', value: parseFloat(q.incorrectPercentage), fill: '#ef4444' },
                                  { name: 'Skipped', value: parseFloat(q.skippedPercentage), fill: '#94a3b8' }
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" vertical={false} />
                                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: 'rgba(100,116,139,0.25)' }} tickLine={false} />
                                  <YAxis domain={[0, 100]} label={{ value: '%', angle: 0, position: 'top' }} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100,116,139,0.08)' }} />
                                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Difficulty Indicator */}
                          <div className="mt-4 p-3 rounded-lg glass-pill" style={{
                            borderLeft: `4px solid ${accentColor}`
                          }}>
                            <p className="text-sm font-medium text-gray-800">
                              💡 <strong>Difficulty Assessment:</strong> {
                                correctPct >= 70 ? 'Easy - Most students answered correctly' :
                                correctPct >= 50 ? 'Moderate - About half got it right' :
                                'Difficult - Consider reviewing this topic'
                              }
                            </p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No question analytics available
                </div>
              )}
            </CardContent>
          </Card>
            </TabsContent>

            <TabsContent value="rankings" className="mt-6">
          {/* Comprehensive Leaderboard */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Comprehensive Student Leaderboard
              </CardTitle>
              <CardDescription>Rankings with overall and section-wise scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white/40 hover:bg-white/40">
                      <TableHead className="w-16 font-bold">Rank</TableHead>
                      <TableHead className="font-bold">Student ID</TableHead>
                      <TableHead className="text-center font-bold">
                        <Trophy className="inline h-4 w-4 mr-1 text-yellow-600" />
                        Overall Score
                      </TableHead>
                      <TableHead className="text-center font-bold">
                        <BookOpen className="inline h-4 w-4 mr-1 text-blue-600" />
                        MCQ
                      </TableHead>
                      <TableHead className="text-center font-bold">
                        <Volume2 className="inline h-4 w-4 mr-1 text-green-600" />
                        Audio
                      </TableHead>
                      <TableHead className="text-center font-bold">
                        <Video className="inline h-4 w-4 mr-1 text-purple-600" />
                        Video
                      </TableHead>
                      <TableHead className="text-center font-bold">
                        <Puzzle className="inline h-4 w-4 mr-1 text-orange-600" />
                        Puzzle
                      </TableHead>
                      <TableHead className="text-center font-bold">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Time
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.studentReports.map((student, index) => {
                      const percentage = parseFloat(student.percentage);
                      return (
                        <TableRow key={student.studentId} className="hover:bg-white/40">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {index === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                              {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                              {index === 2 && <Medal className="h-5 w-5 text-orange-400" />}
                              <span className="font-bold">{index + 1}{getRankSuffix(index + 1)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-blue-600">{student.studentId}</TableCell>
                          <TableCell className="text-center">
                            <div className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${getPerformanceBgColor(percentage)}`}>
                              {student.percentage}%
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {student.sectionWise?.mcq.total > 0 ? (
                              <Badge className={`${getPerformanceBgColor(parseFloat(student.sectionWise.mcq.percentage))} text-blue-700`}>
                                {student.sectionWise.mcq.percentage}%
                              </Badge>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {student.sectionWise?.audio.total > 0 ? (
                              <Badge className={`${getPerformanceBgColor(parseFloat(student.sectionWise.audio.percentage))} text-green-700`}>
                                {student.sectionWise.audio.percentage}%
                              </Badge>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {student.sectionWise?.video.total > 0 ? (
                              <Badge className={`${getPerformanceBgColor(parseFloat(student.sectionWise.video.percentage))} text-purple-700`}>
                                {student.sectionWise.video.percentage}%
                              </Badge>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {student.sectionWise?.puzzle.total > 0 ? (
                              <Badge className={`${getPerformanceBgColor(parseFloat(student.sectionWise.puzzle.percentage))} text-orange-700`}>
                                {student.sectionWise.puzzle.percentage}%
                              </Badge>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {formatTime(student.timeTaken)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {analytics.studentReports.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No students have attempted this quiz yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!analytics && !loading && (
        <Card className="glass-card border-0 border-dashed">
          <CardContent className="py-16 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Analytics Loaded</h3>
            <p className="text-gray-500">Enter a Quiz ID above to view detailed analytics and insights.</p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
