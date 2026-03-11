
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, BookOpen, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuiz } from '@/contexts/QuizContext';
import SubjectIcon from '@/components/SubjectIcon';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#FBBF24', '#F43F5E'];

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const { getTeacherQuizzes } = useQuiz();
  const quizzes = user ? getTeacherQuizzes(user.id) : [];
  
  // Mock data for analytics
  const subjectPerformance = [
    { subject: 'Mathematics', correct: 78, total: 100, percentage: 78 },
    { subject: 'Science', correct: 65, total: 100, percentage: 65 },
    { subject: 'Social Science', correct: 82, total: 100, percentage: 82 },
    { subject: 'Mental Ability', correct: 70, total: 100, percentage: 70 },
  ];
  
  const studentPerformanceData = [
    { name: 'Math', average: 72, highest: 95, lowest: 45 },
    { name: 'Science', average: 68, highest: 90, lowest: 40 },
    { name: 'Social', average: 75, highest: 98, lowest: 55 },
    { name: 'MAT', average: 62, highest: 85, lowest: 35 },
  ];
  
  const pieData = [
    { name: 'Excellent (90%+)', value: 15 },
    { name: 'Good (70-90%)', value: 25 },
    { name: 'Average (50-70%)', value: 35 },
    { name: 'Below Average (30-50%)', value: 15 },
    { name: 'Poor (<30%)', value: 10 },
  ];
  
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
                    <div className="text-3xl font-bold">42</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      From your institute
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
                    <div className="text-3xl font-bold">76%</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Across all quizzes
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Performance</CardTitle>
                    <CardDescription>
                      Average scores by subject
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
                        <Bar dataKey="average" name="Average %" fill="#3B82F6" />
                        <Bar dataKey="highest" name="Highest %" fill="#10B981" />
                        <Bar dataKey="lowest" name="Lowest %" fill="#F43F5E" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Student Score Distribution</CardTitle>
                    <CardDescription>
                      Percentage of students in each score bracket
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
                    Correct answers vs. total questions by subject
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
            </TabsContent>
            
            {/* Quizzes Tab */}
            <TabsContent value="quizzes">
              {quizzes.length > 0 ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Your Quizzes</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quizzes.map((quiz, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center space-x-2">
                            <SubjectIcon subject={quiz.subject} />
                            <CardTitle>{quiz.title}</CardTitle>
                          </div>
                          <CardDescription>
                            {quiz.questions.length} questions | ID: {quiz.id}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Attempts:</span>
                              <span className="font-medium">0</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Average Score:</span>
                              <span className="font-medium">N/A</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Link to={`/teacher/view-quiz/${quiz.id}`} className="w-full">
                            <Button variant="outline" className="w-full">
                              View Details
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
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
                    <Link to="/teacher/create-quiz">
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
                  <CardTitle>Student Performance</CardTitle>
                  <CardDescription>
                    View individual student performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No student data available</h3>
                    <p className="text-gray-500">
                      Students need to attempt your quizzes to see their performance data here
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Link to="/teacher/create-quiz">
                    <Button>Create a Quiz</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Analytics;
