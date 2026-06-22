export interface BlockedShortcutResult {
  blocked: boolean;
  reason?: string;
}

const isModifierPressed = (event: KeyboardEvent) => event.ctrlKey || event.metaKey;

export const getBlockedShortcutReason = (event: KeyboardEvent): BlockedShortcutResult => {
  const key = event.key.toLowerCase();

  if (isModifierPressed(event) && ['c', 'v', 'x', 'a', 'p', 's', 'u'].includes(key)) {
    return {
      blocked: true,
      reason: `Restricted shortcut used: ${event.ctrlKey ? 'Ctrl' : 'Cmd'}+${key.toUpperCase()}`
    };
  }

  if (key === 'f12') {
    return {
      blocked: true,
      reason: 'Restricted shortcut used: F12'
    };
  }

  if (isModifierPressed(event) && event.shiftKey && ['i', 'j', 'c'].includes(key)) {
    return {
      blocked: true,
      reason: `Restricted shortcut used: ${event.ctrlKey ? 'Ctrl' : 'Cmd'}+Shift+${key.toUpperCase()}`
    };
  }

  return { blocked: false };
};
