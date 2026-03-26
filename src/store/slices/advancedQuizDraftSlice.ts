import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AdvancedQuizAnswerDraft {
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
    playbackEvents: Array<{ action: string; timestamp: number }>;
  };
  puzzleData?: Record<string, any>;
}

export interface AdvancedQuizDraft {
  quizId: string;
  studentId: string;
  quizInfo: Record<string, any>;
  currentIndex: number;
  answers: AdvancedQuizAnswerDraft[];
  puzzleResults: Record<string, any>;
  videoAnalytics: Record<string, any>;
  timeRemaining: number;
  initialTimeLimit: number;
  quizStarted: boolean;
  quizEnded: boolean;
  startedAt: string;
  updatedAt: string;
}

interface AdvancedQuizDraftState {
  currentDraft: AdvancedQuizDraft | null;
}

const initialState: AdvancedQuizDraftState = {
  currentDraft: null
};

const advancedQuizDraftSlice = createSlice({
  name: 'advancedQuizDraft',
  initialState,
  reducers: {
    setAdvancedQuizDraft: (state, action: PayloadAction<Omit<AdvancedQuizDraft, 'updatedAt'> | AdvancedQuizDraft>) => {
      state.currentDraft = {
        ...action.payload,
        updatedAt: new Date().toISOString()
      };
    },
    clearAdvancedQuizDraft: (state) => {
      state.currentDraft = null;
    }
  }
});

export const { setAdvancedQuizDraft, clearAdvancedQuizDraft } = advancedQuizDraftSlice.actions;
export default advancedQuizDraftSlice.reducer;
