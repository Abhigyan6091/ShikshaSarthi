import { useEffect, useRef } from 'react';
import { getBlockedShortcutReason } from '@/utils/keyboardRestrictions';

export interface ProctoringLogEntry {
  eventType: string;
  message: string;
  timestamp: string;
}

export interface ProctoringState {
  isEnabled: boolean;
  tabSwitchCount: number;
  fullscreenExitCount: number;
  warningsCount: number;
  copyPasteAttempts: number;
  blockedKeyAttempts: number;
  autoSubmitted: boolean;
  terminationReason: string | null;
  activityLog: ProctoringLogEntry[];
}

interface UseProctoringOptions {
  enabled: boolean;
  quizStarted: boolean;
  quizEnded: boolean;
  state: ProctoringState;
  onStateChange: (updater: (prev: ProctoringState) => ProctoringState) => void;
  onWarning?: (message: string) => void;
  onAutoSubmit?: (reason: string) => void;
  onFullscreenRequiredChange?: (required: boolean) => void;
}

const TAB_SWITCH_LIMIT = 3;
const ACTIVITY_LOG_LIMIT = 30;

interface FullscreenCapableElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface KeyboardLockCapableNavigator extends Navigator {
  keyboard?: {
    lock?: (keyCodes?: string[]) => Promise<void>;
    unlock?: () => void;
  };
}

interface FullscreenCapableDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

export const defaultProctoringState = (): ProctoringState => ({
  isEnabled: true,
  tabSwitchCount: 0,
  fullscreenExitCount: 0,
  warningsCount: 0,
  copyPasteAttempts: 0,
  blockedKeyAttempts: 0,
  autoSubmitted: false,
  terminationReason: null,
  activityLog: [],
});

const addLogEntry = (
  previousState: ProctoringState,
  eventType: string,
  message: string
): ProctoringState => ({
  ...previousState,
  activityLog: [
    {
      eventType,
      message,
      timestamp: new Date().toISOString(),
    },
    ...previousState.activityLog,
  ].slice(0, ACTIVITY_LOG_LIMIT),
});

export const requestFullscreen = async () => {
  const root = document.documentElement as FullscreenCapableElement;

  if (document.fullscreenElement) {
    return true;
  }

  try {
    if (root.requestFullscreen) {
      await root.requestFullscreen();
      return true;
    }

    if (root.webkitRequestFullscreen) {
      await root.webkitRequestFullscreen();
      return true;
    }

    if (root.msRequestFullscreen) {
      await root.msRequestFullscreen();
      return true;
    }
  } catch (error) {
    console.error('Failed to enter fullscreen mode:', error);
  }

  return false;
};

const lockEscapeKey = async () => {
  const keyboardApi = (navigator as KeyboardLockCapableNavigator).keyboard;

  if (!keyboardApi?.lock) {
    return false;
  }

  try {
    await keyboardApi.lock(['Escape']);
    return true;
  } catch (error) {
    console.error('Failed to lock Escape key:', error);
    return false;
  }
};

const unlockEscapeKey = () => {
  const keyboardApi = (navigator as KeyboardLockCapableNavigator).keyboard;

  try {
    keyboardApi?.unlock?.();
  } catch (error) {
    console.error('Failed to unlock keyboard:', error);
  }
};

export const exitFullscreen = async () => {
  const doc = document as FullscreenCapableDocument;

  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
      return;
    }

    if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
      return;
    }

    if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
    }
  } catch (error) {
    console.error('Failed to exit fullscreen mode:', error);
  }
};

