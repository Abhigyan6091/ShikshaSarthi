import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle,
  Clock,
  Globe2,
  Lightbulb,
  RotateCcw,
  Send,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const API_URL = import.meta.env.VITE_API_URL;
const QUESTION_COUNT_OPTIONS = [10, 20, 30, 40];
const SUBJECT_OPTIONS = [
  { id: "maths", label: "Mathematics", labelHindi: "गणित" },
  { id: "science", label: "Science", labelHindi: "विज्ञान" },
  { id: "social", label: "Social Science", labelHindi: "सामाजिक विज्ञान" },
];

type AdaptiveQuestion = {
  id: string;
  class: number;
  subject: string;
  subjectId: string;
  topicId: string;
  tags: string[];
  question: string;
  questionHindi?: string;
  options: string[];
  optionsHindi?: string[];
  correctAnswerIndex: number;
  correctAnswer: string;
  hints?: string[];
  hintsHindi?: string[];
  explanation?: string;
  explanationHindi?: string;
  difficulty: "easy" | "medium" | "hard" | string;
  eloRating: number;
  interval?: number;
  marks?: number;
  negativeMarks?: number;
};

type AttemptAnswer = {
  question: AdaptiveQuestion;
  selectedOptionIndex: number | null;
  timeSpentMs: number;
  hintUsed: boolean;
};

type ReviewItem = {
  questionId: string;
  question: string;
  questionHindi?: string;
  options: string[];
  optionsHindi?: string[];
  selectedOptionIndex: number | null;
  correctAnswerIndex: number;
  isCorrect: boolean;
  hintUsed: boolean;
  explanation?: string;
  explanationHindi?: string;
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
};

type SubmitResult = {
  ratingBand: { min: number; max: number };
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
  momentum: string;
  weakTopics: string[];
  score: { correct: number; incorrect: number; total: number; accuracy: number };
  review: ReviewItem[];
};

