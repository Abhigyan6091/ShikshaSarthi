import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL;
import {
  BookOpen,
  ListChecks,
  BarChart,
  PlusCircle,
  Users,
  Layers,
  MessageSquare,
  Video,
  Database
} from 'lucide-react';
import SubjectIcon from '@/components/SubjectIcon';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [teacherQuizzes, setTeacherQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Teacher data from cookies
  const [teacherId, setTeacherId] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [teacherData, setTeacherData] = useState(null);

  // Fetch quizzes created by the teacher
  useEffect(() => {
    const fetchTeacherQuizzes = async () => {
      const teacherCookie = Cookies.get("teacher");
      let teacherInfo: any = null;

      if (teacherCookie) {
        try {
          const parsedCookie = JSON.parse(teacherCookie);
          teacherInfo = parsedCookie?.teacher || parsedCookie || null;
        } catch (cookieParseError) {
          console.warn('Failed to parse teacher cookie, trying localStorage fallback.', cookieParseError);
        }
      }

      if (!teacherInfo) {
        const teacherFromStorage = localStorage.getItem('teacher');
        const currentUser = localStorage.getItem('currentUser');

        try {
          if (teacherFromStorage) {
            const parsedTeacherStorage = JSON.parse(teacherFromStorage);
            teacherInfo = parsedTeacherStorage?.teacher || parsedTeacherStorage || null;
          } else if (currentUser) {
            const parsedCurrentUser = JSON.parse(currentUser);
            if (parsedCurrentUser?.role === 'teacher' || parsedCurrentUser?.teacherId) {
              teacherInfo = parsedCurrentUser;
            }
          }
        } catch (storageParseError) {
          console.warn('Failed to parse teacher data from localStorage.', storageParseError);
        }
      }

      if (!teacherInfo) {
        setError('Teacher session not found. Please login again.');
        setLoading(false);
        return;
      }

      try {
        // Extract all teacher information from available session data
        setTeacherId(teacherInfo.teacherId || teacherInfo.id || "");
        setTeacherName(teacherInfo.name || teacherInfo.teacherName || "");
        setSchoolId(teacherInfo.schoolId || teacherInfo.instituteId || "");
        setTeacherData(teacherInfo);

        console.log('Teacher data from session:', teacherInfo);

        const teacherIdFromCookie = teacherInfo.teacherId || teacherInfo.id;

        if (!teacherIdFromCookie) {
          throw new Error('Teacher ID not found in session data');
        }

        const response = await fetch(`${API_URL}/teachers/${teacherIdFromCookie}/quizzes`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log to see the structure
        setTeacherQuizzes(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(`Failed to fetch quizzes: ${err.message}`);
        console.error('Error fetching teacher quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherQuizzes();
  }, []);

  // Mock data for the dashboard
  const statsData = [
    {
      title: "Total Students",
      value: "42",
      icon: <Users className="h-8 w-8 text-edu-blue" />,
      description: "From your institute",
    },
    {
      title: "Total Quizzes",
      value: loading ? "..." : teacherQuizzes.length.toString(),
      icon: <ListChecks className="h-8 w-8 text-edu-green" />,
      description: "Created by you",
    },
    {
      title: "Quiz Attempts",
      value: "15",
      icon: <BookOpen className="h-8 w-8 text-edu-yellow" />,
      description: "By your students",
    },
    {
      title: "Avg. Score",
      value: "76%",
      icon: <BarChart className="h-8 w-8 text-edu-purple" />,
      description: "Overall performance",
    },
  ];

  // Mock data for subject stats
  const subjectStats = [
    { subject: 'mathematics', name: 'Mathematics', attempted: 25, avgScore: 72 },
    { subject: 'science', name: 'Science', attempted: 18, avgScore: 65 },
    { subject: 'social', name: 'Social Science', attempted: 12, avgScore: 80 },
    { subject: 'mat', name: 'Mental Ability', attempted: 8, avgScore: 60 },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-6 md:py-8 bg-gray-50">
        <div className="edu-container">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome, {teacherName || user?.name || 'Teacher'}!
            </h1>
          </div>


          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statsData.map((stat, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{stat.title}</CardTitle>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">


            <Card className="border-2 border-edu-green/20 hover:border-edu-green/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">Manage Classes</CardTitle>
                    <CardDescription>Create classes and manage students</CardDescription>
                  </div>
                  <Layers className="h-8 w-8 text-edu-green" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Create and manage your classes by subject. Add or remove students from each class.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/teacher/manage-classes" className="w-full">
                  <Button variant="outline" className="w-full border-edu-green text-edu-green hover:bg-edu-green/10">
                    Manage Classes
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-2 border-edu-purple/20 hover:border-edu-purple/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">Quiz Analytics</CardTitle>
                    <CardDescription>View performance reports and statistics</CardDescription>
                  </div>
                  <BarChart className="h-8 w-8 text-edu-purple" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  See detailed analytics on student performance, question difficulty, and more for each quiz you've created.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/teacher/analytics" className="w-full">
                  <Button variant="outline" className="w-full border-edu-purple text-edu-purple hover:bg-edu-purple/10">
                    View Analytics
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-2 border-orange-500/20 hover:border-orange-500/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">Give Feedback</CardTitle>
                    <CardDescription>Provide feedback on school forms</CardDescription>
                  </div>
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  View and submit feedback forms created by your school administration.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/teacher/give-feedback" className="w-full">
                  <Button variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50">
                    Give Feedback
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-2 border-teal-500/20 hover:border-teal-500/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">Question Bank</CardTitle>
                    <CardDescription>Browse all questions in the database</CardDescription>
                  </div>
                  <Database className="h-8 w-8 text-teal-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  View all questions stored in the database along with their options and correct answers.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/teacher/all-questions" className="w-full">
                  <Button variant="outline" className="w-full border-teal-600 text-teal-600 hover:bg-teal-50">
                    View Questions
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Enhanced Quiz System - New Features */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm">NEW</span>
              Enhanced Quiz System
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 border-blue-500/30 hover:border-blue-500/50 transition-colors bg-gradient-to-br from-blue-50 to-white shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1 flex items-center gap-2">
                      <PlusCircle className="h-6 w-6 text-blue-600" />
                      Quiz Creator
                    </CardTitle>
                    <CardDescription>Comprehensive quizzes with multiple question types</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    Access 1000s of bank questions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    Contest-style with start/end times
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    Mix MCQ, Audio, Video, Puzzle questions
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/teacher/create-quiz-new" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Create Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-2 border-purple-500/30 hover:border-purple-500/50 transition-colors bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1 flex items-center gap-2">
                      <BarChart className="h-6 w-6 text-purple-600" />
                      Comprehensive Analytics
                    </CardTitle>
                    <CardDescription>Detailed student performance analysis</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Student-wise performance metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Comparative analysis & rankings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Performance distribution charts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Time taken & submission stats
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/teacher/quiz-analytics" className="w-full">
                  <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
                    View Analytics
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-2 border-emerald-500/30 hover:border-emerald-500/50 transition-colors bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1 flex items-center gap-2">
                      <Video className="h-6 w-6 text-emerald-600" />
                      Question Generator
                    </CardTitle>
                    <CardDescription>AI-powered video question generation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Upload videos & auto-analyze scenes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    AI generates MCQ questions from content
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    8 question categories (temporal, causal, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Export as JSON/CSV with TTS explanations
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/teacher/question-generator" className="w-full">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white">
                    Open Generator
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Subject Stats */}
          {/* <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Subject Performance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subjectStats.map((subject, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <SubjectIcon subject={subject.subject} />
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quiz Attempts:</span>
                      <span className="font-medium">{subject.attempted}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg. Score:</span>
                      <span className="font-medium">{subject.avgScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className="h-2.5 rounded-full bg-edu-blue"
                        style={{ width: `${subject.avgScore}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div> */}

          {/* Recent Quizzes */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-2xl font-bold">Your Quizzes</h2>
              <Link to="/teacher/create-quiz-new">
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Quiz
                </Button>
              </Link>
            </div>

            {loading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-blue mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your quizzes...</p>
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="text-red-500 mb-4">⚠️</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Error Loading Quizzes
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {error}
                    </p>
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : teacherQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacherQuizzes.map((quiz, idx) => (
                  <Card key={quiz.id || quiz._id || idx}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <SubjectIcon subject={quiz.subject || 'general'} size={20} />
                          <CardTitle className="text-lg truncate">{quiz.title || quiz.quizId || 'Untitled Quiz'}</CardTitle>
                        </div>
                        <div className="bg-primary/10 text-primary text-xs py-1 px-2 rounded">
                          ID: {quiz.quizId || quiz.id || quiz._id || 'N/A'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          <span>{quiz.questions?.length || quiz.questionCount || 0} questions</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{quiz.attemptedBy?.length} attempts</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <div className="w-full flex flex-col sm:flex-row gap-2 sm:justify-between">
                        <Link to={`/teacher/quiz-analytics/${quiz.quizId}`}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <BarChart className="h-4 w-4 mr-2" />
                            Analytics
                          </Button>
                        </Link>

                        <Link to={`/teacher/quiz-details/${quiz.quizId || quiz.id || quiz._id}`}>
                          <Button size="sm" className="w-full sm:w-auto">View Details</Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No quizzes yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first quiz to get started
                    </p>
                    <Link to="/teacher/create-quiz-new">
                      <Button>Create Your First Quiz</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeacherDashboard;
