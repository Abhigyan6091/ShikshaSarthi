import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubjectIcon from '@/components/SubjectIcon';
const API_URL = import.meta.env.VITE_API_URL;
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Users, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Share2,
  Image,
  Video,
  HelpCircle,
  Target,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const QuizDetails = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/quizzes/${quizId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Quiz details:', data); // Debug log
        setQuiz(data);
      } catch (err) {
        setError(`Failed to fetch quiz details: ${err.message}`);
        console.error('Error fetching quiz details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizDetails();
    }
  }, [quizId]);

  const getSubjectColor = (subject) => {
    const colors = {
      'mathematics': 'bg-blue-100 text-blue-800',
      'science': 'bg-green-100 text-green-800',
      'social': 'bg-purple-100 text-purple-800',
      'english': 'bg-orange-100 text-orange-800',
      'hindi': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[subject?.toLowerCase()] || colors.default;
  };

  const getClassColor = (classLevel) => {
    const colors = {
      '1': 'bg-pink-100 text-pink-800',
      '2': 'bg-indigo-100 text-indigo-800',
      '3': 'bg-cyan-100 text-cyan-800',
      '4': 'bg-teal-100 text-teal-800',
      '5': 'bg-lime-100 text-lime-800',
      '6': 'bg-amber-100 text-amber-800',
      '7': 'bg-rose-100 text-rose-800',
      '8': 'bg-violet-100 text-violet-800',
      '9': 'bg-sky-100 text-sky-800',
      '10': 'bg-emerald-100 text-emerald-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[classLevel?.toString()] || colors.default;
  };

  const copyQuizId = async () => {
    try {
      await navigator.clipboard.writeText(quiz.quizId);
      // You could add a toast notification here
      alert('Quiz ID copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy quiz ID:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8 bg-gray-50">
          <div className="edu-container">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-blue mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading quiz details...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8 bg-gray-50">
          <div className="edu-container">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="text-red-500 mb-4">⚠️</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Error Loading Quiz Details
                  </h3>
                  <p className="text-muted-foreground mb-6">{error}</p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
                      Try Again
                    </Button>
                    <Link to="/teacher/dashboard">
                      <Button variant="outline" className="w-full sm:w-auto">Back to Dashboard</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8 bg-gray-50">
          <div className="edu-container">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Quiz Not Found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    The quiz with ID "{quizId}" could not be found.
                  </p>
                  <Link to="/teacher/dashboard">
                    <Button>Back to Dashboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate quiz statistics
  const totalQuestions = quiz.totalQuestions || quiz.questions?.length || 0;
  const totalAttempts = quiz.attemptedBy?.length || 0;
  const correctAnswers = quiz.correct || 0;
  const incorrectAnswers = quiz.incorrect || 0;
  const unattemptedAnswers = quiz.unattempted || 0;
  const totalAnswered = correctAnswers + incorrectAnswers + unattemptedAnswers;
  const accuracyRate = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

  // Helper to determine question type by index based on questionTypes config
  const getQuestionType = (index: number) => {
    const types = quiz.questionTypes || {};
    const mcqEnd = types.mcq || 0;
    const audioEnd = mcqEnd + (types.audio || 0);
    const videoEnd = audioEnd + (types.video || 0);
    if (index < mcqEnd) return 'MCQ';
    if (index < audioEnd) return 'Audio';
    if (index < videoEnd) return 'Video';
    return 'Puzzle';
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'MCQ': return 'bg-blue-100 text-blue-800';
      case 'Audio': return 'bg-green-100 text-green-800';
      case 'Video': return 'bg-purple-100 text-purple-800';
      case 'Puzzle': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 bg-gray-50">
        <div className="edu-container">
          {/* Back Button */}
          <div className="mb-6">
            <Link to="/teacher">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Quiz Header */}
          <Card className="mb-8 border-l-4 border-l-edu-blue">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex items-start sm:items-center space-x-3">
                  <SubjectIcon subject={quiz.questions?.[0]?.subject || 'general'} size={32} />
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      Quiz {quiz.quizId}
                    </CardTitle>
                    <CardDescription className="text-base">
                      Teacher ID: {quiz.teacherId}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <Button variant="outline" size="sm" onClick={copyQuizId} className="w-full sm:w-auto">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Quiz ID
                  </Button>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Quiz
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-edu-blue" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                    <p className="font-medium">{totalQuestions}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-edu-green" />
                  <div>
                    <p className="text-sm text-muted-foreground">Attempts</p>
                    <p className="font-medium">{totalAttempts}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-edu-yellow" />
                  <div>
                    <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                    <p className="font-medium">{accuracyRate}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-edu-purple" />
                  <div>
                    <p className="text-sm text-muted-foreground">Correct Answers</p>
                    <p className="font-medium">{correctAnswers}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Statistics */}
          {totalAnswered > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Correct</p>
                      <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Incorrect</p>
                      <p className="text-2xl font-bold text-red-600">{incorrectAnswers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Unattempted</p>
                      <p className="text-2xl font-bold text-gray-600">{unattemptedAnswers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Questions List */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Questions & Answers</h2>
            
            {quiz.questions && quiz.questions.length > 0 ? (
              <div className="space-y-6">
                {quiz.questions.map((question, index) => {
                  // Check if question is a populated object or just a string ID
                  const isPopulated = typeof question === 'object' && question !== null && question.question;
                  const qType = getQuestionType(index);
                  const qTypeColor = getQuestionTypeColor(qType);

                  if (!isPopulated) {
                    // Render a compact card for non-populated questions (puzzle, video, audio IDs)
                    const qId = typeof question === 'string' ? question : question?._id || `Q${index + 1}`;
                    return (
                      <Card key={qId || index} className="border-l-4 border-l-gray-200">
                        <CardHeader>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Badge className={`${qTypeColor} border-0`}>
                              {qType}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Question {index + 1}
                            </span>
                          </div>
                          <CardTitle className="text-lg">
                            {qType === 'Puzzle' ? 'Puzzle Game' : qType === 'Audio' ? 'Audio Question' : qType === 'Video' ? 'Video Question' : 'Question'}
                          </CardTitle>
                          <CardDescription>
                            ID: {qId}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  }

                  // Render full question card for populated MCQ questions
                  return (
                  <Card key={question._id || index} className="border-l-4 border-l-gray-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge className={`${getSubjectColor(question.subject)} border-0`}>
                              {question.subject || 'General'}
                            </Badge>
                            {question.class && (
                              <Badge className={`${getClassColor(question.class)} border-0`}>
                                Class {question.class}
                              </Badge>
                            )}
                            {question.topic && (
                              <Badge variant="outline">
                                {question.topic}
                              </Badge>
                            )}
                            <Badge className={`${qTypeColor} border-0`}>
                              {qType}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Question {index + 1}
                            </span>
                          </div>
                          <CardTitle className="text-lg leading-relaxed">
                            {question.question || 'No question text available'}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Question Image */}
                      {question.questionImage && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Image className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Question Image:</span>
                          </div>
                          <div className="border rounded-lg p-3 bg-blue-50">
                            <img 
                              src={question.questionImage} 
                              alt="Question" 
                              className="max-w-full h-auto rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <p className="text-sm text-blue-600 hidden">
                              Image: {question.questionImage}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Multiple Choice Options */}
                      {question.options && question.options.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Options:</p>
                          {question.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex} 
                              className={`p-3 rounded-lg border ${
                                option === question.correctAnswer
                                  ? 'bg-green-50 border-green-200 text-green-800' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span className="font-medium">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span>{option}</span>
                                {option === question.correctAnswer && (
                                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Correct Answer */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Correct Answer:</span>
                        </div>
                        <p className="text-green-700 font-medium">
                          {question.correctAnswer || 'No correct answer set'}
                        </p>
                      </div>
                      
                      {/* Hint Section */}
                      {question.hint && (question.hint.text || question.hint.image || question.hint.video) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <HelpCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">Hint:</span>
                          </div>
                          
                          {question.hint.text && (
                            <p className="text-yellow-700 mb-2">{question.hint.text}</p>
                          )}
                          
                          {question.hint.image && (
                            <div className="mb-2">
                              <div className="flex items-center space-x-1 mb-1">
                                <Image className="h-3 w-3 text-yellow-600" />
                                <span className="text-xs text-yellow-600">Hint Image:</span>
                              </div>
                              <img 
                                src={question.hint.image} 
                                alt="Hint" 
                                className="max-w-xs h-auto rounded border"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <p className="text-xs text-yellow-600 hidden">
                                Image: {question.hint.image}
                              </p>
                            </div>
                          )}
                          
                          {question.hint.video && (
                            <div>
                              <div className="flex items-center space-x-1 mb-1">
                                <Video className="h-3 w-3 text-yellow-600" />
                                <span className="text-xs text-yellow-600">Hint Video:</span>
                              </div>
                              <a 
                                href={question.hint.video} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-yellow-700 underline hover:text-yellow-800"
                              >
                                {question.hint.video}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No Questions Found
                    </h3>
                    <p className="text-muted-foreground">
                      This quiz doesn't have any questions yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default QuizDetails;
