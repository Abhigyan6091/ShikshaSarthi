import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  ArrowLeft, Users, PlusCircle, Trash2, User, Phone, IdCard, Building, BookOpen,
  GraduationCap, TrendingUp, Sparkles, ClipboardList, Brain, Loader2, AlertTriangle,
} from 'lucide-react';
import axios from 'axios';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;

interface Student {
  studentId: string;
  name: string;
  class: string;
  phone?: string;
  batch?: string;
}

interface ClassData {
  classId: string;
  className: string;
  subject: string;
  teacherId: string;
  schoolId: string;
  students: string[];
  studentDetails?: Student[];
}

interface AdaptiveRating {
  rating?: number;
  velocity?: number;
  attempts?: number;
  streak?: number;
  variance?: number;
  recentOutcomes?: number[];
  momentum?: string;
  weakTopics?: string[];
  updatedAt?: string;
}

interface StudentDetail {
  studentId: string;
  name: string;
  phone?: string;
  class?: string;
  batch?: string;
  email?: string;
  adaptiveRating?: AdaptiveRating;
}

interface QuizHistoryEntry {
  quizId: string;
  correct: number;
  incorrect: number;
  unattempted: number;
  total: number;
  percentage: number;
  attemptedAt: string | null;
}

interface AdaptiveHistoryEntry {
  className: string | null;
  correct: number;
  incorrect: number;
  total: number;
  percentage: number;
  ratingBefore: number | null;
  ratingAfter: number | null;
  ratingChange: number | null;
  weakTopics: string[];
  startedAt: string | null;
  completedAt: string | null;
}

interface ScoreTrendPoint {
  date: string;
  percentage: number;
  source: 'quiz' | 'adaptive';
  label: string | null;
}

interface WeakTopicRollup {
  topic: string;
  count: number;
}

interface SubjectBreakdown {
  subject: string;
  correct: number;
  total: number;
  percentage: number;
}

interface StudentSummary {
  studentId: string;
  totals: {
    totalQuizzes: number;
    totalAdaptiveTests: number;
    overallAccuracy: number;
    combinedCorrect: number;
    combinedTotal: number;
  };
  adaptiveRating: AdaptiveRating | null;
  quizHistory: QuizHistoryEntry[];
  adaptiveHistory: AdaptiveHistoryEntry[];
  scoreTrend: ScoreTrendPoint[];
  weakTopics: WeakTopicRollup[];
  subjectBreakdown: SubjectBreakdown[];
}

const formatDate = (value: string | null) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const initialsOf = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
};

