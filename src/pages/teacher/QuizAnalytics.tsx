import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { BarChart3, TrendingUp, Users, Trophy, Clock, Target, Medal, Crown, BookOpen, Volume2, Video, Puzzle } from "lucide-react";
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
  Radar
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

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

export default function QuizAnalytics() {
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
      setAnalytics(response.data);
      
      toast({
        title: "Success",
        description: "Analytics loaded successfully"
      });
    } catch (error: any) {
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

  const formatTime = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Quiz Analytics & Student Performance</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Enter Quiz ID"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadAnalytics()}
              className="flex-1"
            />
            <Button onClick={loadAnalytics} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Loading..." : "Load Analytics"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analytics && (
        <div className="space-y-6">
          {/* Quiz Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quiz Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Quiz ID</div>
                  <div className="font-bold text-lg">{analytics.quizInfo.quizId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Questions</div>
                  <div className="font-bold text-lg">{analytics.quizInfo.totalQuestions}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Time Limit</div>
                  <div className="font-bold text-lg">{analytics.quizInfo.timeLimit} min</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Attempts</div>
                  <div className="font-bold text-lg">{analytics.totalAttempts}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <Badge variant="outline" className="justify-center py-2">
                  📝 MCQ: {analytics.quizInfo.questionTypes.mcq}
                </Badge>
                <Badge variant="outline" className="justify-center py-2">
                  🔊 Audio: {analytics.quizInfo.questionTypes.audio}
                </Badge>
                <Badge variant="outline" className="justify-center py-2">
                  📹 Video: {analytics.quizInfo.questionTypes.video}
                </Badge>
                <Badge variant="outline" className="justify-center py-2">
                  🧩 Puzzle: {analytics.quizInfo.questionTypes.puzzle}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Start Time:</span>
                  <span className="ml-2 font-medium">{formatDateTime(analytics.quizInfo.startTime)}</span>
                </div>
                <div>
                  <span className="text-gray-500">End Time:</span>
                  <span className="ml-2 font-medium">{formatDateTime(analytics.quizInfo.endTime)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalAttempts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.averageScore}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Highest Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.highestScore}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Lowest Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {analytics.lowestScore}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Correct</TableHead>
                      <TableHead className="text-center">Incorrect</TableHead>
                      <TableHead className="text-center">Unattempted</TableHead>
                      <TableHead className="text-center">Percentage</TableHead>
                      <TableHead className="text-center">Time Taken</TableHead>
                      <TableHead>Submitted At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.studentReports.map((student, index) => {
                      const percentage = parseFloat(student.percentage);
                      return (
                        <TableRow key={student.studentId}>
                          <TableCell className="font-medium">
                            {index === 0 && <Trophy className="inline h-4 w-4 text-yellow-500 mr-1" />}
                            {index + 1}{getRankSuffix(index + 1)}
                          </TableCell>
                          <TableCell className="font-medium">{student.studentId}</TableCell>
                          <TableCell className="text-center font-bold">
                            {student.correct}
                          </TableCell>
                          <TableCell className="text-center text-green-600">
                            {student.correct}
                          </TableCell>
                          <TableCell className="text-center text-red-600">
                            {student.incorrect}
                          </TableCell>
                          <TableCell className="text-center text-gray-500">
                            {student.unattempted}
                          </TableCell>
                          <TableCell className={`text-center font-bold ${getPerformanceColor(percentage)}`}>
                            {student.percentage}%
                          </TableCell>
                          <TableCell className="text-center">
                            <Clock className="inline h-4 w-4 mr-1" />
                            {formatTime(student.timeTaken)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDateTime(student.submittedAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {analytics.studentReports.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No students have attempted this quiz yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Distribution */}
          {analytics.studentReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Excellent (80-100%)", range: [80, 100], color: "bg-green-500" },
                    { label: "Good (60-79%)", range: [60, 79], color: "bg-blue-500" },
                    { label: "Average (40-59%)", range: [40, 59], color: "bg-yellow-500" },
                    { label: "Needs Improvement (0-39%)", range: [0, 39], color: "bg-red-500" }
                  ].map((category) => {
                    const count = analytics.studentReports.filter(
                      s => parseFloat(s.percentage) >= category.range[0] && parseFloat(s.percentage) <= category.range[1]
                    ).length;
                    const percentage = ((count / analytics.studentReports.length) * 100).toFixed(1);

                    return (
                      <div key={category.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category.label}</span>
                          <span className="font-medium">{count} students ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`${category.color} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section-wise Analysis */}
          {analytics.sectionAverages && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Section-wise Class Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { section: 'MCQ', average: parseFloat(analytics.sectionAverages.mcq), questions: analytics.quizInfo.questionTypes.mcq },
                      { section: 'Audio', average: parseFloat(analytics.sectionAverages.audio), questions: analytics.quizInfo.questionTypes.audio },
                      { section: 'Video', average: parseFloat(analytics.sectionAverages.video), questions: analytics.quizInfo.questionTypes.video },
                      { section: 'Puzzle', average: parseFloat(analytics.sectionAverages.puzzle), questions: analytics.quizInfo.questionTypes.puzzle }
                    ].filter(item => item.questions > 0)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="section" />
                    <YAxis domain={[0, 100]} label={{ value: 'Average Score (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" fill="#8884d8" name="Class Average (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Section-wise Leaderboards */}
          {analytics.sectionRankings && (
            <Tabs defaultValue="mcq" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Medal className="h-5 w-5 text-purple-600" />
                        {section.toUpperCase()} Section Leaderboard
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.sectionRankings[section] && analytics.sectionRankings[section].length > 0 ? (
                        <div className="space-y-2">
                          {analytics.sectionRankings[section].slice(0, 10).map((student, index) => {
                            const sectionData = student.sectionWise?.[section];
                            if (!sectionData || sectionData.total === 0) return null;
                            
                            return (
                              <div 
                                key={student.studentId}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-lg bg-gray-50 border border-gray-200"
                              >
                                <div className="flex items-center justify-center w-10 sm:w-12 self-start sm:self-auto">
                                  {index === 0 && <Crown className="h-6 w-6 text-yellow-500" />}
                                  {index === 1 && <Medal className="h-6 w-6 text-gray-400" />}
                                  {index === 2 && <Medal className="h-6 w-6 text-orange-400" />}
                                  {index > 2 && (
                                    <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">{student.studentId}</div>
                                  <div className="text-sm text-gray-500">
                                    {sectionData.correct}/{sectionData.total} correct
                                  </div>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto">
                                  <div className="font-bold text-lg">{sectionData.percentage}%</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No students attempted {section.toUpperCase()} questions
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Overall Performance Radar Chart */}
          {analytics.studentReports.length > 0 && analytics.sectionAverages && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Overall Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={[
                    { section: 'MCQ', average: parseFloat(analytics.sectionAverages.mcq) },
                    { section: 'Audio', average: parseFloat(analytics.sectionAverages.audio) },
                    { section: 'Video', average: parseFloat(analytics.sectionAverages.video) },
                    { section: 'Puzzle', average: parseFloat(analytics.sectionAverages.puzzle) },
                    { section: 'Overall', average: parseFloat(analytics.averageScore.toString()) }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="section" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name="Class Average (%)" dataKey="average" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
