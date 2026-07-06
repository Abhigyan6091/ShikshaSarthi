import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Volume2,
  VolumeX,
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
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AudioAnalyticsResults from "@/components/AudioAnalyticsResults";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  audio: string; // Cloudinary audio URL
  hint?: {
    text?: string;
    image?: string;
  };
  questionImage?: string;
}

interface AudioQuestionData {
  _id: string;
  subject: string;
  class: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: string;
  audio: string;
  audioOriginal?: string; // Original Cloudinary URL (fallback)
  audioLocal?: string; // Local cached URL
  hint?: {
    text?: string;
    image?: string;
  };
  questionImage?: string;
}

// Analytics tracking interfaces
interface QuestionAnalytics {
  questionIndex: number;
  timeSpent: number;
  attempts: number;
  hintUsed: boolean;
  answerChangeCount: number;
  navigationPattern: string[];
  firstAttemptTime: number;
  finalAttemptTime: number;
  isCorrect: boolean;
  selectedAnswer: string | null;
  audioPlayCount: number;
  audioListenPercentage: number;
  attemptStartTime: number; // Timestamp when question loaded
  attemptTime: number; // Time taken to answer in milliseconds
  isTukka: boolean; // True if answered in < 5 seconds (guessing)
  status: 'attempted' | 'skipped' | 'not-attempted'; // Question attempt status
}

interface AudioAnalytics {
  totalListenTime: number;
  audioPlaybacks: number;
  averageListenPerQuestion: number;
}

interface LearningBehaviorMetrics {
  focusScore: number;
  consistencyScore: number;
  thoughtfulnessScore: number;
  randomClickingIndicator: number;
  hintsUtilization: number;
  audioUtilization: number;
  overallLearningScore: number;
}

