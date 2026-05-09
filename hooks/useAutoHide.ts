import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useAutoHide — tracks inactivity and hides sensitive content.
 *
 * Returns:
 *   isHidden    — true when the timeout has elapsed with no touch
 *   reveal()    — call this on any user interaction to reset the timer
 *   reset()     — force-reset hidden state and restart timer
 *
 * Usage: wrap the result with <BlurRevealContent isHidden={isHidden} onReveal={reveal} />
 */
export function useAutoHide(timeoutMs: number, enabled = true) {
  const [isHidden, setIsHidden] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = useCallback(() => {
    if (!enabled || timeoutMs <= 0) return;
    clearTimer();
    timerRef.current = setTimeout(() => setIsHidden(true), timeoutMs);
  }, [enabled, timeoutMs]);

  const reveal = useCallback(() => {
    setIsHidden(false);
    startTimer();
  }, [startTimer]);

  const reset = useCallback(() => {
    setIsHidden(false);
    startTimer();
  }, [startTimer]);

  // Start timer when enabled
  useEffect(() => {
    if (enabled && timeoutMs > 0) startTimer();
    return clearTimer;
  }, [enabled, timeoutMs, startTimer]);

  // Stop timer if disabled
  useEffect(() => {
    if (!enabled) {
      clearTimer();
      setIsHidden(false);
    }
  }, [enabled]);

  return { isHidden, reveal, reset };
}
