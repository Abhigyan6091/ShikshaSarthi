import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  BrainCircuit,
  ChevronRight,
  Clock,
  Flag,
  Globe2,
  Languages,
  Lightbulb,
  Maximize2,
  Minimize2,
  RotateCcw,
  Send,
  SkipForward,
  Target,
  Trophy,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/session";
import AdaptiveReviewList from "@/components/AdaptiveReviewList";
import { MathText, QuestionMedia } from "@/components/MathText";

const API_URL = import.meta.env.VITE_API_URL;
const QUESTION_COUNT_OPTIONS = [10, 20, 30, 40, "unlimited"] as const;
const TIME_LIMIT_OPTIONS = [20, 40, 60];
const SUBJECT_OPTIONS = [
  { id: "maths", label: "Mathematics", labelHindi: "गणित" },
  { id: "science", label: "Science", labelHindi: "विज्ञान" },
  { id: "social", label: "Social Science", labelHindi: "सामाजिक विज्ञान" },
];

type QuestionStatus = "unanswered" | "answered" | "skipped" | "review";

type QuestionHistoryEntry = {
  question: AdaptiveQuestion;
  selectedOptionIndex: number | null;
  status: QuestionStatus;
  timeSpentMs: number;
  hintUsed: boolean;
  startedAt: number;
};

