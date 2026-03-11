import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Brain,
  Zap,
  Award,
  CheckCircle2,
  XCircle,
  Eye,
  Lightbulb,
  ArrowLeft,
  BarChart3,
  AlertCircle,
  ThumbsUp,
  Flame,
  Timer,
} from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

interface DetailedQuestion {
  questionIndex: number;
  questionId: string;
  timeSpent: number;
  hintUsed: boolean;
  answerChangeCount: number;
  isCorrect: boolean;
  selectedAnswer: number;
  question: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: string;
  };
}

interface TestResults {
  testId: string;
  module: string;
  startTime: string;
  endTime: string;
  totalTimeTaken: number;
  totalQuestions: number;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  percentage: number;
  difficultyBreakdown: {
    easy: { attempted: number; correct: number; accuracy: number };
    medium: { attempted: number; correct: number; accuracy: number };
    hard: { attempted: number; correct: number; accuracy: number };
  };
  speedAnalytics: {
    averageTimePerQuestion: number;
    fastestQuestion: number;
    slowestQuestion: number;
    questionsAnsweredUnderTime: number;
    questionsAnsweredOverTime: number;
  };
  learningBehavior: {
    focusScore: number;
    consistencyScore: number;
    thoughtfulnessScore: number;
    randomClickingIndicator: number;
    hintsUtilization: number;
    overallLearningScore: number;
  };
  strengthAreas: string[];
  weaknessAreas: string[];
  recommendations: string[];
  detailedResults: DetailedQuestion[];
}

