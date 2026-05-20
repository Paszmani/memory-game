import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAttractScreenParams {
  enabled:        boolean;
  timeoutSeconds: number;
  onActivate?:    () => void;
  onDeactivate?:  () => void;
}

export function useAttractScreen({
  enabled,
  timeoutSeconds,
  onActivate,
  onDeactivate,
}: UseAttractScreenParams) {
  const [isActive, setIsActive]     = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const activate = useCallback(() => {
    setIsActive(true);
    onActivate?.();
  }, [onActivate]);

  const deactivate = useCallback(() => {
    setIsActive(false);
    onDeactivate?.();
  }, [onDeactivate]);

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    clearTimer();
    timeoutRef.current = setTimeout(activate, timeoutSeconds * 1000);
  }, [enabled, timeoutSeconds, clearTimer, activate]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }
    resetTimer();
    return () => clearTimer();
  }, [enabled, resetTimer, clearTimer]);

  return { isActive, deactivate, resetTimer };
}