const AudioQuizPlayer: React.FC = () => {
  const { subject, topic } = useParams<{ subject: string; topic: string }>();
  const navigate = useNavigate();
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});
  const lastAudioTimeRef = useRef<{ [key: number]: number }>({});

  const [questions, setQuestions] = useState<AudioQuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [index: number]: string }>({});
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [attemptSaved, setAttemptSaved] = useState(false);

  // Audio controls
  const [audioPlaying, setAudioPlaying] = useState<{ [key: number]: boolean }>({});
  const [audioProgress, setAudioProgress] = useState<{ [key: number]: number }>({});

  // Analytics tracking states
  const [audioAnalytics, setAudioAnalytics] = useState<AudioAnalytics>({
    totalListenTime: 0,
    audioPlaybacks: 0,
    averageListenPerQuestion: 0,
  });
  
  const [questionAnalytics, setQuestionAnalytics] = useState<{ [key: number]: QuestionAnalytics }>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    const fetchAudioQuestions = async () => {
      try {
        const studentCookie = localStorage.getItem("student");
        const parsed = studentCookie ? JSON.parse(studentCookie) : null;
        const className = parsed?.student?.class || parsed?.class || null;

        const decodedSubject = subject ? decodeURIComponent(subject) : '';
        const decodedTopic = topic ? decodeURIComponent(topic) : '';

        console.log("Fetching audio questions for:", { className, subject: decodedSubject, topic: decodedTopic });

        // Class-agnostic: all students can access audio questions for a topic.
        const res = await axios.get(
          `${API_URL}/audio-questions/all/questions/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(decodedTopic)}`
        );

        console.log("Audio questions response:", res.data);

        if (res.data && res.data.length > 0) {
          setQuestions(res.data);
          setStartTime(Date.now());
          
          // Initialize analytics for all questions
          const initialAnalytics: { [key: number]: QuestionAnalytics } = {};
          const currentTime = Date.now();
          res.data.forEach((_question: AudioQuestionData, index: number) => {
            initialAnalytics[index] = {
              questionIndex: index,
              timeSpent: 0,
              attempts: 0,
              hintUsed: false,
              answerChangeCount: 0,
              navigationPattern: [],
              firstAttemptTime: 0,
              finalAttemptTime: 0,
              isCorrect: false,
              selectedAnswer: null,
              audioPlayCount: 0,
              audioListenPercentage: 0,
              attemptStartTime: index === 0 ? currentTime : 0, // Set for first question
              attemptTime: 0,
              isTukka: false,
              status: 'not-attempted',
            };
          });
          setQuestionAnalytics(initialAnalytics);
          setQuestionStartTime(Date.now());
        }
      } catch (err) {
        console.error("Error fetching audio questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioQuestions();
  }, [subject, topic]);

  // Save quiz attempt when completed
  useEffect(() => {
    const saveQuizAttempt = async () => {
      if (!quizCompleted || !startTime || !endTime) return;
      if (savingAttempt || attemptSaved) return; // Prevent duplicate saves

      setSavingAttempt(true);
      console.log("🎯 Starting to save audio quiz attempt...");

      try {
        const studentCookie = localStorage.getItem("student");
        const parsed = studentCookie ? JSON.parse(studentCookie) : null;
        
        console.log("📝 Student cookie data:", parsed);
        
        // Handle both student object structures
        const student = parsed?.student || parsed;

        if (!student) {
          console.error("❌ Student data not found in localStorage");
          setSavingAttempt(false);
          return;
        }

        // Get the correct studentId (STU001, not MongoDB _id)
        const studentId = student.studentId || student._id;
        const studentName = student.name || "Unknown";
        const className = student.class || "";

        console.log("✅ Student info:", { studentId, studentName, className });

        const correctAnswers = Object.entries(answers).filter(
          ([index, answer]) => answer === questions[parseInt(index)].correctAnswer
        ).length;

        const incorrectAnswers = Object.entries(answers).filter(
          ([index, answer]) => answer && answer !== questions[parseInt(index)].correctAnswer
        ).length;

        const skippedQuestions = Object.values(questionAnalytics).filter(
          qa => qa.status === 'skipped'
        ).length;

        const totalQuestions = questions.length;
        const scoreValue = correctAnswers; // Store actual score, not percentage
        const timeTaken = Math.round((endTime - startTime) / 1000);

        console.log("📊 Quiz stats:", { 
          totalQuestions, 
          correctAnswers, 
          incorrectAnswers, 
          skippedQuestions, 
          timeTaken 
        });

        const analyticsValues = Object.values(questionAnalytics);
        const avgAudioListening = totalQuestions > 0 
          ? analyticsValues.reduce((sum, qa) => sum + (qa.audioListenPercentage || 0), 0) / totalQuestions
          : 0;

        // Calculate learning metrics
        const learningMetrics = {
          audioComprehensionScore: Math.round(avgAudioListening * (correctAnswers / Math.max(1, totalQuestions))),
          listeningEngagementScore: Math.min(100, Math.round(avgAudioListening)),
          audioFocusScore: Math.round(avgAudioListening * 0.8),
          processingEfficiency: Math.round((correctAnswers / Math.max(1, totalQuestions)) * 100),
          strategicUsage: Math.round((audioAnalytics.audioPlaybacks / Math.max(1, totalQuestions)) * 20),
          learningPotential: Math.round((scoreValue / totalQuestions * 100 + avgAudioListening) / 2)
        };

        const attemptData = {
          studentId,
          studentName,
          class: className,
          subject: subject || '',
          topic: topic || '',
          score: scoreValue,
          totalQuestions,
          correctAnswers,
          wrongAnswers: incorrectAnswers,
          skippedQuestions,
          timeTaken,
          audioAnalytics: {
            totalListenTime: audioAnalytics.totalListenTime,
            averageListenPercentage: avgAudioListening,
            totalReplayCount: audioAnalytics.audioPlaybacks,
            questionsWithReplays: analyticsValues.filter(qa => qa.audioPlayCount > 1).length,
            averageAttentionScore: Math.round(avgAudioListening)
          },
          questionAnalytics: Object.entries(questionAnalytics).map(([index, qa]) => {
            const qIndex = parseInt(index);
            const question = questions[qIndex];
            const selectedAnswer = answers[qIndex] || '';
            const isCorrect = selectedAnswer === question?.correctAnswer;

            return {
              questionId: question?._id || `q_${qIndex}`,
              questionText: question?.question || '',
              selectedAnswer,
              correctAnswer: question?.correctAnswer || '',
              isCorrect,
              audioPlayCount: qa.audioPlayCount || 0,
              audioListenTime: qa.audioListenPercentage > 0 
                ? Math.round((qa.audioListenPercentage / 100) * 60) // Estimate in seconds
                : 0,
              audioListenPercentage: qa.audioListenPercentage || 0,
              attemptTime: qa.attemptTime || 0,
              isTukka: qa.isTukka || false,
              status: qa.status || 'not-attempted'
            };
          }),
          learningMetrics
        };

        console.log("📤 Sending attempt data to backend:", attemptData);
        
        const response = await axios.post(`${API_URL}/audio-questions/attempt`, attemptData);
        console.log("✅ Audio quiz attempt saved successfully:", response.data);
        
        setAttemptSaved(true);
        setSavingAttempt(false);
      } catch (error) {
        console.error("❌ Error saving audio quiz attempt:", error);
        if (error instanceof Error) {
          console.error("Error details:", error.message);
        }
        setSavingAttempt(false);
        // Don't block the UI if save fails
      }
    };

    saveQuizAttempt();
  }, [quizCompleted, startTime, endTime, answers, questionAnalytics, audioAnalytics, questions, subject, topic, savingAttempt, attemptSaved]);

  // Analytics: Track time spent on each question
  useEffect(() => {
    if (!quizCompleted && questions.length > 0) {
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
  }, [currentQuestion, quizCompleted, questions.length]);

  // Audio playback handlers
  const toggleAudio = (questionIndex: number) => {
    const audio = audioRefs.current[questionIndex];
    if (!audio) return;

    if (audioPlaying[questionIndex]) {
      audio.pause();
      setAudioPlaying(prev => ({ ...prev, [questionIndex]: false }));
    } else {
      // Pause all other audios
      Object.keys(audioRefs.current).forEach(key => {
        const idx = parseInt(key);
        if (idx !== questionIndex && audioRefs.current[idx]) {
          audioRefs.current[idx]!.pause();
          setAudioPlaying(prev => ({ ...prev, [idx]: false }));
        }
      });

      audio.play();
      setAudioPlaying(prev => ({ ...prev, [questionIndex]: true }));
      
      // Track audio play
      setQuestionAnalytics(prev => ({
        ...prev,
        [questionIndex]: {
          ...prev[questionIndex],
          audioPlayCount: (prev[questionIndex]?.audioPlayCount || 0) + 1,
        },
      }));
      
      setAudioAnalytics(prev => ({
        ...prev,
        audioPlaybacks: prev.audioPlaybacks + 1,
      }));
    }
  };

  const handleAudioTimeUpdate = (questionIndex: number) => {
    const audio = audioRefs.current[questionIndex];
    if (!audio || !audio.duration || isNaN(audio.duration)) return;

    const progress = (audio.currentTime / audio.duration) * 100;
    setAudioProgress(prev => ({ ...prev, [questionIndex]: progress }));

    // Track listen percentage (maximum progress reached)
    setQuestionAnalytics(prev => {
      const currentMax = prev[questionIndex]?.audioListenPercentage || 0;
      const newPercentage = Math.max(currentMax, Math.min(100, progress));
      
      return {
        ...prev,
        [questionIndex]: {
          ...prev[questionIndex],
          audioListenPercentage: newPercentage,
        },
      };
    });
    
    // Update total listen time (only count each second once)
    const currentSecond = Math.floor(audio.currentTime);
    const lastSecond = lastAudioTimeRef.current[questionIndex] || -1;
    
    if (currentSecond > lastSecond) {
      const secondsElapsed = currentSecond - lastSecond;
      setAudioAnalytics(prev => ({
        ...prev,
        totalListenTime: prev.totalListenTime + secondsElapsed,
      }));
      lastAudioTimeRef.current[questionIndex] = currentSecond;
    }
  };

  const handleAudioEnded = (questionIndex: number) => {
    setAudioPlaying(prev => ({ ...prev, [questionIndex]: false }));
    setAudioProgress(prev => ({ ...prev, [questionIndex]: 0 }));
    // Reset time tracking for this audio
    lastAudioTimeRef.current[questionIndex] = -1;
  };

  const handleAnswerSelect = (option: string) => {
    const previousAnswer = answers[currentQuestion];
    const currentTime = Date.now();
    const currentAnalytics = questionAnalytics[currentQuestion];
    
    // Track answer change
    if (previousAnswer && previousAnswer !== option) {
      setQuestionAnalytics(prev => ({
        ...prev,
        [currentQuestion]: {
          ...prev[currentQuestion],
          answerChangeCount: (prev[currentQuestion]?.answerChangeCount || 0) + 1,
        },
      }));
    }

    // Track first attempt time (when answer is selected, not checked)
    if (!currentAnalytics?.firstAttemptTime) {
      setQuestionAnalytics(prev => ({
        ...prev,
        [currentQuestion]: {
          ...prev[currentQuestion],
          firstAttemptTime: currentTime,
          attempts: 1,
          status: 'attempted',
        },
      }));
    }

    setSelectedAnswer(option);
    setAnswers(prev => ({ ...prev, [currentQuestion]: option }));
    setAttemptedQuestions(prev => new Set(prev).add(currentQuestion));
    setShowFeedback(false);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) {
      alert("कृपया पहले एक उत्तर चुनें!");
      return;
    }

    const currentTime = Date.now();
    const currentAnalytics = questionAnalytics[currentQuestion];
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    
    // Calculate attempt time from when question was displayed to when answer was checked
    const startTime = currentAnalytics?.attemptStartTime || currentTime;
    const attemptDuration = currentTime - startTime;
    const isTukka = attemptDuration < 4000; // Less than 4 seconds = tukka (guessing)
    
    // Update analytics with correctness, attempt time, and tukka detection
    setQuestionAnalytics(prev => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        isCorrect,
        selectedAnswer,
        finalAttemptTime: currentTime,
        attemptTime: attemptDuration,
        isTukka,
      },
    }));

    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      const currentTime = Date.now();
      
      // Track navigation and set attempt start time for next question
      setQuestionAnalytics(prev => ({
        ...prev,
        [nextIndex]: {
          ...prev[nextIndex],
          navigationPattern: [...(prev[nextIndex]?.navigationPattern || []), `from_${currentQuestion}`],
          attemptStartTime: prev[nextIndex]?.attemptStartTime || currentTime, // Set if not already set
        },
      }));

      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(answers[nextIndex] || null);
      setShowFeedback(false);
      setShowHint(false);
      setQuestionStartTime(currentTime);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      const prevIndex = currentQuestion - 1;
      const currentTime = Date.now();
      
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answers[prevIndex] || null);
      setShowFeedback(false);
      setShowHint(false);
      setQuestionStartTime(currentTime);
    }
  };

  const toggleHint = () => {
    if (!showHint) {
      setQuestionAnalytics(prev => ({
        ...prev,
        [currentQuestion]: {
          ...prev[currentQuestion],
          hintUsed: true,
        },
      }));
    }
    setShowHint(!showHint);
  };

  const skipQuestion = () => {
    // Mark question as skipped (override any previous status)
    setQuestionAnalytics(prev => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        status: 'skipped',
        isCorrect: false, // Skipped questions are not correct
      },
    }));

    // Remove answer for this question if any was selected
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion];
      return newAnswers;
    });

    // Remove from attempted questions
    setAttemptedQuestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentQuestion);
      return newSet;
    });

    // Move to next question or submit if last question
    if (currentQuestion < questions.length - 1) {
      nextQuestion();
    } else {
      const confirm = window.confirm(
        'यह आखिरी प्रश्न है। क्या आप क्विज़ जमा करना चाहते हैं?'
      );
      if (confirm) {
        submitQuiz();
      }
    }
  };

  const submitQuiz = () => {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      const confirm = window.confirm(
        `आपने ${unanswered} प्रश्न नहीं किए हैं। क्या आप फिर भी जमा करना चाहते हैं?`
      );
      if (!confirm) return;
    }

    setEndTime(Date.now());
    setQuizCompleted(true);

    // Pause any playing audio
    Object.keys(audioRefs.current).forEach(key => {
      const audio = audioRefs.current[parseInt(key)];
      if (audio && !audio.paused) {
        audio.pause();
      }
    });
  };

  // Calculate learning metrics
  const calculateLearningMetrics = (): LearningBehaviorMetrics => {
    const analytics = Object.values(questionAnalytics);
    const totalQuestions = questions.length;

    if (totalQuestions === 0) {
      return {
        focusScore: 0,
        consistencyScore: 0,
        thoughtfulnessScore: 0,
        randomClickingIndicator: 0,
        hintsUtilization: 0,
        audioUtilization: 0,
        overallLearningScore: 0,
      };
    }

    // Audio Utilization (0-100)
    const audioPlaysPerQuestion = analytics.map(a => a.audioPlayCount);
    const avgAudioPlays = audioPlaysPerQuestion.reduce((a, b) => a + b, 0) / totalQuestions;
    const avgListenPercentage = analytics.reduce((sum, a) => sum + a.audioListenPercentage, 0) / totalQuestions;
    const audioUtilization = Math.min(100, (avgListenPercentage + (avgAudioPlays * 20)));

    // Consistency Score (based on time variance)
    const times = analytics.map(a => a.timeSpent).filter(t => t > 0);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 100 - (stdDev / avgTime) * 100);

    // Thoughtfulness Score (answer changes + time per question)
    const avgChanges = analytics.reduce((sum, a) => sum + a.answerChangeCount, 0) / totalQuestions;
    const thoughtfulnessScore = Math.min(100, avgTime * 2 - avgChanges * 10 + audioUtilization * 0.3);

    // Random Clicking Indicator (high answer changes + low time)
    const randomClickingIndicator = Math.min(100, (avgChanges * 20) - (avgTime * 2));

    // Hints Utilization
    const hintsUsed = analytics.filter(a => a.hintUsed).length;
    const hintsUtilization = (hintsUsed / totalQuestions) * 100;

    // Focus Score (audio usage + time spent)
    const focusScore = Math.min(100, (audioUtilization * 0.5) + (consistencyScore * 0.5));

    // Overall Learning Score
    const overallLearningScore =
      (focusScore * 0.25) +
      (consistencyScore * 0.2) +
      (thoughtfulnessScore * 0.25) +
      (audioUtilization * 0.2) +
      (Math.max(0, 100 - randomClickingIndicator) * 0.1);

    return {
      focusScore: Math.round(focusScore),
      consistencyScore: Math.round(consistencyScore),
      thoughtfulnessScore: Math.round(thoughtfulnessScore),
      randomClickingIndicator: Math.round(randomClickingIndicator),
      hintsUtilization: Math.round(hintsUtilization),
      audioUtilization: Math.round(audioUtilization),
      overallLearningScore: Math.round(overallLearningScore),
    };
  };

  const formatTime = (seconds: number): string => {
    // Ensure non-negative time
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading audio questions...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertCircle className="mr-2" />
                No Audio Questions Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                No audio questions available for this topic yet.
              </p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (quizCompleted) {
    const correctAnswers = Object.entries(answers).filter(
      ([index, answer]) => answer === questions[parseInt(index)].correctAnswer
    ).length;

    const incorrectAnswers = Object.entries(answers).filter(
      ([index, answer]) => answer && answer !== questions[parseInt(index)].correctAnswer
    ).length;

    const unattemptedAnswers = questions.length - Object.keys(answers).length;
    const totalQuestions = questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const timeTaken = startTime && endTime ? Math.max(0, Math.round((endTime - startTime) / 1000)) : 0;

    // Calculate average audio listening percentage with safety check
    const analyticsValues = Object.values(questionAnalytics);
    const avgAudioListening = totalQuestions > 0 
      ? analyticsValues.reduce((sum, qa) => sum + (qa.audioListenPercentage || 0), 0) / totalQuestions
      : 0;

    const resultsData = {
      correct: correctAnswers,
      incorrect: incorrectAnswers,
      unattempted: unattemptedAnswers,
    };

    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="flex-1 py-8">
          <div className="edu-container max-w-6xl">
            {/* Back Button */}
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate('/student/multimedia/audio-questions')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              वापस ऑडियो प्रश्नों पर जाएं
            </Button>

            {/* Save Status Indicator */}
            {savingAttempt && (
              <Card className="mb-4 border-blue-200 bg-blue-50">
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium text-blue-700">
                      आपका परिणाम सहेजा जा रहा है...
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {attemptSaved && (
              <Card className="mb-4 border-green-200 bg-green-50">
                <CardContent className="py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        ✅ परिणाम सफलतापूर्वक सहेजा गया!
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-600 text-green-700 hover:bg-green-100"
                      onClick={() => navigate('/student/audio-quiz-history')}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      इतिहास देखें
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Use AudioAnalyticsResults Component */}
            <AudioAnalyticsResults
              results={resultsData}
              totalQuestions={totalQuestions}
              accuracy={accuracy}
              timeTaken={timeTaken}
              audioAnalytics={{
                totalListenTime: audioAnalytics.totalListenTime,
                audioPlaybacks: audioAnalytics.audioPlaybacks,
                avgListenPercentage: avgAudioListening,
              }}
              questionAnalytics={questionAnalytics}
            />

            {/* Audio-specific insights */}
            <Card className="mt-6 border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-6 w-6 text-blue-600" />
                  ऑडियो उपयोग विश्लेषण
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">कुल ऑडियो प्ले</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{audioAnalytics.audioPlaybacks || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      प्रति प्रश्न औसत: {totalQuestions > 0 ? ((audioAnalytics.audioPlaybacks || 0) / totalQuestions).toFixed(1) : '0.0'}
                    </p>
                  </div>
                  <div className="p-4 bg-cyan-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-700">सुनने का समय</span>
                    </div>
                    <p className="text-2xl font-bold text-cyan-600">{formatTime(audioAnalytics.totalListenTime || 0)}</p>
                    <p className="text-xs text-gray-600 mt-1">औसत प्रतिशत: {Math.round(avgAudioListening)}%</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">ऑडियो उपयोग स्कोर</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{Math.round(avgAudioListening)}%</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {avgAudioListening >= 70 ? "उत्कृष्ट!" : avgAudioListening >= 50 ? "अच्छा" : "और सुनें"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-800 mb-1">सुझाव</p>
                      <p className="text-sm text-gray-700">
                        {avgAudioListening < 70 
                          ? "ऑडियो को पूरा सुनने से आप बेहतर समझ पाएंगे और सही उत्तर चुन सकेंगे।"
                          : "बहुत अच्छा! आप ऑडियो को ध्यान से सुन रहे हैं। यह सीखने का बेहतरीन तरीका है।"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                onClick={() => navigate('/student/multimedia/audio-questions')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                और विषय देखें
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Trophy className="h-4 w-4 mr-2" />
                फिर से प्रयास करें
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Main quiz interface
  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== undefined;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="flex-1 py-6 md:py-8">
        <div className="edu-container max-w-7xl">
          {/* Main Layout with Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content Area */}
            <div className="flex-1">
              {/* Progress Bar */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <span className="text-sm font-medium text-edu-blue">
                      {Math.round(progress)}% Complete
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </CardContent>
              </Card>

              {/* Mobile Question Status (Collapsible) */}
              <Card className="mb-6 lg:hidden border-2 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 pb-3 cursor-pointer">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-blue-600" />
                    प्रश्न स्थिति ({Object.keys(answers).length}/{questions.length} पूर्ण)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {questions.map((_, index) => {
                      const analytics = questionAnalytics[index];
                      const isAnswered = answers[index] !== undefined;
                      const isSkipped = analytics?.status === 'skipped';
                      const isCurrent = index === currentQuestion;
                      const isCorrect = analytics?.isCorrect;
                      
                      let statusColor = 'bg-gray-200 text-gray-700';
                      let borderClass = '';
                      let statusLabel = 'बाकी है';
                      
                      if (isSkipped) {
                        statusColor = 'bg-yellow-500 text-white';
                        statusLabel = 'छोड़ दिया';
                      } else if (isAnswered) {
                        if (isCorrect) {
                          statusColor = 'bg-green-500 text-white';
                          statusLabel = 'सही';
                        } else {
                          statusColor = 'bg-red-500 text-white';
                          statusLabel = 'गलत';
                        }
                      }
                      
                      if (isCurrent) {
                        borderClass = 'ring-4 ring-blue-400 ring-offset-2';
                      }
                      
                      return (
                        <div
                          key={index}
                          className={`relative aspect-square rounded-lg ${statusColor} ${borderClass} flex flex-col items-center justify-center font-bold text-xs transition-all duration-200 shadow-md`}
                          title={`प्रश्न ${index + 1} - ${statusLabel}`}
                        >
                          <span className="text-sm">{index + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Question Card */}
          <Card className="mb-6 border-2 border-edu-blue/20">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <CardTitle className="text-xl flex-1">
                  Question {currentQuestion + 1}
                </CardTitle>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {currentQ.hint && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleHint}
                      className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    >
                      <Lightbulb className="h-4 w-4 mr-1" />
                      {showHint ? "Hide" : "Show"} Hint
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Audio Player */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-700">Listen to Question</span>
                  </div>
                  <Button
                    onClick={() => toggleAudio(currentQuestion)}
                    variant="outline"
                    size="sm"
                    className="border-purple-500 text-purple-600 hover:bg-purple-100"
                  >
                    {audioPlaying[currentQuestion] ? (
                      <>
                        <PauseCircle className="h-5 w-5 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-5 w-5 mr-1" />
                        Play Audio
                      </>
                    )}
                  </Button>
                </div>
                
                <audio
                  ref={(el) => (audioRefs.current[currentQuestion] = el)}
                  src={currentQ.audio}
                  onTimeUpdate={() => handleAudioTimeUpdate(currentQuestion)}
                  onEnded={() => handleAudioEnded(currentQuestion)}
                  onError={(e) => {
                    // Fallback to original Cloudinary URL if local cache fails
                    const audioElement = e.currentTarget;
                    if (currentQ.audioOriginal && audioElement.src !== currentQ.audioOriginal) {
                      console.log('Local audio failed, falling back to Cloudinary');
                      audioElement.src = currentQ.audioOriginal;
                    }
                  }}
                  preload="metadata"
                />
                
                {audioPlaying[currentQuestion] && (
                  <Progress 
                    value={audioProgress[currentQuestion] || 0} 
                    className="h-2 mt-2" 
                  />
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Played {questionAnalytics[currentQuestion]?.audioPlayCount || 0} time(s)
                </p>
              </div>

              {/* Question Text */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-medium text-gray-800 leading-relaxed">
                  {currentQ.question}
                </p>
                {currentQ.questionImage && (
                  <img
                    src={currentQ.questionImage}
                    alt="Question"
                    className="mt-4 max-w-full h-auto rounded-lg border"
                  />
                )}
              </div>

              {/* Hint */}
              {showHint && currentQ.hint && (
                <Card className="mb-6 border-yellow-300 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center text-yellow-700">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Hint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentQ.hint.text && (
                      <p className="text-gray-700">{currentQ.hint.text}</p>
                    )}
                    {currentQ.hint.image && (
                      <img
                        src={currentQ.hint.image}
                        alt="Hint"
                        className="mt-2 max-w-full h-auto rounded"
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQ.correctAnswer;
                  const showCorrect = showFeedback && isCorrect;
                  const showIncorrect = showFeedback && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => !showFeedback && handleAnswerSelect(option)}
                      disabled={showFeedback}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        showCorrect
                          ? "border-green-500 bg-green-50"
                          : showIncorrect
                          ? "border-red-500 bg-red-50"
                          : isSelected
                          ? "border-edu-blue bg-blue-50"
                          : "border-gray-200 hover:border-edu-blue hover:bg-gray-50"
                      } ${showFeedback ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {showCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {showIncorrect && <XCircle className="h-5 w-5 text-red-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {showFeedback && (
                <Card className={`mt-6 ${
                  selectedAnswer === currentQ.correctAnswer
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      {selectedAnswer === currentQ.correctAnswer ? (
                        <>
                          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-green-700">Correct!</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Well done! You got it right.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-red-700">Incorrect</p>
                            <p className="text-sm text-gray-600 mt-1">
                              The correct answer is: <span className="font-semibold">{currentQ.correctAnswer}</span>
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex flex-wrap gap-3 w-full sm:w-auto sm:justify-end">
              {!showFeedback ? (
                <>
                  <Button
                    onClick={checkAnswer}
                    disabled={!selectedAnswer}
                    className="bg-edu-blue hover:bg-edu-blue/90"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Check Answer
                  </Button>
                  <Button
                    onClick={skipQuestion}
                    variant="outline"
                    className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4 rotate-180" />
                    Skip
                  </Button>
                </>
              ) : currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={nextQuestion}
                  className="bg-edu-green hover:bg-edu-green/90"
                >
                  Next Question
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              ) : (
                <Button
                  onClick={submitQuiz}
                  className="bg-gradient-to-r from-edu-purple to-edu-blue"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>

          {/* Question Stats */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-between text-sm text-gray-600">
                <span>Attempted: {attemptedQuestions.size}/{questions.length}</span>
                <span>Time on question: {formatTime(questionAnalytics[currentQuestion]?.timeSpent || 0)}</span>
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Right Sidebar - Question Status */}
            <div className="w-80 hidden lg:block">
              <Card className="sticky top-6 border-2 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-blue-600" />
                    प्रश्न स्थिति
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((_, index) => {
                      const analytics = questionAnalytics[index];
                      const isAnswered = answers[index] !== undefined;
                      const isSkipped = analytics?.status === 'skipped';
                      const isCurrent = index === currentQuestion;
                      const isCorrect = analytics?.isCorrect;
                      
                      let statusColor = 'bg-gray-200 text-gray-700'; // Not attempted
                      let borderClass = '';
                      let statusLabel = 'बाकी है';
                      
                      if (isSkipped) {
                        statusColor = 'bg-yellow-500 text-white'; // Skipped
                        statusLabel = 'छोड़ दिया';
                      } else if (isAnswered) {
                        if (isCorrect) {
                          statusColor = 'bg-green-500 text-white'; // Correct
                          statusLabel = 'सही';
                        } else {
                          statusColor = 'bg-red-500 text-white'; // Wrong
                          statusLabel = 'गलत';
                        }
                      }
                      
                      if (isCurrent) {
                        borderClass = 'ring-4 ring-blue-400 ring-offset-2';
                      }
                      
                      return (
                        <div
                          key={index}
                          className={`relative aspect-square rounded-lg ${statusColor} ${borderClass} flex flex-col items-center justify-center font-bold text-xs transition-all duration-200 cursor-pointer hover:scale-110 shadow-md`}
                          title={`प्रश्न ${index + 1} - ${statusLabel}`}
                        >
                          <span className="text-sm">{index + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-gray-600 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded flex-shrink-0"></div>
                      <span>सही</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded flex-shrink-0"></div>
                      <span>गलत</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded flex-shrink-0"></div>
                      <span>छोड़ दिया</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-200 rounded flex-shrink-0"></div>
                      <span>बाकी है</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-400 ring-2 ring-blue-400 ring-offset-1 rounded flex-shrink-0"></div>
                      <span>वर्तमान</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AudioQuizPlayer;
