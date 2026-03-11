import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  BarChart3, TrendingUp, Users, Trophy, Clock, Target, Medal, Crown, 
  BookOpen, Volume2, Video, Puzzle, AlertCircle, CheckCircle2, XCircle,
  MinusCircle, Timer, TrendingDown, Award, Brain, Zap
} from "lucide-react";
import axios from "axios";
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
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const SECTION_COLORS = {
  mcq: '#3b82f6',
  audio: '#10b981',
  video: '#8b5cf6',
  puzzle: '#f59e0b'
};

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
    mcq: { correct: number; incorrect: number; unattempted: number; total: number; percentage: string };
    audio: { correct: number; incorrect: number; unattempted: number; total: number; percentage: string };
    video: { correct: number; incorrect: number; unattempted: number; total: number; percentage: string };
    puzzle: { correct: number; incorrect: number; unattempted: number; total: number; percentage: string };
  };
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
  };
  totalAttempts: number;
  studentReports: StudentAnalytics[];
  sectionRankings?: {
    mcq: StudentAnalytics[];
    audio: StudentAnalytics[];
    video: StudentAnalytics[];
    puzzle: StudentAnalytics[];
  };
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

export default function QuizAnalyticsImproved() {
  const [quizId, setQuizId] = useState("");
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadAnalytics = async () => {
    if (!quizId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/quizzes/analytics/${quizId}`);
      console.log('Analytics data received:', response.data);
      setAnalytics(response.data);
      
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

  // Calculate performance distribution
  const getPerformanceDistribution = () => {
    if (!analytics) return [];
    
    const categories = [
      { label: "Excellent", range: [90, 100], color: COLORS[0] },
      { label: "Very Good", range: [80, 89], color: COLORS[1] },
      { label: "Good", range: [60, 79], color: COLORS[2] },
      { label: "Average", range: [40, 59], color: COLORS[3] },
      { label: "Below Average", range: [0, 39], color: COLORS[4] }
    ];

    return categories.map(category => {
      const count = analytics.studentReports.filter(
        s => parseFloat(s.percentage) >= category.range[0] && parseFloat(s.percentage) <= category.range[1]
      ).length;
      
      return {
        name: category.label,
        value: count,
        percentage: ((count / analytics.studentReports.length) * 100).toFixed(1),
        color: category.color
      };
    }).filter(cat => cat.value > 0);
  };

  // Calculate answer distribution
  const getAnswerDistribution = () => {
    if (!analytics) return [];
    
    const totalCorrect = analytics.studentReports.reduce((sum, s) => sum + s.correct, 0);
    const totalIncorrect = analytics.studentReports.reduce((sum, s) => sum + s.incorrect, 0);
    const totalUnattempted = analytics.studentReports.reduce((sum, s) => sum + s.unattempted, 0);
    
    return [
      { name: 'Correct', value: totalCorrect, color: '#10b981' },
      { name: 'Incorrect', value: totalIncorrect, color: '#ef4444' },
      { name: 'Unattempted', value: totalUnattempted, color: '#94a3b8' }
    ];
  };

  // Get time analysis data
  const getTimeAnalysis = () => {
    if (!analytics) return [];
    
    return analytics.studentReports
      .filter(s => s.timeTaken && s.timeTaken > 0)
      .map(s => ({
        studentId: s.studentId.slice(-6),
        timeTaken: Math.round(s.timeTaken / 60), // Convert to minutes
        score: parseFloat(s.percentage)
      }))
      .sort((a, b) => a.timeTaken - b.timeTaken);
  };

  // Calculate difficulty index for sections
  const getDifficultyIndex = () => {
    if (!analytics || !analytics.sectionAverages) return [];
    
    return [
      { section: 'MCQ', score: parseFloat(analytics.sectionAverages.mcq), difficulty: 100 - parseFloat(analytics.sectionAverages.mcq) },
      { section: 'Audio', score: parseFloat(analytics.sectionAverages.audio), difficulty: 100 - parseFloat(analytics.sectionAverages.audio) },
      { section: 'Video', score: parseFloat(analytics.sectionAverages.video), difficulty: 100 - parseFloat(analytics.sectionAverages.video) },
      { section: 'Puzzle', score: parseFloat(analytics.sectionAverages.puzzle), difficulty: 100 - parseFloat(analytics.sectionAverages.puzzle) }
    ].filter(item => !isNaN(item.score));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('%') || entry.name.includes('Score') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          📊 Comprehensive Quiz Analytics
        </h1>
        <p className="text-gray-600">Deep insights into student performance and quiz effectiveness</p>
      </div>

      {/* Quiz ID Input */}
      <Card className="mb-6 border-2 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Enter Quiz ID (e.g., QUIZ001)"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadAnalytics()}
              className="flex-1 text-lg"
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
          </div>
        </CardContent>
      </Card>

      {analytics && (
        <div className="space-y-6">
          {/* Quiz Overview Section */}
          <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="h-6 w-6 text-blue-600" />
                Quiz Overview
              </CardTitle>
              <CardDescription>Basic quiz information and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">Quiz ID</div>
                  <div className="font-bold text-xl text-blue-600">{analytics.quizInfo.quizId}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">Total Questions</div>
                  <div className="font-bold text-xl text-purple-600">{analytics.quizInfo.totalQuestions}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">Time Limit</div>
                  <div className="font-bold text-xl text-orange-600">{analytics.quizInfo.timeLimit} min</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-500 mb-1">Total Attempts</div>
                  <div className="font-bold text-xl text-green-600">{analytics.totalAttempts}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <Badge variant="outline" className="justify-center py-3 text-base bg-blue-100 border-blue-300">
                  <BookOpen className="mr-2 h-5 w-5" />
                  MCQ: {analytics.quizInfo.questionTypes.mcq}
                </Badge>
                <Badge variant="outline" className="justify-center py-3 text-base bg-green-100 border-green-300">
                  <Volume2 className="mr-2 h-5 w-5" />
                  Audio: {analytics.quizInfo.questionTypes.audio}
                </Badge>
                <Badge variant="outline" className="justify-center py-3 text-base bg-purple-100 border-purple-300">
                  <Video className="mr-2 h-5 w-5" />
                  Video: {analytics.quizInfo.questionTypes.video}
                </Badge>
                <Badge variant="outline" className="justify-center py-3 text-base bg-orange-100 border-orange-300">
                  <Puzzle className="mr-2 h-5 w-5" />
                  Puzzle: {analytics.quizInfo.questionTypes.puzzle}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-lg">
                <div>
                  <span className="text-gray-500">📅 Start:</span>
                  <span className="ml-2 font-medium">{formatDateTime(analytics.quizInfo.startTime)}</span>
                </div>
                <div>
                  <span className="text-gray-500">🏁 End:</span>
                  <span className="ml-2 font-medium">{formatDateTime(analytics.quizInfo.endTime)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{analytics.totalAttempts}</div>
                <p className="text-xs text-gray-500 mt-1">Attempted this quiz</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Class Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.averageScore}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Mean score across all students</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  Highest Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {analytics.highestScore}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Top performance</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-red-50 to-rose-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Lowest Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {analytics.lowestScore}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Needs attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1: Performance Distribution & Answer Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  Performance Distribution
                </CardTitle>
                <CardDescription>Student performance by grade category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getPerformanceDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getPerformanceDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {getPerformanceDistribution().map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span>{item.name}: {item.value} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Answer Distribution
                </CardTitle>
                <CardDescription>Overall response accuracy across all students</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getAnswerDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getAnswerDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-around text-center">
                  {getAnswerDistribution().map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full mb-1" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-medium">{item.name}</span>
                      <span className="text-lg font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2: Section-wise Performance */}
          {analytics.sectionAverages && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Section-wise Performance Analysis
                </CardTitle>
                <CardDescription>Compare student performance across different question types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart
                    data={[
                      { 
                        section: 'MCQ', 
                        average: parseFloat(analytics.sectionAverages.mcq), 
                        questions: analytics.quizInfo.questionTypes.mcq,
                        difficulty: 100 - parseFloat(analytics.sectionAverages.mcq)
                      },
                      { 
                        section: 'Audio', 
                        average: parseFloat(analytics.sectionAverages.audio), 
                        questions: analytics.quizInfo.questionTypes.audio,
                        difficulty: 100 - parseFloat(analytics.sectionAverages.audio)
                      },
                      { 
                        section: 'Video', 
                        average: parseFloat(analytics.sectionAverages.video), 
                        questions: analytics.quizInfo.questionTypes.video,
                        difficulty: 100 - parseFloat(analytics.sectionAverages.video)
                      },
                      { 
                        section: 'Puzzle', 
                        average: parseFloat(analytics.sectionAverages.puzzle), 
                        questions: analytics.quizInfo.questionTypes.puzzle,
                        difficulty: 100 - parseFloat(analytics.sectionAverages.puzzle)
                      }
                    ].filter(item => item.questions > 0)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="section" />
                    <YAxis yAxisId="left" domain={[0, 100]} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Difficulty Index', angle: 90, position: 'insideRight' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="average" fill="#3b82f6" name="Average Score (%)" />
                    <Line yAxisId="right" type="monotone" dataKey="difficulty" stroke="#ef4444" name="Difficulty Index" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Time Analysis */}
          {getTimeAnalysis().length > 0 && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Time vs Performance Analysis
                </CardTitle>
                <CardDescription>Relationship between time taken and quiz score</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="timeTaken" 
                      name="Time Taken" 
                      unit=" min"
                      label={{ value: 'Time Taken (minutes)', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="score" 
                      name="Score" 
                      unit="%"
                      domain={[0, 100]}
                      label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis range={[100, 400]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                    <Legend />
                    <Scatter name="Students" data={getTimeAnalysis()} fill="#8b5cf6" />
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="mt-4 text-sm text-gray-600 text-center">
                  <p>💡 <strong>Insight:</strong> Analyze if students who took more/less time performed better</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Radar Chart */}
          {analytics.sectionAverages && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Multidimensional Performance Overview
                </CardTitle>
                <CardDescription>360° view of class performance across all dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={450}>
                  <RadarChart data={[
                    { dimension: 'MCQ Mastery', score: parseFloat(analytics.sectionAverages.mcq) },
                    { dimension: 'Audio Comprehension', score: parseFloat(analytics.sectionAverages.audio) },
                    { dimension: 'Video Understanding', score: parseFloat(analytics.sectionAverages.video) },
                    { dimension: 'Problem Solving', score: parseFloat(analytics.sectionAverages.puzzle) },
                    { dimension: 'Overall Performance', score: parseFloat(analytics.averageScore.toString()) }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name="Class Performance" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Student Performance Table */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Detailed Student Performance
              </CardTitle>
              <CardDescription>Complete breakdown of individual student results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="w-16 font-bold">Rank</TableHead>
                      <TableHead className="font-bold">Student ID</TableHead>
                      <TableHead className="text-center font-bold">
                        <CheckCircle2 className="inline h-4 w-4 mr-1 text-green-600" />
                        Correct
                      </TableHead>
                      <TableHead className="text-center font-bold">
                        <XCircle className="inline h-4 w-4 mr-1 text-red-600" />
                        Incorrect
                      </TableHead>
                      <TableHead className="text-center font-bold">
                        <MinusCircle className="inline h-4 w-4 mr-1 text-gray-600" />
                        Unattempted
                      </TableHead>
                      <TableHead className="text-center font-bold">Score</TableHead>
                      <TableHead className="text-center font-bold">
                        <Timer className="inline h-4 w-4 mr-1" />
                        Time
                      </TableHead>
                      <TableHead className="font-bold">Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.studentReports.map((student, index) => {
                      const percentage = parseFloat(student.percentage);
                      return (
                        <TableRow key={student.studentId} className="hover:bg-gray-50">
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
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                              {student.correct}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                              {student.incorrect}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{student.unattempted}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className={`inline-block px-3 py-1 rounded-full font-bold text-lg ${getPerformanceBgColor(percentage)}`}>
                              {student.percentage}%
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {formatTime(student.timeTaken)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDateTime(student.submittedAt)}
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

          {/* Section-wise Leaderboards */}
          {analytics.sectionRankings && (
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Section-wise Leaderboards
                </CardTitle>
                <CardDescription>Top performers in each question category</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="mcq" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
                    <TabsTrigger value="mcq" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      MCQ
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Audio
                    </TabsTrigger>
                    <TabsTrigger value="video" className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video
                    </TabsTrigger>
                    <TabsTrigger value="puzzle" className="flex items-center gap-2">
                      <Puzzle className="h-4 w-4" />
                      Puzzle
                    </TabsTrigger>
                  </TabsList>
                  
                  {(['mcq', 'audio', 'video', 'puzzle'] as const).map(section => (
                    <TabsContent key={section} value={section}>
                      {analytics.sectionRankings[section] && analytics.sectionRankings[section].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analytics.sectionRankings[section].slice(0, 10).map((student, index) => {
                            const sectionData = student.sectionWise?.[section];
                            if (!sectionData || sectionData.total === 0) return null;
                            
                            const percentage = parseFloat(sectionData.percentage);
                            
                            return (
                              <div 
                                key={student.studentId}
                                className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-lg ${getPerformanceBgColor(percentage)}`}
                              >
                                <div className="flex items-center justify-center w-12 sm:w-14 self-start sm:self-auto">
                                  {index === 0 && <Crown className="h-8 w-8 text-yellow-500" />}
                                  {index === 1 && <Medal className="h-7 w-7 text-gray-400" />}
                                  {index === 2 && <Medal className="h-7 w-7 text-orange-400" />}
                                  {index > 2 && (
                                    <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-lg text-gray-900">{student.studentId}</div>
                                  <div className="text-sm text-gray-600">
                                    ✓ {sectionData.correct} correct · ✗ {sectionData.incorrect} wrong · ○ {sectionData.unattempted} skipped
                                  </div>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto">
                                  <div className={`font-bold text-2xl ${getPerformanceColor(percentage)}`}>
                                    {sectionData.percentage}%
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {sectionData.correct}/{sectionData.total}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">
                            No students attempted {section.toUpperCase()} questions in this quiz.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Performance Insights */}
          <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Key Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.averageScore >= 80 && (
                  <div className="flex items-start gap-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800">Excellent Class Performance</p>
                      <p className="text-sm text-green-700">The class average of {analytics.averageScore}% indicates strong understanding of the material.</p>
                    </div>
                  </div>
                )}
                
                {analytics.averageScore < 60 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800">Needs Improvement</p>
                      <p className="text-sm text-yellow-700">Class average of {analytics.averageScore}% suggests topics may need to be reviewed.</p>
                    </div>
                  </div>
                )}

                {analytics.sectionAverages && (
                  <>
                    {Object.entries(analytics.sectionAverages).map(([section, avg]) => {
                      const avgNum = parseFloat(avg as string);
                      if (avgNum < 50 && avgNum > 0) {
                        return (
                          <div key={section} className="flex items-start gap-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                              <p className="font-semibold text-red-800">Low Performance in {section.toUpperCase()}</p>
                              <p className="text-sm text-red-700">Only {avg}% average - consider additional practice or review sessions for this section.</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </>
                )}

                <div className="flex items-start gap-3 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800">Score Range</p>
                    <p className="text-sm text-blue-700">
                      Scores range from {analytics.lowestScore}% to {analytics.highestScore}% 
                      (spread: {(analytics.highestScore - analytics.lowestScore).toFixed(1)}%)
                      {analytics.highestScore - analytics.lowestScore > 50 && " - Consider providing additional support for struggling students."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!analytics && !loading && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="py-16 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Analytics Loaded</h3>
            <p className="text-gray-500">Enter a Quiz ID above to view detailed analytics and insights.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
