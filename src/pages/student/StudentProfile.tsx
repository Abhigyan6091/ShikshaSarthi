import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { getCurrentUser } from '@/lib/session';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  User,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Target,
  Brain,
  Activity,
  Star,
  Calendar,
  School,
  Hash,
  GraduationCap,
  Pencil,
  Camera,
  KeyRound,
  Loader2,
  Sparkles
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface QuizAttempt {
  quizId: string;
  attemptMode?: 'quiz' | 'group';
  groupAttemptId?: string;
  answers: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
  score: {
    correct: number;
    incorrect: number;
    unattempted: number;
  };
  attemptedAt: string;
}

interface StudentData {
  _id: string;
  studentId: string;
  name: string;
  username?: string;
  phone?: string;
  email?: string;
  schoolId: string;
  class: string;
  batch?: string;
  profilePhoto?: string;
  quizAttempted: QuizAttempt[];
  adaptiveRating?: {
    rating?: number;
    momentum?: string;
    streak?: number;
    attempts?: number;
    weakTopics?: string[];
  };
  createdAt?: string;
}

interface StudentSummary {
  totals: {
    totalQuizzes: number;
    totalGroupQuizzes?: number;
    totalAdaptiveTests: number;
    overallAccuracy: number;
    combinedCorrect: number;
    combinedTotal: number;
  };
  adaptiveRating?: StudentData['adaptiveRating'] | null;
  quizHistory: {
    quizId: string;
    attemptMode?: 'quiz' | 'group';
    correct: number;
    incorrect: number;
    unattempted: number;
    total: number;
    percentage: number;
    attemptedAt: string | null;
  }[];
  adaptiveHistory: {
    className: string | null;
    correct: number;
    incorrect: number;
    total: number;
    percentage: number;
    ratingBefore: number | null;
    ratingAfter: number | null;
    ratingChange: number | null;
    weakTopics: string[];
    completedAt: string | null;
    startedAt: string | null;
  }[];
  scoreTrend: {
    date: string;
    percentage: number;
    source: 'quiz' | 'adaptive';
    label: string | null;
  }[];
  weakTopics: { topic: string; count: number }[];
}

const batchToClass = (batch?: string) => {
  const n = Number.parseInt(String(batch || '').replace(/\D/g, ''), 10);
  const derived = Number.isFinite(n) && n >= 2026 && n <= 2037 ? 2038 - n : 0;
  return derived >= 6 && derived <= 12 ? String(derived) : '';
};

