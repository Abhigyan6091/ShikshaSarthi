import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Volume2, Video, BookOpen, Puzzle, ChevronLeft, ChevronRight, Flag, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import EmbeddableMemoryMatch from '@/components/puzzles/EmbeddableMemoryMatch';
import EmbeddableMatchPieces from '@/components/puzzles/EmbeddableMatchPieces';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAdvancedQuizDraft, setAdvancedQuizDraft } from '@/store/slices/advancedQuizDraftSlice';

const API_URL = import.meta.env.VITE_API_URL;

interface QuestionData {
  _id: string;
  type: 'mcq' | 'audio' | 'video' | 'puzzle';
  data: any;
}

interface Answer {
  questionId: string;
  questionType: string;
  selectedAnswer: string | string[] | null;
  timeSpent: number;
  videoAnalytics?: {
    videoDuration: number;
    watchTime: number;
    watchPercentage: number;
    pauseCount: number;
    seekCount: number;
    playbackEvents: Array<{action: string; timestamp: number}>;
  };
  puzzleData?: {
    puzzleType: string;
    score: number;
    timeTaken: number;
    endReason: string;
    [key: string]: any;
  };
}

interface QuizInfo {
  quizId: string;
  teacherId: string;
  timeLimit: number;
  totalQuestions: number;
  questionTypes: {
    mcq: number;
    audio: number;
    video: number;
    puzzle: number;
  };
  startTime: string;
  endTime: string;
  questions: string[];
  videoQuestionMetadata?: Array<{
    slotIndex: number;
    parentVideoId: string;
    questionIndex: number;
  }>;
}

interface AdvancedQuizPlayerLocationState {
  quizInfo?: QuizInfo;
  studentId?: string;
}

