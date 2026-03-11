import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DatabaseInteractiveDemo from "@/components/DatabaseInteractiveDemo";
import MATQuestionViewer from "@/components/MATQuestionViewer";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Clock,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  Award
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface Question {
  _id: string;
  questionId: string;
  module: string;
  subModule: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: string;
  hint: string;
  explanation: string;
  images: Array<{ url: string; description: string; position: string }>;
  interactiveContent: {
    html: string;
    css: string;
    javascript: string;
    isInteractive: boolean;
  };
  animation?: {
    enabled: boolean;
    frames: Array<{
      html: string;
      css: string;
      javascript: string;
      description: string;
      duration?: number;
    }>;
    autoPlaySpeed: number;
  };
  timeLimit: number;
}

const MATPractice: React.FC = () => {
  const { module } = useParams<{ module: string }>();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string>("");
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(true);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    // Get student ID
    const studentData = localStorage.getItem('student');
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData);
        if (parsed.student && parsed.student.studentId) {
          setStudentId(parsed.student.studentId);
        }
      } catch (e) {
        console.error('Error parsing student data:', e);
      }
    }

    fetchQuestions();
  }, [module]);

  useEffect(() => {
    if (timerActive && timer > 0 && !submitted) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, timerActive, submitted]);

  useEffect(() => {
    if (questions[currentIndex]) {
      setTimer(questions[currentIndex].timeLimit || 60);
      setStartTime(Date.now());
    }
  }, [currentIndex, questions]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/mat/modules/${module}/questions`);
      setQuestions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      const response = await axios.post(
        `${API_URL}/api/mat/questions/${currentQuestion.questionId}/submit`,
        {
          studentId,
          answer: selectedAnswer,
          timeTaken,
          hintsUsed
        }
      );

      setResult(response.data);
      setSubmitted(true);
      setTimerActive(false);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetQuestion();
    }
  };

  const resetQuestion = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setResult(null);
    setShowHint(false);
    setTimerActive(true);
    setHintsUsed(0);
  };

  const handleShowHint = () => {
    setShowHint(true);
    setHintsUsed(hintsUsed + 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">प्रश्न लोड हो रहे हैं...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">इस मॉड्यूल के लिए अभी कोई प्रश्न उपलब्ध नहीं हैं।</p>
              <Button onClick={() => navigate('/student/mat')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                मॉड्यूल पर वापस जाएं
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="edu-container max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/student/mat')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              मॉड्यूल पर वापस जाएं
            </Button>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{module}</h1>
                <p className="text-gray-600">
                  प्रश्न {currentIndex + 1} / {questions.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={timer > 10 ? "default" : "destructive"}>
                  <Clock className="h-3 w-3 mr-1" />
                  {timer} सेकंड
                </Badge>
                <Badge variant="outline">
                  {currentQuestion.difficulty === 'Easy' ? 'आसान' : currentQuestion.difficulty === 'Medium' ? 'मध्यम' : 'कठिन'}
                </Badge>
              </div>
            </div>

            <Progress value={progress} className="h-2" />
          </div>

          {/* Use MATQuestionViewer for animated questions */}
          {currentQuestion.animation?.enabled && currentQuestion.animation?.frames?.length > 0 ? (
            <div className="mb-6">
              <MATQuestionViewer
                question={currentQuestion}
                onAnswer={(optionIndex) => {
                  if (!submitted) {
                    setSelectedAnswer(optionIndex);
                    handleSubmit();
                  }
                }}
                showCorrectAnswer={submitted}
                selectedAnswer={selectedAnswer}
              />
              
              {/* Navigation buttons for animated questions */}
              {submitted && (
                <div className="mt-6 flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentIndex(prev => prev - 1);
                      resetQuestion();
                    }}
                    disabled={currentIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    पिछला प्रश्न
                  </Button>
                  
                  <Button
                    onClick={() => {
                      if (currentIndex < questions.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                        resetQuestion();
                      } else {
                        navigate('/student/mat');
                      }
                    }}
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>अगला प्रश्न <ArrowRight className="h-4 w-4 ml-2" /></>
                    ) : (
                      'समाप्त करें'
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Original question card for non-animated questions */
            <>
          {/* Question Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Images if present */}
              {currentQuestion.images && currentQuestion.images.length > 0 && (
                <div className="space-y-2">
                  {currentQuestion.images
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
              {currentQuestion.interactiveContent?.html && (
                <DatabaseInteractiveDemo
                  html={currentQuestion.interactiveContent.html}
                  css={currentQuestion.interactiveContent.css}
                  javascript={currentQuestion.interactiveContent.javascript}
                />
              )}

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !submitted && setSelectedAnswer(index)}
                    disabled={submitted}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      selectedAnswer === index
                        ? submitted
                          ? result?.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-blue-500 bg-blue-50'
                        : submitted && index === result?.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                      {submitted && selectedAnswer === index && (
                        result?.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )
                      )}
                      {submitted && index === result?.correctAnswer && selectedAnswer !== index && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Hint */}
              {!submitted && currentQuestion.hint && (
                <div>
                  {!showHint ? (
                    <Button variant="outline" size="sm" onClick={handleShowHint}>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      संकेत देखें
                    </Button>
                  ) : (
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>{currentQuestion.hint}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Result and Explanation */}
              {submitted && result && (
                <div className="space-y-3">
                  <Alert className={result.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                    <div className="flex items-center gap-2">
                      {result.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <AlertDescription className="font-semibold">
                        {result.isCorrect ? 'सही! बहुत बढ़िया!' : 'गलत। सीखते रहें!'}
                      </AlertDescription>
                    </div>
                  </Alert>

                  {result.explanation && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-sm">व्याख्या</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">{result.explanation}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Statistics */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-gray-900">
                            {result.statistics.accuracy}%
                          </p>
                          <p className="text-xs text-gray-600">सटीकता</p>
                        </div>
                        <div>
                          <Award className="h-6 w-6 text-green-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-gray-900">
                            {result.statistics.correctAnswers}
                          </p>
                          <p className="text-xs text-gray-600">सही</p>
                        </div>
                        <div>
                          <RotateCcw className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-gray-900">
                            {result.statistics.totalAttempted}
                          </p>
                          <p className="text-xs text-gray-600">कुल</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {!submitted ? (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={selectedAnswer === null}
                    className="flex-1"
                  >
                    जवाब जमा करें
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    disabled={currentIndex === questions.length - 1}
                    className="flex-1"
                  >
                    अगला प्रश्न
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MATPractice;
