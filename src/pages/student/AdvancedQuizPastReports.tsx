import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Clock, Calendar, Trophy, ArrowLeft, FileText } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface StudentReport {
  _id: string;
  quizId: string;
  studentId: string;
  correct: number;
  incorrect: number;
  unattempted: number;
  timeTaken?: number;
  answers: Array<{
    questionId: string;
    questionType: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }>;
  createdAt: string;
}

const AdvancedQuizPastReports: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    // Get student info
    const studentData = localStorage.getItem('student');
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData);
        const extractedStudentId = parsed.student?.studentId || 
                                   parsed.studentId || 
                                   parsed.student?._id || 
                                   parsed._id || 
                                   '';
        
        if (!extractedStudentId) {
          toast({
            title: "Error",
            description: "Student ID not found. Please log in again.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        setStudentId(extractedStudentId);
        fetchReports(extractedStudentId);
      } catch (e) {
        console.error('Error parsing student data', e);
        toast({
          title: "Error",
          description: "Failed to load student data.",
          variant: "destructive"
        });
        navigate('/login');
      }
    } else {
      toast({
        title: "Error",
        description: "No student data found. Please log in.",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [navigate, toast]);

  const fetchReports = async (studentId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/reports/student/${studentId}`);
      
      console.log('=== PAST REPORTS DEBUG ===');
      console.log('Total reports fetched:', response.data.length);
      response.data.forEach((report: StudentReport, index: number) => {
        console.log(`Report ${index + 1}:`, {
          quizId: report.quizId,
          timeTaken: report.timeTaken,
          timeTakenType: typeof report.timeTaken,
          timeTakenValue: report.timeTaken,
          createdAt: report.createdAt
        });
      });
      console.log('========================');
      
      // Sort by most recent first
      const sortedReports = response.data.sort((a: StudentReport, b: StudentReport) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReports(sortedReports);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load past reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const viewReport = (report: StudentReport) => {
    const totalQuestions = report.correct + report.incorrect + report.unattempted;
    const percentage = totalQuestions > 0 
      ? ((report.correct / totalQuestions) * 100).toFixed(2)
      : '0';

    // Navigate to results page with the same structure as when quiz ends
    navigate('/student/advanced-quiz-results', {
      state: {
        results: {
          quizId: report.quizId,
          studentId: report.studentId,
          score: {
            correct: report.correct,
            incorrect: report.incorrect,
            unattempted: report.unattempted,
            percentage: percentage
          },
          answers: report.answers,
          quizEndTime: new Date(report.createdAt).toISOString(), // Use submission time as end time (past)
          isPastReport: true // Flag to indicate this is a past report
        }
      }
    });
  };

  const formatTime = (seconds?: number) => {
    if (!seconds || seconds === 0) return "N/A";
    if (seconds < 0) return "N/A"; // Handle negative values
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    // If less than 1 minute, show only seconds
    if (mins === 0) {
      return `${secs}s`;
    }
    
    return `${mins}m ${secs}s`;
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-600">Excellent</Badge>;
    if (percentage >= 60) return <Badge className="bg-blue-600">Good</Badge>;
    if (percentage >= 40) return <Badge className="bg-yellow-600">Average</Badge>;
    return <Badge className="bg-red-600">Needs Improvement</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-3 sm:p-6 max-w-6xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading past reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-6xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/student/take-advanced-quiz')}
          className="mb-4 w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Take Quiz
        </Button>
        
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Past Quiz Reports</h1>
        <p className="text-gray-600">View detailed reports of all your previously attempted quizzes</p>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Past Reports</h3>
            <p className="text-gray-600 mb-4">You haven't attempted any quizzes yet.</p>
            <Button onClick={() => navigate('/student/take-advanced-quiz')}>
              Take Your First Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => {
            const totalQuestions = report.correct + report.incorrect + report.unattempted;
            const percentage = totalQuestions > 0 
              ? (report.correct / totalQuestions) * 100
              : 0;

            return (
              <Card key={report._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div>
                      <CardTitle className="text-xl mb-1">Quiz: {report.quizId}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </div>
                    </div>
                    {getPerformanceBadge(percentage)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{report.correct}</div>
                      <p className="text-xs text-gray-600">Correct</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{report.incorrect}</div>
                      <p className="text-xs text-gray-600">Incorrect</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">{report.unattempted}</div>
                      <p className="text-xs text-gray-600">Unattempted</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{percentage.toFixed(1)}%</div>
                      <p className="text-xs text-gray-600">Score</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <div className="text-lg font-bold text-purple-600">
                          {(() => {
                            const formattedTime = formatTime(report.timeTaken);
                            console.log('Display time for quiz', report.quizId, ':', {
                              rawValue: report.timeTaken,
                              formatted: formattedTime
                            });
                            return formattedTime;
                          })()}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Time Taken</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => viewReport(report)} className="w-full sm:w-auto">
                      <Trophy className="mr-2 h-4 w-4" />
                      View Detailed Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdvancedQuizPastReports;