const ClassStudents: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [studentToAdd, setStudentToAdd] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [studentSummary, setStudentSummary] = useState<StudentSummary | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const response = await axios.get(`${API_URL}/classes/${classId}`);
      setClassData(response.data);

      // Fetch all students from the same school
      if (response.data.schoolId) {
        const studentsRes = await axios.get(`${API_URL}/classes/school/${response.data.schoolId}/students`);
        setAllStudents(studentsRes.data);
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
      toast({
        title: "Error",
        description: "Failed to load class data",
        variant: "destructive",
      });
    }
  };

  const handleAddStudent = async () => {
    if (!studentToAdd) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(`${API_URL}/classes/${classId}/students`, {
        studentId: studentToAdd
      });

      toast({
        title: "Success",
        description: "Student added to class",
      });

      setStudentToAdd('');
      fetchClassData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add student",
        variant: "destructive",
      });
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the class?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/classes/${classId}/students/${studentId}`);

      toast({
        title: "Success",
        description: "Student removed from class",
      });

      fetchClassData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove student",
        variant: "destructive",
      });
    }
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
    setStudentDetail(null);
    setStudentSummary(null);
    setProfileError(null);
    fetchStudentProfile(student.studentId);
  };

  const fetchStudentProfile = async (studentId: string) => {
    setIsProfileLoading(true);
    setProfileError(null);
    try {
      const [detailRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/students/${studentId}`),
        axios.get(`${API_URL}/students/${studentId}/summary`),
      ]);
      setStudentDetail(detailRes.data);
      setStudentSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching student profile:', error);
      setProfileError('Failed to load full student profile.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Filter available students
  const availableStudents = allStudents.filter(student => {
    // Not already in class
    if (classData?.students?.includes(student.studentId)) return false;

    // Batch filter (falls back to legacy class value for pre-migration records)
    if (classFilter && classFilter !== 'all' && (student.batch || student.class) !== classFilter) return false;

    return true;
  });

  // Get enrolled students with details
  const enrolledStudents = classData?.studentDetails || [];

  // Unique batches from all students for the filter dropdown
  const availableClasses = Array.from(new Set(allStudents.map(s => s.batch || s.class).filter(Boolean))).sort();

  const chartData = (studentSummary?.scoreTrend || []).map((p, idx) => ({
    index: idx + 1,
    date: formatDate(p.date),
    percentage: p.percentage,
    label: p.label || (p.source === 'quiz' ? 'Quiz' : 'Adaptive Test'),
  }));

  const rating = studentDetail?.adaptiveRating?.rating ?? studentSummary?.adaptiveRating?.rating;

  if (!classData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 bg-gray-50">
        <div className="edu-container">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/teacher/manage-classes')}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Classes
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Class {classData.className} - {classData.subject}
              </h1>
              <p className="text-gray-600">Manage student enrollment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Add Students
                </CardTitle>
                <CardDescription>
                  {availableStudents.length} students available to add
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="space-y-2">
                  <Label htmlFor="classFilter">Filter by Batch</Label>
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All batches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All batches</SelectItem>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls} Batch
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Student Selection */}
                <div className="space-y-2">
                  <Label htmlFor="student">Select Student</Label>
                  <Select value={studentToAdd} onValueChange={setStudentToAdd}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableStudents.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No students available
                        </div>
                      ) : (
                        availableStudents.map((student) => (
                          <SelectItem key={student.studentId} value={student.studentId}>
                            {student.name} ({student.studentId}) - {student.batch || student.class} Batch
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAddStudent}
                  className="w-full"
                  disabled={!studentToAdd}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </CardContent>
            </Card>

            {/* Enrolled Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Enrolled Students ({enrolledStudents.length})
                </CardTitle>
                <CardDescription>
                  Students currently in this class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {enrolledStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">No students enrolled yet</p>
                      <p className="text-sm text-gray-400">Add students from the left panel</p>
                    </div>
                  ) : (
                    enrolledStudents.map((student) => (
                      <div
                        key={student.studentId}
                        className="p-2 bg-gray-50 rounded border flex flex-col sm:flex-row gap-2 sm:items-center hover:bg-green-50 transition-colors group"
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleStudentClick(student)}
                        >
                          <p className="font-medium group-hover:text-green-700 transition-colors">{student.name}</p>
                          <p className="text-sm text-gray-600">
                            ID: {student.studentId}
                          </p>
                          <p className="text-xs text-green-600 mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to view profile →
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveStudent(student.studentId);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Student Profile Modal */}
      <Dialog open={isStudentModalOpen} onOpenChange={setIsStudentModalOpen}>
        <DialogContent className="glass-page-bg max-w-4xl max-h-[90vh] overflow-y-auto border-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-700">Student Profile</DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Header Section */}
              <Card className="glass-card border-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-white/70 shadow-md">
                      <AvatarFallback className="bg-green-600 text-white text-xl font-semibold">
                        {initialsOf(studentDetail?.name || selectedStudent.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {studentDetail?.name || selectedStudent.name}
                      </h2>
                      <p className="text-gray-700">Student</p>
                    </div>
                    {typeof rating === 'number' && (
                      <Badge className="bg-green-600 hover:bg-green-600 text-white text-sm px-3 py-1.5 flex items-center gap-1.5 self-start sm:self-center">
                        <Sparkles className="h-3.5 w-3.5" />
                        Rating: {Math.round(rating)}
                      </Badge>
                    )}
                  </div>

                  {/* Profile Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300/60 pb-2">Personal Information</h3>

                      <div className="flex items-start space-x-3">
                        <IdCard className="h-5 w-5 text-green-700 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Student ID</p>
                          <p className="text-gray-900 font-medium">{selectedStudent.studentId || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-green-700 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="text-gray-900 font-medium">{studentDetail?.name || selectedStudent.name || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Phone className="h-5 w-5 text-green-700 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="text-gray-900 font-medium">{studentDetail?.phone || selectedStudent.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300/60 pb-2">Academic Details</h3>

                      <div className="flex items-start space-x-3">
                        <BookOpen className="h-5 w-5 text-green-700 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Class</p>
                          <p className="text-gray-900 font-medium">
                            {studentDetail?.batch || studentDetail?.class || selectedStudent.class || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Building className="h-5 w-5 text-green-700 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Current Class</p>
                          <p className="text-gray-900 font-medium">{classData?.className || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <BookOpen className="h-5 w-5 text-green-700 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Subject</p>
                          <p className="text-gray-900 font-medium">{classData?.subject || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loading state */}
              {isProfileLoading && (
                <Card className="glass-card border-0">
                  <CardContent className="p-10 flex flex-col items-center justify-center text-gray-600">
                    <Loader2 className="h-8 w-8 animate-spin mb-3 text-green-700" />
                    <p>Loading student history and insights...</p>
                  </CardContent>
                </Card>
              )}

              {/* Error state */}
              {!isProfileLoading && profileError && (
                <Card className="glass-card border-0">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center text-gray-600">
                    <AlertTriangle className="h-8 w-8 mb-3 text-amber-600" />
                    <p>{profileError}</p>
                  </CardContent>
                </Card>
              )}

              {/* Comprehensive Summary + History + Insights */}
              {!isProfileLoading && !profileError && studentSummary && (
                <>
                  {/* Comprehensive Summary stat tiles */}
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <ClipboardList className="h-5 w-5 text-green-700" />
                        Comprehensive Summary
                      </CardTitle>
                      <CardDescription>Overall activity and performance rollup</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="glass-pill rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-gray-900">{studentSummary.totals.totalQuizzes}</p>
                          <p className="text-xs text-gray-600 mt-1">Quizzes Attempted</p>
                        </div>
                        <div className="glass-pill rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-gray-900">{studentSummary.totals.totalAdaptiveTests}</p>
                          <p className="text-xs text-gray-600 mt-1">Adaptive Tests</p>
                        </div>
                        <div className="glass-pill rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-gray-900">{studentSummary.totals.overallAccuracy}%</p>
                          <p className="text-xs text-gray-600 mt-1">Overall Accuracy</p>
                        </div>
                        <div className="glass-pill rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {typeof rating === 'number' ? Math.round(rating) : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Adaptive Rating</p>
                        </div>
                      </div>

                      {studentSummary.weakTopics.length > 0 && (
                        <div className="mt-5">
                          <p className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-1.5">
                            <Brain className="h-4 w-4 text-green-700" />
                            Weak Topics
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {studentSummary.weakTopics.map((wt) => (
                              <Badge key={wt.topic} variant="outline" className="bg-white/50 border-amber-400 text-amber-800">
                                {wt.topic} ({wt.count})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Score trend chart */}
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <TrendingUp className="h-5 w-5 text-green-700" />
                        Score Trend
                      </CardTitle>
                      <CardDescription>Chronological performance across quizzes and adaptive tests</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {chartData.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                          <TrendingUp className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                          <p>No activity yet — the trend will appear once the student attempts a quiz or adaptive test.</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={260}>
                          <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                            <defs>
                              <linearGradient id="scoreTrendFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#16a34a" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#16a34a" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.25)" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#52514e' }} />
                            <YAxis
                              domain={[0, 100]}
                              tickFormatter={(v) => `${v}%`}
                              tick={{ fontSize: 11, fill: '#52514e' }}
                              width={40}
                            />
                            <Tooltip
                              formatter={(value: number, _name, item) => [`${value}%`, item?.payload?.label || 'Score']}
                              labelFormatter={(label) => `Date: ${label}`}
                              contentStyle={{
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.6)',
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="percentage"
                              stroke="#15803d"
                              strokeWidth={2}
                              fill="url(#scoreTrendFill)"
                              dot={{ r: 3, fill: '#15803d', strokeWidth: 0 }}
                              activeDot={{ r: 5 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* History tables */}
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <ClipboardList className="h-5 w-5 text-green-700" />
                        Attempt History
                      </CardTitle>
                      <CardDescription>Everything this student has attempted so far</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="quizzes" className="w-full">
                        <TabsList className="glass-pill">
                          <TabsTrigger value="quizzes">
                            Quizzes ({studentSummary.quizHistory.length})
                          </TabsTrigger>
                          <TabsTrigger value="adaptive">
                            Adaptive Tests ({studentSummary.adaptiveHistory.length})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="quizzes">
                          {studentSummary.quizHistory.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <ClipboardList className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                              <p>No quizzes attempted yet.</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-lg">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Quiz ID</TableHead>
                                    <TableHead>Correct</TableHead>
                                    <TableHead>Incorrect</TableHead>
                                    <TableHead>Unattempted</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Date</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {studentSummary.quizHistory.map((q, idx) => (
                                    <TableRow key={`${q.quizId}-${idx}`}>
                                      <TableCell className="font-medium text-gray-900">{q.quizId}</TableCell>
                                      <TableCell className="text-green-700">{q.correct}</TableCell>
                                      <TableCell className="text-red-600">{q.incorrect}</TableCell>
                                      <TableCell className="text-gray-500">{q.unattempted}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="bg-white/50">{q.percentage}%</Badge>
                                      </TableCell>
                                      <TableCell className="text-gray-600">{formatDate(q.attemptedAt)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="adaptive">
                          {studentSummary.adaptiveHistory.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <Brain className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                              <p>No adaptive tests attempted yet.</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-lg">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Correct</TableHead>
                                    <TableHead>Incorrect</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Rating Change</TableHead>
                                    <TableHead>Date</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {studentSummary.adaptiveHistory.map((a, idx) => (
                                    <TableRow key={`${a.className}-${idx}`}>
                                      <TableCell className="font-medium text-gray-900">{a.className || 'N/A'}</TableCell>
                                      <TableCell className="text-green-700">{a.correct}</TableCell>
                                      <TableCell className="text-red-600">{a.incorrect}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="bg-white/50">{a.percentage}%</Badge>
                                      </TableCell>
                                      <TableCell
                                        className={
                                          typeof a.ratingChange === 'number' && a.ratingChange >= 0
                                            ? 'text-green-700'
                                            : 'text-red-600'
                                        }
                                      >
                                        {typeof a.ratingChange === 'number'
                                          ? `${a.ratingChange >= 0 ? '+' : ''}${Math.round(a.ratingChange)}`
                                          : 'N/A'}
                                      </TableCell>
                                      <TableCell className="text-gray-600">
                                        {formatDate(a.completedAt || a.startedAt)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ClassStudents;
