import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
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
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnalyticsResults from "@/components/AnalyticsResults";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  hint?: {
    text?: string;
    image?: string;
  };
}

interface VideoQuestionData {
  _id: string;
  videoUrl: string;
  videoTitle: string;
  videoDescription?: string;
  videoDuration?: string;
  questions: Question[];
}

// Analytics tracking interfaces
interface QuestionAnalytics {
  questionIndex: number;
  timeSpent: number; // seconds
  attempts: number; // how many times visited this question
  hintUsed: boolean;
  answerChangeCount: number; // before final submission
  navigationPattern: string[]; // track from which question they came
  firstAttemptTime: number; // time when first visited
  finalAttemptTime: number; // time when finally answered
  isCorrect: boolean;
  selectedAnswer: string | null;
}

interface VideoAnalytics {
  totalWatchTime: number; // actual time watched
  videoDuration: number;
  watchPercentage: number;
  skippedVideo: boolean;
  pauseCount: number;
  seekCount: number; // how many times user seeked/rewinded
  playbackEvents: { type: string; timestamp: number; position: number }[];
}

interface LearningBehaviorMetrics {
  focusScore: number; // 0-100, based on video watching
  consistencyScore: number; // 0-100, based on time per question
  thoughtfulnessScore: number; // 0-100, based on attempts and time
  randomClickingIndicator: number; // 0-100, higher means more random
  hintsUtilization: number; // 0-100
  overallLearningScore: number; // 0-100
}

