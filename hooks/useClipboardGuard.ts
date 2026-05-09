import { useState, useEffect, useRef, useCallback } from 'react';
import { copyToClipboard } from '@/services/clipboardService';

interface ClipboardGuardState {
  hasCopied: boolean;
  secondsLeft: number;
  doCopy: (text: string, seconds?: number) => Promise<void>;
  doClear: () => void;
}

/**
 * useClipboardGuard — manages clipboard copy with live countdown.
 *
 * doCopy(text, seconds): copies text and starts a visible countdown.
 * doClear(): immediately clears clipboard and resets state.
 * secondsLeft: reactive countdown for the UI timer display.
 * hasCopied: true while the countdown is active.
 */
export function useClipboardGuard(defaultSeconds = 60): ClipboardGuardState {
  const [hasCopied, setHasCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const copiedTextRef = useRef<string>('');

  const clearCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHasCopied(false);
    setSecondsLeft(0);
    copiedTextRef.current = '';
  }, []);

  const doClear = useCallback(async () => {
    clearCountdown();
    try {
      const { Clipboard } = await import('expo-clipboard');
      await Clipboard.setStringAsync('');
    } catch {}
  }, [clearCountdown]);

  const doCopy = useCallback(async (text: string, seconds = defaultSeconds) => {
    copiedTextRef.current = text;
    await copyToClipboard(text, 0); // We manage our own timer here
    setHasCopied(true);
    setSecondsLeft(seconds);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [defaultSeconds, clearCountdown]);

  // Cleanup on unmount
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return { hasCopied, secondsLeft, doCopy, doClear };
}