const resolveDisplayClass = (student?: Pick<StudentData, 'class' | 'batch'> | null) => {
  const legacyClass = String(student?.class || '').trim();
  return legacyClass || batchToClass(student?.batch) || 'N/A';
};

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const routeStudentId = id || getCurrentUser()?.studentId || '';
  const [student, setStudent] = useState<StudentData | null>(null);
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = Boolean(routeStudentId) && getCurrentUser()?.studentId === routeStudentId;

  // ── Edit profile dialog ──────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Change password dialog ───────────────────────────────────────────────
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      await fetchStudentProfile();
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeStudentId]);

  const fetchStudentProfile = async () => {
    if (!routeStudentId) {
      setLoading(false);
      setError('Student session not found. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      const [profileRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/students/${routeStudentId}`),
        axios.get(`${API_URL}/students/${routeStudentId}/summary`).catch(() => ({ data: null })),
      ]);
      setStudent(profileRes.data);
      setSummary(summaryRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = () => {
    if (!student) return;
    setEditName(student.name || '');
    setEditPhone(student.phone || '');
    setEditEmail(student.email || '');
    setPhotoPreview(null);
    setPhotoDataUrl(null);
    setEditOpen(true);
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please choose an image file.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setPhotoDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!student) return;
    if (!editName.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    try {
      setSavingProfile(true);
      const payload: Record<string, string> = {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
      };
      if (photoDataUrl) payload.profilePhoto = photoDataUrl;

      const response = await axios.patch(`${API_URL}/students/${student.studentId}/profile`, payload);
      setStudent((prev) => (prev ? { ...prev, ...response.data } : response.data));

      // Keep the locally cached session in sync so Header/Dashboard reflect the change immediately.
      try {
        const raw = localStorage.getItem('student');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.student) parsed.student = { ...parsed.student, ...response.data };
          localStorage.setItem('student', JSON.stringify(parsed));
        }
      } catch {
        // non-fatal; session cache stays stale until next login
      }

      toast({ title: 'Profile updated' });
      setEditOpen(false);
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to update profile';
      toast({ title: 'Update failed', description: message, variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!student) return;
    if (!currentPassword || !newPassword) {
      toast({ title: 'All fields are required', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Password too short', description: 'New password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    try {
      setSavingPassword(true);
      await axios.post(`${API_URL}/students/${student.studentId}/change-password`, {
        currentPassword,
        newPassword,
      });
      toast({ title: 'Password changed successfully' });
      setPasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to change password';
      toast({ title: 'Change failed', description: message, variant: 'destructive' });
    } finally {
      setSavingPassword(false);
    }
  };

  // Calculate average score
  const calculateAverageScore = (): number => {
    if (!student?.quizAttempted || student.quizAttempted.length === 0) return 0;

    const percentages = student.quizAttempted
      .map((quiz) => {
        const total = (quiz.score?.correct || 0) + (quiz.score?.incorrect || 0) + (quiz.score?.unattempted || 0);
        return total > 0 ? ((quiz.score?.correct || 0) / total) * 100 : null;
      })
      .filter((score): score is number => typeof score === 'number');

    return percentages.length > 0
      ? Math.round(percentages.reduce((sum, score) => sum + score, 0) / percentages.length)
      : 0;
  };

  // Calculate total quizzes attempted
  const getTotalQuizzes = (): number => {
    return student?.quizAttempted?.filter((quiz) => quiz.attemptMode !== 'group').length || 0;
  };

  const getTotalGroupQuizzes = (): number => {
    return student?.quizAttempted?.filter((quiz) => quiz.attemptMode === 'group').length || 0;
  };

  const getSubjectProficiency = () => {
    const adaptiveTotal = summary?.totals.combinedTotal || 0;
    if ((!student?.quizAttempted || student.quizAttempted.length === 0) && adaptiveTotal === 0) {
      return { subject: 'N/A', score: 0 };
    }

    const score = summary?.totals.overallAccuracy ?? calculateAverageScore();
    return {
      subject: 'Overall Progress',
      score
    };
  };

  // Calculate consistency (based on quiz attempts over time)
  const getConsistency = (): string => {
    if (!student?.quizAttempted || student.quizAttempted.length < 3) {
      return 'N/A';
    }
    
    // Simple consistency check: if more than 3 quizzes, consider consistent
    if (student.quizAttempted.length >= 5) return 'High';
    if (student.quizAttempted.length >= 3) return 'Medium';
    return 'Low';
  };

  // Calculate focus level (based on unattempted questions)
  const getFocusLevel = (): string => {
    if (!student?.quizAttempted || student.quizAttempted.length === 0) {
      return 'N/A';
    }
    
    const totalUnattempted = student.quizAttempted.reduce(
      (sum, quiz) => sum + quiz.score.unattempted,
      0
    );
    const totalQuestions = student.quizAttempted.reduce(
      (sum, quiz) => sum + quiz.score.correct + quiz.score.incorrect + quiz.score.unattempted,
      0
    );
    
    const attemptRate = totalQuestions > 0 ? ((totalQuestions - totalUnattempted) / totalQuestions) * 100 : 0;
    
    if (attemptRate >= 90) return 'High';
    if (attemptRate >= 70) return 'Medium';
    return 'Low';
  };

  const getCompletionStats = () => {
    const quizAttempts = student?.quizAttempted || [];
    const totalUnattempted = quizAttempts.reduce((sum, quiz) => sum + (quiz.score?.unattempted || 0), 0);
    const totalQuestions = quizAttempts.reduce(
      (sum, quiz) => sum + (quiz.score?.correct || 0) + (quiz.score?.incorrect || 0) + (quiz.score?.unattempted || 0),
      0
    );
    const attemptRate = totalQuestions > 0 ? Math.round(((totalQuestions - totalUnattempted) / totalQuestions) * 100) : 0;
    return { totalUnattempted, totalQuestions, attemptRate };
  };

  // Get recent quiz performance
  const getRecentPerformance = () => {
    if (!student?.quizAttempted || student.quizAttempted.length === 0) return [];
    
    return student.quizAttempted.slice(-5).reverse().map(quiz => {
      const total = quiz.score.correct + quiz.score.incorrect + quiz.score.unattempted;
      const percentage = total > 0 ? Math.round((quiz.score.correct / total) * 100) : 0;
      
      return {
        quizId: quiz.quizId,
        score: percentage,
        correct: quiz.score.correct,
        incorrect: quiz.score.incorrect,
        unattempted: quiz.score.unattempted,
        date: new Date(quiz.attemptedAt).toLocaleDateString()
      };
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading student profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>{error || 'Student not found'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const averageScore = calculateAverageScore();
  const totalQuizzes = getTotalQuizzes();
  const totalGroupQuizzes = getTotalGroupQuizzes();
  const subjectProficiency = getSubjectProficiency();
  const consistency = getConsistency();
  const focusLevel = getFocusLevel();
  const recentPerformance = getRecentPerformance();
  const adaptiveRating = student.adaptiveRating?.rating ?? summary?.adaptiveRating?.rating;
  const chartData = (summary?.scoreTrend || []).map((point, index) => ({
    index: index + 1,
    date: formatDate(point.date),
    percentage: point.percentage,
    label: point.label || (point.source === 'quiz' ? 'Quiz' : 'Adaptive Test'),
  }));
  const completionStats = getCompletionStats();
  const totalActivities = (summary?.totals.totalQuizzes || 0) + (summary?.totals.totalGroupQuizzes || 0) + (summary?.totals.totalAdaptiveTests || 0);
  const overallAccuracy = summary?.totals.overallAccuracy ?? averageScore;
  const topWeakTopics = (summary?.weakTopics || []).slice(0, 3).map((item) => item.topic);
  const trendDelta =
    chartData.length >= 2
      ? Math.round(chartData[chartData.length - 1].percentage - chartData[0].percentage)
      : 0;
  const lastActivityDate = (summary?.scoreTrend || [])
    .map((point) => new Date(point.date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const progressSummary =
    totalActivities === 0
      ? `${student.name} has not attempted any scored activity yet. Start with one quiz or adaptive test to build a baseline.`
      : `${student.name} has completed ${totalActivities} scored activit${totalActivities === 1 ? 'y' : 'ies'} with ${overallAccuracy}% overall accuracy${typeof adaptiveRating === 'number' ? ` and an adaptive rating of ${Math.round(adaptiveRating)}` : ''}. ${
          trendDelta > 5
            ? `Recent scores are improving by about ${trendDelta} points from the first recorded score.`
            : trendDelta < -5
              ? `Recent scores are down by about ${Math.abs(trendDelta)} points, so revision should be prioritized.`
              : 'Performance is currently steady.'
        }`;

  const focusRecommendation =
    topWeakTopics.length > 0
      ? `Focus first on ${topWeakTopics.join(', ')}. These topics are repeatedly appearing as weak areas in adaptive tests.`
      : completionStats.totalQuestions === 0
        ? 'Begin with a short quiz or adaptive test so the system can identify focus areas.'
        : completionStats.attemptRate < 70
          ? `Focus on completing more questions. ${completionStats.totalUnattempted} out of ${completionStats.totalQuestions} quiz questions were left unattempted.`
          : overallAccuracy < 50
            ? 'Focus on fundamentals and review incorrect answers before attempting harder tests.'
            : overallAccuracy < 75
              ? 'Focus on converting near-misses into correct answers by revising mistakes after every quiz.'
              : 'Focus on maintaining accuracy with mixed practice and slightly harder adaptive tests.';

  const consistencyRecommendation =
    totalActivities === 0
      ? 'No consistency pattern yet. Attempt at least three activities to get a reliable reading.'
      : totalActivities < 3
        ? `Only ${totalActivities} scored activit${totalActivities === 1 ? 'y has' : 'ies have'} been completed. Aim for at least three attempts this week.`
        : lastActivityDate
          ? `Last activity was on ${formatDate(lastActivityDate.toISOString())}. Keep a regular rhythm with small practice sessions every few days.`
          : 'Practice is happening, but activity dates are incomplete. Keep attempts regular for better tracking.';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="flex-1 py-6 md:py-8">
        <div className="edu-container">
          {/* Header Section */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              ← Back
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Avatar className="h-20 w-20 ring-4 ring-edu-blue/20">
                <AvatarImage src={student.profilePhoto ? `${API_URL}/${student.profilePhoto.replace(/^\//, '')}` : ''} alt={student.name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-edu-blue to-edu-purple text-white text-3xl font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{student.name}</h1>
                <p className="text-gray-600">Student Profile</p>
              </div>
              {isOwnProfile && (
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2" onClick={openEditDialog}>
                    <Pencil className="h-4 w-4" /> Edit Profile
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => setPasswordOpen(true)}>
                    <KeyRound className="h-4 w-4" /> Change Password
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Basic Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Student ID</CardTitle>
                  <Hash className="h-4 w-4 text-edu-blue flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 break-words overflow-hidden">{student.studentId}</p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Class</CardTitle>
                  <GraduationCap className="h-4 w-4 text-edu-green flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 break-words overflow-hidden">{resolveDisplayClass(student)}</p>
                {student.batch && (
                  <p className="text-xs text-gray-500 mt-1">Batch {student.batch}</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">School ID</CardTitle>
                  <School className="h-4 w-4 text-edu-purple flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 break-words overflow-hidden">{student.schoolId}</p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Username</CardTitle>
                  <User className="h-4 w-4 text-edu-yellow flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 break-words overflow-hidden" title={student.username || student.studentId}>
                  {student.username || student.studentId}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Average Score */}
            <Card className="bg-gradient-to-br from-edu-blue to-blue-600 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Average Score</CardTitle>
                  <Award className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold mb-2">{averageScore}%</p>
                <Progress value={averageScore} className="bg-white/30" />
                <p className="text-sm mt-2 text-blue-100">
                  {averageScore >= 75 ? 'Excellent Performance!' : averageScore >= 50 ? 'Good Progress' : 'Needs Improvement'}
                </p>
              </CardContent>
            </Card>

            {/* Total Quizzes */}
            <Card className="bg-gradient-to-br from-edu-green to-green-600 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Total Quizzes</CardTitle>
                  <BookOpen className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold mb-2">{totalQuizzes}</p>
                <p className="text-sm text-green-100">
                  {totalQuizzes > 0 ? 'Keep up the practice!' : 'Start practicing today!'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-600 to-teal-600 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Group Quiz</CardTitle>
                  <Users className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold mb-2">{totalGroupQuizzes}</p>
                <p className="text-sm text-cyan-100">
                  {totalGroupQuizzes > 0 ? 'Collaborative attempts completed' : 'No group quiz yet'}
                </p>
              </CardContent>
            </Card>

            {/* Subject Proficiency */}
            <Card className="bg-gradient-to-br from-edu-purple to-purple-600 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Subject Proficiency</CardTitle>
                  <Target className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold mb-2">{subjectProficiency.subject}</p>
                <p className="text-4xl font-bold">{subjectProficiency.score}%</p>
                <p className="text-sm mt-2 text-purple-100">Overall Performance</p>
              </CardContent>
            </Card>
          </div>

          {/* Rating and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Adaptive Rating</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">
                  {typeof adaptiveRating === 'number' ? Math.round(adaptiveRating) : 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-1">{student.adaptiveRating?.momentum || 'Steady'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Adaptive Tests</CardTitle>
                  <Brain className="h-4 w-4 text-edu-purple" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{summary?.totals.totalAdaptiveTests || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Completed tests</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Overall Accuracy</CardTitle>
                  <Target className="h-4 w-4 text-edu-green" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{summary?.totals.overallAccuracy ?? averageScore}%</p>
                <p className="text-sm text-gray-500 mt-1">
                  {summary?.totals.combinedCorrect || 0}/{summary?.totals.combinedTotal || 0} correct
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Weak Topics</CardTitle>
                  <Activity className="h-4 w-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{summary?.weakTopics.length || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Need attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Behavioral Insights */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-edu-blue" />
                <CardTitle>Behavioral Insights</CardTitle>
              </div>
              <CardDescription>Understanding learning patterns and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-edu-blue" />
                  <p className="font-semibold text-gray-900">Current Situation Summary</p>
                </div>
                <p className="text-sm leading-6 text-gray-700">{progressSummary}</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-md bg-white/75 p-3">
                    <p className="text-xs text-gray-500">Activity</p>
                    <p className="text-lg font-bold text-gray-900">{totalActivities}</p>
                  </div>
                  <div className="rounded-md bg-white/75 p-3">
                    <p className="text-xs text-gray-500">Question Completion</p>
                    <p className="text-lg font-bold text-gray-900">{completionStats.attemptRate}%</p>
                  </div>
                  <div className="rounded-md bg-white/75 p-3">
                    <p className="text-xs text-gray-500">Trend</p>
                    <p className={`text-lg font-bold ${trendDelta >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {chartData.length >= 2 ? `${trendDelta >= 0 ? '+' : ''}${trendDelta} pts` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Focus Level */}
                <div className="space-y-3 rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-edu-yellow" />
                      <span className="font-semibold">Focus Level</span>
                    </div>
                    <Badge variant={focusLevel === 'High' ? 'default' : focusLevel === 'Medium' ? 'secondary' : 'outline'}>
                      {focusLevel}
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-gray-700">{focusRecommendation}</p>
                  {topWeakTopics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {topWeakTopics.map((topic) => (
                        <Badge key={topic} variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Based on weak topics, accuracy, and unattempted questions.
                  </p>
                </div>

                {/* Consistency */}
                <div className="space-y-3 rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-edu-green" />
                      <span className="font-semibold">Consistency</span>
                    </div>
                    <Badge variant={consistency === 'High' ? 'default' : consistency === 'Medium' ? 'secondary' : 'outline'}>
                      {consistency}
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-gray-700">{consistencyRecommendation}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="rounded-md bg-gray-50 p-2">
                      <span className="block text-gray-500">Quizzes</span>
                      <span className="font-semibold text-gray-900">{summary?.totals.totalQuizzes ?? totalQuizzes}</span>
                    </div>
                    <div className="rounded-md bg-gray-50 p-2">
                      <span className="block text-gray-500">Adaptive Tests</span>
                      <span className="font-semibold text-gray-900">{summary?.totals.totalAdaptiveTests || 0}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Based on number of attempts and recent activity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Trend */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-edu-blue" />
                <CardTitle>Score Trend</CardTitle>
              </div>
              <CardDescription>Performance across quizzes and adaptive tests</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <TrendingUp className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p>No scored activity yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="studentProfileScoreTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.25)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} width={42} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number, _name, item) => [`${value}%`, item?.payload?.label || 'Score']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="percentage"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="url(#studentProfileScoreTrend)"
                      dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Quiz Performance */}
          {recentPerformance.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-edu-blue" />
                  <CardTitle>Recent Quiz Performance</CardTitle>
                </div>
                <CardDescription>Last 5 quiz attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPerformance.map((quiz, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div>
                          <p className="font-semibold">Quiz ID: {quiz.quizId}</p>
                          <p className="text-sm text-gray-600">{quiz.date}</p>
                        </div>
                        <Badge className={quiz.score >= 75 ? 'bg-green-500' : quiz.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}>
                          {quiz.score}%
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-green-600">✓ {quiz.correct} Correct</span>
                        <span className="text-red-600">✗ {quiz.incorrect} Incorrect</span>
                        <span className="text-gray-600">− {quiz.unattempted} Unattempted</span>
                      </div>
                      <Progress value={quiz.score} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Attempt History */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-edu-blue" />
                <CardTitle>History and Insights</CardTitle>
              </div>
              <CardDescription>Quiz attempts, adaptive tests, rating movement, and weak topics</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[72vh] overflow-y-auto pr-3">
              {(summary?.weakTopics?.length || 0) > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {summary?.weakTopics.map((topic) => (
                    <Badge key={topic.topic} variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                      {topic.topic} ({topic.count})
                    </Badge>
                  ))}
                </div>
              )}

              <Tabs defaultValue="quizzes" className="w-full">
                <TabsList>
                  <TabsTrigger value="quizzes">Quizzes ({summary?.quizHistory.length || 0})</TabsTrigger>
                  <TabsTrigger value="adaptive">Adaptive Tests ({summary?.adaptiveHistory.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="quizzes">
                  {(summary?.quizHistory.length || 0) === 0 ? (
                    <div className="text-center py-8 text-gray-500">No quizzes attempted yet.</div>
                  ) : (
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Quiz ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Correct</TableHead>
                            <TableHead>Incorrect</TableHead>
                            <TableHead>Unattempted</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summary?.quizHistory.map((quiz, index) => (
                            <TableRow key={`${quiz.quizId}-${index}`}>
                              <TableCell className="font-medium">{quiz.quizId}</TableCell>
                              <TableCell>{quiz.attemptMode === 'group' ? 'Group Quiz' : 'Quiz'}</TableCell>
                              <TableCell className="text-green-700">{quiz.correct}</TableCell>
                              <TableCell className="text-red-600">{quiz.incorrect}</TableCell>
                              <TableCell className="text-gray-600">{quiz.unattempted}</TableCell>
                              <TableCell>{quiz.percentage}%</TableCell>
                              <TableCell>{formatDate(quiz.attemptedAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="adaptive">
                  {(summary?.adaptiveHistory.length || 0) === 0 ? (
                    <div className="text-center py-8 text-gray-500">No adaptive tests attempted yet.</div>
                  ) : (
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Class</TableHead>
                            <TableHead>Correct</TableHead>
                            <TableHead>Incorrect</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summary?.adaptiveHistory.map((attempt, index) => (
                            <TableRow key={`${attempt.className}-${index}`}>
                              <TableCell className="font-medium">{attempt.className || 'N/A'}</TableCell>
                              <TableCell className="text-green-700">{attempt.correct}</TableCell>
                              <TableCell className="text-red-600">{attempt.incorrect}</TableCell>
                              <TableCell>{attempt.percentage}%</TableCell>
                              <TableCell>
                                {typeof attempt.ratingChange === 'number'
                                  ? `${Math.round(attempt.ratingBefore || 0)} → ${Math.round(attempt.ratingAfter || 0)} (${attempt.ratingChange >= 0 ? '+' : ''}${Math.round(attempt.ratingChange)})`
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>{formatDate(attempt.completedAt || attempt.startedAt)}</TableCell>
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
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24 ring-4 ring-edu-blue/20">
                <AvatarImage
                  src={photoPreview || (student.profilePhoto ? `${API_URL}/${student.profilePhoto.replace(/^\//, '')}` : '')}
                  alt={student.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-edu-blue to-edu-purple text-white text-3xl font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-4 w-4" /> Change Photo
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input id="edit-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email address" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingProfile}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile} className="gap-2">
              {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)} disabled={savingPassword}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={savingPassword} className="gap-2">
              {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />} Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default StudentProfile;