type AdaptiveQuestion = {
  id: string;
  class: number;
  subject: string;
  subjectId: string;
  topicId: string;
  tags: string[];
  question: string;
  questionHindi?: string;
  questionImage?: string;
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
  hints?: string[];
  hintsHindi?: string[];
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

// A graduation batch maps back to a grade: batch 2026 → class 12, 2027 → 11, …
// (class = 2038 − batch), the inverse of the student batch backfill.
const batchToClass = (batch?: string) => {
  const n = Number.parseInt(String(batch || "").replace(/\D/g, ""), 10);
  const derived = Number.isFinite(n) && n >= 2026 && n <= 2037 ? 2038 - n : 0;
  return derived >= 6 && derived <= 10 ? derived : 0;
};

// Resolve a student's grade for the adaptive engine. Prefer the legacy `class`
// field; fall back to the batch-derived grade (students are keyed by batch now);
// default to 6 only if neither is present.
const resolveClassNumber = (student?: { class?: string; batch?: string }) => {
  const parsed = Number.parseInt(String(student?.class || "").replace(/\D/g, ""), 10);
  if (Number.isFinite(parsed) && parsed >= 6 && parsed <= 10) return parsed;
  return batchToClass(student?.batch) || 10;
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
  const boundedMagnitude = Math.max(1, Math.round(Math.abs(velocity)));
  const ratingChange = isCorrect
    ? clamp(boundedMagnitude, 1, 10)
    : -clamp(boundedMagnitude, 1, 5);
  const rating = clamp(Math.round(state.rating + ratingChange), band.min, band.max);

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
  recentTopics: string[],
  wronglyAnsweredIds: Set<string>
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

  const scoredCandidates = candidates
    .map((question) => {
      const difficultyFit = 1 - Math.min(1, Math.abs(question.eloRating - targetRating) / 250);
      const wrongBonus = wronglyAnsweredIds.has(question.id) ? 0.3 : 0;
      const diversity = recentTopicSet.has(question.topicId) ? -0.12 : 0.08;
      const timePenalty = estimateReferenceTime(question) / 300;
      const randomJitter = Math.random() * 0.05;
      return { question, score: 1.98 * difficultyFit + wrongBonus + diversity - timePenalty + randomJitter };
    })
    .sort((a, b) => b.score - a.score);

  const topN = Math.min(3, scoredCandidates.length);
  const randomIndex = Math.floor(Math.random() * topN);
  return scoredCandidates[randomIndex].question;
};

// ── Status colour helpers ──────────────────────────────────────────────────
const statusColors: Record<QuestionStatus, string> = {
  answered: "bg-green-500 text-white border-green-600",
  skipped: "bg-orange-400 text-white border-orange-500",
  review: "bg-purple-500 text-white border-purple-600",
  unanswered: "bg-white text-slate-700 border-slate-300",
};

const AdaptiveTest: React.FC = () => {
  const [language, setLanguage] = useState(() => localStorage.getItem("appLanguage") || "hi");
  const storedStudent = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("student") || "{}")?.student || getCurrentUser() || {};
    } catch {
      return getCurrentUser() || {};
    }
  }, []);
  const classNumber = resolveClassNumber(storedStudent);
  const band = ratingBands[classNumber] || ratingBands[6];
  const [questions, setQuestions] = useState<AdaptiveQuestion[]>([]);
  const [testMode, setTestMode] = useState<"mixed" | "subject">("mixed");
  const [selectedSubject, setSelectedSubject] = useState("maths");
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number | "unlimited">(20);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(20);
  const [testStarted, setTestStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [softError, setSoftError] = useState(""); // non-blocking error (rating save fail)
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryEntry[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
  const [startedAt] = useState(new Date().toISOString());
  const [initialRating, setInitialRating] = useState(getInitialRating(classNumber));
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
  const [showPalette, setShowPalette] = useState(true);
  const [wronglyAnsweredIds, setWronglyAnsweredIds] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Per-question stopwatch (counts up from 0 each time a new question loads),
  // shown alongside the overall countdown so a student can see time spent on
  // just the current question.
  const [questionElapsedSeconds, setQuestionElapsedSeconds] = useState(0);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setLanguage(detail?.language || localStorage.getItem("appLanguage") || "hi");
    };

    window.addEventListener("appLanguageChanged", handleLanguageChange);
    return () => window.removeEventListener("appLanguageChanged", handleLanguageChange);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/quizzes/adaptive-test/questions/${classNumber}`, {
          params: { studentId: storedStudent?.studentId },
        });
        setQuestions(res.data.questions || []);
        setInitialRating(res.data.currentRating || getInitialRating(classNumber));
        setAdaptiveState((prev) => ({
          ...prev,
          rating: res.data.currentRating || getInitialRating(classNumber),
        }));
        setWronglyAnsweredIds(new Set(res.data.wronglyAnsweredIds || []));
        setQuestionHistory([]);
        setCurrentHistoryIndex(0);
      } catch (loadError) {
        console.error(loadError);
        setError("Adaptive questions could not be loaded right now.");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [classNumber, storedStudent?.studentId]);

  // Class-scoped leaderboard for the student's own school + grade.
  const [leaderboard, setLeaderboard] = useState<{ studentId: string; name: string; rating: number; testsTaken: number }[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const loadLeaderboard = async () => {
      if (!storedStudent?.schoolId) { setLeaderboardLoading(false); return; }
      try {
        setLeaderboardLoading(true);
        const res = await axios.get(`${API_URL}/quizzes/adaptive-test/leaderboard`, {
          params: { schoolId: storedStudent.schoolId, classNumber },
        });
        if (active) {
          const normalizedLeaderboard = (res.data.leaderboard || []).map((entry: any) => ({
            studentId: entry.studentId,
            name: entry.name,
            rating: Number(entry.rating || 0),
            testsTaken: Number(entry.totalTestsAttempted ?? entry.testsTaken ?? 0),
          }));
          setLeaderboard(normalizedLeaderboard);
        }
      } catch (lbError) {
        console.error("Leaderboard load failed:", lbError);
        if (active) setLeaderboard([]);
      } finally {
        if (active) setLeaderboardLoading(false);
      }
    };
    loadLeaderboard();
    return () => { active = false; };
  }, [classNumber, storedStudent?.schoolId, result]);

  const activeQuestions = useMemo(
    () => (testMode === "subject" ? questions.filter((question) => question.subject === selectedSubject) : questions),
    [questions, selectedSubject, testMode]
  );
  const isUnlimitedMode = selectedQuestionCount === "unlimited";
  const plannedQuestionCount = isUnlimitedMode
    ? activeQuestions.length
    : Math.min(selectedQuestionCount as number, activeQuestions.length);

  // Derived answered count
  const answeredCount = questionHistory.filter((e) => e.status === "answered").length;
  const skippedCount = questionHistory.filter((e) => e.status === "skipped").length;
  const reviewCount = questionHistory.filter((e) => e.status === "review").length;

  const progress = isUnlimitedMode
    ? selectedTimeLimit > 0
      ? Math.round(((selectedTimeLimit * 60 - timeRemaining) / (selectedTimeLimit * 60)) * 100)
      : 0
    : plannedQuestionCount > 0
    ? Math.round((answeredCount / plannedQuestionCount) * 100)
    : 0;

  const currentHistoryEntry = questionHistory[currentHistoryIndex];
  const currentQuestion = currentHistoryEntry?.question || null;
  const isHindi = language === "hi";
  const visibleHint =
    isHindi
      ? currentQuestion?.hintsHindi?.[0] || currentQuestion?.hints?.[0] || ""
      : currentQuestion?.hints?.[0] || currentQuestion?.hintsHindi?.[0] || "";

  const toggleLanguage = () => {
    const nextLanguage = isHindi ? "en" : "hi";
    setLanguage(nextLanguage);
    localStorage.setItem("appLanguage", nextLanguage);
    window.dispatchEvent(new CustomEvent("appLanguageChanged", { detail: { language: nextLanguage } }));
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (fullscreenError) {
      console.warn("Fullscreen toggle failed:", fullscreenError);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // ── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!testStarted || result || submitting) return;
    if (timeRemaining <= 0) {
      const finalAnswers = questionHistory
        .filter((entry) => entry.status === "answered" && entry.selectedOptionIndex !== null)
        .map((entry) => ({
          question: entry.question,
          selectedOptionIndex: entry.selectedOptionIndex!,
          hintUsed: entry.hintUsed,
          timeSpentMs: entry.timeSpentMs,
        }));
      finishTest(finalAnswers);
      return;
    }

    const timer = window.setInterval(() => {
      setTimeRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [result, submitting, testStarted, timeRemaining]);

  // Per-question stopwatch: resets whenever questionStartedAt changes (new
  // question, or navigating), ticks every second while the test is active.
  useEffect(() => {
    setQuestionElapsedSeconds(0);
    if (!testStarted || result || submitting) return;
    const timer = window.setInterval(() => {
      setQuestionElapsedSeconds(Math.floor((Date.now() - questionStartedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [questionStartedAt, testStarted, result, submitting]);

  // ── Finish Test ────────────────────────────────────────────────────────
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
      const correct = finalAnswers.filter((answer) => answer.selectedOptionIndex === answer.question.correctAnswerIndex).length;
      const incorrect = finalAnswers.length - correct;
      const localResult: SubmitResult = {
        ratingBand: band,
        ratingBefore: initialRating,
        ratingAfter: adaptiveState.rating,
        ratingChange: adaptiveState.rating - initialRating,
        momentum: "unknown",
        weakTopics: [],
        score: {
          correct,
          incorrect,
          total: finalAnswers.length,
          accuracy: finalAnswers.length ? Math.round((correct / finalAnswers.length) * 100) : 0,
        },
        review: finalAnswers.map((answer) => ({
          questionId: answer.question.id,
          question: answer.question.question,
          questionHindi: answer.question.questionHindi,
          options: answer.question.options,
          optionsHindi: answer.question.optionsHindi || [],
          selectedOptionIndex: answer.selectedOptionIndex,
          correctAnswerIndex: answer.question.correctAnswerIndex,
          isCorrect: answer.selectedOptionIndex === answer.question.correctAnswerIndex,
          hintUsed: answer.hintUsed,
          hints: answer.question.hints || [],
          hintsHindi: answer.question.hintsHindi || [],
          explanation: answer.question.explanation,
          explanationHindi: answer.question.explanationHindi,
          ratingBefore: adaptiveState.rating,
          ratingAfter: adaptiveState.rating,
          ratingChange: 0,
        })),
      };
      setResult(localResult);
      // Soft error — result still shown, only the save failed
      setSoftError("Your score is shown below, but the rating could not be saved to the server due to a connection issue.");
    } finally {
      setSubmitting(false);
    }
  };

  const createHistoryEntry = (question: AdaptiveQuestion): QuestionHistoryEntry => ({
    question,
    selectedOptionIndex: null,
    status: "unanswered",
    timeSpentMs: 0,
    hintUsed: false,
    startedAt: Date.now(),
  });

  const startTest = () => {
    const firstQuestion = chooseNextQuestion(activeQuestions, new Set(), adaptiveState, [], wronglyAnsweredIds);
    if (!firstQuestion) {
      setError("No adaptive questions are available for the selected mode.");
      return;
    }

    setQuestionHistory([createHistoryEntry(firstQuestion)]);
    setCurrentHistoryIndex(0);
    setResult(null);
    setSoftError("");
    setSelectedOptionIndex(null);
    setShowHint(false);
    setHintUsed(false);
    setTimeRemaining(isUnlimitedMode ? selectedTimeLimit * 60 : (selectedQuestionCount as number) * 60);
    setTestStarted(true);
    setQuestionStartedAt(Date.now());
  };

  const updateCurrentHistory = (update: Partial<QuestionHistoryEntry>) => {
    setQuestionHistory((history) =>
      history.map((entry, index) =>
        index === currentHistoryIndex ? { ...entry, ...update } : entry
      )
    );
  };

  const addNewQuestionHistory = (question: AdaptiveQuestion) => {
    setQuestionHistory((history) => [...history, createHistoryEntry(question)]);
    setCurrentHistoryIndex((index) => index + 1);
  };

  const saveAnswerAndProceed = async (answer: AttemptAnswer) => {
    const nextState = updateLocalState(adaptiveState, answer, classNumber);
    setAdaptiveState(nextState);

    const updatedHistory = questionHistory.map((entry, index) =>
      index === currentHistoryIndex
        ? { ...entry, selectedOptionIndex: answer.selectedOptionIndex, status: "answered" as QuestionStatus, timeSpentMs: answer.timeSpentMs, hintUsed: answer.hintUsed }
        : entry
    );

    setQuestionHistory(updatedHistory);

    if (updatedHistory.filter((e) => e.status === "answered").length >= plannedQuestionCount && !isUnlimitedMode) {
      await finishTest(
        updatedHistory
          .filter((entry) => entry.status === "answered" && entry.selectedOptionIndex !== null)
          .map((entry) => ({
            question: entry.question,
            selectedOptionIndex: entry.selectedOptionIndex!,
            hintUsed: entry.hintUsed,
            timeSpentMs: entry.timeSpentMs,
          }))
      );
      return;
    }

    const servedIds = new Set(updatedHistory.filter((e) => e.status !== "unanswered").map((e) => e.question.id));
    const nextQuestion = chooseNextQuestion(
      activeQuestions,
      servedIds,
      nextState,
      updatedHistory.map((item) => item.question.topicId),
      wronglyAnsweredIds
    );

    if (!nextQuestion) {
      await finishTest(
        updatedHistory
          .filter((entry) => entry.status === "answered" && entry.selectedOptionIndex !== null)
          .map((entry) => ({
            question: entry.question,
            selectedOptionIndex: entry.selectedOptionIndex!,
            hintUsed: entry.hintUsed,
            timeSpentMs: entry.timeSpentMs,
          }))
      );
      return;
    }

    if (currentHistoryIndex < updatedHistory.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    } else {
      setQuestionHistory((h) => [...h, createHistoryEntry(nextQuestion)]);
      setCurrentHistoryIndex(updatedHistory.length);
    }
    setSelectedOptionIndex(null);
    setShowHint(false);
    setHintUsed(false);
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

    await saveAnswerAndProceed(answer);
  };

  const markForReview = () => {
    if (!currentQuestion) return;
    const newStatus: QuestionStatus = currentHistoryEntry?.status === "review" ? "unanswered" : "review";
    updateCurrentHistory({ status: newStatus });
  };

  const skipQuestion = () => {
    if (!currentQuestion) return;
    const timeSpent = Date.now() - questionStartedAt;
    const updatedHistory = questionHistory.map((entry, index) =>
      index === currentHistoryIndex
        ? { ...entry, status: "skipped" as QuestionStatus, timeSpentMs: timeSpent }
        : entry
    );
    setQuestionHistory(updatedHistory);

    const servedIds = new Set(updatedHistory.filter((e) => e.status !== "unanswered").map((e) => e.question.id));
    const nextQuestion = chooseNextQuestion(
      activeQuestions,
      servedIds,
      adaptiveState,
      updatedHistory.map((item) => item.question.topicId),
      wronglyAnsweredIds
    );

    if (nextQuestion) {
      if (currentHistoryIndex < updatedHistory.length - 1) {
        setCurrentHistoryIndex(currentHistoryIndex + 1);
      } else {
        setQuestionHistory((h) => [...h, createHistoryEntry(nextQuestion)]);
        setCurrentHistoryIndex(updatedHistory.length);
      }
      setSelectedOptionIndex(null);
      setShowHint(false);
      setHintUsed(false);
      setQuestionStartedAt(Date.now());
    } else {
      finishTest(
        updatedHistory
          .filter((entry) => entry.status === "answered" && entry.selectedOptionIndex !== null)
          .map((entry) => ({
            question: entry.question,
            selectedOptionIndex: entry.selectedOptionIndex!,
            hintUsed: entry.hintUsed,
            timeSpentMs: entry.timeSpentMs,
          }))
      );
    }
  };

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= questionHistory.length) return;
    const entry = questionHistory[index];
    // Already-answered questions are locked (no backward navigation to change a
    // committed answer); skipped / marked-for-review / the current question can
    // still be revisited before finishing the test.
    if (entry.status === "answered" && index !== currentHistoryIndex) return;
    setCurrentHistoryIndex(index);
    setSelectedOptionIndex(entry?.selectedOptionIndex ?? null);
    setShowHint(false);
    setHintUsed(entry?.hintUsed || false);
    setQuestionStartedAt(Date.now());
  };

  const resetTest = () => {
    const initial = result?.ratingAfter || adaptiveState.rating || getInitialRating(classNumber);
    setQuestionHistory([]);
    setCurrentHistoryIndex(0);
    setResult(null);
    setSoftError("");
    setTestStarted(false);
    setTimeRemaining(isUnlimitedMode ? selectedTimeLimit * 60 : (selectedQuestionCount as number) * 60);
    setSelectedOptionIndex(null);
    setShowHint(false);
    setHintUsed(false);
    setAdaptiveState({
      rating: initial,
      velocity: 0,
      attempts: 0,
      streak: 0,
      variance: 100,
      recentOutcomes: [],
    });
    setQuestionStartedAt(Date.now());
  };

  // ── Loading ────────────────────────────────────────────────────────────
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

  // Hard error — no result at all
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

  // ── Main Render ────────────────────────────────────────────────────────
  // While a test is in progress the content area uses the full viewport width
  // (and skips the footer) so the question fits the complete screen instead of
  // being boxed into the same reading-width container as the setup/result
  // screens.
  const inTestScreen = testStarted && !result;
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className={`flex-1 ${inTestScreen ? "flex flex-col py-4" : "py-6 md:py-8"}`}>
        <div className={`mx-auto w-full px-4 ${inTestScreen ? "max-w-[1800px] flex-1 flex flex-col" : "max-w-7xl"}`}>
          {/* Top bar */}
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
              <p className="mt-1 text-slate-600">MARS-based routing — Class {classNumber} · Rating band {band.min}–{band.max}.</p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={toggleLanguage} className="gap-2">
                  <Languages className="h-4 w-4" />
                  {isHindi ? "English" : "हिंदी"}
                </Button>
                {testStarted && !result && (
                  <Button type="button" variant="outline" size="sm" onClick={toggleFullscreen} className="gap-2">
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    {isFullscreen ? (isHindi ? "बाहर निकलें" : "Exit") : (isHindi ? "पूर्ण स्क्रीन" : "Fullscreen")}
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:min-w-72">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500">{isHindi ? "रेटिंग" : "Rating"}</p>
                    {testStarted && !result ? (
                      // Live rating is hidden during the test itself — per-question
                      // rating swings would tell the student whether they just
                      // answered correctly, defeating the point of the test.
                      <p className="text-2xl font-bold text-slate-400" title={isHindi ? "टेस्ट पूरा होने पर दिखेगा" : "Revealed after you finish"}>•••</p>
                    ) : (
                      <p className="text-2xl font-bold text-blue-700">{result?.ratingAfter ?? adaptiveState.rating}</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500">Questions</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {result?.score.total ?? answeredCount}/{isUnlimitedMode ? "∞" : plannedQuestionCount}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* ── SETUP SCREEN ─────────────────────────────────────────────── */}
          {!result && !testStarted ? (
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-blue-600">Class {classNumber}</Badge>
                  <Badge variant="outline">Rating {adaptiveState.rating}</Badge>
                  <Badge variant="outline">{band.min}–{band.max}</Badge>
                </div>
                <CardTitle className="text-2xl">Adaptive Test Setup</CardTitle>
                <CardDescription>
                  Choose the test type, number of questions, and time limit before starting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Test type */}
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

                {/* Question count */}
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-700">Number of Questions</p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {QUESTION_COUNT_OPTIONS.map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          setSelectedQuestionCount(count);
                          if (count !== "unlimited") {
                            setTimeRemaining((count as number) * 60);
                          }
                        }}
                        className={`rounded-lg border-2 p-4 text-center transition ${
                          selectedQuestionCount === count
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-slate-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <p className="text-2xl font-bold">{count === "unlimited" ? "∞" : count}</p>
                        <p className="text-sm text-slate-600">{count === "unlimited" ? "No Limit" : `${count} mins`}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time limit selector (only for unlimited mode) */}
                {isUnlimitedMode && (
                  <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-blue-800 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Select Time Limit for No-Limit Mode
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {TIME_LIMIT_OPTIONS.map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            setSelectedTimeLimit(mins);
                            setTimeRemaining(mins * 60);
                          }}
                          className={`rounded-lg border-2 p-3 text-center transition ${
                            selectedTimeLimit === mins
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-blue-300 bg-white text-slate-700 hover:border-blue-500"
                          }`}
                        >
                          <p className="text-xl font-bold">{mins}</p>
                          <p className="text-xs">minutes</p>
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-blue-700">
                      Questions will keep coming until the timer runs out or question pool is exhausted.
                    </p>
                  </div>
                )}

                {/* Summary */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">Selected pool</p>
                      <p className="text-xl font-bold text-slate-900">{activeQuestions.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Test length</p>
                      <p className="text-xl font-bold text-slate-900">
                        {isUnlimitedMode ? "Unlimited" : `${plannedQuestionCount} questions`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Time limit</p>
                      <p className="text-xl font-bold text-slate-900">
                        {isUnlimitedMode ? `${selectedTimeLimit} minutes` : `${selectedQuestionCount} minutes`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button disabled={plannedQuestionCount === 0} onClick={startTest} className="px-8">
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Start Test
                  </Button>
                </div>

                {/* ── Class leaderboard (this school + grade only) ──────────── */}
                <div className="mt-6 rounded-lg border bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold text-slate-900">
                      {language === "hi" ? "क्लास लीडरबोर्ड" : "Class Leaderboard"}
                    </h3>
                    <Badge variant="outline" className="ml-auto">Class {classNumber}</Badge>
                  </div>
                  {leaderboardLoading ? (
                    <p className="py-4 text-center text-sm text-slate-500">{language === "hi" ? "लोड हो रहा है…" : "Loading…"}</p>
                  ) : leaderboard.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-500">
                      {language === "hi" ? "अभी कोई रैंकिंग नहीं है। पहला टेस्ट पूरा करें!" : "No rankings yet. Be the first to complete a test!"}
                    </p>
                  ) : (
                    <ol className="space-y-1">
                      {leaderboard.map((entry, i) => {
                        const isMe = entry.studentId === storedStudent?.studentId;
                        return (
                          <li
                            key={entry.studentId}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${isMe ? "bg-blue-50 font-semibold" : ""}`}
                          >
                            <span className={`w-6 text-center font-bold ${
                              i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-600" : "text-slate-500"
                            }`}>{i + 1}</span>
                            <span className="flex-1 truncate">{entry.name}{isMe ? (language === "hi" ? " (आप)" : " (You)") : ""}</span>
                            <span className="text-slate-500">
                              {entry.testsTaken} {language === "hi" ? "टेस्ट दिए" : "tests attempted"}
                            </span>
                            <span className="w-16 text-right font-bold text-blue-700">{entry.rating}</span>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              </CardContent>
            </Card>

          /* ── IN-TEST SCREEN ─────────────────────────────────────────────── */
          ) : !result ? (
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

              {/* ── Left: Question + Controls ──────────────────────────────── */}
              <div className="flex-1 space-y-4 min-w-0">
                {/* Progress bar */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-3 flex items-center justify-between text-sm text-slate-600">
                      <span className="font-medium">
                        Question <span className="text-blue-700 font-bold">{currentHistoryIndex + 1}</span> of{" "}
                        <span className="font-bold">{isUnlimitedMode ? questionHistory.length : plannedQuestionCount}</span>
                      </span>
                      <span className="inline-flex items-center gap-3">
                        <span>{progress}%</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${
                          timeRemaining < 60 ? "bg-red-100 text-red-700 animate-pulse" : "bg-slate-100 text-slate-700"
                        }`}>
                          <Clock className="h-4 w-4" />
                          {formatTime(timeRemaining)}
                        </span>
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    {/* Status legend */}
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-green-500 inline-block" />{answeredCount} Answered</span>
                      <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-orange-400 inline-block" />{skippedCount} Skipped</span>
                      <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-purple-500 inline-block" />{reviewCount} For Review</span>
                      <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full border border-slate-300 inline-block" />{questionHistory.length - answeredCount - skippedCount - reviewCount} Not Visited</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Soft error (non-blocking) */}
                {softError && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-2 text-sm text-amber-800">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{softError}</span>
                  </div>
                )}

                {/* Question card */}
                <Card className="shadow-sm">
                  <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-blue-600 text-white">Q{currentHistoryIndex + 1}</Badge>
                      <Badge variant="outline">{currentQuestion?.subject}</Badge>
                      <Badge variant="outline">{currentQuestion?.difficulty}</Badge>
                      <Badge className="bg-indigo-600 text-white">Elo {currentQuestion?.eloRating}</Badge>
                      {currentHistoryEntry?.status === "review" && (
                        <Badge className="bg-purple-500 text-white flex items-center gap-1">
                          <Flag className="h-3 w-3" /> Marked for Review
                        </Badge>
                      )}
                      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={toggleLanguage} className="h-8 gap-1 px-2">
                          <Languages className="h-3.5 w-3.5" />
                          {isHindi ? "English" : "हिंदी"}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={toggleFullscreen} className="h-8 gap-1 px-2">
                          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                          {isFullscreen ? (isHindi ? "बाहर" : "Exit") : (isHindi ? "पूर्ण" : "Full")}
                        </Button>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${
                            questionElapsedSeconds >= 90 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                          }`}
                          title={isHindi ? "इस प्रश्न पर बिताया गया समय" : "Time spent on this question"}
                        >
                          <Clock className="h-4 w-4" />
                          {formatTime(questionElapsedSeconds)}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-xl leading-relaxed">
                      <MathText
                        text={
                          isHindi
                            ? currentQuestion?.questionHindi || currentQuestion?.question
                            : currentQuestion?.question || currentQuestion?.questionHindi
                        }
                      />
                    </CardTitle>
                    <QuestionMedia imageUrl={currentQuestion?.questionImage} />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      {(currentQuestion?.options || []).map((option, index) => {
                        const label =
                          isHindi
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
                            <MathText text={label} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Hint */}
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
                            <p><MathText text={visibleHint} /></p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      {/* Left: Skip & Mark for review (no Previous — adaptive tests are forward-only) */}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={skipQuestion}
                          className="flex items-center gap-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <SkipForward className="h-4 w-4" />
                          Skip
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={markForReview}
                          className={`flex items-center gap-1 ${
                            currentHistoryEntry?.status === "review"
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-purple-300 text-purple-700 hover:bg-purple-50"
                          }`}
                        >
                          <BookmarkCheck className="h-4 w-4" />
                          {currentHistoryEntry?.status === "review" ? "Unmark" : "Mark Review"}
                        </Button>
                      </div>

                      {/* Right: Next/Submit */}
                      <Button
                        disabled={selectedOptionIndex === null || submitting}
                        onClick={moveNext}
                        className="flex items-center gap-1"
                      >
                        {answeredCount + 1 >= plannedQuestionCount && !isUnlimitedMode ? (
                          <>
                            <Send className="mr-1 h-4 w-4" />
                            Finish Test
                          </>
                        ) : (
                          <>
                            <ChevronRight className="mr-1 h-4 w-4" />
                            Next Question
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Submit all */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={submitting || answeredCount === 0}
                        onClick={() =>
                          finishTest(
                            questionHistory
                              .filter((e) => e.status === "answered" && e.selectedOptionIndex !== null)
                              .map((e) => ({
                                question: e.question,
                                selectedOptionIndex: e.selectedOptionIndex!,
                                hintUsed: e.hintUsed,
                                timeSpentMs: e.timeSpentMs,
                              }))
                          )
                        }
                        className="text-sm text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Send className="mr-1 h-3 w-3" />
                        Submit Test ({answeredCount} answered)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── Right: GATE-style Question Palette ──────────────────────── */}
              <div className="w-full lg:w-64 flex-shrink-0">
                <Card className="sticky top-4 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Question Palette</CardTitle>
                      <button
                        type="button"
                        onClick={() => setShowPalette((v) => !v)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {showPalette ? "Hide" : "Show"}
                      </button>
                    </div>
                  </CardHeader>
                  {showPalette && (
                    <CardContent className="pt-0">
                      {/* Legend */}
                      <div className="mb-3 grid grid-cols-2 gap-1 text-xs">
                        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-green-500 inline-block" /> Answered</span>
                        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-orange-400 inline-block" /> Skipped</span>
                        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-purple-500 inline-block" /> Review</span>
                        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border border-slate-300 inline-block" /> Not Visited</span>
                      </div>

                      {/* Bubble grid */}
                      <div className="flex flex-wrap gap-2">
                        {questionHistory.map((entry, idx) => {
                          const locked = entry.status === "answered" && idx !== currentHistoryIndex;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => goToQuestion(idx)}
                              disabled={locked}
                              className={`h-9 w-9 rounded-md border-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                locked ? "cursor-not-allowed opacity-70" : "hover:scale-110"
                              } ${
                                idx === currentHistoryIndex
                                  ? "ring-2 ring-blue-500 ring-offset-1 " + statusColors[entry.status]
                                  : statusColors[entry.status]
                              }`}
                              title={locked ? `${isHindi ? "उत्तर दर्ज हो चुका" : "Already answered"} — ${idx + 1}` : `Question ${idx + 1} — ${entry.status}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>

                      {/* Summary counts */}
                      <div className="mt-4 space-y-1 rounded-lg bg-slate-50 p-3 text-xs">
                        <div className="flex justify-between"><span className="text-green-700 font-semibold">Answered</span><span>{answeredCount}</span></div>
                        <div className="flex justify-between"><span className="text-orange-600 font-semibold">Skipped</span><span>{skippedCount}</span></div>
                        <div className="flex justify-between"><span className="text-purple-600 font-semibold">For Review</span><span>{reviewCount}</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">Not Visited</span><span>{questionHistory.length - answeredCount - skippedCount - reviewCount}</span></div>
                        <hr className="border-slate-200" />
                        <div className="flex justify-between font-bold"><span>Total Seen</span><span>{questionHistory.length}</span></div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>

          /* ── RESULT SCREEN ─────────────────────────────────────────────── */
          ) : (
            <div className="space-y-6">
              {/* Soft error banner */}
              {softError && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-2 text-sm text-amber-800">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{softError}</span>
                </div>
              )}

              <Card>
                <CardHeader className="text-center">
                  <Trophy className="mx-auto h-14 w-14 text-yellow-500" />
                  <CardTitle className="text-3xl">Adaptive Test Complete!</CardTitle>
                  <CardDescription>
                    Rating {result.ratingBefore} → {result.ratingAfter} ({result.ratingChange >= 0 ? "+" : ""}
                    {result.ratingChange}) · momentum: {result.momentum}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                      <p className="text-sm text-green-700">Correct</p>
                      <p className="text-3xl font-bold text-green-700">{result.score.correct}</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-4 text-center">
                      <p className="text-sm text-red-700">Incorrect</p>
                      <p className="text-3xl font-bold text-red-700">{result.score.incorrect}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <p className="text-sm text-blue-700">Accuracy</p>
                      <p className="text-3xl font-bold text-blue-700">{result.score.accuracy}%</p>
                    </div>
                    <div className="rounded-lg bg-slate-100 p-4 text-center">
                      <p className="text-sm text-slate-700">Band</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {result.ratingBand.min}–{result.ratingBand.max}
                      </p>
                    </div>
                  </div>
                  {result.weakTopics.length > 0 && (
                    <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
                      <p className="text-sm font-semibold text-orange-800 mb-2">Weak Topics to Revise:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.weakTopics.map((topic) => (
                          <Badge key={topic} variant="outline" className="border-orange-400 text-orange-700">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review answers — hints and explanations are now visible for
                  every question (not just ones where the hint was opened
                  during the test), and only the current language is shown. */}
              <Card>
                <CardHeader>
                  <CardTitle>{isHindi ? "उत्तर समीक्षा" : "Review Answers"}</CardTitle>
                  <CardDescription>
                    {isHindi ? "सही उत्तर, हिंट, व्याख्या और रेटिंग बदलाव देखें।" : "Check the correct answers, hints, explanations, and rating movement."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdaptiveReviewList items={result.review} isHindi={isHindi} />
                </CardContent>
              </Card>

              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={resetTest} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Take Again
                </Button>
                <Link to="/student/dashboard">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      {!inTestScreen && <Footer />}
    </div>
  );
};

export default AdaptiveTest;
