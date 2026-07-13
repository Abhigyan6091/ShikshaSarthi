import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Clock, Calendar, Trophy, ArrowLeft, FileText, Search, X } from 'lucide-react';
import axios from 'axios';
import Header from '@/components/Header';

const API_URL = import.meta.env.VITE_API_URL;

interface StudentReport {
  _id: string;
  quizId: string;
  studentId: string;
  attemptMode?: 'quiz' | 'group';
  groupAttemptId?: string;
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
  const [quizIdSearch, setQuizIdSearch] = useState('');

  const getSafeTimestamp = (dateValue?: string) => {
    if (!dateValue) return 0;
    const timestamp = new Date(dateValue).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const getSafeIsoDate = (dateValue?: string) => {
    const timestamp = getSafeTimestamp(dateValue);
    return timestamp > 0 ? new Date(timestamp).toISOString() : new Date().toISOString();
  };

  const formatReportDate = (dateValue?: string) => {
    const timestamp = getSafeTimestamp(dateValue);
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

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
        getSafeTimestamp(b.createdAt) - getSafeTimestamp(a.createdAt)
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
          quizEndTime: getSafeIsoDate(report.createdAt), // Use submission time as end time (past)
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
    if (percentage >= 80) return <Badge className="bg-green-600 text-[11px] px-2 py-0.5">Excellent</Badge>;
    if (percentage >= 60) return <Badge className="bg-blue-600 text-[11px] px-2 py-0.5">Good</Badge>;
    if (percentage >= 40) return <Badge className="bg-yellow-600 text-[11px] px-2 py-0.5">Average</Badge>;
    return <Badge className="bg-red-600 text-[11px] px-2 py-0.5">Needs Improvement</Badge>;
  };

  const normalizedSearch = quizIdSearch.trim().toLowerCase();
  const filteredReports = reports.filter((report) =>
    report.quizId.toLowerCase().includes(normalizedSearch)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto p-3 sm:p-6 max-w-6xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading past reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={quizIdSearch}
                    onChange={(e) => setQuizIdSearch(e.target.value)}
                    placeholder="Search by Quiz ID (e.g., QUIZ001)"
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setQuizIdSearch('')}
                  disabled={!quizIdSearch}
                  className="w-full sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Showing {filteredReports.length} of {reports.length} report{reports.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">No matching report found</h3>
                <p className="text-sm text-gray-600">
                  Try another Quiz ID or clear search.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => {
            const totalQuestions = report.correct + report.incorrect + report.unattempted;
            const percentage = totalQuestions > 0 
              ? (report.correct / totalQuestions) * 100
              : 0;

            return (
              <Card key={report._id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-1 pt-3 px-3 sm:px-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1.5">
                    <div>
                      <CardTitle className="text-base sm:text-lg mb-1">
                        {report.attemptMode === 'group' ? 'Group Quiz' : 'Quiz'}: {report.quizId}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600">
                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {formatReportDate(report.createdAt)}
                      </div>
                    </div>
                    {getPerformanceBadge(percentage)}
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2.5">
                    <div className="rounded-md bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700">
                      Correct: {report.correct}
                    </div>
                    <div className="rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
                      Incorrect: {report.incorrect}
                    </div>
                    <div className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700">
                      Unattempted: {report.unattempted}
                    </div>
                    <div className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                      Score: {percentage.toFixed(1)}%
                    </div>
                    {report.attemptMode === 'group' && (
                      <div className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">
                        Group Quiz
                      </div>
                    )}
                    <div className="rounded-md bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Time: {formatTime(report.timeTaken)}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => viewReport(report)} className="w-full sm:w-auto h-8 text-xs px-3">
                      <Trophy className="mr-1.5 h-3 w-3" />
                      View Detailed Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
            })
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default AdvancedQuizPastReports;