const VideoQuizPlayer: React.FC = () => {
  const { subject, topic } = useParams<{ subject: string; topic: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoData, setVideoData] = useState<VideoQuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [index: number]: string }>({});
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  // Video controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isYouTube, setIsYouTube] = useState(false);

  // Analytics tracking states
  const [videoAnalytics, setVideoAnalytics] = useState<VideoAnalytics>({
    totalWatchTime: 0,
    videoDuration: 0,
    watchPercentage: 0,
    skippedVideo: false,
    pauseCount: 0,
    seekCount: 0,
    playbackEvents: [],
  });
  
  const [questionAnalytics, setQuestionAnalytics] = useState<{ [key: number]: QuestionAnalytics }>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [lastVideoPosition, setLastVideoPosition] = useState<number>(0);
  const videoWatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const studentCookie = localStorage.getItem("student");
        const parsed = studentCookie ? JSON.parse(studentCookie) : null;
        const className = parsed?.student?.class || parsed?.class || null;

        // Decode URL parameters
        const decodedSubject = subject ? decodeURIComponent(subject) : '';
        const decodedTopic = topic ? decodeURIComponent(topic) : '';

        console.log("Fetching video data for:", { className, subject: decodedSubject, topic: decodedTopic });

        const res = await axios.get(
          `${API_URL}/video-questions/${className}/${decodedSubject}/${decodedTopic}`
        );

        console.log("Video data response:", res.data);

        if (res.data && res.data.length > 0) {
          const data = res.data[0];
          setVideoData(data);
          
          // Check if it's a YouTube video
          if (data.videoUrl.includes('youtube.com') || data.videoUrl.includes('youtu.be')) {
            setIsYouTube(true);
          }
          
          setStartTime(Date.now());
        }
      } catch (err) {
        console.error("Error fetching video questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [subject, topic]);

  // Video control handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        // Track pause
        setVideoAnalytics(prev => ({
          ...prev,
          pauseCount: prev.pauseCount + 1,
          playbackEvents: [...prev.playbackEvents, { type: 'pause', timestamp: Date.now(), position: currentTime }],
        }));
      } else {
        videoRef.current.play();
        setVideoAnalytics(prev => ({
          ...prev,
          playbackEvents: [...prev.playbackEvents, { type: 'play', timestamp: Date.now(), position: currentTime }],
        }));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setIsPlaying(false);
    
    // Track video completion
    if (videoRef.current) {
      const watchPercentage = (videoAnalytics.totalWatchTime / duration) * 100;
      setVideoAnalytics(prev => ({
        ...prev,
        videoDuration: duration,
        watchPercentage: Math.min(watchPercentage, 100),
      }));
    }
  };

  // Analytics: Track video watching behavior
  useEffect(() => {
    if (isPlaying && videoRef.current && !videoEnded) {
      videoWatchIntervalRef.current = setInterval(() => {
        setVideoAnalytics(prev => ({
          ...prev,
          totalWatchTime: prev.totalWatchTime + 1,
        }));
      }, 1000);
    } else {
      if (videoWatchIntervalRef.current) {
        clearInterval(videoWatchIntervalRef.current);
      }
    }

    return () => {
      if (videoWatchIntervalRef.current) {
        clearInterval(videoWatchIntervalRef.current);
      }
    };
  }, [isPlaying, videoEnded]);

  // Analytics: Initialize question analytics when quiz starts
  useEffect(() => {
    if (videoEnded && videoData && Object.keys(questionAnalytics).length === 0) {
      const initialAnalytics: { [key: number]: QuestionAnalytics } = {};
      videoData.questions.forEach((_, index) => {
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
        };
      });
      setQuestionAnalytics(initialAnalytics);
      setQuestionStartTime(Date.now());
    }
  }, [videoEnded, videoData]);

  // Analytics: Track time spent on each question
  useEffect(() => {
    if (videoEnded && !quizCompleted) {
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
  }, [currentQuestion, videoEnded, quizCompleted]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      const diff = Math.abs(newTime - currentTime);
      if (diff > 2) { // Consider as seek if difference > 2 seconds
        setVideoAnalytics(prev => ({
          ...prev,
          seekCount: prev.seekCount + 1,
          playbackEvents: [...prev.playbackEvents, { type: 'seek', timestamp: Date.now(), position: newTime }],
        }));
      }
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
    setLastVideoPosition(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Quiz handlers
  const handleAnswer = (option: string) => {
    if (showFeedback) return; // Don't allow changing answer after feedback shown

    const currentQ = videoData?.questions[currentQuestion];
    if (!currentQ) return;

    const isFirstAttempt = !attemptedQuestions.has(currentQuestion);
    const now = Date.now();

    setSelectedAnswer(option);
    setAnswers((prev) => ({ ...prev, [currentQuestion]: option }));
    setAttemptedQuestions((prev) => new Set(prev).add(currentQuestion));
    setShowFeedback(true);

    // Track analytics
    setQuestionAnalytics(prev => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        attempts: (prev[currentQuestion]?.attempts || 0) + 1,
        firstAttemptTime: isFirstAttempt ? now : prev[currentQuestion]?.firstAttemptTime || now,
        finalAttemptTime: now,
        isCorrect: option === currentQ.correctAnswer,
        selectedAnswer: option,
        answerChangeCount: prev[currentQuestion]?.selectedAnswer && prev[currentQuestion]?.selectedAnswer !== option 
          ? (prev[currentQuestion]?.answerChangeCount || 0) + 1 
          : prev[currentQuestion]?.answerChangeCount || 0,
      },
    }));
  };

  const handleSkip = () => {
    // Skip current question without answering
    // Track skip in navigation pattern
    if (videoData && currentQuestion < videoData.questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      
      // Track navigation
      setQuestionAnalytics(prev => ({
        ...prev,
        [nextIndex]: {
          ...prev[nextIndex],
          navigationPattern: [...(prev[nextIndex]?.navigationPattern || []), `from_${currentQuestion}_skipped`],
        },
      }));

      setCurrentQuestion(nextIndex);
      
      // Check if next question was already attempted
      const wasAttempted = attemptedQuestions.has(nextIndex);
      setSelectedAnswer(answers[nextIndex] || null);
      setShowFeedback(wasAttempted);
      setShowHint(false);
    } else {
      // Last question, complete quiz
      setEndTime(Date.now());
      setQuizCompleted(true);
    }
  };

  const handleNext = () => {
    if (videoData && currentQuestion < videoData.questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      
      // Track navigation
      setQuestionAnalytics(prev => ({
        ...prev,
        [nextIndex]: {
          ...prev[nextIndex],
          navigationPattern: [...(prev[nextIndex]?.navigationPattern || []), `from_${currentQuestion}`],
        },
      }));

      setCurrentQuestion(nextIndex);
      
      // Check if next question was already attempted
      const wasAttempted = attemptedQuestions.has(nextIndex);
      setSelectedAnswer(answers[nextIndex] || null);
      setShowFeedback(wasAttempted);
      setShowHint(false);
    } else {
      setEndTime(Date.now());
      setQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const prevIndex = currentQuestion - 1;
      
      // Track navigation
      setQuestionAnalytics(prev => ({
        ...prev,
        [prevIndex]: {
          ...prev[prevIndex],
          navigationPattern: [...(prev[prevIndex]?.navigationPattern || []), `from_${currentQuestion}_back`],
        },
      }));

      setCurrentQuestion(prevIndex);
      
      // Check if previous question was already attempted
      const wasAttempted = attemptedQuestions.has(prevIndex);
      setSelectedAnswer(answers[prevIndex] || null);
      setShowFeedback(wasAttempted);
      setShowHint(false);
    }
  };

  // Track hint usage
  const handleHintToggle = () => {
    if (!showHint && currentQ) {
      // Track hint usage
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

  const calculateResults = () => {
    if (!videoData) return { correct: 0, incorrect: 0, unattempted: 0 };

    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    videoData.questions.forEach((q, index) => {
      const answer = answers[index];
      if (!answer) {
        unattempted++;
      } else if (answer === q.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    return { correct, incorrect, unattempted };
  };

  // Calculate comprehensive learning behavior metrics
  const calculateLearningBehavior = (): LearningBehaviorMetrics => {
    const totalQuestions = videoData?.questions.length || 1;
    
    // 1. Focus Score (based on video watching)
    const watchPercentage = videoAnalytics.watchPercentage;
    const skippedPenalty = videoAnalytics.skippedVideo ? -20 : 0;
    const pauseScore = Math.max(0, 100 - (videoAnalytics.pauseCount * 5)); // Penalize excessive pausing
    const focusScore = Math.max(0, Math.min(100, (watchPercentage * 0.6) + (pauseScore * 0.4) + skippedPenalty));

    // 2. Consistency Score (based on time distribution across questions)
    const timesSpent = Object.values(questionAnalytics).map(q => q.timeSpent);
    const avgTime = timesSpent.reduce((a, b) => a + b, 0) / totalQuestions;
    const variance = timesSpent.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / totalQuestions;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 100 - (stdDev * 5)); // Lower variance = more consistent

    // 3. Thoughtfulness Score (based on time per question and attempts)
    const hasReasonableTime = timesSpent.filter(t => t >= 5 && t <= 120).length; // 5 sec to 2 min
    const thoughtfulnessScore = (hasReasonableTime / totalQuestions) * 100;

    // 4. Random Clicking Indicator
    const veryQuickAnswers = timesSpent.filter(t => t < 3).length; // < 3 seconds
    const multipleAttempts = Object.values(questionAnalytics).filter(q => q.attempts > 2).length;
    const erraticNavigation = Object.values(questionAnalytics).filter(q => q.navigationPattern.length > 3).length;
    const randomClickingIndicator = Math.min(100, 
      (veryQuickAnswers / totalQuestions) * 40 +
      (multipleAttempts / totalQuestions) * 30 +
      (erraticNavigation / totalQuestions) * 30
    );

    // 5. Hints Utilization
    const hintsUsed = Object.values(questionAnalytics).filter(q => q.hintUsed).length;
    const hintsUtilization = (hintsUsed / totalQuestions) * 100;

    // 6. Overall Learning Score
    const results = calculateResults();
    const accuracyScore = (results.correct / totalQuestions) * 100;
    const completionScore = ((totalQuestions - results.unattempted) / totalQuestions) * 100;
    
    const overallLearningScore = (
      accuracyScore * 0.4 + // 40% weight on correct answers
      focusScore * 0.2 + // 20% weight on video engagement
      thoughtfulnessScore * 0.2 + // 20% weight on time management
      completionScore * 0.1 + // 10% weight on completion
      (100 - randomClickingIndicator) * 0.1 // 10% weight on avoiding random clicking
    );

    return {
      focusScore: Math.round(focusScore),
      consistencyScore: Math.round(consistencyScore),
      thoughtfulnessScore: Math.round(thoughtfulnessScore),
      randomClickingIndicator: Math.round(randomClickingIndicator),
      hintsUtilization: Math.round(hintsUtilization),
      overallLearningScore: Math.round(overallLearningScore),
    };
  };

  const results = calculateResults();
  const totalQuestions = videoData?.questions.length || 0;
  const accuracy = totalQuestions > 0 ? (results.correct / totalQuestions) * 100 : 0;
  const timeTaken = startTime && endTime ? Math.floor((endTime - startTime) / 1000) : 0;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading video...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Video Not Found</h2>
            <p className="text-gray-600 mb-4">The video for this topic is not available.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQ = videoData.questions[currentQuestion];
  const isCorrect = selectedAnswer === currentQ?.correctAnswer;

  // Results View
  if (quizCompleted) {
    const learningBehavior = calculateLearningBehavior();

    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Header />
        <main className="flex-1 py-6 md:py-8">
          <div className="edu-container max-w-7xl">
            {/* Back Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate(`/student/video-questions/${subject}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Topics
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Try Again
              </Button>
            </div>

            {/* Analytics Results Component */}
            <AnalyticsResults
              results={results}
              totalQuestions={totalQuestions}
              accuracy={accuracy}
              timeTaken={timeTaken}
              videoAnalytics={videoAnalytics}
              questionAnalytics={questionAnalytics}
              learningBehavior={learningBehavior}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />
      <main className="flex-1 py-6 md:py-8">
        <div className="edu-container max-w-6xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {!videoEnded ? (
            // Video Player
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-6 w-6" />
                  {videoData.videoTitle}
                </CardTitle>
                {videoData.videoDescription && (
                  <p className="text-purple-100 text-sm">{videoData.videoDescription}</p>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-black">
                  {isYouTube ? (
                    // YouTube iframe player
                    <div className="relative w-full aspect-video">
                      <iframe
                        className="w-full h-full"
                        src={videoData.videoUrl}
                        title={videoData.videoTitle}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    // Direct video player
                    <>
                      <video
                        ref={videoRef}
                        className="w-full aspect-video"
                        src={videoData.videoUrl}
                        onEnded={handleVideoEnd}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                      />

                      {/* Custom Controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <input
                          type="range"
                          min="0"
                          max={duration}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full mb-2"
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-white">
                          <div className="flex items-center gap-4 flex-wrap">
                            <button onClick={togglePlay} className="hover:scale-110 transition">
                              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                            </button>
                            <button onClick={toggleMute} className="hover:scale-110 transition">
                              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </button>
                            <span className="text-sm">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                          </div>
                          <button onClick={toggleFullscreen} className="hover:scale-110 transition">
                            <Maximize className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    {isYouTube 
                      ? "वीडियो देखने के बाद नीचे बटन क्लिक करें" 
                      : "वीडियो समाप्त होने के बाद प्रश्न दिखाई देंगे"}
                  </p>
                  <Button onClick={() => setVideoEnded(true)} variant="outline">
                    Skip to Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Questions
            <div className="space-y-6">
              {/* Progress Card */}
              <Card className="border-2 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Progress:</span>
                      <span className="text-sm font-bold text-purple-600">
                        {currentQuestion + 1} / {totalQuestions}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Answered: {Object.keys(answers).length} / {totalQuestions}
                      </span>
                    </div>
                  </div>
                  <Progress value={((currentQuestion + 1) / totalQuestions) * 100} className="h-2" />
                </CardContent>
              </Card>

              {/* Question Card */}
              <Card className="border-2 border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg">
                      प्रश्न {currentQuestion + 1}
                    </CardTitle>
                    {attemptedQuestions.has(currentQuestion) && (
                      <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                        Answered
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-8 leading-relaxed">{currentQ.question}</h3>

                  {/* Options */}
                  <div className="space-y-3 mb-6">
                    {currentQ.options.map((option, idx) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrectOption = option === currentQ.correctAnswer;
                      let bgColor = "bg-white hover:bg-purple-50 border-gray-200";
                      let textColor = "text-gray-800";

                      if (showFeedback) {
                        if (isSelected && isCorrect) {
                          bgColor = "bg-green-50 border-green-500";
                          textColor = "text-green-800";
                        } else if (isSelected && !isCorrect) {
                          bgColor = "bg-red-50 border-red-500";
                          textColor = "text-red-800";
                        } else if (isCorrectOption) {
                          bgColor = "bg-green-50 border-green-500";
                          textColor = "text-green-800";
                        }
                      } else if (isSelected) {
                        bgColor = "bg-purple-50 border-purple-500";
                        textColor = "text-purple-800";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(option)}
                          disabled={showFeedback}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${bgColor} ${
                            !showFeedback ? "hover:shadow-md hover:scale-[1.01]" : ""
                          } ${showFeedback ? "cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium text-sm">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className={`${textColor} font-medium`}>{option}</span>
                            </div>
                            {showFeedback && isCorrectOption && (
                              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                            )}
                            {showFeedback && isSelected && !isCorrect && (
                              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  {showFeedback && (
                    <div className={`p-4 rounded-lg mb-6 ${isCorrect ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"}`}>
                      <p className={`font-semibold text-lg mb-1 ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                        {isCorrect ? "✅ बिल्कुल सही!" : "❌ गलत उत्तर"}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-700">
                          सही उत्तर: <span className="font-semibold text-green-700">{currentQ.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Hint */}
                  {currentQ.hint && currentQ.hint.text && (
                    <div className="mb-6">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleHintToggle}
                        className="text-amber-600 border-amber-300 hover:bg-amber-50"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        {showHint ? "संकेत छुपाएं" : "संकेत देखें"}
                      </Button>
                      {showHint && (
                        <div className="mt-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-900 leading-relaxed">
                            💡 <span className="font-semibold">संकेत:</span> {currentQ.hint.text}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t-2">
                    <Button 
                      onClick={handlePrevious} 
                      disabled={currentQuestion === 0} 
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:justify-end">
                      {!showFeedback && (
                        <Button 
                          onClick={handleSkip} 
                          variant="ghost"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Skip Question
                        </Button>
                      )}
                      
                      <Button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
                      >
                        {currentQuestion === totalQuestions - 1 ? "Finish Quiz" : "Next"}
                        {currentQuestion !== totalQuestions - 1 && <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />}
                      </Button>
                    </div>
                  </div>

                  {/* Question Status Indicator */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center gap-2 flex-wrap">
                      {videoData.questions.map((_, idx) => {
                        const isCurrentQ = idx === currentQuestion;
                        const isAnswered = answers[idx] !== undefined;
                        const isCorrectAnswer = isAnswered && answers[idx] === videoData.questions[idx].correctAnswer;
                        
                        let statusColor = "bg-gray-200";
                        if (isAnswered) {
                          statusColor = isCorrectAnswer ? "bg-green-500" : "bg-red-500";
                        } else if (isCurrentQ) {
                          statusColor = "bg-purple-500";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setCurrentQuestion(idx);
                              const wasAttempted = attemptedQuestions.has(idx);
                              setSelectedAnswer(answers[idx] || null);
                              setShowFeedback(wasAttempted);
                              setShowHint(false);
                            }}
                            className={`w-8 h-8 rounded-full ${statusColor} ${
                              isCurrentQ ? "ring-4 ring-purple-300" : ""
                            } text-white text-sm font-medium hover:scale-110 transition-transform`}
                            title={`Question ${idx + 1}${isAnswered ? " - Answered" : ""}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                        <span>Current</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span>Correct</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span>Incorrect</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                        <span>Unattempted</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VideoQuizPlayer;