const MATTestResults: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailedView, setShowDetailedView] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [testId]);

  const fetchResults = async () => {
    try {
      console.log('Fetching results for testId:', testId);
      const response = await axios.get(`${API_URL}/api/mat-test/results/${testId}`);
      console.log('Results received:', response.data);
      setResults(response.data);
      setLoading(false);
    } catch (error: any) {
      console.error('परिणाम प्राप्त करने में त्रुटि:', error);
      console.error('Error details:', error.response?.data);
      alert(`त्रुटि: ${error.response?.data?.error || error.message || 'परिणाम लोड करने में विफल'}`);
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">परिणाम लोड हो रहे हैं...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">परिणाम नहीं मिले</p>
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

  // Prepare chart data
  const scoreData = [
    { name: 'सही', value: results.correctAnswers, color: '#10b981' },
    { name: 'गलत', value: results.incorrectAnswers, color: '#ef4444' },
    { name: 'अनुत्तरित', value: results.unattempted, color: '#6b7280' },
  ];

  const difficultyData = [
    { 
      difficulty: 'आसान', 
      प्रयास: results.difficultyBreakdown.easy.attempted,
      सही: results.difficultyBreakdown.easy.correct,
      सटीकता: results.difficultyBreakdown.easy.accuracy
    },
    { 
      difficulty: 'मध्यम', 
      प्रयास: results.difficultyBreakdown.medium.attempted,
      सही: results.difficultyBreakdown.medium.correct,
      सटीकता: results.difficultyBreakdown.medium.accuracy
    },
    { 
      difficulty: 'कठिन', 
      प्रयास: results.difficultyBreakdown.hard.attempted,
      सही: results.difficultyBreakdown.hard.correct,
      सटीकता: results.difficultyBreakdown.hard.accuracy
    },
  ];

  const learningBehaviorData = [
    { subject: 'ध्यान', value: results.learningBehavior.focusScore, fullMark: 100 },
    { subject: 'निरंतरता', value: results.learningBehavior.consistencyScore, fullMark: 100 },
    { subject: 'विचारशीलता', value: results.learningBehavior.thoughtfulnessScore, fullMark: 100 },
    { subject: 'संकेत उपयोग', value: results.learningBehavior.hintsUtilization, fullMark: 100 },
    { subject: 'समग्र', value: results.learningBehavior.overallLearningScore, fullMark: 100 },
  ];

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 90) return { text: 'उत्कृष्ट', color: 'bg-green-100 text-green-700 border-green-300' };
    if (percentage >= 75) return { text: 'बहुत अच्छा', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    if (percentage >= 60) return { text: 'अच्छा', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' };
    if (percentage >= 40) return { text: 'औसत', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    return { text: 'सुधार चाहिए', color: 'bg-red-100 text-red-700 border-red-300' };
  };

  const performanceBadge = getPerformanceBadge(results.percentage);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="edu-container max-w-7xl">
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

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  टेस्ट परिणाम
                </h1>
                <p className="text-gray-600">{results.module}</p>
              </div>
              <Badge className={`${performanceBadge.color} border text-lg px-4 py-2`}>
                {performanceBadge.text}
              </Badge>
            </div>
          </div>

          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6 text-center">
                <Trophy className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">स्कोर</p>
                <p className={`text-4xl font-bold ${getPerformanceColor(results.percentage)}`}>
                  {results.percentage}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {results.correctAnswers}/{results.totalQuestions} सही
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">सही उत्तर</p>
                <p className="text-4xl font-bold text-green-600">{results.correctAnswers}</p>
                <Progress value={(results.correctAnswers / results.totalQuestions) * 100} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="pt-6 text-center">
                <XCircle className="h-10 w-10 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">गलत उत्तर</p>
                <p className="text-4xl font-bold text-red-600">{results.incorrectAnswers}</p>
                <Progress value={(results.incorrectAnswers / results.totalQuestions) * 100} className="mt-2 h-2 [&>div]:bg-red-500" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="pt-6 text-center">
                <Clock className="h-10 w-10 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">समय लिया</p>
                <p className="text-4xl font-bold text-purple-600">
                  {formatTime(results.totalTimeTaken)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  औसत: {formatTime(results.speedAnalytics.averageTimePerQuestion)}/प्रश्न
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Score Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  स्कोर वितरण
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={scoreData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {scoreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Difficulty Breakdown Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  कठिनाई स्तर विश्लेषण
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={difficultyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="difficulty" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="प्रयास" fill="#8b5cf6" />
                    <Bar dataKey="सही" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Learning Behavior Radar Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-600" />
                सीखने का व्यवहार विश्लेषण
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={learningBehaviorData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="स्कोर" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">ध्यान स्कोर</span>
                    </div>
                    <Badge variant="outline">{results.learningBehavior.focusScore}/100</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-green-600" />
                      <span className="font-medium">निरंतरता स्कोर</span>
                    </div>
                    <Badge variant="outline">{results.learningBehavior.consistencyScore}/100</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">विचारशीलता स्कोर</span>
                    </div>
                    <Badge variant="outline">{results.learningBehavior.thoughtfulnessScore}/100</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">संकेत उपयोग</span>
                    </div>
                    <Badge variant="outline">{results.learningBehavior.hintsUtilization}/100</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold">समग्र सीखने का स्कोर</span>
                    </div>
                    <Badge className="bg-purple-600 text-white">{results.learningBehavior.overallLearningScore}/100</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Speed Analytics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-orange-600" />
                गति विश्लेषण
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">औसत समय</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {results.speedAnalytics.averageTimePerQuestion}s
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">सबसे तेज</p>
                  <p className="text-2xl font-bold text-green-600">
                    {results.speedAnalytics.fastestQuestion}s
                  </p>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">सबसे धीमा</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {results.speedAnalytics.slowestQuestion}s
                  </p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">समय में</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {results.speedAnalytics.questionsAnsweredUnderTime}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <ThumbsUp className="h-5 w-5" />
                  मजबूत क्षेत्र
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.strengthAreas.length > 0 ? (
                  <ul className="space-y-2">
                    {results.strengthAreas.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">अभी तक कोई मजबूत क्षेत्र पहचाना नहीं गया</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <TrendingUp className="h-5 w-5" />
                  सुधार के क्षेत्र
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.weaknessAreas.length > 0 ? (
                  <ul className="space-y-2">
                    {results.weaknessAreas.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">कोई कमजोर क्षेत्र नहीं मिला - बढ़िया काम!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                सिफारिशें
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {results.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Award className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Detailed Question Review */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-indigo-600" />
                  विस्तृत प्रश्न समीक्षा
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailedView(!showDetailedView)}
                >
                  {showDetailedView ? 'छिपाएं' : 'देखें'}
                </Button>
              </div>
            </CardHeader>
            {showDetailedView && (
              <CardContent>
                <div className="space-y-4">
                  {results.detailedResults.map((result, index) => (
                    <Card key={index} className={`border-2 ${result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">प्रश्न {result.questionIndex + 1}</Badge>
                            <Badge className={result.question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : result.question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                              {result.question.difficulty === 'Easy' ? 'आसान' : result.question.difficulty === 'Medium' ? 'मध्यम' : 'कठिन'}
                            </Badge>
                            {result.isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {result.timeSpent}s
                            {result.hintUsed && <Lightbulb className="h-4 w-4 text-yellow-600" />}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="font-medium text-gray-900">{result.question.question}</p>
                        
                        <div className="space-y-2">
                          {result.question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex}
                              className={`p-3 rounded-lg border-2 ${
                                optIndex === result.question.correctAnswer 
                                  ? 'border-green-500 bg-green-50' 
                                  : optIndex === result.selectedAnswer && !result.isCorrect
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm">
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </span>
                                {optIndex === result.question.correctAnswer && (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                                {optIndex === result.selectedAnswer && !result.isCorrect && (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {result.question.explanation && (
                          <Alert className="bg-blue-50 border-blue-200">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-sm">
                              <strong>व्याख्या:</strong> {result.question.explanation}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <Button
              onClick={() => navigate(`/student/mat-test/${encodeURIComponent(results.module)}`)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Trophy className="h-4 w-4 mr-2" />
              फिर से प्रयास करें
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/student/mat/${encodeURIComponent(results.module)}`)}
              className="flex-1"
            >
              अभ्यास करें
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/student/mat')}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              सभी मॉड्यूल
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MATTestResults;
