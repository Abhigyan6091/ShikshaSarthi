import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  BarChart3,
  ArrowLeft,
  Lightbulb,
  Eye,
  TrendingUp,
  Target,
  Brain,
  Zap,
  AlertTriangle,
  Award,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DatabaseInteractiveDemo from "@/components/DatabaseInteractiveDemo";

const API_URL = import.meta.env.VITE_API_URL;

interface Question {
  _id: string;
  questionId: string;
  question: string;
  options: string[];
  difficulty: string;
  hint?: string;
  images?: Array<{ url: string; description: string; position: string }>;
  interactiveContent?: {
    html: string;
    css: string;
    javascript: string;
    isInteractive: boolean;
  };
  timeLimit: number;
}

interface QuestionAnalytics {
  questionIndex: number;
  timeSpent: number;
  attempts: number;
  hintUsed: boolean;
  answerChangeCount: number;
  firstAttemptTime: number;
  finalAttemptTime: number;
  selectedAnswer: number | null;
}

const MATTopicTest: React.FC = () => {
  const { module } = useParams<{ module: string }>();
  const navigate = useNavigate();

  const [testId, setTestId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [index: number]: number }>({});
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(new Set()); // Track skipped questions
  const [showHint, setShowHint] = useState<{ [index: number]: boolean }>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  const [questionAnalytics, setQuestionAnalytics] = useState<{ [key: number]: QuestionAnalytics }>({});
  const [answerChangeCount, setAnswerChangeCount] = useState<{ [index: number]: number }>({});
  
  // Timer states
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(600); // 10 minutes default
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);

  const [studentId, setStudentId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Get student ID
    const studentData = localStorage.getItem('student');
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData);
        if (parsed.student && parsed.student.studentId) {
          setStudentId(parsed.student.studentId);
        } else if (parsed.studentId) {
          setStudentId(parsed.studentId);
        }
      } catch (e) {
        console.error('Error parsing student data:', e);
      }
    }
    setLoading(false);
  }, []);

  const createTest = async () => {
    if (!studentId) {
      alert('कृपया पहले लॉगिन करें');
      navigate('/login/student');
      return;
    }

    try {
      setLoading(true);
      console.log('Creating test with:', { studentId, module: decodeURIComponent(module || '') });
      
      const response = await axios.post(`${API_URL}/api/mat-test/create-test`, {
        studentId,
        module: decodeURIComponent(module || ''),
        questionsCount: 10
      });

      console.log('Test created:', response.data);

      setTestId(response.data.testId);
      setQuestions(response.data.questions);
      setTotalTimeRemaining(response.data.timeLimit);
      
      // Initialize analytics for all questions
      const initialAnalytics: { [key: number]: QuestionAnalytics } = {};
      response.data.questions.forEach((_: Question, index: number) => {
        initialAnalytics[index] = {
          questionIndex: index,
          timeSpent: 0,
          attempts: 0,
          hintUsed: false,
          answerChangeCount: 0,
          firstAttemptTime: 0,
          finalAttemptTime: 0,
          selectedAnswer: null,
        };
      });
      setQuestionAnalytics(initialAnalytics);
      
      setTestStarted(true);
      setLoading(false);
      setQuestionStartTime(Date.now());
    } catch (error: any) {
      console.error('टेस्ट बनाने में त्रुटि:', error);
      alert(`त्रुटि: ${error.response?.data?.error || error.message || 'टेस्ट बनाने में विफल'}`);
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (testStarted && totalTimeRemaining > 0 && !submitting) {
      timerIntervalRef.current = setInterval(() => {
        setTotalTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [testStarted, totalTimeRemaining, submitting]);

  // Track time spent on current question
  useEffect(() => {
    if (testStarted && !submitting) {
      const interval = setInterval(() => {
        setQuestionAnalytics(prev => ({
          ...prev,
          [currentQuestion]: {
            ...prev[currentQuestion],
            timeSpent: (prev[currentQuestion]?.timeSpent || 0) + 1,
          },
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentQuestion, testStarted, submitting]);

  const handleAnswerSelect = (answerIndex: number) => {
    const prevAnswer = selectedAnswers[currentQuestion];
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }));

    // Track answer changes
    if (prevAnswer !== undefined && prevAnswer !== answerIndex) {
      setAnswerChangeCount(prev => ({
        ...prev,
        [currentQuestion]: (prev[currentQuestion] || 0) + 1
      }));
    }

    // Update analytics
    setQuestionAnalytics(prev => {
      const analytics = prev[currentQuestion] || {
        questionIndex: currentQuestion,
        timeSpent: 0,
        attempts: 0,
        hintUsed: false,
        answerChangeCount: 0,
        firstAttemptTime: 0,
        finalAttemptTime: 0,
        selectedAnswer: null,
      };

      if (analytics.firstAttemptTime === 0) {
        analytics.firstAttemptTime = Date.now();
      }

      return {
        ...prev,
        [currentQuestion]: {
          ...analytics,
          selectedAnswer: answerIndex,
          attempts: analytics.attempts + 1,
          answerChangeCount: answerChangeCount[currentQuestion] || 0,
          finalAttemptTime: Date.now(),
        }
      };
    });
  };

  const handleShowHint = () => {
    setShowHint(prev => ({ ...prev, [currentQuestion]: true }));
    setQuestionAnalytics(prev => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        hintUsed: true,
      },
    }));
  };

  const handleNavigateQuestion = (index: number) => {
    // Update time for current question before navigating
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setQuestionAnalytics(prev => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        timeSpent: prev[currentQuestion].timeSpent + timeSpent,
      },
    }));

    setCurrentQuestion(index);
    setVisitedQuestions(prev => new Set([...prev, index]));
    setQuestionStartTime(Date.now());
  };

  const handleSubmitTest = async () => {
    if (submitting) return;
    
    const confirmSubmit = window.confirm(
      `क्या आप टेस्ट जमा करना चाहते हैं?\n\nउत्तरित प्रश्न: ${answeredCount}/${questions.length}\nअनुत्तरित प्रश्न: ${unansweredCount}`
    );
    
    if (!confirmSubmit) return;
    
    setSubmitting(true);
    console.log('Starting test submission...');
    console.log('Test ID:', testId);
    console.log('Total questions:', questions.length);
    
    try {
      // Submit all answers
      console.log('Submitting answers...');
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const analytics = questionAnalytics[i];
        const selectedAnswer = selectedAnswers[i] ?? -1;

        console.log(`Submitting Q${i + 1}:`, {
          questionId: question.questionId,
          selectedAnswer,
          timeSpent: analytics?.timeSpent || 0
        });

        await axios.post(`${API_URL}/api/mat-test/submit-answer`, {
          testId,
          questionId: question.questionId,
          selectedAnswer,
          timeSpent: analytics?.timeSpent || 0,
          hintUsed: analytics?.hintUsed || false,
          answerChangeCount: answerChangeCount[i] || 0
        });
      }

      console.log('All answers submitted. Completing test...');
      
      // Complete the test
      const response = await axios.post(`${API_URL}/api/mat-test/complete-test`, {
        testId
      });

      console.log('Test completed:', response.data);

      // Navigate to results
      console.log('Navigating to results page...');
      navigate(`/student/mat-test-results/${testId}`);
    } catch (error: any) {
      console.error('टेस्ट जमा करने में त्रुटि:', error);
      console.error('Error details:', error.response?.data);
      alert(`त्रुटि: ${error.response?.data?.error || error.message || 'टेस्ट जमा करने में विफल'}`);
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index: number) => {
    if (selectedAnswers[index] !== undefined) return 'answered'; // Green - answered
    if (skippedQuestions.has(index)) return 'skipped'; // Orange - skipped
    if (visitedQuestions.has(index)) return 'visited'; // Yellow - visited but not answered
    return 'not-visited'; // Gray - not visited
  };

  const handleSkipQuestion = () => {
    // Mark current question as skipped
    setSkippedQuestions(prev => new Set([...prev, currentQuestion]));
    
    // Move to next question
    if (currentQuestion < questions.length - 1) {
      handleNavigateQuestion(currentQuestion + 1);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = questions.length - answeredCount;
  const progress = (answeredCount / questions.length) * 100;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">टेस्ट तैयार हो रहा है...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="flex-1 py-6 md:py-8">
          <div className="edu-container max-w-3xl">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/student/mat')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              मॉड्यूल पर वापस जाएं
            </Button>

            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{decodeURIComponent(module || '')} - टॉपिक टेस्ट</CardTitle>
                    <p className="text-gray-600 mt-1">अपने ज्ञान का परीक्षण करें</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-gray-700">
                    यह एक समयबद्ध परीक्षा है। एक बार शुरू करने के बाद, आपको समय सीमा के भीतर सभी प्रश्नों को पूरा करना होगा।
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="pt-6 text-center">
                      <Target className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-1">कुल प्रश्न</h3>
                      <p className="text-3xl font-bold text-blue-600">10</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="pt-6 text-center">
                      <Clock className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-1">समय सीमा</h3>
                      <p className="text-3xl font-bold text-purple-600">10 मिनट</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      परीक्षा निर्देश
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>प्रत्येक प्रश्न के लिए सावधानीपूर्वक सोचें</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>आप प्रश्नों के बीच आगे-पीछे जा सकते हैं</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>संकेत उपलब्ध हैं लेकिन इन्हें बुद्धिमानी से उपयोग करें</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>समय समाप्त होने पर परीक्षा स्वतः जमा हो जाएगी</p>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={createTest}
                  disabled={!studentId}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  टेस्ट शुरू करें
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-700 border-green-200',
    'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Hard': 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="flex-1 py-6">
        <div className="edu-container max-w-7xl">
          {/* Top Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-sm font-semibold">
                प्रश्न {currentQuestion + 1}/{questions.length}
              </Badge>
              <Badge 
                className={`${difficultyColors[currentQ.difficulty as keyof typeof difficultyColors]} border`}
              >
                {currentQ.difficulty === 'Easy' ? 'आसान' : currentQ.difficulty === 'Medium' ? 'मध्यम' : 'कठिन'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge 
                variant={totalTimeRemaining < 120 ? "destructive" : "default"}
                className="text-base sm:text-lg px-3 sm:px-4 py-2"
              >
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(totalTimeRemaining)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Question Area */}
            <div className="lg:col-span-3 space-y-4">
              {/* Question Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{currentQ.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Images */}
                  {currentQ.images && currentQ.images.length > 0 && (
                    <div className="space-y-2">
                      {currentQ.images
                        .filter(img => img.position === 'question')
                        .map((img, idx) => (
                          <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                            <img 
                              src={img.url} 
                              alt={img.description} 
                              className="max-w-full h-auto mx-auto"
                            />
                            {img.description && (
                              <p className="text-sm text-gray-600 mt-2 text-center">
                                {img.description}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Interactive Content from Database */}
                  {currentQ.interactiveContent?.html && (
                    <DatabaseInteractiveDemo
                      html={currentQ.interactiveContent.html}
                      css={currentQ.interactiveContent.css}
                      javascript={currentQ.interactiveContent.javascript}
                    />
                  )}

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQ.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                          selectedAnswers[currentQuestion] === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {String.fromCharCode(65 + index)}. {option}
                          </span>
                          {selectedAnswers[currentQuestion] === index && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Hint */}
                  {currentQ.hint && (
                    <div>
                      {!showHint[currentQuestion] ? (
                        <Button variant="outline" size="sm" onClick={handleShowHint}>
                          <Lightbulb className="h-4 w-4 mr-2" />
                          संकेत देखें
                        </Button>
                      ) : (
                        <Alert className="bg-yellow-50 border-yellow-200">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <AlertDescription>{currentQ.hint}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleNavigateQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="flex-1 w-full"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  पिछला
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSkipQuestion}
                  disabled={currentQuestion === questions.length - 1}
                  className="flex-1 w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  छोड़ें
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                
                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmitTest}
                    disabled={submitting}
                    className="flex-1 w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {submitting ? 'जमा हो रहा है...' : 'टेस्ट जमा करें'}
                    <Trophy className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleNavigateQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    className="flex-1 w-full"
                  >
                    अगला
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Side Panel - Question Navigator */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">प्रगति अवलोकन</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Progress value={progress} className="h-2 mb-2" />
                    <div className="flex flex-col sm:flex-row gap-1 sm:justify-between text-xs text-gray-600">
                      <span>हल किए: {answeredCount}</span>
                      <span>शेष: {unansweredCount}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      <span>उत्तर दिया ({answeredCount})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded bg-orange-500"></div>
                      <span>छोड़ा गया ({skippedQuestions.size})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded bg-yellow-500"></div>
                      <span>देखा गया ({visitedQuestions.size - answeredCount - skippedQuestions.size})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded bg-gray-300"></div>
                      <span>नहीं देखा ({questions.length - visitedQuestions.size})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">प्रश्न नेविगेटर</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {questions.map((_, index) => {
                      const status = getQuestionStatus(index);
                      return (
                        <button
                          key={index}
                          onClick={() => handleNavigateQuestion(index)}
                          className={`
                            h-10 w-10 rounded-lg border-2 font-semibold text-sm transition-all
                            ${currentQuestion === index 
                              ? 'border-blue-600 bg-blue-600 text-white ring-2 ring-blue-200' 
                              : status === 'answered'
                              ? 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                              : status === 'skipped'
                              ? 'border-orange-500 bg-orange-500 text-white hover:bg-orange-600'
                              : status === 'visited'
                              ? 'border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                            }
                          `}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleSubmitTest}
                disabled={submitting}
                className="w-full"
              >
                <Trophy className="h-4 w-4 mr-2" />
                टेस्ट समाप्त करें
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MATTopicTest;
