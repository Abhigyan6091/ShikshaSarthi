import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Clock, Video, Volume2, BookOpen, Puzzle, FileText } from 'lucide-react';
import axios from 'axios';
import Header from '@/components/Header';
import { useAppDispatch } from '@/store/hooks';
import { clearAdvancedQuizDraft } from '@/store/slices/advancedQuizDraftSlice';

const API_URL = import.meta.env.VITE_API_URL;

interface QuizInfo {
  quizId: string;
  teacherId: string;
  timeLimit: number;
  totalQuestions: number;
  questionTypes: {
    mcq: number;
    audio: number;
    video: number;
    puzzle: number;
  };
  startTime: string;
  endTime: string;
  questions: string[];
  audience?: {
    type?: 'global' | 'classes';
    classIds?: string[];
  };
}

const buildPastReportState = (report: any) => {
  const correct = Number(report?.correct || 0);
  const incorrect = Number(report?.incorrect || 0);
  const unattempted = Number(report?.unattempted || 0);
  const total = correct + incorrect + unattempted;

  return {
    results: {
      quizId: report?.quizId,
      studentId: report?.studentId,
      score: {
        correct,
        incorrect,
        unattempted,
        percentage: total > 0 ? ((correct / total) * 100).toFixed(2) : '0',
      },
      answers: Array.isArray(report?.answers) ? report.answers : [],
      quizEndTime: report?.createdAt || report?.updatedAt || new Date().toISOString(),
      isPastReport: true,
    },
  };
};

const TakeAdvancedQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [quizId, setQuizId] = useState(searchParams.get('quizId') || '');
  const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [checkingDraft, setCheckingDraft] = useState(false);

  const hasMatchingLocalDraft = (targetQuizId: string, targetStudentId: string) => {
    try {
      const rawState = localStorage.getItem('advancedQuizDraft.v1');
      if (!rawState) return false;

      const parsed = JSON.parse(rawState);
      const localDraft = parsed?.advancedQuizDraft?.currentDraft;
      if (!localDraft) return false;

      return (
        String(localDraft.quizId || '').trim() === String(targetQuizId || '').trim() &&
        String(localDraft.studentId || '').trim() === String(targetStudentId || '').trim()
      );
    } catch (error) {
      console.error('Failed to inspect local advanced quiz draft:', error);
      return false;
    }
  };

  const replaceDifferentLocalDraft = (nextQuizId: string, nextStudentId: string) => {
    try {
      const rawState = localStorage.getItem('advancedQuizDraft.v1');
      if (!rawState) return;

      const parsed = JSON.parse(rawState);
      const localDraft = parsed?.advancedQuizDraft?.currentDraft;
      if (!localDraft) return;

      const oldQuizId = String(localDraft.quizId || '').trim();
      const oldStudentId = String(localDraft.studentId || '').trim();
      const isSameDraft =
        oldQuizId === String(nextQuizId || '').trim() &&
        oldStudentId === String(nextStudentId || '').trim();

      if (!isSameDraft) {
        dispatch(clearAdvancedQuizDraft());
        localStorage.removeItem('advancedQuizDraft.v1');

        if (oldQuizId && oldStudentId) {
          axios
            .delete(`${API_URL}/quizzes/advanced-draft/${oldQuizId}/${oldStudentId}`)
            .catch((error) => {
              console.error('Failed to delete previous draft from database:', error);
            });
        }
      }
    } catch (error) {
      console.error('Failed to replace local advanced quiz draft:', error);
    }
  };

  useEffect(() => {
    // Get student info
    const studentData = localStorage.getItem('student');
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData);
        console.log('Parsed student data:', parsed);
        
        // Try multiple ways to get studentId
        const extractedStudentId = parsed.student?.studentId || 
                                   parsed.studentId || 
                                   parsed.student?._id || 
                                   parsed._id || 
                                   '';
        
        console.log('Extracted studentId:', extractedStudentId);
        
        if (!extractedStudentId) {
          toast({
            title: "Error",
            description: "Student ID not found. Please log in again.",
            variant: "destructive"
          });
        }
        
        setStudentId(extractedStudentId);
      } catch (e) {
        console.error('Error parsing student data', e);
        toast({
          title: "Error",
          description: "Failed to load student data. Please log in again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Error",
        description: "No student data found. Please log in.",
        variant: "destructive"
      });
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate, toast]);

  // Auto-load quiz when quizId is provided via URL params
  useEffect(() => {
    const urlQuizId = searchParams.get('quizId');
    if (urlQuizId && studentId) {
      setQuizId(urlQuizId);
      // Small delay to ensure quizId state is set
      const timer = setTimeout(() => {
        document.getElementById('load-quiz-btn')?.click();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams, studentId]);

  const handleLoadQuiz = async () => {
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
      // FIRST: Check if student has already submitted this quiz
      console.log('Checking for existing submission...');
      try {
        const checkResponse = await axios.get(
          `${API_URL}/reports/student/${studentId}/quiz/${quizId}`
        );
        
        if (checkResponse.data && checkResponse.data.submitted) {
          const report = checkResponse.data.report;
          toast({
            title: "Quiz Already Submitted",
            description: "Opening your review report.",
            duration: 6000
          });
          setLoading(false);
          if (report) {
            navigate('/student/advanced-quiz-results', { state: buildPastReportState(report) });
          } else {
            navigate('/student/advanced-quiz-past-reports');
          }
          return; // Stop here - don't load quiz
        }
      } catch (checkError: any) {
        // If error is 404, it means no submission exists, which is fine - continue
        if (checkError.response?.status !== 404) {
          console.error('Error checking submission:', checkError);
          toast({
            title: "Error",
            description: "Failed to verify submission status. Please try again.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        console.log('No previous submission found - OK to proceed');
      }

      // SECOND: Load the quiz (try advanced format first, fall back to simple)
      let quiz;
      try {
        const response = await axios.get(`${API_URL}/quizzes/by-id/${quizId}/student/${studentId}`);
        quiz = response.data;
      } catch {
        const response = await axios.get(`${API_URL}/quizzes/${quizId}`);
        quiz = response.data;
        if (quiz?.audience?.type === 'classes') {
          toast({
            title: "Quiz Not Assigned",
            description: "This quiz is available only to selected classes.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      // Normalize simple quiz to advanced quiz format
      if (!quiz.questionTypes || quiz.questionTypes.mcq === 0 && quiz.questionTypes.audio === 0 && quiz.questionTypes.video === 0 && quiz.questionTypes.puzzle === 0) {
        const totalQ = quiz.questions?.length || 0;
        quiz.questionTypes = { mcq: totalQ, audio: 0, video: 0, puzzle: 0 };
        quiz.totalQuestions = totalQ;
        quiz.timeLimit = quiz.timeLimit || 30;
        if (!quiz.startTime) {
          const past = new Date();
          past.setFullYear(past.getFullYear() - 1);
          quiz.startTime = past.toISOString();
        }
        if (!quiz.endTime) {
          const future = new Date();
          future.setFullYear(future.getFullYear() + 1);
          quiz.endTime = future.toISOString();
        }
        // Extract IDs if questions are populated objects
        if (quiz.questions?.length > 0 && typeof quiz.questions[0] === 'object') {
          quiz.questions = quiz.questions.map((q: any) => q._id || q);
        }
      }

      if (studentId && studentId.trim()) {
        setCheckingDraft(true);
        try {
          await axios.get(`${API_URL}/quizzes/advanced-draft/${quiz.quizId}/${studentId}`);
          setHasSavedProgress(true);
        } catch (draftError: any) {
          if (draftError.response?.status === 404) {
            setHasSavedProgress(hasMatchingLocalDraft(quiz.quizId, studentId));
          } else if (draftError.response?.status === 409) {
            setHasSavedProgress(false);
          } else {
            console.error('Draft lookup failed:', draftError);
            setHasSavedProgress(hasMatchingLocalDraft(quiz.quizId, studentId));
          }
        } finally {
          setCheckingDraft(false);
        }
      } else {
        setHasSavedProgress(hasMatchingLocalDraft(quiz.quizId, studentId));
      }
      
      // Check if quiz is active
      const now = new Date();
      const startTime = new Date(quiz.startTime);
      const endTime = new Date(quiz.endTime);
      
      if (now < startTime) {
        // Quiz hasn't started - navigate to player with countdown
        setQuizInfo(quiz);
        toast({
          title: "Quiz Not Started Yet",
          description: `This quiz will start at ${startTime.toLocaleString()}. You'll see a countdown.`
        });
        // Still set the quiz info so user can see instructions and wait
      } else if (now > endTime) {
        toast({
          title: "Quiz Ended",
          description: `This quiz ended on ${endTime.toLocaleString()}`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      } else {
        // Quiz is active
        setQuizInfo(quiz);
        toast({
          title: "Quiz Ready",
          description: `Ready to start: ${quiz.totalQuestions} questions, ${quiz.timeLimit} minutes`
        });
      }
      
      setLoading(false);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Quiz not found",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (!quizInfo) return;
    
    // Validate studentId before starting
    if (!studentId || studentId.trim() === '') {
      toast({
        title: "Error",
        description: "Student ID is missing. Please log in again.",
        variant: "destructive"
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    console.log('Starting quiz with studentId:', studentId);
    replaceDifferentLocalDraft(quizInfo.quizId, studentId);
    
    // Navigate to the quiz player with quiz data
    navigate('/student/advanced-quiz-player', {
      state: {
        quizInfo,
        studentId
      }
    });
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq': return <BookOpen className="h-5 w-5" />;
      case 'audio': return <Volume2 className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'puzzle': return <Puzzle className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle className="text-2xl sm:text-3xl font-bold">Take Quiz</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => navigate('/student/advanced-quiz-past-reports')}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <FileText className="h-4 w-4" />
              Past Reports
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!quizInfo ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quizId">Enter Quiz ID</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="quizId"
                    placeholder="Enter quiz ID provided by your teacher"
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLoadQuiz()}
                  />
                  <Button id="load-quiz-btn" onClick={handleLoadQuiz} disabled={loading} className="w-full sm:w-auto">
                    {loading ? 'Loading...' : 'Load Quiz'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                <h3 className="text-2xl font-bold mb-4">Quiz: {quizInfo.quizId}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Time Limit:</span>
                    <span>{quizInfo.timeLimit} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Total Questions:</span>
                    <span>{quizInfo.totalQuestions}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-lg mb-2">Question Types:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quizInfo.questionTypes.mcq > 0 && (
                      <div className="flex items-center gap-2 bg-blue-100 p-2 rounded">
                        {getQuestionTypeIcon('mcq')}
                        <span>MCQ: {quizInfo.questionTypes.mcq}</span>
                      </div>
                    )}
                    {quizInfo.questionTypes.mcq > 0 && quizInfo.questionTypes.audio === 0 && quizInfo.questionTypes.video === 0 && quizInfo.questionTypes.puzzle === 0 && (
                      <div className="flex items-center gap-2 p-2 rounded text-xs text-gray-500 italic">
                        Standard quiz — all MCQ questions. Advanced features (audio, video, puzzles) not available for this quiz.
                      </div>
                    )}
                    {quizInfo.questionTypes.audio > 0 && (
                      <div className="flex items-center gap-2 bg-green-100 p-2 rounded">
                        {getQuestionTypeIcon('audio')}
                        <span>Audio: {quizInfo.questionTypes.audio}</span>
                      </div>
                    )}
                    {quizInfo.questionTypes.video > 0 && (
                      <div className="flex items-center gap-2 bg-purple-100 p-2 rounded">
                        {getQuestionTypeIcon('video')}
                        <span>Video: {quizInfo.questionTypes.video}</span>
                      </div>
                    )}
                    {quizInfo.questionTypes.puzzle > 0 && (
                      <div className="flex items-center gap-2 bg-orange-100 p-2 rounded">
                        {getQuestionTypeIcon('puzzle')}
                        <span>Puzzle: {quizInfo.questionTypes.puzzle}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm">
                    <strong>Note:</strong> Once you start the quiz, the timer will begin immediately. 
                    Make sure you have a stable internet connection.
                  </p>
                </div>

                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Auto-save:</strong> Your answers (MCQ, Audio, Video, Puzzle) are saved instantly in local storage and synced to database in background.
                  </p>
                  {checkingDraft ? (
                    <p className="text-xs text-blue-700 mt-1">Checking for saved progress...</p>
                  ) : hasSavedProgress ? (
                    <p className="text-xs text-green-700 mt-1">Saved progress found. You can resume from where you left off.</p>
                  ) : (
                    <p className="text-xs text-blue-700 mt-1">No previous draft found for this quiz. Background sync runs every ~10 minutes.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleStartQuiz} className="flex-1 w-full" size="lg">
                  {hasSavedProgress ? 'Resume Quiz' : 'Start Quiz'}
                </Button>
                <Button onClick={() => setQuizInfo(null)} variant="outline" size="lg" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default TakeAdvancedQuiz;
