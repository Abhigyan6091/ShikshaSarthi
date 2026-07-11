import axios from 'axios';
import { AlertCircle, ArrowLeft, BarChart3, CheckCircle, Clock, ExternalLink, Image, Lightbulb, SkipForward, Target, Timer, Trophy, Video, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '@/hooks/useLanguage';
import { MathText } from '@/components/MathText';
const API_URL = import.meta.env.VITE_API_URL;
interface Question {
  _id: string;
  question: string;
  questionHindi?: string;
  questionImage?: string; // Added question image support
  options: string[];
  optionsHindi?: string[];
  correctAnswer: string;
  hint?: {
    text?: string;
    image?: string;
    video?: string;
  };
}

// A Hindi value is only usable if it exists and isn't the "NA" single-lingual tag.
const hasHindi = (value?: string) => !!value && value.trim() !== "" && value.trim().toUpperCase() !== "NA";

const PracticeQuiz: React.FC = () => {
  const { subject, topic } = useParams<{ subject: string; topic: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  // Grading always uses the English option text (that's what correctAnswer
  // stores); only the *displayed* label switches to Hindi when available.
  const displayQuestion = (q: Question) =>
    language === "hi" && hasHindi(q.questionHindi) ? (q.questionHindi as string) : q.question;
  const displayOption = (q: Question, i: number) =>
    language === "hi" && hasHindi(q.optionsHindi?.[i]) ? (q.optionsHindi as string[])[i] : q.options[i];
  const displayCorrect = (q: Question) => {
    const idx = q.options.findIndex((o) => o === q.correctAnswer);
    return idx >= 0 ? displayOption(q, idx) : q.correctAnswer;
  };
  const [questions, setQuestions] = useState<Question[]>([]);
const [current, setCurrent] = useState(0); 

// 🔁 Replace this:
const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<number>>(new Set());
  const [quizCompleted, setQuizCompleted] = useState(false); // Added explicit quiz completion state

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadError(null);
      try {
        // Class-agnostic: every student can practice any question for the
        // chosen subject/topic (students are identified by batch, not grade).
        const res = await axios.get(
          `${API_URL}/questions/all/questions/${encodeURIComponent(
            String(subject || "")
          )}/${encodeURIComponent(String(topic || ""))}`
        );
        setQuestions(Array.isArray(res.data) ? res.data : []);
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
      } catch (err) {
        console.error(err);
        setLoadError("Could not load practice questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [subject, topic]);

 const handleAnswer = (option: string) => {
  if (selectedAnswer !== null) return;

  const currentQuestion = questions[current];
  const questionId = currentQuestion._id;

  const isCorrect = option === currentQuestion.correctAnswer;

  setSelectedAnswer(option);

  setAnswers(prev => ({
    ...prev,
    [questionId]: option
  }));

  setAttemptedQuestions(prev => new Set(prev).add(current));
  setShowFeedback(true);
};


 const handleNext = () => {
  if (current < questions.length - 1) {
    const nextIndex = current + 1;
    const nextQuestionId = questions[nextIndex]._id;

    setCurrent(nextIndex);
    setSelectedAnswer(answers[nextQuestionId] || null);
    setShowFeedback(false);
    setShowHint(false);
    setQuestionStartTime(Date.now());
  } else {
    setEndTime(Date.now());
    setQuizCompleted(true);
  }
};

const handlePrevious = () => {
  if (current > 0) {
    const prevIndex = current - 1;
    const prevQuestionId = questions[prevIndex]._id;

    setCurrent(prevIndex);
    setSelectedAnswer(answers[prevQuestionId] || null);
    setShowFeedback(false);
    setShowHint(false);
  }
};


 
const handleSkip = () => {
  if (current < questions.length - 1) {
    const nextIndex = current + 1;
    const nextQuestionId = questions[nextIndex]._id;

    setCurrent(nextIndex);
    setSelectedAnswer(answers[nextQuestionId] || null);
    setShowFeedback(false);
    setShowHint(false);
    setQuestionStartTime(Date.now());
  } else {
    setEndTime(Date.now());
    setQuizCompleted(true);
  }
};


const getResult = () => {
  const correct = questions.filter(q => answers[q._id] === q.correctAnswer).length;
  const incorrect = Object.keys(answers).length - correct;
  const unattempted = questions.length - Object.keys(answers).length;

  const totalTime = endTime && startTime ? (endTime - startTime) / 1000 : 0;
  const questionsAttempted = quizCompleted ? questions.length : current + 1;
  const avgTime = questionsAttempted > 0 ? totalTime / questionsAttempted : 0;
  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

  return { correct, incorrect, unattempted, totalTime, avgTime, score };
};


  // Helper function to check if hint exists and has content
  const hasHint = (question: Question) => {
    if (!question.hint) return false;
    return !!(question.hint.text?.trim() || question.hint.image?.trim() || question.hint.video?.trim());
  };

  // Helper function to render hint content
  const renderHintContent = (hint: Question['hint']) => {
    if (!hint) return null;

    return (
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <div className="flex items-start gap-2">
          <Lightbulb className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
          <div className="flex-1">
            <p className="font-medium text-amber-800 mb-2">Hint:</p>
            
            {/* Text Hint */}
            {hint.text && hint.text.trim() && (
              <div className="mb-3">
                <p className="text-amber-700"><MathText text={hint.text} /></p>
              </div>
            )}
            
            {/* Image Hint - As Clickable Link */}
            {hint.image && hint.image.trim() && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="text-amber-600" size={16} />
                  <span className="text-sm font-medium text-amber-800">Image Hint:</span>
                </div>
                <a 
                  href={hint.image} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors duration-200 border border-amber-300 hover:border-amber-400"
                >
                  <Image size={16} />
                  <span className="font-medium">View Image Hint</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
            
            {/* Video Hint - As Clickable Link */}
            {hint.video && hint.video.trim() && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="text-amber-600" size={16} />
                  <span className="text-sm font-medium text-amber-800">Video Hint:</span>
                </div>
                <a 
                  href={hint.video} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors duration-200 border border-amber-300 hover:border-amber-400"
                >
                  <Video size={16} />
                  <span className="font-medium">Watch Video Hint</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper function to render question image with fixed size
  const renderQuestionImage = (questionImage?: string) => {
    if (!questionImage || !questionImage.trim()) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Image className="text-blue-600" size={18} />
          <span className="text-sm font-medium text-gray-700">Question Image:</span>
        </div>
        <div className="border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex justify-center">
            <img 
              src={questionImage} 
              alt="Question" 
              className="max-w-full max-h-80 w-auto h-auto object-contain rounded-lg shadow-sm"
              style={{ maxWidth: '500px', maxHeight: '320px' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement?.parentElement;
                if (parent) parent.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-600">Loading questions...</p>
      </div>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700">{loadError}</p>
      </div>
    </div>
  );

  if (questions.length === 0) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-600">No questions available for this topic.</p>
      </div>
    </div>
  );

  const progress = ((current + 1) / questions.length) * 100;

  // Pie chart data
  const { correct, incorrect, unattempted } = getResult();
  const pieData = [
    { name: 'Correct', value: correct, color: '#10B981' },
    { name: 'Incorrect', value: incorrect, color: '#EF4444' },
    { name: 'Unattempted', value: unattempted, color: '#6B7280' }
  ].filter(item => item.value > 0);

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { message: "Outstanding! 🌟", color: "text-emerald-600" };
    if (score >= 80) return { message: "Excellent work! 🎉", color: "text-green-600" };
    if (score >= 70) return { message: "Good job! 👍", color: "text-blue-600" };
    if (score >= 60) return { message: "Keep practicing! 💪", color: "text-yellow-600" };
    return { message: "Need more practice 📚", color: "text-red-600" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(`/student/practice/${encodeURIComponent(String(subject || ''))}`))}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            title={language === 'en' ? 'Back' : 'वापस'}
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">{language === 'en' ? 'Back' : 'वापस'}</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Target className="text-blue-600" />
            Practice Quiz: {subject} - {topic}
          </h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!quizCompleted ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-600">
                  Question {current + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Clock size={16} />
                  {startTime ? Math.floor((Date.now() - startTime) / 1000) : 0}s
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
              {/* Hint Section */}
              {hasHint(questions[current]) && (
                <div className="mb-6">
                  {!showHint ? (
                    <button
                      onClick={() => setShowHint(true)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:bg-blue-50 px-3 py-2 rounded-lg"
                    >
                      <Lightbulb size={18} />
                      Show Hint
                    </button>
                  ) : (
                    <div>
                      {renderHintContent(questions[current].hint)}
                      <button
                        onClick={() => setShowHint(false)}
                        className="mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Hide Hint
                      </button>
                    </div>
                  )}
                </div>
              )}

              <h2 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
                <MathText text={String(displayQuestion(questions[current]))} />
              </h2>

              {/* Question Image with Fixed Size */}
              {renderQuestionImage(questions[current].questionImage)}
              
              <div className="grid gap-3">
                {questions[current].options.map((opt, i) => {
                  const isSelected = opt === selectedAnswer;
                  const isCorrect = opt === questions[current].correctAnswer;
                  
                  let classes = "p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 text-left";
                  
                  if (selectedAnswer === null) {
                    classes += " border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md";
                  } else {
                    if (isSelected && isCorrect) {
                      classes += " border-green-500 bg-green-50 text-green-700";
                    } else if (isSelected && !isCorrect) {
                      classes += " border-red-500 bg-red-50 text-red-700";
                    } else if (isCorrect) {
                      classes += " border-green-500 bg-green-50 text-green-700";
                    } else {
                      classes += " border-gray-200 bg-gray-50 text-gray-500";
                    }
                  }

                  return (
                    <div
                      key={i}
                      className={classes}
                      onClick={() => handleAnswer(opt)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium"><MathText text={String(displayOption(questions[current], i))} /></span>
                        {selectedAnswer !== null && (
                          <>
                            {isSelected && isCorrect && <CheckCircle className="text-green-600" size={20} />}
                            {isSelected && !isCorrect && <XCircle className="text-red-600" size={20} />}
                            {!isSelected && isCorrect && <CheckCircle className="text-green-600" size={20} />}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {showFeedback && (
                <div className="mt-6 p-4 rounded-lg bg-gray-50 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAnswer === questions[current].correctAnswer ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <XCircle className="text-red-600" size={20} />
                    )}
                    <span className="font-medium">
                      {selectedAnswer === questions[current].correctAnswer ? "Correct!" : "Incorrect"}
                    </span>
                  </div>
                  {selectedAnswer !== questions[current].correctAnswer && (
                    <p className="text-sm text-gray-600">
                      The correct answer is: <strong><MathText text={String(displayCorrect(questions[current]))} /></strong>
                    </p>
                  )}
                </div>
              )}

             {/* Action Buttons */}
<div className="mt-6 flex gap-3">
  {/* Show Previous button only if not on the first question */}
  {current > 0 && (
    <button
      onClick={handlePrevious}
      className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-6 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
    >
      ← Previous
    </button>
  )}

  {selectedAnswer ? (
    <button
      onClick={handleNext}
      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
    >
      {current === questions.length - 1 ? "Finish Quiz 🎯" : "Next Question →"}
    </button>
  ) : (
    <button
      onClick={handleSkip}
      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
    >
      <SkipForward size={18} />
      {current === questions.length - 1 ? "Finish Quiz" : "Skip Question"}
    </button>
  )}
</div>

            </div>
          </div>
        ) : (
          /* Results Page */
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="mb-6">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
                <div className={`text-xl font-semibold ${getScoreMessage(getResult().score).color}`}>
                  {getScoreMessage(getResult().score).message}
                </div>
              </div>
              
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                {getResult().score}%
              </div>
              <p className="text-gray-600">Your Score</p>
            </div>

            {/* Analytics */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="text-blue-600" />
                  Performance Breakdown
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Timer className="text-blue-600" />
                  Detailed Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="font-medium text-green-700">Correct Answers</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{correct}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="text-red-600" size={20} />
                      <span className="font-medium text-red-700">Incorrect Answers</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{incorrect}</span>
                  </div>

                  {unattempted > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="text-gray-600" size={20} />
                        <span className="font-medium text-gray-700">Unattempted</span>
                      </div>
                      <span className="text-xl font-bold text-gray-600">{unattempted}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="text-blue-600" size={20} />
                      <span className="font-medium text-blue-700">Total Time</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      {Math.floor(getResult().totalTime)}s
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Timer className="text-purple-600" size={20} />
                      <span className="font-medium text-purple-700">Avg Time/Question</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">
                      {getResult().avgTime.toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => {
                  // Reset quiz state
                  setCurrent(0);
                  setQuizCompleted(false);
                  setAnswers({});
                  setSelectedAnswer(null);
                  setShowFeedback(false);
                  setShowHint(false);
                  setAttemptedQuestions(new Set());
                  setStartTime(Date.now());
                  setQuestionStartTime(Date.now());
                  setEndTime(null);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-8 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
              >
                Retake Quiz
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
                Review Answers
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PracticeQuiz;