export const useProctoring = ({
  enabled,
  quizStarted,
  quizEnded,
  state,
  onStateChange,
  onWarning,
  onAutoSubmit,
  onFullscreenRequiredChange,
}: UseProctoringOptions) => {
  const stateRef = useRef(state);
  const autoSubmittedRef = useRef(false);
  const lastHiddenAtRef = useRef(0);
  const onWarningRef = useRef(onWarning);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  const onFullscreenRequiredChangeRef = useRef(onFullscreenRequiredChange);

  useEffect(() => {
    stateRef.current = state;
    autoSubmittedRef.current = state.autoSubmitted;
  }, [state]);

  useEffect(() => {
    onWarningRef.current = onWarning;
    onAutoSubmitRef.current = onAutoSubmit;
    onFullscreenRequiredChangeRef.current = onFullscreenRequiredChange;
  }, [onAutoSubmit, onFullscreenRequiredChange, onWarning]);

  useEffect(() => {
    if (quizEnded) {
      onFullscreenRequiredChangeRef.current?.(false);
      unlockEscapeKey();
      exitFullscreen();
    }
  }, [quizEnded]);

  useEffect(() => {
    if (!enabled || !quizStarted || quizEnded) {
      return;
    }

    requestFullscreen().then((entered) => {
      onFullscreenRequiredChangeRef.current?.(!entered);
      if (entered) {
        lockEscapeKey();
      }
      if (!entered) {
        onWarningRef.current?.('Please allow fullscreen mode before continuing the proctored test.');
      }
    });

    const registerWarning = (eventType: string, message: string, updates: Partial<ProctoringState>) => {
      let nextState: ProctoringState | null = null;

      onStateChange((previous) => {
        const updated = addLogEntry(
          {
            ...previous,
            ...updates,
            warningsCount: previous.warningsCount + 1,
          },
          eventType,
          message
        );
        nextState = updated;
        return updated;
      });

      onWarningRef.current?.(message);

      if (
        nextState &&
        nextState.tabSwitchCount >= TAB_SWITCH_LIMIT &&
        !autoSubmittedRef.current
      ) {
        autoSubmittedRef.current = true;
        onStateChange((previous) => ({
          ...previous,
          autoSubmitted: true,
          terminationReason: 'Auto-submitted after 3 tab/window switches',
        }));
        onAutoSubmitRef.current?.('Auto-submitted after 3 tab/window switches');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') {
        return;
      }

      const now = Date.now();
      if (now - lastHiddenAtRef.current < 1200) {
        return;
      }
      lastHiddenAtRef.current = now;

      const nextTabSwitchCount = stateRef.current.tabSwitchCount + 1;
      registerWarning(
        'tab_switch',
        `Tab switch detected (${nextTabSwitchCount}/${TAB_SWITCH_LIMIT}).`,
        { tabSwitchCount: nextTabSwitchCount }
      );
    };

    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        onFullscreenRequiredChangeRef.current?.(false);
        lockEscapeKey();
        return;
      }

      unlockEscapeKey();
      const nextFullscreenExitCount = stateRef.current.fullscreenExitCount + 1;
      registerWarning(
        'fullscreen_exit',
        `Fullscreen exited (${nextFullscreenExitCount} time${nextFullscreenExitCount > 1 ? 's' : ''}).`,
        { fullscreenExitCount: nextFullscreenExitCount }
      );

      onFullscreenRequiredChangeRef.current?.(true);
      requestFullscreen().then((entered) => {
        onFullscreenRequiredChangeRef.current?.(!entered);
        if (entered) {
          lockEscapeKey();
        }
      });
    };

    const handleClipboardAttempt = (event: ClipboardEvent) => {
      event.preventDefault();
      const nextCopyPasteAttempts = stateRef.current.copyPasteAttempts + 1;
      registerWarning(
        'copy_paste_blocked',
        'Copy, cut, and paste are disabled during this proctored test.',
        { copyPasteAttempts: nextCopyPasteAttempts }
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'F11') {
        event.preventDefault();
        onWarningRef.current?.(
          event.key === 'Escape'
            ? 'Esc is disabled during the exam.'
            : 'Fullscreen shortcut is disabled during the exam.'
        );
      }

      const shortcut = getBlockedShortcutReason(event);
      if (!shortcut.blocked) {
        return;
      }

      event.preventDefault();
      const nextBlockedKeyAttempts = stateRef.current.blockedKeyAttempts + 1;
      registerWarning(
        'restricted_shortcut',
        shortcut.reason || 'Restricted keyboard shortcut used.',
        { blockedKeyAttempts: nextBlockedKeyAttempts }
      );
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      const nextCopyPasteAttempts = stateRef.current.copyPasteAttempts + 1;
      registerWarning(
        'context_menu_blocked',
        'Right click is disabled during this proctored test.',
        { copyPasteAttempts: nextCopyPasteAttempts }
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleClipboardAttempt);
    document.addEventListener('cut', handleClipboardAttempt);
    document.addEventListener('paste', handleClipboardAttempt);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleClipboardAttempt);
      document.removeEventListener('cut', handleClipboardAttempt);
      document.removeEventListener('paste', handleClipboardAttempt);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      unlockEscapeKey();
    };
  }, [enabled, onStateChange, quizEnded, quizStarted]);
};
