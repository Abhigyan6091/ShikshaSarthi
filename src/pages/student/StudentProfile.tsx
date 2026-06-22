import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
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
  GraduationCap
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface QuizAttempt {
  quizId: string;
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
  schoolId: string;
  class: string;
  profilePhoto?: string;
  quizAttempted: QuizAttempt[];
  createdAt?: string;
}

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      await fetchStudentProfile();
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/students/${id}`);
      setStudent(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  // Calculate average score
  const calculateAverageScore = (): number => {
    if (!student?.quizAttempted || student.quizAttempted.length === 0) return 0;
    
    const totalCorrect = student.quizAttempted.reduce((sum, quiz) => sum + quiz.score.correct, 0);
    const totalQuestions = student.quizAttempted.reduce(
      (sum, quiz) => sum + quiz.score.correct + quiz.score.incorrect + quiz.score.unattempted,
      0
    );
    
    return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  };

  // Calculate total quizzes attempted
  const getTotalQuizzes = (): number => {
    return student?.quizAttempted?.length || 0;
  };

  // Calculate subject proficiency (placeholder for future enhancement)
  const getSubjectProficiency = () => {
    if (!student?.quizAttempted || student.quizAttempted.length === 0) {
      return { subject: 'N/A', score: 0 };
    }
    
    // Placeholder - In future, group by subject from quiz data
    const avgScore = calculateAverageScore();
    return {
      subject: 'Overall Performance',
      score: avgScore
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
  const subjectProficiency = getSubjectProficiency();
  const consistency = getConsistency();
  const focusLevel = getFocusLevel();
  const recentPerformance = getRecentPerformance();

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
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{student.name}</h1>
                <p className="text-gray-600">Student Profile</p>
              </div>
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
                <p className="text-2xl font-bold text-gray-900 break-words overflow-hidden">{student.class}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Focus Level */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-edu-yellow" />
                      <span className="font-semibold">Focus Level</span>
                    </div>
                    <Badge variant={focusLevel === 'High' ? 'default' : focusLevel === 'Medium' ? 'secondary' : 'outline'}>
                      {focusLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Measures question completion rate and engagement
                  </p>
                </div>

                {/* Consistency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-edu-green" />
                      <span className="font-semibold">Consistency</span>
                    </div>
                    <Badge variant={consistency === 'High' ? 'default' : consistency === 'Medium' ? 'secondary' : 'outline'}>
                      {consistency}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Regular practice and quiz participation
                  </p>
                </div>
              </div>
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

          {/* Rating Section - Coming Soon */}
          <Card className="mb-8 border-dashed border-2">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-yellow-500" />
                <CardTitle>Performance Rating</CardTitle>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <CardDescription>Advanced performance analytics and personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-6">
                This feature will be available in the next version. Stay tuned for detailed performance ratings, 
                personalized study recommendations, and AI-powered insights!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudentProfile;
