import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, BookOpen, Users, CheckCircle2 } from 'lucide-react';
import SubjectIcon from '@/components/SubjectIcon';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;
const COLORS = ['#10B981', '#3B82F6', '#FBBF24', '#F43F5E', '#8B5CF6'];

interface TeacherQuiz {
  _id?: string;
  quizId?: string;
  id?: string;
  title?: string;
  subject?: string;
  questions?: any[];
  questionCount?: number;
}

interface StudentAttempt {
  quizId: string;
  score: {
    correct: number;
    incorrect: number;
    unattempted: number;
  };
  attemptedAt: string;
}

interface StudentData {
  _id?: string;
  studentId?: string;
  name?: string;
  quizAttempted?: StudentAttempt[];
}

const unwrapTeacherSession = (raw: string | undefined | null): any => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as any;
    return parsed.teacher || parsed;
  } catch {
    return null;
  }
};

const Analytics: React.FC = () => {
  const [quizzes, setQuizzes] = useState<TeacherQuiz[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed data
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const [studentPerformanceData, setStudentPerformanceData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [totalAttemptsCount, setTotalAttemptsCount] = useState(0);
  const [avgScoreGlobal, setAvgScoreGlobal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      let teacherInfo = unwrapTeacherSession(Cookies.get("teacher")) 
        || unwrapTeacherSession(localStorage.getItem('teacher'))
        || unwrapTeacherSession(localStorage.getItem('currentUser'));

      if (!teacherInfo) {
        setError('Teacher session not found. Please login again.');
        setLoading(false);
        return;
      }

      const teacherId = teacherInfo.teacherId || teacherInfo.id || teacherInfo._id;

      try {
        const [quizResponse, studentResponse] = await Promise.all([
          fetch(`${API_URL}/teachers/${teacherId}/quizzes`),
          fetch(`${API_URL}/teachers/${teacherId}/students`),
        ]);

        if (!quizResponse.ok || !studentResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const quizData = await quizResponse.json();
        const studentRespData = await studentResponse.json();
        
        const fetchedQuizzes: TeacherQuiz[] = Array.isArray(quizData) ? quizData : [];
        const fetchedStudents: StudentData[] = Array.isArray(studentRespData.students) ? studentRespData.students : [];
        
        setQuizzes(fetchedQuizzes);
        setStudents(fetchedStudents);

        computeAnalytics(fetchedQuizzes, fetchedStudents);

      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const computeAnalytics = (qList: TeacherQuiz[], sList: StudentData[]) => {
    // Map quiz id -> subject
    const quizSubjectMap: Record<string, string> = {};
    const quizTotalQuestionsMap: Record<string, number> = {};
    qList.forEach(q => {
      const qId = q.quizId || q.id || q._id || '';
      quizSubjectMap[qId] = q.subject || 'general';
      quizTotalQuestionsMap[qId] = q.questions?.length || q.questionCount || 0;
    });

    let totalScoreSum = 0;
    let totalAttempts = 0;
    
    // For Pie Chart (Distribution of percentages)
    let excellent = 0; // >= 90
    let good = 0;      // 70 - 89
    let average = 0;   // 50 - 69
    let below = 0;     // 30 - 49
    let poor = 0;      // < 30

    // For Subject performance
    const subjectStats: Record<string, { correct: number; total: number; percentages: number[] }> = {};

    sList.forEach(student => {
      (student.quizAttempted || []).forEach(attempt => {
        const qId = attempt.quizId;
        const quizIdString = typeof qId === 'object' ? (qId as any)._id || qId : qId;
        const subject = quizSubjectMap[quizIdString] || 'general';
        const totalQ = quizTotalQuestionsMap[quizIdString] || 
                      ((attempt.score?.correct || 0) + (attempt.score?.incorrect || 0) + (attempt.score?.unattempted || 0));

        if (totalQ === 0) return; // Ignore empty quizzes

        const correct = attempt.score?.correct || 0;
        const percentage = Math.round((correct / totalQ) * 100);

        totalScoreSum += percentage;
        totalAttempts += 1;

        if (percentage >= 90) excellent++;
        else if (percentage >= 70) good++;
        else if (percentage >= 50) average++;
        else if (percentage >= 30) below++;
        else poor++;

        if (!subjectStats[subject]) {
          subjectStats[subject] = { correct: 0, total: 0, percentages: [] };
        }
        subjectStats[subject].correct += correct;
        subjectStats[subject].total += totalQ;
        subjectStats[subject].percentages.push(percentage);
      });
    });

    setTotalAttemptsCount(totalAttempts);
    setAvgScoreGlobal(totalAttempts > 0 ? Math.round(totalScoreSum / totalAttempts) : 0);

    const newPieData = [];
    if (excellent > 0) newPieData.push({ name: 'Excellent (90%+)', value: excellent });
    if (good > 0) newPieData.push({ name: 'Good (70-90%)', value: good });
    if (average > 0) newPieData.push({ name: 'Average (50-70%)', value: average });
    if (below > 0) newPieData.push({ name: 'Below Avg (30-50%)', value: below });
    if (poor > 0) newPieData.push({ name: 'Poor (<30%)', value: poor });
    
    // Ensure Pie has something to show even if no attempts
    setPieData(newPieData.length > 0 ? newPieData : [{ name: 'No Data', value: 1 }]);

    const computedSubPerf = [];
    const computedBarPerf = [];

    Object.keys(subjectStats).forEach(subj => {
      const stats = subjectStats[subj];
      const avgPerc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      
      computedSubPerf.push({
        subject: subj.charAt(0).toUpperCase() + subj.slice(1),
        correct: stats.correct,
        total: stats.total,
        percentage: avgPerc
      });

      const max = Math.max(...stats.percentages);
      const min = Math.min(...stats.percentages);
      const trueAvg = Math.round(stats.percentages.reduce((a, b) => a + b, 0) / stats.percentages.length);

      computedBarPerf.push({
        name: subj.charAt(0).toUpperCase() + subj.slice(1),
        average: trueAvg,
        highest: max,
        lowest: min
      });
    });

    setSubjectPerformance(computedSubPerf);
    setStudentPerformanceData(computedBarPerf);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 bg-gray-50">
        <div className="edu-container">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
            <Link to="/teacher" className="sm:mr-4 w-full sm:w-auto">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-blue"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">
               <h3 className="text-xl font-bold">Error</h3>
               <p>{error}</p>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3 sm:max-w-md">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="quizzes" className="flex-1">Quizzes</TabsTrigger>
                <TabsTrigger value="students" className="flex-1">Students</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Total Quizzes</CardTitle>
                        <BookOpen className="h-5 w-5 text-edu-blue" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{quizzes.length}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {quizzes.length === 0 ? "No quizzes created yet" : "Across all subjects"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Students</CardTitle>
                        <Users className="h-5 w-5 text-edu-green" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{students.length}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enrolled in your classes
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Average Score</CardTitle>
                        <CheckCircle2 className="h-5 w-5 text-edu-purple" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{avgScoreGlobal}%</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Across {totalAttemptsCount} total attempts
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {totalAttemptsCount > 0 ? (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Subject Performance</CardTitle>
                          <CardDescription>
                            Average scores by subject across all students
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={studentPerformanceData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="average" name="Average %" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="highest" name="Highest %" fill="#10B981" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="lowest" name="Lowest %" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Score Distribution</CardTitle>
                          <CardDescription>
                            Overall attempt performance distribution
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Subject-wise Accuracy</CardTitle>
                        <CardDescription>
                          Correct answers vs. total questions answered by subject
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {subjectPerformance.map((item, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <SubjectIcon 
                                    subject={item.subject.toLowerCase()} 
                                    size={20} 
                                  />
                                  <span className="font-medium">{item.subject}</span>
                                </div>
                                <span className="text-sm font-medium">
                                  {item.correct}/{item.total} ({item.percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="h-2.5 rounded-full bg-edu-blue"
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No Attempt Data Yet</h3>
                      <p className="text-gray-500">
                        Once your students start attempting quizzes, rich analytics will appear here.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Quizzes Tab */}
              <TabsContent value="quizzes">
                {quizzes.length > 0 ? (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Your Quizzes</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quizzes.map((quiz, index) => {
                        const quizIdStr = quiz.quizId || quiz.id || quiz._id || '';
                        // Find attempts for this quiz
                        let qAttempts = 0;
                        let qScoreSum = 0;
                        let qMaxPoss = 0;
                        
                        students.forEach(s => {
                          (s.quizAttempted || []).forEach(att => {
                            const attQId = typeof att.quizId === 'object' ? (att.quizId as any)._id || att.quizId : att.quizId;
                            if (attQId === quizIdStr) {
                              qAttempts++;
                              qScoreSum += att.score?.correct || 0;
                              qMaxPoss += (att.score?.correct || 0) + (att.score?.incorrect || 0) + (att.score?.unattempted || 0);
                            }
                          });
                        });
                        const avg = qMaxPoss > 0 ? Math.round((qScoreSum / qMaxPoss) * 100) : 0;
                        
                        return (
                          <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                              <div className="flex items-center space-x-2">
                                <SubjectIcon subject={quiz.subject || 'general'} />
                                <CardTitle className="truncate">{quiz.title || quizIdStr}</CardTitle>
                              </div>
                              <CardDescription>
                                {quiz.questions?.length || quiz.questionCount || 0} questions
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm border-b pb-1">
                                  <span className="text-gray-500">Total Attempts:</span>
                                  <span className="font-medium">{qAttempts}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Average Score:</span>
                                  <span className="font-medium text-blue-600">{qAttempts > 0 ? `${avg}%` : 'N/A'}</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Link to={`/teacher/quiz-analytics/${quizIdStr}`} className="w-full">
                                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                                  Detailed Analytics
                                </Button>
                              </Link>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No quizzes created yet</h3>
                      <p className="text-gray-500 mb-4">
                        Create your first quiz to see analytics
                      </p>
                      <Link to="/teacher/create-quiz-new">
                        <Button>Create Quiz</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Students Tab */}
              <TabsContent value="students">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Performance Summary</CardTitle>
                    <CardDescription>
                      Overview of student engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {students.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                              <th className="px-4 py-3">Student Name</th>
                              <th className="px-4 py-3">Student ID</th>
                              <th className="px-4 py-3 text-center">Quizzes Attempted</th>
                              <th className="px-4 py-3 text-center">Avg Accuracy</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.map((student, idx) => {
                              const attempts = student.quizAttempted || [];
                              let c = 0, t = 0;
                              attempts.forEach(a => {
                                c += a.score?.correct || 0;
                                t += (a.score?.correct || 0) + (a.score?.incorrect || 0) + (a.score?.unattempted || 0);
                              });
                              const avg = t > 0 ? Math.round((c / t) * 100) : 0;
                              
                              return (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                                  <td className="px-4 py-3 text-gray-500">{student.studentId}</td>
                                  <td className="px-4 py-3 text-center font-bold">{attempts.length}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs ${avg >= 70 ? 'bg-green-100 text-green-700' : avg >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                      {t > 0 ? `${avg}%` : 'N/A'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-medium mb-2">No student data available</h3>
                        <p className="text-gray-500">
                          Students need to enroll in your classes to see their performance
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Analytics;
