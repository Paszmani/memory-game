import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAttractScreenParams {
  enabled: boolean;
  timeoutSeconds: number;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export function useAttractScreen({
  enabled,
  timeoutSeconds,
  onActivate,
  onDeactivate,
}: UseAttractScreenParams) {
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const activate = useCallback(() => {
    timeoutRef.current = null;
    setIsActive(true);
    onActivate?.();
  }, [onActivate]);

  const resetTimer = useCallback(() => {
    clearTimer();

    if (!enabled || timeoutSeconds <= 0) {
      return;
    }

    timeoutRef.current = setTimeout(activate, timeoutSeconds * 1000);
  }, [activate, clearTimer, enabled, timeoutSeconds]);

  const deactivate = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      onDeactivate?.();
    }
  }, [isActive, onDeactivate]);

  /**
   * Deve ser chamado sempre que o usuário interagir com a tela.
   * Isso impede que a tela de atração apareça durante o uso real do app.
   */
  const notifyActivity = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      onDeactivate?.();
    }

    resetTimer();
  }, [isActive, onDeactivate, resetTimer]);

  useEffect(() => {
    if (!enabled || timeoutSeconds <= 0) {
      clearTimer();
      setIsActive(false);
      return;
    }

    resetTimer();

    return () => clearTimer();
  }, [clearTimer, enabled, resetTimer, timeoutSeconds]);

  return {
    isActive,
    activate,
    deactivate,
    resetTimer,
    clearTimer,
    notifyActivity,
  };
}