const AdvancedQuizPlayer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  
  const locationState = (location.state || {}) as AdvancedQuizPlayerLocationState;
  const persistedDraft = useAppSelector((state) => state.advancedQuizDraft.currentDraft);
  const initialQuizInfoRef = useRef<QuizInfo | undefined>((locationState.quizInfo || persistedDraft?.quizInfo) as QuizInfo | undefined);
  const initialStudentIdRef = useRef<string>(locationState.studentId || persistedDraft?.studentId || '');

  const quizInfo = initialQuizInfoRef.current as QuizInfo;
  const studentId: string = initialStudentIdRef.current;
  
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialTimeLimit, setInitialTimeLimit] = useState(0); // Store the actual starting time
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [countdownToStart, setCountdownToStart] = useState(0);
  
  // Puzzle results tracking — maps questionId to puzzle result data
  const [puzzleResults, setPuzzleResults] = useState<{[key: string]: any}>({});

  // Video analytics tracking
  const [videoAnalytics, setVideoAnalytics] = useState<{[key: string]: {
    videoDuration: number;
    watchTime: number;
    watchPercentage: number;
    pauseCount: number;
    seekCount: number;
    playbackEvents: Array<{action: string; timestamp: number}>;
    lastPlayTime: number;
  }}>({});
  
  const timerRef = useRef<ReturnType<typeof window.setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof window.setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());
  const answersRef = useRef<Answer[]>([]);
  const questionsRef = useRef<QuestionData[]>([]);
  const draftRestoreCompletedRef = useRef<boolean>(false);
  const lastServerDraftSaveRef = useRef<number>(0);
  const initialPersistedDraftRef = useRef(persistedDraft);
  const nextServerDraftSyncAtRef = useRef<number>(0);
  const SERVER_DRAFT_SYNC_INTERVAL_SECONDS = 10 * 60;
  const INITIAL_SERVER_DRAFT_SYNC_DELAY_SECONDS = 20;
  const LOCAL_DRAFT_TIME_CHECKPOINT_SECONDS = 30;

  const createDraftSnapshot = () => {
    if (!quizInfo || !studentId) {
      return null;
    }

    return {
      quizId: quizInfo.quizId,
      studentId: studentId.trim(),
      quizInfo,
      currentIndex,
      answers,
      puzzleResults,
      videoAnalytics,
      timeRemaining,
      initialTimeLimit,
      quizStarted,
      quizEnded,
      startedAt: new Date(startTimeRef.current).toISOString()
    };
  };

  const applyDraftState = (
    draft: any,
    fallbackTimeRemaining: number,
    fallbackInitialTimeLimit: number
  ) => {
    const safeCurrentIndex = Math.max(0, Number(draft?.currentIndex || 0));
    const safeAnswers = Array.isArray(draft?.answers) ? draft.answers : [];
    const safePuzzleResults = draft?.puzzleResults && typeof draft.puzzleResults === 'object'
      ? draft.puzzleResults
      : {};
    const safeVideoAnalytics = draft?.videoAnalytics && typeof draft.videoAnalytics === 'object'
      ? draft.videoAnalytics
      : {};
    const safeInitialTime = Number(draft?.initialTimeLimit || fallbackInitialTimeLimit);
    const requestedTimeRemaining = Number(draft?.timeRemaining || fallbackTimeRemaining);
    const safeTimeRemaining = Math.max(
      0,
      Math.min(requestedTimeRemaining, fallbackTimeRemaining)
    );

    setCurrentIndex(safeCurrentIndex);
    setAnswers(safeAnswers);
    setPuzzleResults(safePuzzleResults);
    setVideoAnalytics(safeVideoAnalytics);
    setInitialTimeLimit(safeInitialTime);
    setTimeRemaining(safeTimeRemaining);

    if (draft?.quizStarted) {
      setShowInstructions(false);
      setQuizStarted(true);
    }

    if (draft?.startedAt) {
      const parsed = new Date(draft.startedAt).getTime();
      startTimeRef.current = Number.isFinite(parsed) ? parsed : Date.now();
    } else {
      startTimeRef.current = Date.now();
    }

    questionStartTimeRef.current = Date.now();
    draftRestoreCompletedRef.current = true;
  };

  const saveDraftToServer = async (force = false) => {
    const snapshot = createDraftSnapshot();
    if (!snapshot || !snapshot.quizStarted || snapshot.quizEnded) {
      return;
    }

    const now = Date.now();
    if (
      !force &&
      now - lastServerDraftSaveRef.current < SERVER_DRAFT_SYNC_INTERVAL_SECONDS * 1000
    ) {
      return;
    }

    lastServerDraftSaveRef.current = now;

    try {
      await axios.put(`${API_URL}/quizzes/advanced-draft`, snapshot);
    } catch (error) {
      console.error('Failed to sync advanced quiz draft to database:', error);
    }
  };

  useEffect(() => {
    if (!quizInfo) {
      navigate('/student/take-advanced-quiz');
      return;
    }
    
    // Validate studentId
    if (!studentId || studentId.trim() === '') {
      console.error('StudentId is missing or empty:', studentId);
      toast({
        title: "Error",
        description: "Student ID is missing. Please log in and try again.",
        variant: "destructive"
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    console.log('Quiz initialized with studentId:', studentId);

    const initializeQuizAttempt = async () => {
      await loadQuestions();

      // Calculate remaining time based on quiz end time (not just time limit)
      const nowTime = new Date();
      const endTime = new Date(quizInfo.endTime);
      const remainingSeconds = Math.floor((endTime.getTime() - nowTime.getTime()) / 1000);

      // Use the smaller of: remaining time to end OR configured time limit
      const configuredTimeLimit = quizInfo.timeLimit * 60;
      const actualTimeRemaining = Math.min(remainingSeconds, configuredTimeLimit);

      if (actualTimeRemaining <= 0) {
        // Quiz time has already expired
        setTimeRemaining(0);
        toast({
          title: "Quiz Ended",
          description: "The quiz time has expired",
          variant: "destructive"
        });
        setTimeout(() => navigate('/student'), 2000);
        return;
      }

      setTimeRemaining(actualTimeRemaining);
      setInitialTimeLimit(actualTimeRemaining); // Store the initial time for accurate calculation later
      console.log(`Time remaining calculated: ${actualTimeRemaining}s (${Math.floor(actualTimeRemaining / 60)}m)`);

      // Calculate countdown to quiz start
      const startTime = new Date(quizInfo.startTime);
      const secondsUntilStart = Math.floor((startTime.getTime() - nowTime.getTime()) / 1000);
      if (secondsUntilStart > 0) {
        setCountdownToStart(secondsUntilStart);
      }

      let restoredFromDraft = false;
      let skipLocalRestore = false;

      const persistedDraftSnapshot = initialPersistedDraftRef.current;
      if (
        persistedDraftSnapshot &&
        (
          String(persistedDraftSnapshot.quizId || '').trim() !== String(quizInfo.quizId || '').trim() ||
          String(persistedDraftSnapshot.studentId || '').trim() !== String(studentId || '').trim()
        )
      ) {
        dispatch(clearAdvancedQuizDraft());
      }

      try {
        const response = await axios.get(`${API_URL}/quizzes/advanced-draft/${quizInfo.quizId}/${studentId}`);
        if (response.data?.draft) {
          applyDraftState(response.data.draft, actualTimeRemaining, actualTimeRemaining);
          restoredFromDraft = true;
          toast({
            title: "Progress Restored",
            description: "Your previous advanced quiz answers were restored."
          });
        }
      } catch (draftError: any) {
        if (draftError.response?.status === 409) {
          skipLocalRestore = true;
          dispatch(clearAdvancedQuizDraft());
        }

        if (draftError.response?.status !== 404 && draftError.response?.status !== 409) {
          console.error('Failed to fetch server-side advanced quiz draft:', draftError);
        }
      }

      if (
        !restoredFromDraft &&
        !skipLocalRestore &&
        persistedDraftSnapshot &&
        persistedDraftSnapshot.quizId === quizInfo.quizId &&
        persistedDraftSnapshot.studentId === studentId
      ) {
        applyDraftState(persistedDraftSnapshot, actualTimeRemaining, actualTimeRemaining);
        toast({
          title: "Progress Restored",
          description: "Recovered your quiz progress from local storage."
        });
      } else if (!restoredFromDraft) {
        draftRestoreCompletedRef.current = true;
      }
    };

    initializeQuizAttempt();
  }, [quizInfo, studentId, navigate, toast, dispatch]);

  // Keep refs in sync with state
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex >= questions.length) {
      setCurrentIndex(questions.length - 1);
    }
  }, [questions, currentIndex]);

  const localDraftTimeCheckpoint = Math.floor(
    timeRemaining / LOCAL_DRAFT_TIME_CHECKPOINT_SECONDS
  );

  useEffect(() => {
    if (!draftRestoreCompletedRef.current) {
      return;
    }

    const snapshot = createDraftSnapshot();
    if (!snapshot) {
      return;
    }

    dispatch(setAdvancedQuizDraft(snapshot));
  }, [
    dispatch,
    quizInfo,
    studentId,
    currentIndex,
    answers,
    puzzleResults,
    videoAnalytics,
    localDraftTimeCheckpoint,
    initialTimeLimit,
    quizStarted,
    quizEnded
  ]);

  useEffect(() => {
    if (!quizInfo || !studentId || !quizStarted || quizEnded || !draftRestoreCompletedRef.current) {
      nextServerDraftSyncAtRef.current = 0;
      return;
    }

    const now = Date.now();
    if (nextServerDraftSyncAtRef.current === 0) {
      nextServerDraftSyncAtRef.current = now + (INITIAL_SERVER_DRAFT_SYNC_DELAY_SECONDS * 1000);
      return;
    }

    if (now >= nextServerDraftSyncAtRef.current) {
      nextServerDraftSyncAtRef.current = now + (SERVER_DRAFT_SYNC_INTERVAL_SECONDS * 1000);
      saveDraftToServer(true);
    }
  }, [
    quizInfo,
    studentId,
    quizStarted,
    quizEnded,
    timeRemaining,
    currentIndex,
    answers,
    puzzleResults,
    videoAnalytics
  ]);

  // Countdown timer before quiz starts
  useEffect(() => {
    if (countdownToStart > 0 && showInstructions) {
      countdownRef.current = setInterval(() => {
        setCountdownToStart((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    }
  }, [countdownToStart, showInstructions]);

  useEffect(() => {
    if (quizStarted && !quizEnded && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [quizStarted, quizEnded]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      console.log('Loading questions for quiz:', quizInfo);
      console.log('Questions array:', quizInfo.questions);
      console.log('Question types:', quizInfo.questionTypes);
      console.log('Video question metadata:', quizInfo.videoQuestionMetadata);
      
      const questionPromises = quizInfo.questions.map(async (questionId: string, index: number) => {
        // Determine question type based on index and quiz configuration
        let type: 'mcq' | 'audio' | 'video' | 'puzzle' = 'mcq';
        let endpoint = '';
        
        if (index < quizInfo.questionTypes.mcq) {
          type = 'mcq';
          endpoint = `${API_URL}/questions/${questionId}`;
        } else if (index < quizInfo.questionTypes.mcq + quizInfo.questionTypes.audio) {
          type = 'audio';
          endpoint = `${API_URL}/audio-questions/question/${questionId}`;
        } else if (index < quizInfo.questionTypes.mcq + quizInfo.questionTypes.audio + quizInfo.questionTypes.video) {
          type = 'video';
          // Check if this is an individual video question (has metadata)
          const videoMetadata = quizInfo.videoQuestionMetadata?.find((meta: any) => meta.slotIndex === index);
          if (videoMetadata) {
            // Load specific question from video set
            endpoint = `${API_URL}/video-questions/single/${videoMetadata.parentVideoId}/question/${videoMetadata.questionIndex}`;
            console.log(`Loading individual video question: parent=${videoMetadata.parentVideoId}, index=${videoMetadata.questionIndex}`);
          } else {
            // Fallback to loading entire video set (old behavior)
            endpoint = `${API_URL}/video-questions/single/${questionId}`;
          }
        } else {
          type = 'puzzle';
          endpoint = `${API_URL}/puzzles/single/${questionId}`;
        }

        console.log(`Loading question ${index} (${type}):`, questionId, 'from:', endpoint);

        try {
          const response = await axios.get(endpoint);
          console.log(`Loaded ${type} question:`, response.data);
          
          // For video questions loaded via the individual question endpoint, 
          // use the unique _id from the response (format: parentId_q0, parentId_q1, etc.)
          // This ensures each question has a unique ID even if from the same video topic
          const uniqueQuestionId = (type === 'video' && response.data._id) 
            ? response.data._id 
            : questionId;
          
          return {
            _id: uniqueQuestionId,
            type,
            data: response.data
          };
        } catch (err: any) {
          console.error(`Failed to load question ${questionId}:`, err.response?.data || err.message);
          // Return placeholder for failed question
          return {
            _id: questionId,
            type,
            data: {
              question: 'Failed to load question',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 'Option A'
            }
          };
        }
      });

      const loadedQuestions = await Promise.all(questionPromises);
      console.log('All questions loaded:', loadedQuestions);
      setQuestions(loadedQuestions);
      // Don't auto-start quiz, wait for user to click start after reading instructions
      questionStartTimeRef.current = Date.now();
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setShowInstructions(false);
    setQuizStarted(true);
    startTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
  };

  const handleTimeUp = () => {
    console.log('⏰ TIME UP! Auto-submitting quiz...');
    setQuizEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    toast({
      title: "⏰ Time's Up!",
      description: "Quiz time has ended. Auto-submitting your answers...",
      duration: 4000
    });
    
    // Auto-submit with timeout flag
    handleSubmitQuiz(true);
  };

  const handleAnswerSelect = (answer: string) => {
    const currentQuestion = questions[currentIndex];
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    
    const newAnswer: Answer = {
      questionId: currentQuestion._id,
      questionType: currentQuestion.type,
      selectedAnswer: answer,
      timeSpent
    };

    // Add video analytics if it's a video question
    if (currentQuestion.type === 'video' && videoAnalytics[currentQuestion._id]) {
      const analytics = videoAnalytics[currentQuestion._id];
      newAnswer.videoAnalytics = {
        videoDuration: analytics.videoDuration,
        watchTime: analytics.watchTime,
        watchPercentage: analytics.watchPercentage,
        pauseCount: analytics.pauseCount,
        seekCount: analytics.seekCount,
        playbackEvents: analytics.playbackEvents
      };
    }

    setAnswers((prev) => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion._id);
      return [...filtered, newAnswer];
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const normalizeHintText = (hint: any): string | null => {
    if (typeof hint === 'string') {
      const trimmedHint = hint.trim();
      return trimmedHint.length > 0 ? trimmedHint : null;
    }

    if (hint && typeof hint === 'object' && typeof hint.text === 'string') {
      const trimmedHintText = hint.text.trim();
      return trimmedHintText.length > 0 ? trimmedHintText : null;
    }

    return null;
  };

  const normalizeSolutionText = (solution: any): string | null => {
    if (typeof solution === 'string') {
      const trimmedSolution = solution.trim();
      return trimmedSolution.length > 0 ? trimmedSolution : null;
    }

    if (!solution || typeof solution !== 'object') {
      return null;
    }

    if (typeof solution.text === 'string') {
      const trimmedSolutionText = solution.text.trim();
      if (trimmedSolutionText.length > 0) {
        return trimmedSolutionText;
      }
    }

    if (Array.isArray(solution.steps)) {
      const stepsText = solution.steps
        .filter((step: unknown): step is string => typeof step === 'string' && step.trim().length > 0)
        .join('\n');

      if (stepsText.length > 0) {
        return stepsText;
      }
    }

    return null;
  };

  const handleSubmitQuiz = async (timeUp: boolean = false) => {
    // Use refs to get the latest state values, especially important for auto-submit on timeout
    const currentAnswers = answersRef.current;
    const currentQuestions = questionsRef.current;
    
    try {
      console.log('=== QUIZ SUBMISSION START ===');
      console.log('Time Up?:', timeUp);
      console.log('Student ID:', studentId);
      console.log('Total Questions:', currentQuestions.length);
      console.log('Answers Provided:', currentAnswers.length);
      console.log('===============================');
      
      // Validate studentId before submission
      if (!studentId || studentId.trim() === '') {
        console.error('Cannot submit: studentId is missing or empty');
        toast({
          title: "Submission Error",
          description: "Student ID is missing. Cannot submit quiz. Please log in again.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      console.log('Submitting with studentId:', studentId);
      
      setQuizEnded(true);
      
      // Calculate results
      let correctCount = 0;
      let incorrectCount = 0;
      let unattemptedCount = 0; // Will be calculated during evaluation

      console.log('Questions:', currentQuestions.length);
      console.log('Answers:', currentAnswers.length);

      const evaluatedAnswers = currentQuestions.map((q, index) => {
        const answer = currentAnswers.find(a => a.questionId === q._id);
        
        console.log(`Question ${index + 1} (${q.type}):`, {
          hasAnswer: !!answer,
          selectedAnswer: answer?.selectedAnswer,
          questionId: q._id
        });
        
        // Question was not attempted
        if (!answer || !answer.selectedAnswer) {
          unattemptedCount++;
          console.log(`  → UNATTEMPTED`);
          return {
            questionId: q._id,
            questionType: q.type,
            selectedAnswer: null,
            correctAnswer: getCorrectAnswer(q),
            isCorrect: false,
            timeSpent: 0,
            // Add video question details for results page
            ...(q.type === 'video' && q.data && {
              questionText: q.data.question,
              options: q.data.options,
              hint: normalizeHintText(q.data.hint),
              solution: normalizeSolutionText(q.data.solution),
              parentVideoId: q.data.parentVideoId,
              questionIndex: q.data.questionIndex
            }),
            videoAnalytics: q.type === 'video' && videoAnalytics[q._id] ? {
              videoDuration: videoAnalytics[q._id].videoDuration,
              watchTime: videoAnalytics[q._id].watchTime,
              watchPercentage: videoAnalytics[q._id].watchPercentage,
              pauseCount: videoAnalytics[q._id].pauseCount,
              seekCount: videoAnalytics[q._id].seekCount,
              playbackEvents: videoAnalytics[q._id].playbackEvents
            } : undefined
          };
        }

        // Puzzle questions: use puzzle score (>= 50 → correct)
        if (q.type === 'puzzle' && answer.puzzleData) {
          const puzzleScore = answer.puzzleData.score || 0;
          const isPuzzleCorrect = puzzleScore >= 50;
          if (isPuzzleCorrect) {
            correctCount++;
            console.log(`  → CORRECT (Puzzle score: ${puzzleScore})`);
          } else {
            incorrectCount++;
            console.log(`  → INCORRECT (Puzzle score: ${puzzleScore})`);
          }

          return {
            questionId: q._id,
            questionType: q.type,
            selectedAnswer: 'puzzle_completed',
            correctAnswer: 'puzzle_completed',
            isCorrect: isPuzzleCorrect,
            timeSpent: answer.timeSpent,
            puzzleData: answer.puzzleData,
          };
        }

        const correctAnswer = getCorrectAnswer(q);
        const isCorrect = answer.selectedAnswer === correctAnswer;
        
        if (isCorrect) {
          correctCount++;
          console.log(`  → CORRECT (Selected: ${answer.selectedAnswer})`);
        } else {
          incorrectCount++;
          console.log(`  → INCORRECT (Selected: ${answer.selectedAnswer}, Correct: ${correctAnswer})`);
        }

        return {
          questionId: q._id,
          questionType: q.type,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer,
          isCorrect,
          timeSpent: answer.timeSpent,
          // Add video question details for results page
          ...(q.type === 'video' && q.data && {
            questionText: q.data.question,
            options: q.data.options,
            hint: normalizeHintText(q.data.hint),
            solution: normalizeSolutionText(q.data.solution),
            parentVideoId: q.data.parentVideoId,
            questionIndex: q.data.questionIndex
          }),
          videoAnalytics: answer.videoAnalytics
        };
      });

      console.log('=== EVALUATION COMPLETE ===');
      console.log('Correct:', correctCount);
      console.log('Incorrect:', incorrectCount);
      console.log('Unattempted:', unattemptedCount);
      console.log('Total:', correctCount + incorrectCount + unattemptedCount);
      console.log('===========================');

      // Calculate time taken with validation
      // Use the STORED initial time limit, not recalculated value
      const quizTimeLimit = initialTimeLimit || (quizInfo.timeLimit * 60); 
      const rawTimeTaken = quizTimeLimit - timeRemaining;
      
      // Ensure time is valid and within bounds
      const totalTimeTaken = Math.max(0, Math.min(rawTimeTaken, quizTimeLimit));

      console.log('=== TIME CALCULATION DEBUG ===');
      console.log('Initial time limit (seconds):', initialTimeLimit);
      console.log('Quiz time limit from config (seconds):', quizInfo.timeLimit * 60);
      console.log('Using time limit (seconds):', quizTimeLimit);
      console.log('Time remaining (seconds):', timeRemaining);
      console.log('Raw time taken:', rawTimeTaken);
      console.log('Final time taken (seconds):', totalTimeTaken);
      console.log('Time taken (minutes):', (totalTimeTaken / 60).toFixed(2));
      console.log('==============================');

      const submitData = {
        quizId: quizInfo.quizId,
        studentId: studentId || '', // Ensure it's at least an empty string
        answers: evaluatedAnswers,
        score: {
          correct: correctCount,
          incorrect: incorrectCount,
          unattempted: unattemptedCount
        },
        timeTaken: totalTimeTaken,
        completedAt: new Date().toISOString(),
        timeUp
      };

      console.log('=== SUBMIT DATA DEBUG ===');
      console.log('Full submitData:', JSON.stringify(submitData, null, 2));
      console.log('studentId value:', studentId);
      console.log('studentId type:', typeof studentId);
      console.log('studentId length:', studentId?.length);
      console.log('studentId trimmed:', studentId?.trim());
      console.log('========================');

      // Submit to backend
      const response = await axios.post(`${API_URL}/quizzes/submit-advanced`, submitData);
      console.log('✅ Submit response:', response.data);

      const successMessage = timeUp 
        ? `Quiz auto-submitted! Score: ${correctCount}/${currentQuestions.length} (${((correctCount/currentQuestions.length)*100).toFixed(0)}%)`
        : `Quiz submitted successfully! Score: ${correctCount}/${currentQuestions.length}`;

      toast({
        title: timeUp ? "⏰ Time's Up - Auto Submitted" : "✅ Quiz Submitted",
        description: successMessage,
        duration: 4000
      });

      dispatch(clearAdvancedQuizDraft());
      try {
        await axios.delete(`${API_URL}/quizzes/advanced-draft/${quizInfo.quizId}/${studentId}`);
      } catch (draftDeleteError) {
        console.error('Failed to delete advanced quiz draft after submission:', draftDeleteError);
      }

      // Navigate to results page with data
      navigate('/student/advanced-quiz-results', {
        state: {
          results: {
            quizId: quizInfo.quizId,
            studentId,
            score: {
              correct: correctCount,
              incorrect: incorrectCount,
              unattempted: unattemptedCount,
              percentage: ((correctCount / currentQuestions.length) * 100).toFixed(2)
            },
            answers: evaluatedAnswers,
            quizEndTime: quizInfo.endTime // Pass quiz end time
          }
        }
      });
      
    } catch (error: any) {
      console.error('❌ Error submitting quiz:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error details:', error.message);
      
      // If it's a duplicate submission error, navigate to results anyway
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already submitted')) {
        dispatch(clearAdvancedQuizDraft());
        try {
          await axios.delete(`${API_URL}/quizzes/advanced-draft/${quizInfo.quizId}/${studentId}`);
        } catch (draftDeleteError) {
          console.error('Failed to delete advanced quiz draft after duplicate submission:', draftDeleteError);
        }

        toast({
          title: "Already Submitted",
          description: "This quiz was already submitted.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/student'), 2000);
        return;
      }
      
      // Show error toast
      toast({
        title: timeUp ? "Auto-Submit Error" : "Submission Error",
        description: timeUp 
          ? "Time's up but submission failed. Showing local results..."
          : (error.response?.data?.error || error.message || "Failed to submit quiz. Please contact support."),
        variant: "destructive",
        duration: 5000
      });
      
      // If timeUp, still show results locally even if submission failed
      if (timeUp) {
        console.log('⚠️ Timeout submission failed, showing local results');
        
        // Calculate and show local results
        let correctCount = 0;
        let incorrectCount = 0;
        let unattemptedCount = 0;
        
        currentQuestions.forEach((q) => {
          const answer = currentAnswers.find(a => a.questionId === q._id);
          if (!answer || !answer.selectedAnswer) {
            unattemptedCount++;
          } else if (q.type === 'puzzle' && answer.puzzleData) {
            // Puzzle scoring
            const puzzleScore = answer.puzzleData.score || 0;
            if (puzzleScore >= 50) {
              correctCount++;
            } else {
              incorrectCount++;
            }
          } else {
            // Regular question scoring
            const correct = getCorrectAnswer(q);
            if (answer.selectedAnswer === correct) {
              correctCount++;
            } else {
              incorrectCount++;
            }
          }
        });
        
        console.log('Local Results - Correct:', correctCount, 'Incorrect:', incorrectCount, 'Unattempted:', unattemptedCount);
        
        toast({
          title: "⚠️ Showing Local Results",
          description: `Score: ${correctCount}/${currentQuestions.length} (${((correctCount/currentQuestions.length)*100).toFixed(0)}%). Note: Not saved to server.`,
          duration: 5000
        });
        
        navigate('/student/advanced-quiz-results', {
          state: {
            results: {
              quizId: quizInfo.quizId,
              studentId,
              score: {
                correct: correctCount,
                incorrect: incorrectCount,
                unattempted: unattemptedCount,
                percentage: ((correctCount / currentQuestions.length) * 100).toFixed(2)
              },
              submissionFailed: true,
              quizEndTime: quizInfo.endTime // Pass quiz end time
            }
          }
        });
      } else {
        // Don't keep quiz ended state if submission failed and not timeout
        setQuizEnded(false);
      }
    }
  };

  const getCorrectAnswer = (question: QuestionData): string => {
    switch (question.type) {
      case 'mcq':
      case 'audio':
        return question.data.correctAnswer;
      case 'video':
        // Check if individual video question (has correctAnswer directly) or video set (has questions array)
        if (question.data.correctAnswer) {
          // Individual video question
          return question.data.correctAnswer;
        } else if (question.data.questions?.[0]?.correctAnswer) {
          // Video question set - get first question's correct answer
          return question.data.questions[0].correctAnswer;
        }
        return '';
      case 'puzzle':
        return 'puzzle_completed'; // Puzzles are scored separately; this is a sentinel value
      default:
        return '';
    }
  };

  // Helper function to check if URL is YouTube
  const isYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  // Helper function to get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return url;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'mcq': return <BookOpen className="h-5 w-5" />;
      case 'audio': return <Volume2 className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'puzzle': return <Puzzle className="h-5 w-5" />;
      default: return null;
    }
  };

  const renderQuestion = () => {
    if (loading || questions.length === 0) {
      return <div className="text-center py-8">Loading questions...</div>;
    }

    const currentQuestion = questions[currentIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQuestion._id);

    switch (currentQuestion.type) {
      case 'mcq':
        return renderMCQ(currentQuestion.data, currentAnswer?.selectedAnswer as string);
      case 'audio':
        return renderAudioQuestion(currentQuestion.data, currentAnswer?.selectedAnswer as string);
      case 'video':
        return renderVideoQuestion(currentQuestion.data, currentAnswer?.selectedAnswer as string);
      case 'puzzle':
        return renderPuzzleQuestion(currentQuestion.data);
      default:
        return <div>Unknown question type</div>;
    }
  };

  const renderMCQ = (data: any, selectedAnswer?: string) => {
    // Safety check for data structure
    if (!data) {
      return <div className="p-4 text-red-600">Error: MCQ data not loaded</div>;
    }

    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">{data.question || 'Question not available'}</h3>
          {data.questionImage && (
            <img src={data.questionImage} alt="Question" className="max-w-full h-auto rounded mt-2" />
          )}
        </div>
        <div className="space-y-2">
          {data.options && data.options.length > 0 ? (
            data.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === option
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-gray-600">No options available</div>
          )}
        </div>
      </div>
    );
  };

  const renderAudioQuestion = (data: any, selectedAnswer?: string) => {
    console.log('=== RENDERING AUDIO QUESTION ===');
    console.log('Audio data received:', data);
    console.log('Audio data type:', typeof data);
    console.log('Audio data keys:', data ? Object.keys(data) : 'null');
    console.log('Audio URL:', data?.audio);
    console.log('Question:', data?.question);
    console.log('Options:', data?.options);
    console.log('================================');
    
    // Safety check for data structure
    if (!data) {
      return <div className="p-4 text-red-600">Error: Audio question data not loaded</div>;
    }

    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold">Audio Question</h3>
          </div>
          {data.audio ? (
            <audio controls className="w-full mb-3" key={data.audio}>
              <source src={data.audio} type="audio/mpeg" />
              <source src={data.audio} type="audio/mp3" />
              <source src={data.audio} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
              ⚠️ Audio file not available
            </div>
          )}
          <h3 className="text-lg font-semibold mb-2">{data.question || 'Question not available'}</h3>
          {data.questionImage && (
            <img src={data.questionImage} alt="Question" className="max-w-full h-auto rounded mt-2" />
          )}
        </div>
        <div className="space-y-2">
          {data.options && data.options.length > 0 ? (
            data.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === option
                    ? 'border-green-500 bg-green-100'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-gray-600">No options available</div>
          )}
        </div>
      </div>
    );
  };

  const renderVideoQuestion = (data: any, selectedAnswer?: string) => {
    console.log('=== RENDERING VIDEO QUESTION ===');
    console.log('Video data received:', data);
    console.log('Video data type:', typeof data);
    console.log('Video data keys:', data ? Object.keys(data) : 'null');
    console.log('Video URL:', data?.videoUrl);
    console.log('Video title:', data?.videoTitle);
    console.log('Video questions array:', data?.questions);
    console.log('Direct question:', data?.question);
    console.log('Direct options:', data?.options);
    console.log('================================');
    
    // Safety check for data structure
    if (!data) {
      return <div className="p-4 text-red-600">Error: Video question data not loaded</div>;
    }

    // Check if this is an individual video question (has question/options directly)
    // or a video question set (has questions array)
    const isIndividualQuestion = data.question && data.options;
    const currentQuestion = isIndividualQuestion 
      ? data  // Use data directly
      : data.questions?.[0];  // Use first question from array
    
    const currentQuestionId = questions[currentIndex]._id;
    
    // Initialize video analytics for this question if not exists
    if (!videoAnalytics[currentQuestionId]) {
      setVideoAnalytics(prev => ({
        ...prev,
        [currentQuestionId]: {
          videoDuration: 0,
          watchTime: 0,
          watchPercentage: 0,
          pauseCount: 0,
          seekCount: 0,
          playbackEvents: [],
          lastPlayTime: 0
        }
      }));
    }

    // Video event handlers
    const handleVideoPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      const now = Date.now();
      
      setVideoAnalytics(prev => ({
        ...prev,
        [currentQuestionId]: {
          ...prev[currentQuestionId],
          lastPlayTime: now,
          videoDuration: video.duration || prev[currentQuestionId]?.videoDuration || 0,
          playbackEvents: [
            ...(prev[currentQuestionId]?.playbackEvents || []),
            { action: 'play', timestamp: now }
          ]
        }
      }));
    };

    const handleVideoPause = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      const now = Date.now();
      
      setVideoAnalytics(prev => {
        const current = prev[currentQuestionId] || { watchTime: 0, pauseCount: 0, playbackEvents: [], lastPlayTime: 0, videoDuration: 0, watchPercentage: 0, seekCount: 0 };
        const additionalWatchTime = current.lastPlayTime > 0 ? (now - current.lastPlayTime) / 1000 : 0;
        const newWatchTime = current.watchTime + additionalWatchTime;
        const videoDuration = video.duration || current.videoDuration || 0;
        
        return {
          ...prev,
          [currentQuestionId]: {
            ...current,
            watchTime: newWatchTime,
            watchPercentage: videoDuration > 0 ? (newWatchTime / videoDuration) * 100 : 0,
            pauseCount: current.pauseCount + 1,
            playbackEvents: [
              ...current.playbackEvents,
              { action: 'pause', timestamp: now }
            ],
            lastPlayTime: 0
          }
        };
      });
    };

    const handleVideoSeeking = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const now = Date.now();
      
      setVideoAnalytics(prev => ({
        ...prev,
        [currentQuestionId]: {
          ...(prev[currentQuestionId] || { watchTime: 0, pauseCount: 0, playbackEvents: [], lastPlayTime: 0, videoDuration: 0, watchPercentage: 0, seekCount: 0 }),
          seekCount: (prev[currentQuestionId]?.seekCount || 0) + 1,
          playbackEvents: [
            ...(prev[currentQuestionId]?.playbackEvents || []),
            { action: 'seek', timestamp: now }
          ]
        }
      }));
    };

    const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      const now = Date.now();
      
      setVideoAnalytics(prev => {
        const current = prev[currentQuestionId] || { watchTime: 0, pauseCount: 0, playbackEvents: [], lastPlayTime: 0, videoDuration: 0, watchPercentage: 0, seekCount: 0 };
        const additionalWatchTime = current.lastPlayTime > 0 ? (now - current.lastPlayTime) / 1000 : 0;
        const newWatchTime = current.watchTime + additionalWatchTime;
        const videoDuration = video.duration || current.videoDuration || 0;
        
        return {
          ...prev,
          [currentQuestionId]: {
            ...current,
            watchTime: newWatchTime,
            watchPercentage: videoDuration > 0 ? (newWatchTime / videoDuration) * 100 : 0,
            playbackEvents: [
              ...current.playbackEvents,
              { action: 'ended', timestamp: now }
            ],
            lastPlayTime: 0
          }
        };
      });
    };
    
    return (
      <div className="space-y-4">
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">{data.videoTitle || 'Video Question'}</h3>
          </div>
          {data.videoDescription && (
            <p className="text-sm text-gray-600 mb-3">{data.videoDescription}</p>
          )}
          {data.videoUrl ? (
            <>
              {isYouTubeUrl(data.videoUrl) ? (
                // YouTube iframe embed
                <div className="relative w-full rounded-lg overflow-hidden mb-3" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={getYouTubeEmbedUrl(data.videoUrl)}
                    title={data.videoTitle || 'Video Question'}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                // Regular MP4/video file
                <video 
                  controls 
                  className="w-full rounded-lg mb-3" 
                  key={data.videoUrl}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onSeeking={handleVideoSeeking}
                  onEnded={handleVideoEnded}
                >
                  <source src={data.videoUrl} type="video/mp4" />
                  <source src={data.videoUrl} type="video/webm" />
                  <source src={data.videoUrl} type="video/ogg" />
                  Your browser does not support the video element.
                </video>
              )}
            </>
          ) : (
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
              ⚠️ Video file not available
            </div>
          )}
        </div>
        
        {currentQuestion ? (
          <>
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">{currentQuestion.question}</h3>
            </div>
            <div className="space-y-2">
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                currentQuestion.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === option
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-gray-600">No options available</div>
              )}
            </div>
          </>
        ) : (
          <div className="p-4 text-gray-600">No questions available for this video</div>
        )}
      </div>
    );
  };

  const handlePuzzleComplete = (questionId: string, result: any) => {
    // Store the puzzle result
    setPuzzleResults(prev => ({ ...prev, [questionId]: result }));

    // Also record as an answer so the quiz palette shows it as answered
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    const newAnswer: Answer = {
      questionId,
      questionType: 'puzzle',
      selectedAnswer: 'puzzle_completed',
      timeSpent,
      puzzleData: result,
    };
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      return [...filtered, newAnswer];
    });
  };

  const renderPuzzleQuestion = (data: any) => {
    const currentQuestion = questions[currentIndex];
    const questionId = currentQuestion._id;
    const existingResult = puzzleResults[questionId];
    const isMemory = data?.puzzleType === 'memory_match';
    const puzzleTitle = data?.title || (isMemory ? 'मेमोरी मैच चैलेंज' : data?.puzzleType === 'match_pieces' ? 'मैच पीसेज़' : 'पहेली गेम');

    // If already completed, show the result summary (without score - score shown only in final results)
    if (existingResult) {
      return (
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center border border-green-200">
          <div className="h-16 w-16 mx-auto mb-4 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br from-green-500 to-emerald-600">
            <Puzzle className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">{puzzleTitle} — पूर्ण!</h3>
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-md mb-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {existingResult.endReason === 'COMPLETED' ? 'गेम पूर्ण' : existingResult.endReason === 'TIME_UP' ? 'समय समाप्त' : 'बाहर निकले'}
            {existingResult.timeTaken && ` — ${existingResult.timeTaken} सेकंड`}
          </p>
          <p className="text-xs text-green-600 font-medium">✓ यह पहेली पहले ही पूरी हो चुकी है</p>
          <p className="text-xs text-gray-500 mt-1">आपका स्कोर क्विज़ परिणाम में दिखाया जाएगा</p>
        </div>
      );
    }

    // Render the embedded game
    if (isMemory) {
      return (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white shadow bg-gradient-to-br from-indigo-500 to-purple-600">
              <Puzzle className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{puzzleTitle}</h3>
          </div>
          <EmbeddableMemoryMatch onComplete={(result) => handlePuzzleComplete(questionId, result)} />
        </div>
      );
    } else if (data?.puzzleType === 'match_pieces') {
      return (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white shadow bg-gradient-to-br from-cyan-500 to-teal-600">
              <Puzzle className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{puzzleTitle}</h3>
          </div>
          <EmbeddableMatchPieces onComplete={(result) => handlePuzzleComplete(questionId, result)} />
        </div>
      );
    }

    // Fallback if puzzle type is unknown
    return (
      <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl text-center border border-indigo-200">
        <Puzzle className="h-12 w-12 mx-auto mb-4 text-indigo-400" />
        <h3 className="text-lg font-bold mb-2 text-gray-900">पहेली गेम</h3>
        <p className="text-gray-600 text-sm mb-4">इस पहेली गेम को खेलें।</p>
        <Button onClick={() => handleAnswerSelect('puzzle_completed')}>
          पूर्ण के रूप में चिह्नित करें
        </Button>
      </div>
    );
  };

  if (!quizInfo) {
    return null;
  }

  // Instructions screen
  if (showInstructions) {
    const now = new Date();
    const startTime = new Date(quizInfo.startTime);
    const canStartNow = countdownToStart === 0;

    return (
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">Quiz Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiz Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="text-2xl font-bold mb-4">{quizInfo.quizId}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Time Limit:</span>
                  <span>{quizInfo.timeLimit} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Total Questions:</span>
                  <span>{quizInfo.totalQuestions}</span>
                </div>
              </div>

              {/* Question Types Breakdown */}
              <div className="space-y-2">
                <h4 className="font-semibold text-lg mb-2">Question Types:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quizInfo.questionTypes.mcq > 0 && (
                    <div className="flex items-center gap-2 bg-blue-100 p-2 rounded">
                      <BookOpen className="h-5 w-5" />
                      <span>MCQ: {quizInfo.questionTypes.mcq}</span>
                    </div>
                  )}
                  {quizInfo.questionTypes.audio > 0 && (
                    <div className="flex items-center gap-2 bg-green-100 p-2 rounded">
                      <Volume2 className="h-5 w-5" />
                      <span>Audio: {quizInfo.questionTypes.audio}</span>
                    </div>
                  )}
                  {quizInfo.questionTypes.video > 0 && (
                    <div className="flex items-center gap-2 bg-purple-100 p-2 rounded">
                      <Video className="h-5 w-5" />
                      <span>Video: {quizInfo.questionTypes.video}</span>
                    </div>
                  )}
                  {quizInfo.questionTypes.puzzle > 0 && (
                    <div className="flex items-center gap-2 bg-orange-100 p-2 rounded">
                      <Puzzle className="h-5 w-5" />
                      <span>Puzzle: {quizInfo.questionTypes.puzzle}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            {countdownToStart > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
                <h3 className="text-xl font-bold mb-2">Quiz Starts In</h3>
                <div className="text-5xl font-bold text-yellow-600 mb-2">
                  {Math.floor(countdownToStart / 60)}:{(countdownToStart % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-sm text-gray-600">
                  Scheduled Start: {startTime.toLocaleString()}
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold">Important Instructions:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Once you start the quiz, the timer will begin immediately and cannot be paused.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>You can navigate between questions using Previous and Next buttons.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>For audio and video questions, make sure your device volume is turned on.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>You can change your answers before submitting the quiz.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>The quiz will automatically submit when time runs out.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Ensure you have a stable internet connection throughout the quiz.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Do not refresh or close the browser during the quiz.</span>
                </li>
              </ul>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading quiz questions...</p>
              </div>
            )}

            {/* Start Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleStartQuiz} 
                disabled={!canStartNow || loading}
                className="flex-1 bg-green-600 hover:bg-green-700" 
                size="lg"
              >
                {loading ? 'Loading...' : canStartNow ? 'I\'m Ready - Start Quiz' : 'Please Wait...'}
              </Button>
              <Button 
                onClick={() => navigate('/student/take-advanced-quiz')} 
                variant="outline" 
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const correctCount = answers.filter((a, index) => {
      const q = questions.find(qu => qu._id === a.questionId);
      if (!q) return false;
      return a.selectedAnswer === getCorrectAnswer(q);
    }).length;

    return (
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-bold text-blue-600 mb-2">
                {correctCount}/{questions.length}
              </div>
              <p className="text-lg sm:text-xl text-gray-600">
                Score: {Math.round((correctCount / questions.length) * 100)}%
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {answers.length - correctCount}
                </div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {questions.length - answers.length}
                </div>
                <div className="text-sm text-gray-600">Unattempted</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/student/dashboard')} className="flex-1">
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/student/take-advanced-quiz')} 
                variant="outline" 
                className="flex-1"
              >
                Take Another Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Palette Sidebar */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="text-sm">Question Palette</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Timer */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-600">Time Left</span>
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-green-50 rounded text-center">
                  <div className="font-bold text-green-600">{answers.length}</div>
                  <div className="text-gray-600">Answered</div>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <div className="font-bold text-gray-600">{questions.length - answers.length}</div>
                  <div className="text-gray-600">Remaining</div>
                </div>
              </div>

              {/* MCQ Section */}
              {quizInfo.questionTypes.mcq > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-gray-700">MCQ ({quizInfo.questionTypes.mcq})</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                    {questions.slice(0, quizInfo.questionTypes.mcq).map((q, idx) => {
                      const isAnswered = answers.some(a => a.questionId === q._id);
                      const isCurrent = currentIndex === idx;
                      return (
                        <button
                          key={q._id}
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-8 h-8 rounded text-xs font-semibold transition-all ${
                            isCurrent
                              ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                              : isAnswered
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Audio Section */}
              {quizInfo.questionTypes.audio > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-semibold text-gray-700">Audio ({quizInfo.questionTypes.audio})</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                    {questions.slice(quizInfo.questionTypes.mcq, quizInfo.questionTypes.mcq + quizInfo.questionTypes.audio).map((q, idx) => {
                      const actualIndex = quizInfo.questionTypes.mcq + idx;
                      const isAnswered = answers.some(a => a.questionId === q._id);
                      const isCurrent = currentIndex === actualIndex;
                      return (
                        <button
                          key={q._id}
                          onClick={() => setCurrentIndex(actualIndex)}
                          className={`w-8 h-8 rounded text-xs font-semibold transition-all ${
                            isCurrent
                              ? 'bg-green-600 text-white ring-2 ring-green-300'
                              : isAnswered
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {actualIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Video Section */}
              {quizInfo.questionTypes.video > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-700">Video ({quizInfo.questionTypes.video})</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                    {questions.slice(
                      quizInfo.questionTypes.mcq + quizInfo.questionTypes.audio,
                      quizInfo.questionTypes.mcq + quizInfo.questionTypes.audio + quizInfo.questionTypes.video
                    ).map((q, idx) => {
                      const actualIndex = quizInfo.questionTypes.mcq + quizInfo.questionTypes.audio + idx;
                      const isAnswered = answers.some(a => a.questionId === q._id);
                      const isCurrent = currentIndex === actualIndex;
                      return (
                        <button
                          key={q._id}
                          onClick={() => setCurrentIndex(actualIndex)}
                          className={`w-8 h-8 rounded text-xs font-semibold transition-all ${
                            isCurrent
                              ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                              : isAnswered
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {actualIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Puzzle Section */}
              {quizInfo.questionTypes.puzzle > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Puzzle className="h-4 w-4 text-orange-600" />
                    <span className="text-xs font-semibold text-gray-700">Puzzle ({quizInfo.questionTypes.puzzle})</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
                    {questions.slice(
                      quizInfo.questionTypes.mcq + quizInfo.questionTypes.audio + quizInfo.questionTypes.video
                    ).map((q, idx) => {
                      const actualIndex = quizInfo.questionTypes.mcq + quizInfo.questionTypes.audio + quizInfo.questionTypes.video + idx;
                      const isAnswered = answers.some(a => a.questionId === q._id);
                      const isCurrent = currentIndex === actualIndex;
                      return (
                        <button
                          key={q._id}
                          onClick={() => setCurrentIndex(actualIndex)}
                          className={`w-8 h-8 rounded text-xs font-semibold transition-all ${
                            isCurrent
                              ? 'bg-orange-600 text-white ring-2 ring-orange-300'
                              : isAnswered
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {actualIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="pt-3 border-t space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded ring-2 ring-blue-300"></div>
                  <span className="text-gray-600">Current</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Quiz Content */}
        <div className="lg:col-span-3">
          <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              {getQuestionIcon(questions[currentIndex]?.type)}
              <span className="text-base sm:text-xl">Question {currentIndex + 1} of {questions.length}</span>
            </CardTitle>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <Badge variant={timeRemaining < 60 ? 'destructive' : 'default'} className="text-base sm:text-lg px-3 sm:px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(timeRemaining)}
              </Badge>
            </div>
          </div>
          <Progress value={(currentIndex + 1) / questions.length * 100} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {renderQuestion()}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-600 order-last sm:order-none">
              Answered: {answers.length}/{questions.length}
            </div>

            {currentIndex === questions.length - 1 ? (
              <Button onClick={() => handleSubmitQuiz(false)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <Flag className="h-4 w-4 mr-2" />
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full sm:w-auto">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedQuizPlayer;
