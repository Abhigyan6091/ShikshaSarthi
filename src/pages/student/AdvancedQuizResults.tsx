import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  Clock, 
  Award,
  BookOpen,
  Volume2,
  Video,
  Puzzle,
  TrendingUp,
  Users,
  Play,
  Pause,
  FastForward,
  Brain,
  Target,
  BarChart3,
  Activity,
  Grid3X3,
  Medal,
  Crown,
  Star,
  Trophy
} from 'lucide-react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;

interface QuizResult {
  quizId: string;
  studentId: string;
  score: {
    correct: number;
    incorrect: number;
    unattempted: number;
    percentage: number | string;
  };
  answers?: any[];
  quizEndTime?: string;  // Add quiz end time
  isPastReport?: boolean;  // Flag to indicate past report viewing
  sectionWise: {
    mcq: { correct: number; incorrect: number; unattempted: number; total: number };
    audio: { correct: number; incorrect: number; unattempted: number; total: number };
    video: { correct: number; incorrect: number; unattempted: number; total: number };
    puzzle: { correct: number; incorrect: number; unattempted: number; total: number };
  };
  allStudentsStats?: {
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    yourRank: number;
  };
  sectionRankings?: {
    mcq: { rank: number; total: number };
    audio: { rank: number; total: number };
    video: { rank: number; total: number };
    puzzle: { rank: number; total: number };
  };
  leaderboard?: Array<{
    studentId: string;
    percentage: string;
    sectionWise: any;
  }>;
}

const AdvancedQuizResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizEnded, setQuizEnded] = useState(false);
  const [timeUntilEnd, setTimeUntilEnd] = useState<string>('');
  const [fetchingComparativeStats, setFetchingComparativeStats] = useState(false);
  const [delayCountdown, setDelayCountdown] = useState<number>(0);

  const resultData = location.state?.results;

  // Check if quiz has ended
  useEffect(() => {
    // If this is a past report, always treat as ended
    if (resultData?.isPastReport) {
      setQuizEnded(true);
      return;
    }

    if (resultData?.quizEndTime) {
      const checkQuizEnd = () => {
        const now = new Date().getTime();
        const endTime = new Date(resultData.quizEndTime).getTime();
        const diff = endTime - now;
        
        if (diff <= 0) {
          setQuizEnded(true);
          setTimeUntilEnd('');
        } else {
          setQuizEnded(false);
          // Calculate time remaining
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          if (hours > 0) {
            setTimeUntilEnd(`${hours}h ${minutes}m ${seconds}s`);
          } else if (minutes > 0) {
            setTimeUntilEnd(`${minutes}m ${seconds}s`);
          } else {
            setTimeUntilEnd(`${seconds}s`);
          }
        }
      };
      
      // Check immediately
      checkQuizEnd();
      
      // Update every second
      const interval = setInterval(checkQuizEnd, 1000);
      
      return () => clearInterval(interval);
    } else {
      // If no end time provided, assume quiz has ended
      setQuizEnded(true);
    }
  }, [resultData?.quizEndTime, resultData?.isPastReport]);

  useEffect(() => {
    if (resultData) {
      processResults();
      // Only fetch comparative stats if quiz has ended
      if (quizEnded) {
        // For past reports, fetch immediately
        if (resultData.isPastReport) {
          fetchComparativeStats();
        } else {
          // For fresh submissions, wait 15 seconds after quiz end to ensure all submissions are in
          setFetchingComparativeStats(true);
          
          // Calculate actual time remaining: (endTime + 15 seconds) - currentTime
          const endTime = new Date(resultData.quizEndTime).getTime();
          const analyticsTime = endTime + 15000; // endTime + 15 seconds
          const now = new Date().getTime();
          const initialDelay = Math.max(0, Math.ceil((analyticsTime - now) / 1000));
          
          setDelayCountdown(initialDelay);
          
          const countdownInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            const remaining = Math.max(0, Math.ceil((analyticsTime - currentTime) / 1000));
            
            setDelayCountdown(remaining);
            
            if (remaining <= 0) {
              clearInterval(countdownInterval);
              fetchComparativeStats();
              setFetchingComparativeStats(false);
            }
          }, 1000);
          
          return () => {
            clearInterval(countdownInterval);
          };
        }
      }
    } else {
      navigate('/student/take-advanced-quiz');
    }
  }, [resultData, quizEnded]);

  const processResults = () => {
    console.log('Processing results:', resultData);
    
    // Ensure percentage is a number
    const percentage = typeof resultData.score.percentage === 'string' 
      ? parseFloat(resultData.score.percentage) 
      : resultData.score.percentage;

    // Process section-wise results
    const sectionWise = {
      mcq: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
      audio: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
      video: { correct: 0, incorrect: 0, unattempted: 0, total: 0 },
      puzzle: { correct: 0, incorrect: 0, unattempted: 0, total: 0 }
    };

    // Check if answers exist
    if (resultData.answers && Array.isArray(resultData.answers)) {
      resultData.answers.forEach((answer: any) => {
        const type = answer.questionType as 'mcq' | 'audio' | 'video' | 'puzzle';
        if (sectionWise[type]) {
          sectionWise[type].total++;
          if (answer.selectedAnswer === null || answer.selectedAnswer === undefined) {
            sectionWise[type].unattempted++;
          } else if (answer.isCorrect) {
            sectionWise[type].correct++;
          } else {
            sectionWise[type].incorrect++;
          }
        }
      });
    }

    setResults({
      quizId: resultData.quizId,
      studentId: resultData.studentId,
      score: {
        correct: resultData.score.correct,
        incorrect: resultData.score.incorrect,
        unattempted: resultData.score.unattempted,
        percentage: percentage
      },
      answers: resultData.answers,
      sectionWise
    });
    
    setLoading(false);
  };

  const fetchComparativeStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/quizzes/analytics/${resultData.quizId}`);
      const analytics = response.data;

      console.log('Analytics data:', analytics);

      // Check if studentReports exists and is an array
      if (!analytics.studentReports || !Array.isArray(analytics.studentReports) || analytics.studentReports.length === 0) {
        console.log('No student reports available for comparative stats');
        return;
      }

      // Calculate overall ranking
      const scores = analytics.studentReports.map((r: any) => parseFloat(r.percentage));
      const percentage = typeof resultData.score.percentage === 'string' 
        ? parseFloat(resultData.score.percentage) 
        : resultData.score.percentage;
      
      const yourScore = percentage;
      const sortedScores = [...scores].sort((a, b) => b - a);
      const yourRank = sortedScores.findIndex(score => Math.abs(score - yourScore) < 0.01) + 1;
      const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

      // Calculate section-wise rankings
      const sectionRankings = {
        mcq: { rank: 0, total: 0 },
        audio: { rank: 0, total: 0 },
        video: { rank: 0, total: 0 },
        puzzle: { rank: 0, total: 0 }
      };

      // Process section rankings
      if (analytics.sectionRankings) {
        ['mcq', 'audio', 'video', 'puzzle'].forEach(section => {
          const ranking = analytics.sectionRankings[section];
          if (ranking && ranking.length > 0) {
            const myRank = ranking.findIndex((r: any) => r.studentId === resultData.studentId) + 1;
            sectionRankings[section as keyof typeof sectionRankings] = {
              rank: myRank > 0 ? myRank : ranking.length,
              total: ranking.length
            };
          }
        });
      }

      setResults(prev => prev ? {
        ...prev,
        allStudentsStats: {
          totalAttempts: analytics.studentReports.length,
          averageScore: avgScore,
          highestScore: Math.max(...scores),
          lowestScore: Math.min(...scores),
          yourRank: yourRank > 0 ? yourRank : scores.length
        },
        sectionRankings,
        leaderboard: analytics.studentReports.slice(0, 10) // Top 10
      } : null);
    } catch (error: any) {
      console.error('Error fetching comparative stats:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  // Helper function to safely get percentage as number
  const getPercentage = (): number => {
    if (!results) return 0;
    return typeof results.score.percentage === 'number' 
      ? results.score.percentage 
      : parseFloat(results.score.percentage);
  };

  // Calculate video-specific analytics based on accuracy and time spent
  const calculateVideoAnalytics = () => {
    if (!results?.answers) return null;
    
    const videoQuestions = results.answers.filter(a => a.questionType === 'video');
    if (videoQuestions.length === 0) return null;

    let totalTimeSpent = 0;
    let correctAnswers = 0;
    let veryQuickAnswers = 0; // Less than 10 seconds
    let thoughtfulAnswers = 0; // More than 20 seconds
    let moderateAnswers = 0; // Between 10-20 seconds

    videoQuestions.forEach(q => {
      const timeSpent = q.timeSpent || 0; // Handle undefined/null timeSpent
      totalTimeSpent += timeSpent;
      if (q.isCorrect) correctAnswers++;
      
      if (timeSpent < 10) veryQuickAnswers++;
      else if (timeSpent >= 20) thoughtfulAnswers++;
      else moderateAnswers++;
    });

    // Prevent division by zero
    const avgTimeSpent = videoQuestions.length > 0 ? totalTimeSpent / videoQuestions.length : 0;
    const accuracy = videoQuestions.length > 0 ? (correctAnswers / videoQuestions.length) * 100 : 0;

    // Determine learning behavior based on accuracy and time spent
    let behaviorCategory = '';
    let behaviorDescription = '';
    let behaviorIcon = '';
    
    // Excellent Performance: High accuracy + Good time management
    if (accuracy >= 75 && avgTimeSpent >= 15) {
      behaviorCategory = 'उत्कृष्ट प्रदर्शन';
      behaviorDescription = `आपने ${accuracy.toFixed(0)}% सटीकता के साथ शानदार प्रदर्शन किया। प्रति प्रश्न औसतन ${avgTimeSpent.toFixed(0)} सेकंड का समय देकर आपने सोच-समझकर उत्तर दिए। यह दर्शाता है कि आप वीडियो को ध्यान से देखते हैं और समझकर उत्तर देते हैं। बेहतरीन काम!`;
      behaviorIcon = '🌟';
    } 
    // Good Performance: Decent accuracy with reasonable time
    else if (accuracy >= 60 && avgTimeSpent >= 10) {
      behaviorCategory = 'अच्छा प्रदर्शन';
      behaviorDescription = `${accuracy.toFixed(0)}% सटीकता अच्छी है। आप प्रति प्रश्न ${avgTimeSpent.toFixed(0)} सेकंड का समय ले रहे हैं जो उचित है। थोड़ा और ध्यान देने से आप उत्कृष्ट स्तर पर पहुंच सकते हैं। वीडियो के महत्वपूर्ण हिस्सों पर फोकस करें।`;
      behaviorIcon = '✅';
    }
    // Quick but accurate: High accuracy but very fast
    else if (accuracy >= 70 && avgTimeSpent < 10) {
      behaviorCategory = 'तेज़ और सटीक';
      behaviorDescription = `आप बहुत जल्दी उत्तर दे रहे हैं (औसत ${avgTimeSpent.toFixed(0)} सेकंड) लेकिन ${accuracy.toFixed(0)}% सटीकता अच्छी है। यह दिखाता है कि आप विषय को अच्छे से जानते हैं। हालांकि, थोड़ा अधिक समय लेने से और बेहतर परिणाम मिल सकते हैं।`;
      behaviorIcon = '⚡';
    }
    // Needs more focus: Low accuracy despite spending time
    else if (accuracy < 50 && avgTimeSpent >= 15) {
      behaviorCategory = 'ध्यान केंद्रित करें';
      behaviorDescription = `आप प्रति प्रश्न ${avgTimeSpent.toFixed(0)} सेकंड का अच्छा समय दे रहे हैं, लेकिन ${accuracy.toFixed(0)}% सटीकता में सुधार की जरूरत है। वीडियो के मुख्य बिंदुओं पर अधिक ध्यान दें। यदि कोई भाग समझ न आए तो उसे दोबारा देखें।`;
      behaviorIcon = '🎯';
    }
    // Rushing: Both low accuracy and low time
    else if (accuracy < 50 && avgTimeSpent < 10) {
      behaviorCategory = 'जल्दबाजी में सुधार करें';
      behaviorDescription = `${accuracy.toFixed(0)}% सटीकता और औसत ${avgTimeSpent.toFixed(0)} सेकंड का समय दर्शाता है कि आप बहुत जल्दी में हैं। वीडियो को पूरा देखें और प्रश्नों को ध्यान से पढ़ें। धैर्य रखें - गुणवत्ता गति से अधिक महत्वपूर्ण है।`;
      behaviorIcon = '⏱️';
    }
    // Average performance
    else {
      behaviorCategory = 'संतोषजनक प्रयास';
      behaviorDescription = `${accuracy.toFixed(0)}% सटीकता और ${avgTimeSpent.toFixed(0)} सेकंड प्रति प्रश्न एक अच्छी शुरुआत है। नियमित अभ्यास से आप बेहतर हो सकते हैं। वीडियो के महत्वपूर्ण भागों को नोट करें और ध्यान से सुनें।`;
      behaviorIcon = '📈';
    }

    // Additional insights based on answer patterns
    const quickAnswerRatio = veryQuickAnswers / videoQuestions.length;
    const thoughtfulRatio = thoughtfulAnswers / videoQuestions.length;
    
    let additionalInsight = '';
    if (quickAnswerRatio > 0.6) {
      additionalInsight = ' आप अधिकतर प्रश्नों का उत्तर जल्दी दे रहे हैं - वीडियो को पूरा देखने पर विचार करें।';
    } else if (thoughtfulRatio > 0.6) {
      additionalInsight = ' आप प्रत्येक प्रश्न पर अच्छा समय दे रहे हैं - यह सीखने का सही तरीका है।';
    }

    return {
      totalVideoQuestions: videoQuestions.length,
      avgTimeSpent,
      accuracy,
      correctAnswers,
      veryQuickAnswers,
      thoughtfulAnswers,
      moderateAnswers,
      behaviorCategory,
      behaviorDescription: behaviorDescription + additionalInsight,
      behaviorIcon
    };
  };

  const videoAnalytics = calculateVideoAnalytics();

  if (loading || !results) {
    return (
      <div className="container mx-auto p-3 sm:p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing results...</p>
        </div>
      </div>
    );
  }

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'mcq': return <BookOpen className="h-5 w-5" />;
      case 'audio': return <Volume2 className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'puzzle': return <Puzzle className="h-5 w-5" />;
      default: return null;
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'mcq': return 'from-blue-500 to-cyan-500';
      case 'audio': return 'from-green-500 to-emerald-500';
      case 'video': return 'from-purple-500 to-pink-500';
      case 'puzzle': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const sectionRankingStyles = {
    mcq: {
      card: 'border-blue-200 bg-blue-50',
      icon: 'text-blue-600',
      score: 'text-blue-600'
    },
    audio: {
      card: 'border-green-200 bg-green-50',
      icon: 'text-green-600',
      score: 'text-green-600'
    },
    video: {
      card: 'border-purple-200 bg-purple-50',
      icon: 'text-purple-600',
      score: 'text-purple-600'
    },
    puzzle: {
      card: 'border-orange-200 bg-orange-50',
      icon: 'text-orange-600',
      score: 'text-orange-600'
    }
  } as const;

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-6xl">
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-2xl sm:text-3xl flex flex-col sm:flex-row sm:items-center gap-3">
            <Award className="h-7 w-7 sm:h-8 sm:w-8" />
            Quiz Results
          </CardTitle>
          <p className="text-blue-100">Quiz ID: {results.quizId}</p>
        </CardHeader>
      </Card>

      {/* Overall Score Card */}
      <Card className="mb-6 border-2 border-blue-200">
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">
                {getPercentage().toFixed(1)}%
              </div>
              <p className="text-gray-600">Score</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-2xl sm:text-3xl font-bold text-green-600">{results.score.correct}</span>
              </div>
              <p className="text-gray-600">Correct</p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="h-6 w-6 text-red-600" />
                <span className="text-2xl sm:text-3xl font-bold text-red-600">{results.score.incorrect}</span>
              </div>
              <p className="text-gray-600">Incorrect</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MinusCircle className="h-6 w-6 text-gray-600" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-600">{results.score.unattempted}</span>
              </div>
              <p className="text-gray-600">Unattempted</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section-wise Results */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Section-wise Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(results.sectionWise).map(([type, stats]) => {
            if (stats.total === 0) return null;
            
            const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
            
            return (
              <div key={type} className="border rounded-lg p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getSectionColor(type)} text-white`}>
                      {getSectionIcon(type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg capitalize">{type} Questions</h3>
                      <p className="text-sm text-gray-600">{stats.total} questions</p>
                    </div>
                  </div>
                  <Badge className="text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 self-start sm:self-auto">
                    {percentage.toFixed(0)}%
                  </Badge>
                </div>

                <Progress value={percentage} className="mb-3" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{stats.correct}</span>
                    <span className="text-gray-600">Correct</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="font-semibold">{stats.incorrect}</span>
                    <span className="text-gray-600">Incorrect</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MinusCircle className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold">{stats.unattempted}</span>
                    <span className="text-gray-600">Skipped</span>
                  </div>
                </div>

                {/* Video Analysis Accordion */}
                {type === 'video' && results.answers && stats.total > 0 && videoAnalytics && (
                  <Accordion type="single" collapsible className="mt-4">
                    {/* Panel 1: Video विश्लेषण और स्कोर */}
                    <AccordionItem value="video-analysis" className="border border-purple-200 rounded-lg px-3 bg-purple-50/30 mb-3">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-semibold text-gray-900">वीडियो विश्लेषण और स्कोर</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <div className="space-y-4 mt-2">
                          {/* Score Cards - Only 2 metrics */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border-2 border-purple-100 bg-purple-50/50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-semibold text-gray-600">सटीकता (Accuracy)</span>
                              </div>
                              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                                {videoAnalytics.accuracy.toFixed(0)}%
                              </div>
                              <p className="text-xs text-gray-600 mt-2">
                                {videoAnalytics.correctAnswers}/{videoAnalytics.totalVideoQuestions} सही उत्तर
                              </p>
                            </div>

                            <div className="border-2 border-green-100 bg-green-50/50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-semibold text-gray-600">औसत समय (Avg Time)</span>
                              </div>
                              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                                {!isNaN(videoAnalytics.avgTimeSpent) && isFinite(videoAnalytics.avgTimeSpent) 
                                  ? videoAnalytics.avgTimeSpent.toFixed(0) 
                                  : '0'}s
                              </div>
                              <p className="text-xs text-gray-600 mt-2">प्रति प्रश्न</p>
                            </div>
                          </div>

                          {/* Overall Analysis */}
                          <div className="p-4 rounded-lg border-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
                            <div className="flex flex-col sm:flex-row items-start gap-3">
                              <div className="text-2xl sm:text-3xl">{videoAnalytics.behaviorIcon}</div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-2 text-base">
                                  {videoAnalytics.behaviorCategory}
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {videoAnalytics.behaviorDescription}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Panel 2: प्रश्न, उत्तर और हल */}
                    <AccordionItem value="video-questions" className="border border-purple-200 rounded-lg px-3 bg-purple-50/30">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-semibold text-gray-900">प्रश्न, उत्तर और हल</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        <div className="space-y-4 mt-2">
                          {results.answers?.filter(a => a.questionType === 'video').map((answer, index) => {
                            // Use data directly from answer object (included during quiz submission)
                            const questionText = answer.questionText || 'प्रश्न पाठ उपलब्ध नहीं';
                            const options = answer.options || [];
                            const correctAnswer = answer.correctAnswer;
                            const solution = answer.solution;
                            
                            console.log('Video Question:', {
                              questionId: answer.questionId,
                              hasQuestionText: !!answer.questionText,
                              hasOptions: !!answer.options,
                              optionsLength: options.length,
                              correctAnswer: correctAnswer,
                              hasSolution: !!solution,
                              solutionType: typeof solution,
                              solutionIsString: typeof solution === 'string',
                              solutionIsObject: typeof solution === 'object',
                              solutionHasText: solution && typeof solution === 'object' ? !!solution.text : false,
                              solutionData: solution
                            });
                            
                            return (
                            <div 
                              key={answer.questionId}
                              className="border-2 border-purple-200 rounded-lg overflow-hidden bg-white"
                            >
                              {/* Question Header with Purple Background */}
                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold">प्रश्न {index + 1}</span>
                                  <Badge className="bg-white/20 text-white border-white/30">
                                    {answer.isCorrect ? 'Answered' : answer.selectedAnswer === null ? 'Skipped' : 'Answered'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-sm self-start sm:self-auto">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{answer.timeSpent}s</span>
                                </div>
                              </div>

                              {/* Question Text */}
                              <div className="p-4">
                                <p className="text-base font-medium text-gray-800 mb-4">
                                  {questionText}
                                </p>

                                {/* Options - Only show if options exist */}
                                {options.length > 0 ? (
                                  <div className="space-y-2 mb-4">
                                    {options.map((option: string, optIndex: number) => {
                                      const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D
                                      const isSelected = answer.selectedAnswer === option;
                                      const isCorrect = correctAnswer === option;
                                      
                                      return (
                                        <div
                                          key={optIndex}
                                          className={`flex items-start sm:items-center gap-3 p-3 rounded-lg border-2 ${
                                            isCorrect
                                              ? 'bg-green-50 border-green-300'
                                              : isSelected && !answer.isCorrect
                                              ? 'bg-red-50 border-red-300'
                                              : 'bg-gray-50 border-gray-200'
                                          }`}
                                        >
                                          <div className={`font-bold text-sm min-w-[24px] ${
                                            isCorrect ? 'text-green-700' :
                                            isSelected && !answer.isCorrect ? 'text-red-700' :
                                            'text-gray-700'
                                          }`}>
                                            {optionLabel}
                                          </div>
                                          <div className={`flex-1 text-sm ${
                                            isCorrect ? 'text-green-900 font-medium' :
                                            isSelected && !answer.isCorrect ? 'text-red-900 font-medium' :
                                            'text-gray-700'
                                          }`}>
                                            {option}
                                          </div>
                                          {isCorrect && (
                                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                          )}
                                          {isSelected && !answer.isCorrect && (
                                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                    ⚠️ विकल्प उपलब्ध नहीं हैं
                                  </div>
                                )}

                                {/* Wrong Answer Section */}
                                {!answer.isCorrect && answer.selectedAnswer !== null && (
                                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-3">
                                    <div className="flex items-start gap-2">
                                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <div className="font-bold text-red-900 mb-1">गलत उत्तर</div>
                                        <div className="text-sm text-red-800">
                                          सही उत्तर: <span className="font-semibold text-green-700">{correctAnswer}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Skipped Section */}
                                {answer.selectedAnswer === null && (
                                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 mb-3">
                                    <div className="flex items-start gap-2">
                                      <MinusCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <div className="font-bold text-gray-900 mb-1">अप्रयासित</div>
                                        <div className="text-sm text-gray-700">
                                          सही उत्तर: <span className="font-semibold text-green-700">{correctAnswer}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Solution Section - Blue/Green Background - Always Show */}
                                <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                                        <span className="text-sm">📝</span>
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-bold text-blue-900 mb-2 text-base flex items-center gap-2">
                                        <span>हल (Solution)</span>
                                      </div>
                                      
                                      {solution ? (
                                        <>
                                          {/* Solution Text - Full explanation */}
                                          {/* Handle both string format and object format */}
                                          {(typeof solution === 'string' ? solution : solution.text) && (
                                            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                                              {typeof solution === 'string' ? solution : solution.text}
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <div className="text-sm text-gray-600 italic">
                                          इस प्रश्न के लिए हल उपलब्ध नहीं है। (Only वर्गमूल and घनमूल topics have solutions)
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )})}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                {/* Puzzle Analysis Accordion */}
                {type === 'puzzle' && results.answers && stats.total > 0 && (
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="puzzle-analysis" className="border border-orange-200 rounded-lg px-3 bg-orange-50/30">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-semibold text-gray-900">Puzzle Analysis & Scores</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3">
                        {(() => {
                          const puzzleAnswers = results.answers?.filter(a => a.questionType === 'puzzle') || [];
                          const memoryMatchAnswers = puzzleAnswers.filter(a => a.puzzleData?.puzzleType === 'memory_match');
                          const matchPiecesAnswers = puzzleAnswers.filter(a => a.puzzleData?.puzzleType === 'match_pieces');

                          const calculatePuzzleStats = (answers: any[], puzzleName: string) => {
                            if (answers.length === 0) return null;
                            const avgScore = Math.round(answers.reduce((sum, a) => sum + (a.puzzleData?.score || 0), 0) / answers.length);
                            const bestScore = Math.max(...answers.map(a => a.puzzleData?.score || 0));
                            const completed = answers.filter(a => a.puzzleData?.endReason === 'COMPLETED').length;
                            return { avgScore, bestScore, completed, total: answers.length, puzzleName };
                          };

                          const memoryMatchStats = calculatePuzzleStats(memoryMatchAnswers, 'मेमोरी मैच');
                          const matchPiecesStats = calculatePuzzleStats(matchPiecesAnswers, 'मैच पीसेज़');

                          const getScoreColor = (score: number) => {
                            if (score >= 85) return 'text-green-600';
                            if (score >= 70) return 'text-blue-600';
                            if (score >= 55) return 'text-yellow-600';
                            if (score >= 40) return 'text-orange-600';
                            return 'text-red-600';
                          };

                          const getPerformanceText = (score: number) => {
                            if (score >= 85) return 'उत्कृष्ट';
                            if (score >= 70) return 'अच्छा';
                            if (score >= 55) return 'औसत';
                            return 'सुधार की आवश्यकता';
                          };

                          const totalPuzzleScore = puzzleAnswers.reduce((sum, a) => sum + (a.puzzleData?.score || 0), 0);
                          const avgPuzzleScore = puzzleAnswers.length > 0 ? Math.round(totalPuzzleScore / puzzleAnswers.length) : 0;

                          return (
                            <div className="space-y-4 mt-2">
                              {/* Individual Puzzle Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {memoryMatchStats && (
                                  <div className="border-2 border-indigo-100 bg-indigo-50/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Brain className="h-4 w-4 text-indigo-600" />
                                      <h4 className="text-sm font-semibold">{memoryMatchStats.puzzleName}</h4>
                                    </div>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">औसत स्कोर:</span>
                                        <span className={`text-lg font-bold ${getScoreColor(memoryMatchStats.avgScore)}`}>
                                          {memoryMatchStats.avgScore}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">सर्वोत्तम:</span>
                                        <span className="text-sm font-semibold text-green-600">{memoryMatchStats.bestScore}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">पूर्ण:</span>
                                        <span className="text-xs font-medium">{memoryMatchStats.completed}/{memoryMatchStats.total}</span>
                                      </div>
                                      <p className="text-xs text-gray-700 pt-1 border-t border-indigo-200">
                                        {getPerformanceText(memoryMatchStats.avgScore)} प्रदर्शन
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {matchPiecesStats && (
                                  <div className="border-2 border-cyan-100 bg-cyan-50/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Grid3X3 className="h-4 w-4 text-cyan-600" />
                                      <h4 className="text-sm font-semibold">{matchPiecesStats.puzzleName}</h4>
                                    </div>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">औसत स्कोर:</span>
                                        <span className={`text-lg font-bold ${getScoreColor(matchPiecesStats.avgScore)}`}>
                                          {matchPiecesStats.avgScore}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">सर्वोत्तम:</span>
                                        <span className="text-sm font-semibold text-green-600">{matchPiecesStats.bestScore}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">पूर्ण:</span>
                                        <span className="text-xs font-medium">{matchPiecesStats.completed}/{matchPiecesStats.total}</span>
                                      </div>
                                      <p className="text-xs text-gray-700 pt-1 border-t border-cyan-200">
                                        {getPerformanceText(matchPiecesStats.avgScore)} प्रदर्शन
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Combined Analysis */}
                              <div className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Activity className="h-4 w-4 text-purple-600" />
                                  <h4 className="text-sm font-semibold">संयुक्त पहेली विश्लेषण</h4>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-700">कुल औसत स्कोर:</span>
                                  <span className={`text-xl font-bold ${getScoreColor(avgPuzzleScore)}`}>
                                    {avgPuzzleScore}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  आपका समग्र पहेली प्रदर्शन {getPerformanceText(avgPuzzleScore)} है। {puzzleAnswers.filter(a => a.puzzleData?.endReason === 'COMPLETED').length}/{puzzleAnswers.length} पहेलियाँ पूरी कीं। निरंतर अभ्यास से और सुधार हो सकता है।
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Timer Notice - Show if quiz hasn't ended */}
      {!quizEnded && timeUntilEnd && (
        <Card className="mb-6 border-2 border-orange-300 bg-orange-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h3 className="text-lg sm:text-xl font-bold text-orange-900 mb-2">
                Quiz Still In Progress
              </h3>
              <p className="text-gray-700 mb-3">
                Comparative analytics will be available after the quiz ends.
              </p>
              <div className="flex flex-col sm:inline-flex sm:flex-row sm:items-center gap-2 bg-white px-4 py-2 rounded-lg border border-orange-300">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-base sm:text-lg font-semibold text-orange-900 text-center">
                  Time until quiz ends: {timeUntilEnd}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Refresh the page after the quiz ends to see comparative stats and leaderboard
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Analytics - Show during 15 second delay */}
      {quizEnded && fetchingComparativeStats && delayCountdown > 0 && (
        <Card className="mb-6 border-2 border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-3"></div>
              <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">
                Preparing Comparative Analytics
              </h3>
              <p className="text-gray-700 mb-3">
                Waiting for all students to submit their answers for accurate rankings...
              </p>
              <div className="flex flex-col sm:inline-flex sm:flex-row sm:items-center gap-2 bg-white px-6 py-3 rounded-lg border border-blue-300 shadow-sm">
                <Clock className="h-6 w-6 text-blue-600 animate-pulse" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {delayCountdown}s
                  </div>
                  <div className="text-xs text-gray-600">
                    remaining
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                This ensures accurate rankings and statistics based on all submissions
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparative Analysis - Only show if quiz has ended and delay is over */}
      {quizEnded && !fetchingComparativeStats && results.allStudentsStats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Comparative Analysis
            </CardTitle>
            <p className="text-sm text-gray-600">How you performed compared to other students</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  #{results.allStudentsStats.yourRank}
                </div>
                <p className="text-sm text-gray-600">Your Rank</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {results.allStudentsStats.totalAttempts}
                </div>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {results.allStudentsStats.averageScore.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Class Average</p>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {results.allStudentsStats.highestScore.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Highest Score</p>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {results.allStudentsStats.lowestScore.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Lowest Score</p>
              </div>
            </div>

            {/* Performance Message */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <p className="text-center font-semibold">
                {getPercentage() >= results.allStudentsStats.averageScore
                  ? `🎉 Great job! You scored above the class average!`
                  : `Keep practicing! You can improve your score.`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section-wise Rankings */}
      {results?.sectionRankings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-purple-600" />
              Section-wise Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'mcq', icon: BookOpen, label: 'MCQ' },
                { key: 'audio', icon: Volume2, label: 'Audio' },
                { key: 'video', icon: Video, label: 'Video' },
                { key: 'puzzle', icon: Puzzle, label: 'Puzzle' }
              ].map(section => {
                const ranking = results.sectionRankings?.[section.key as keyof typeof results.sectionRankings];
                const sectionData = results.sectionWise[section.key as keyof typeof results.sectionWise];
                const sectionPercentage = sectionData.total > 0 
                  ? ((sectionData.correct / sectionData.total) * 100).toFixed(1)
                  : '0';
                const sectionStyle = sectionRankingStyles[section.key as keyof typeof sectionRankingStyles];
                
                if (!ranking || ranking.total === 0) return null;

                return (
                  <div key={section.key} className={`p-4 rounded-lg border-2 ${sectionStyle.card}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <section.icon className={`h-5 w-5 ${sectionStyle.icon}`} />
                      <h3 className="font-semibold text-gray-900">{section.label}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Your Rank:</span>
                        <div className="flex items-center gap-1">
                          {ranking.rank === 1 && <Crown className="h-4 w-4 text-yellow-500" />}
                          {ranking.rank === 2 && <Medal className="h-4 w-4 text-gray-400" />}
                          {ranking.rank === 3 && <Medal className="h-4 w-4 text-orange-400" />}
                          <span className="font-bold text-lg">#{ranking.rank}</span>
                          <span className="text-sm text-gray-500">/ {ranking.total}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Score:</span>
                        <span className={`font-bold ${sectionStyle.score}`}>{sectionPercentage}%</span>
                      </div>
                      <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                        {sectionData.correct}/{sectionData.total} correct
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard - Only show if quiz has ended and delay is over */}
      {quizEnded && !fetchingComparativeStats && results?.leaderboard && results.leaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performers Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.leaderboard.map((student, index) => {
                const isCurrentStudent = student.studentId === results.studentId;
                return (
                  <div 
                    key={student.studentId}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-lg ${
                      isCurrentStudent 
                        ? 'bg-blue-100 border-2 border-blue-400' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 sm:w-12 self-start sm:self-auto">
                      {index === 0 && <Crown className="h-6 w-6 text-yellow-500" />}
                      {index === 1 && <Medal className="h-6 w-6 text-gray-400" />}
                      {index === 2 && <Medal className="h-6 w-6 text-orange-400" />}
                      {index > 2 && (
                        <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold ${isCurrentStudent ? 'text-blue-700' : 'text-gray-900'}`}>
                          {isCurrentStudent ? 'You' : student.studentId}
                        </span>
                        {isCurrentStudent && (
                          <Badge variant="default" className="bg-blue-500">You</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <div className="font-bold text-lg">{student.percentage}%</div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                        {student.sectionWise && (
                          <>
                            <span title="MCQ">📝 {((student.sectionWise.mcq.correct / (student.sectionWise.mcq.total || 1)) * 100).toFixed(0)}%</span>
                            <span title="Audio">🔊 {((student.sectionWise.audio.correct / (student.sectionWise.audio.total || 1)) * 100).toFixed(0)}%</span>
                            <span title="Video">📹 {((student.sectionWise.video.correct / (student.sectionWise.video.total || 1)) * 100).toFixed(0)}%</span>
                            <span title="Puzzle">🧩 {((student.sectionWise.puzzle.correct / (student.sectionWise.puzzle.total || 1)) * 100).toFixed(0)}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Show current student if not in top 10 */}
            {results.allStudentsStats && results.allStudentsStats.yourRank > 10 && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-lg bg-blue-100 border-2 border-blue-400">
                  <div className="flex items-center justify-center w-10 sm:w-12 self-start sm:self-auto">
                    <span className="text-lg font-bold text-blue-700">
                      #{results.allStudentsStats.yourRank}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-blue-700">You</span>
                    <Badge variant="default" className="ml-2 bg-blue-500">Your Rank</Badge>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="font-bold text-lg text-blue-700">{getPercentage().toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparative Performance Chart */}
      {results?.sectionWise && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Your Section-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    section: 'MCQ',
                    score: results.sectionWise.mcq.total > 0 
                      ? ((results.sectionWise.mcq.correct / results.sectionWise.mcq.total) * 100).toFixed(1)
                      : 0,
                    total: results.sectionWise.mcq.total
                  },
                  {
                    section: 'Audio',
                    score: results.sectionWise.audio.total > 0 
                      ? ((results.sectionWise.audio.correct / results.sectionWise.audio.total) * 100).toFixed(1)
                      : 0,
                    total: results.sectionWise.audio.total
                  },
                  {
                    section: 'Video',
                    score: results.sectionWise.video.total > 0 
                      ? ((results.sectionWise.video.correct / results.sectionWise.video.total) * 100).toFixed(1)
                      : 0,
                    total: results.sectionWise.video.total
                  },
                  {
                    section: 'Puzzle',
                    score: results.sectionWise.puzzle.total > 0 
                      ? ((results.sectionWise.puzzle.correct / results.sectionWise.puzzle.total) * 100).toFixed(1)
                      : 0,
                    total: results.sectionWise.puzzle.total
                  }
                ].filter(item => item.total > 0)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="section" />
                <YAxis domain={[0, 100]} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" name="Your Score (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => navigate('/student/dashboard')} 
          className="flex-1 w-full"
          size="lg"
        >
          Back to Dashboard
        </Button>
        <Button 
          onClick={() => navigate('/student/take-advanced-quiz')} 
          variant="outline"
          className="flex-1 w-full"
          size="lg"
        >
          Take Another Quiz
        </Button>
      </div>
    </div>
  );
};

export default AdvancedQuizResults;
