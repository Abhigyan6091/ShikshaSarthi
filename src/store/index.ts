import { combineReducers, configureStore } from '@reduxjs/toolkit';
import advancedQuizDraftReducer from './slices/advancedQuizDraftSlice';

const STORAGE_KEY = 'advancedQuizDraft.v1';

const rootReducer = combineReducers({
  advancedQuizDraft: advancedQuizDraftReducer
});

type StoreState = ReturnType<typeof rootReducer>;

const loadPreloadedState = (): Partial<StoreState> | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const serializedState = window.localStorage.getItem(STORAGE_KEY);
    if (!serializedState) {
      return undefined;
    }

    const parsed = JSON.parse(serializedState);
    if (!parsed || typeof parsed !== 'object') {
      return undefined;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load advanced quiz draft from localStorage:', error);
    return undefined;
  }
};

const saveState = (state: StoreState) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        advancedQuizDraft: state.advancedQuizDraft
      })
    );
  } catch (error) {
    console.error('Failed to persist advanced quiz draft to localStorage:', error);
  }
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadPreloadedState()
});

let saveTimeout: any = null;

store.subscribe(() => {
  if (saveTimeout) {
    window.clearTimeout(saveTimeout);
  }

  saveTimeout = window.setTimeout(() => {
    saveState(store.getState());
  }, 250);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