const ratingBands: Record<number, { min: number; max: number }> = {
  6: { min: 600, max: 850 },
  7: { min: 800, max: 1050 },
  8: { min: 1000, max: 1250 },
  9: { min: 1200, max: 1450 },
  10: { min: 1400, max: 1650 },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const expectedSuccess = (rating: number, itemRating: number) =>
  1 / (1 + Math.pow(10, (itemRating - rating) / 400));

const estimateReferenceTime = (question: AdaptiveQuestion) => {
  const stemLength = String(question.question || question.questionHindi || "").length;
  const optionLength = (question.options || []).join(" ").length;
  const complexity = question.difficulty === "hard" ? 16 : question.difficulty === "medium" ? 8 : 0;
  return clamp(18 + stemLength * 0.12 + optionLength * 0.05 + complexity, 25, 120);
};

const getClassNumber = (className?: string) => {
  const parsed = Number.parseInt(String(className || "").replace(/\D/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 6;
};

const getInitialRating = (classNumber: number) => {
  const band = ratingBands[classNumber] || ratingBands[6];
  return Math.round((band.min + band.max) / 2);
};

const updateLocalState = (
  state: {
    rating: number;
    velocity: number;
    attempts: number;
    streak: number;
    variance: number;
    recentOutcomes: number[];
  },
  answer: AttemptAnswer,
  classNumber: number
) => {
  const band = ratingBands[classNumber] || ratingBands[6];
  const isCorrect = answer.selectedOptionIndex === answer.question.correctAnswerIndex;
  const streak = isCorrect ? Math.max(1, state.streak + 1) : Math.min(-1, state.streak - 1);
  const itemRating = clamp(answer.question.eloRating || state.rating, band.min, band.max);
  const expected = expectedSuccess(state.rating, itemRating);
  const referenceMs = estimateReferenceTime(answer.question) * 1000;
  const timeQuality = clamp((referenceMs - answer.timeSpentMs + referenceMs * 0.2) / referenceMs, 0, 1);
  const hintQuality = answer.hintUsed ? 0.65 : 1;
  const streakQuality = 0.5 * (1 + clamp(streak, -5, 5) / 5);
  const quality = isCorrect ? clamp(0.45 * timeQuality + 0.35 * hintQuality + 0.2 * streakQuality, 0, 1) : 0.05;
  const dynamicK =
    state.attempts < 30
      ? 45
      : clamp((12 + (45 - 12) * Math.exp(-0.06 * (state.attempts - 30))) * (state.variance / (state.variance + 100)), 12, 45);
  let rawUpdate = dynamicK * (quality - expected);

  if (isCorrect && answer.timeSpentMs < referenceMs * 0.25) {
    rawUpdate = Math.min(rawUpdate, 7.8);
  }

  const varianceRatio = state.variance / (state.variance + 100);
  const beta = 0.0687 + (0.1237 - 0.0687) * (1 - varianceRatio);
  const velocity = beta * state.velocity + (1 - beta) * rawUpdate;
  const rating = clamp(Math.round(state.rating + clamp(velocity, -17.2544, 17.2544)), band.min, band.max);

  return {
    rating,
    velocity,
    attempts: state.attempts + 1,
    streak,
    variance: clamp(0.8 * state.variance + 0.2 * Math.abs(rawUpdate) * 10, 20, 400),
    recentOutcomes: [...state.recentOutcomes.slice(-9), isCorrect ? 1 : 0],
  };
};

const chooseNextQuestion = (
  questions: AdaptiveQuestion[],
  servedIds: Set<string>,
  state: { rating: number; velocity: number; variance: number; recentOutcomes: number[] },
  recentTopics: string[]
) => {
  const candidates = questions.filter((question) => !servedIds.has(question.id));
  if (candidates.length === 0) return null;

  const recentAccuracy =
    state.recentOutcomes.length > 0
      ? state.recentOutcomes.reduce((sum, value) => sum + value, 0) / state.recentOutcomes.length
      : 0.7;
  const volatilityTerm = state.variance / (state.variance + 100);
  const targetRating =
    state.rating +
    clamp(2.783 * state.velocity + 54.3184 * (recentAccuracy - 0.7) - 26.3128 * volatilityTerm, -195.6223, 195.6223);
  const recentTopicSet = new Set(recentTopics.slice(-5));

  return candidates
    .map((question) => {
      const difficultyFit = 1 - Math.min(1, Math.abs(question.eloRating - targetRating) / 250);
      const diversity = recentTopicSet.has(question.topicId) ? -0.12 : 0.08;
      const timePenalty = estimateReferenceTime(question) / 300;
      return { question, score: 1.98 * difficultyFit + diversity - timePenalty };
    })
    .sort((a, b) => b.score - a.score)[0].question;
};

const AdaptiveTest: React.FC = () => {
  const [language, setLanguage] = useState(() => localStorage.getItem("appLanguage") || "hi");
  const storedStudent = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("student") || "{}")?.student || {};
    } catch {
      return {};
    }
  }, []);
  const classNumber = getClassNumber(storedStudent?.class);
  const band = ratingBands[classNumber] || ratingBands[6];
  const [questions, setQuestions] = useState<AdaptiveQuestion[]>([]);
  const [testMode, setTestMode] = useState<"mixed" | "subject">("mixed");
  const [selectedSubject, setSelectedSubject] = useState("maths");
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(20);
  const [testStarted, setTestStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
  const [startedAt] = useState(new Date().toISOString());
  const [answers, setAnswers] = useState<AttemptAnswer[]>([]);
  const [adaptiveState, setAdaptiveState] = useState({
    rating: getInitialRating(classNumber),
    velocity: 0,
    attempts: 0,
    streak: 0,
    variance: 100,
    recentOutcomes: [] as number[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setLanguage(detail?.language || localStorage.getItem("appLanguage") || "hi");
    };

    window.addEventListener("appLanguageChanged", handleLanguageChange);
    return () => window.removeEventListener("appLanguageChanged", handleLanguageChange);
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/quizzes/adaptive-test/questions/${classNumber}`, {
          params: { studentId: storedStudent?.studentId },
        });
        setQuestions(res.data.questions || []);
        setAdaptiveState((prev) => ({
          ...prev,
          rating: res.data.currentRating || getInitialRating(classNumber),
        }));
        setCurrentQuestion(null);
      } catch (loadError) {
        console.error(loadError);
        setError("Adaptive questions could not be loaded right now.");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [classNumber, storedStudent?.studentId]);

  const activeQuestions = useMemo(
    () => (testMode === "subject" ? questions.filter((question) => question.subject === selectedSubject) : questions),
    [questions, selectedSubject, testMode]
  );
  const plannedQuestionCount = Math.min(selectedQuestionCount, activeQuestions.length);
  const progress = plannedQuestionCount > 0 ? Math.round((answers.length / plannedQuestionCount) * 100) : 0;
  const visibleHint =
    language === "hi"
      ? currentQuestion?.hintsHindi?.[0] || currentQuestion?.hints?.[0] || ""
      : currentQuestion?.hints?.[0] || currentQuestion?.hintsHindi?.[0] || "";
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!testStarted || result || submitting) return;
    if (timeRemaining <= 0) {
      finishTest(answers);
      return;
    }

    const timer = window.setInterval(() => {
      setTimeRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [answers, result, submitting, testStarted, timeRemaining]);

  const finishTest = async (finalAnswers: AttemptAnswer[]) => {
    try {
      setSubmitting(true);
      const res = await axios.post(`${API_URL}/quizzes/adaptive-test/submit`, {
        studentId: storedStudent?.studentId,
        className: String(classNumber),
        startedAt,
        answers: finalAnswers,
      });
      setResult(res.data);
    } catch (submitError) {
      console.error(submitError);
      setError("The test finished, but the rating could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  const startTest = () => {
    const firstQuestion = chooseNextQuestion(
      activeQuestions,
      new Set(),
      adaptiveState,
      []
    );

    setAnswers([]);
    setResult(null);
    setCurrentQuestion(firstQuestion);
    setSelectedOptionIndex(null);
    setShowHint(false);
    setHintUsed(false);
    setTimeRemaining(selectedQuestionCount * 60);
    setTestStarted(true);
    setQuestionStartedAt(Date.now());
  };

  const moveNext = async () => {
    if (!currentQuestion || selectedOptionIndex === null) return;

    const answer: AttemptAnswer = {
      question: currentQuestion,
      selectedOptionIndex,
      hintUsed,
      timeSpentMs: Date.now() - questionStartedAt,
    };
    const nextAnswers = [...answers, answer];
    const nextState = updateLocalState(adaptiveState, answer, classNumber);
    setAnswers(nextAnswers);
    setAdaptiveState(nextState);

    if (nextAnswers.length >= plannedQuestionCount || nextAnswers.length >= activeQuestions.length) {
      await finishTest(nextAnswers);
      return;
    }

    const servedIds = new Set(nextAnswers.map((item) => item.question.id));
    const nextQuestion = chooseNextQuestion(
      activeQuestions,
      servedIds,
      nextState,
      nextAnswers.map((item) => item.question.topicId)
    );
    setCurrentQuestion(nextQuestion);
    setSelectedOptionIndex(null);
    setShowHint(false);
    setHintUsed(false);
    setQuestionStartedAt(Date.now());
  };

  const resetTest = () => {
    const initialRating = result?.ratingAfter || adaptiveState.rating || getInitialRating(classNumber);
    setAnswers([]);
    setResult(null);
    setTestStarted(false);
    setTimeRemaining(selectedQuestionCount * 60);
    setSelectedOptionIndex(null);
    setShowHint(false);
    setHintUsed(false);
    setAdaptiveState({
      rating: initialRating,
      velocity: 0,
      attempts: 0,
      streak: 0,
      variance: 100,
      recentOutcomes: [],
    });
    setCurrentQuestion(null);
    setQuestionStartedAt(Date.now());
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="font-medium text-slate-600">Loading adaptive test...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="max-w-md text-center">
            <CardHeader>
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <CardTitle>Adaptive Test Unavailable</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/student/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="max-w-lg text-center">
            <CardHeader>
              <BrainCircuit className="mx-auto h-12 w-12 text-blue-600" />
              <CardTitle>No adaptive questions yet</CardTitle>
              <CardDescription>
                Class {classNumber} files are ready, but this class does not have question data yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/student/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-6 md:py-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link to="/student/dashboard" className="mb-2 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
                <BrainCircuit className="h-8 w-8 text-blue-600" />
                Adaptive Test
              </h1>
              <p className="mt-1 text-slate-600">MARS-based routing with class {classNumber} rating band {band.min}-{band.max}.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-72">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-slate-500">Current rating</p>
                  <p className="text-2xl font-bold text-blue-700">{result?.ratingAfter ?? adaptiveState.rating}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-slate-500">Questions</p>
                  <p className="text-2xl font-bold text-slate-900">{result?.score.total ?? answers.length}/{plannedQuestionCount}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {!result && !testStarted ? (
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-blue-600">Class {classNumber}</Badge>
                  <Badge variant="outline">Rating {adaptiveState.rating}</Badge>
                  <Badge variant="outline">{band.min}-{band.max}</Badge>
                </div>
                <CardTitle className="text-2xl">
                  {language === "hi" ? "Adaptive Test Setup" : "Adaptive Test Setup"}
                </CardTitle>
                <CardDescription>
                  Choose the test type, number of questions, and time limit before starting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-700">Test Type</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setTestMode("mixed")}
                      className={`rounded-lg border-2 p-4 text-left transition ${
                        testMode === "mixed" ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <Globe2 className="h-5 w-5 text-blue-600" />
                        Mixed Test
                      </div>
                      <p className="mt-1 text-sm text-slate-600">Adaptive questions from all available subjects.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestMode("subject")}
                      className={`rounded-lg border-2 p-4 text-left transition ${
                        testMode === "subject" ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <Target className="h-5 w-5 text-blue-600" />
                        Subject-wise Test
                      </div>
                      <p className="mt-1 text-sm text-slate-600">Focus the adaptive test on one subject.</p>
                    </button>
                  </div>
                </div>

                {testMode === "subject" && (
                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-700">Subject</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {SUBJECT_OPTIONS.map((subject) => {
                        const available = questions.filter((question) => question.subject === subject.id).length;
                        return (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => setSelectedSubject(subject.id)}
                            disabled={available === 0}
                            className={`rounded-lg border-2 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              selectedSubject === subject.id
                                ? "border-cyan-600 bg-cyan-50"
                                : "border-slate-200 bg-white hover:border-cyan-300"
                            }`}
                          >
                            <p className="font-semibold text-slate-900">
                              {language === "hi" ? subject.labelHindi : subject.label}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">{available} questions</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-700">Number of Questions</p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {QUESTION_COUNT_OPTIONS.map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          setSelectedQuestionCount(count);
                          setTimeRemaining(count * 60);
                        }}
                        className={`rounded-lg border-2 p-4 text-center transition ${
                          selectedQuestionCount === count
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-slate-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm text-slate-600">{count} mins</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">Selected pool</p>
                      <p className="text-xl font-bold text-slate-900">{activeQuestions.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Test length</p>
                      <p className="text-xl font-bold text-slate-900">{plannedQuestionCount} questions</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Time limit</p>
                      <p className="text-xl font-bold text-slate-900">{selectedQuestionCount} minutes</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button disabled={plannedQuestionCount === 0} onClick={startTest} className="px-8">
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Start Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : !result ? (
            <div className="space-y-5">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-center justify-between text-sm text-slate-600">
                    <span>Progress</span>
                    <span className="inline-flex items-center gap-3">
                      <span>{progress}%</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                        <Clock className="h-4 w-4" />
                        {formatTime(timeRemaining)}
                      </span>
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{currentQuestion?.subject}</Badge>
                    <Badge variant="outline">{currentQuestion?.difficulty}</Badge>
                    <Badge className="bg-blue-600">Elo {currentQuestion?.eloRating}</Badge>
                    <span className="ml-auto inline-flex items-center gap-1 text-sm text-slate-500">
                      <Clock className="h-4 w-4" />
                      Ref {currentQuestion ? Math.round(estimateReferenceTime(currentQuestion)) : 0}s
                    </span>
                  </div>
                  <CardTitle className="text-xl leading-relaxed">
                    {language === "hi"
                      ? currentQuestion?.questionHindi || currentQuestion?.question
                      : currentQuestion?.question || currentQuestion?.questionHindi}
                  </CardTitle>
                  {language === "hi" && currentQuestion?.questionHindi && (
                    <CardDescription className="text-base">{currentQuestion.question}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {(currentQuestion?.options || []).map((option, index) => {
                      const label =
                        language === "hi"
                          ? currentQuestion?.optionsHindi?.[index] || option
                          : option || currentQuestion?.optionsHindi?.[index];
                      const selected = selectedOptionIndex === index;
                      return (
                        <button
                          key={`${currentQuestion?.id}-${index}`}
                          type="button"
                          onClick={() => setSelectedOptionIndex(index)}
                          className={`rounded-lg border-2 p-4 text-left transition ${
                            selected
                              ? "border-blue-600 bg-blue-50 text-blue-900"
                              : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className="mr-3 font-semibold">{String.fromCharCode(65 + index)}.</span>
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {visibleHint && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      {!showHint ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-amber-300 text-amber-800 hover:bg-amber-100"
                          onClick={() => {
                            setShowHint(true);
                            setHintUsed(true);
                          }}
                        >
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Show Hint
                        </Button>
                      ) : (
                        <div className="flex gap-3 text-amber-900">
                          <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0" />
                          <p>{visibleHint}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button disabled={selectedOptionIndex === null || submitting} onClick={moveNext}>
                      {answers.length + 1 >= plannedQuestionCount ? (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Finish Test
                        </>
                      ) : (
                        <>
                          <Target className="mr-2 h-4 w-4" />
                          Next Adaptive Question
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <Trophy className="mx-auto h-14 w-14 text-yellow-500" />
                  <CardTitle className="text-3xl">Adaptive Test Complete</CardTitle>
                  <CardDescription>
                    Rating {result.ratingBefore} to {result.ratingAfter} ({result.ratingChange >= 0 ? "+" : ""}
                    {result.ratingChange}), momentum: {result.momentum}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                      <p className="text-sm text-green-700">Correct</p>
                      <p className="text-2xl font-bold text-green-700">{result.score.correct}</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-4 text-center">
                      <p className="text-sm text-red-700">Incorrect</p>
                      <p className="text-2xl font-bold text-red-700">{result.score.incorrect}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <p className="text-sm text-blue-700">Accuracy</p>
                      <p className="text-2xl font-bold text-blue-700">{result.score.accuracy}%</p>
                    </div>
                    <div className="rounded-lg bg-slate-100 p-4 text-center">
                      <p className="text-sm text-slate-700">Band</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {result.ratingBand.min}-{result.ratingBand.max}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Review Answers</CardTitle>
                  <CardDescription>Check the correct answers, explanations, hints used, and rating movement.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.review.map((item, index) => (
                    <div key={`${item.questionId}-${index}`} className="rounded-lg border bg-white p-4">
                      <div className="mb-3 flex items-start gap-2">
                        {item.isCorrect ? (
                          <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="mt-1 h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {index + 1}. {item.questionHindi || item.question}
                          </p>
                          {item.questionHindi && <p className="mt-1 text-sm text-slate-600">{item.question}</p>}
                        </div>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {item.options.map((option, optionIndex) => {
                          const label = item.optionsHindi?.[optionIndex] || option;
                          const isSelected = item.selectedOptionIndex === optionIndex;
                          const isCorrect = item.correctAnswerIndex === optionIndex;
                          return (
                            <div
                              key={`${item.questionId}-${optionIndex}`}
                              className={`rounded-md border px-3 py-2 text-sm ${
                                isCorrect
                                  ? "border-green-300 bg-green-50 text-green-800"
                                  : isSelected
                                    ? "border-red-300 bg-red-50 text-red-800"
                                    : "border-slate-200 bg-slate-50 text-slate-700"
                              }`}
                            >
                              {String.fromCharCode(65 + optionIndex)}. {label}
                            </div>
                          );
                        })}
                      </div>
                      {(item.explanationHindi || item.explanation) && (
                        <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                          {item.explanationHindi || item.explanation}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <Badge variant="outline">Rating {item.ratingBefore} to {item.ratingAfter}</Badge>
                        {item.hintUsed && <Badge variant="outline">Hint used</Badge>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={resetTest} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Take Again
                </Button>
                <Link to="/student/dashboard">
                  <Button>Back to Dashboard</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdaptiveTest;
