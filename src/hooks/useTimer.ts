import { useCallback, useEffect, useRef, useState } from 'react';

const TICK_INTERVAL_MS = 1000;

export interface TimerState {
  elapsedSeconds: number;
  isRunning:      boolean;
}

export interface TimerActions {
  start:  () => void;
  stop:   () => void;
  reset:  () => void;
  pause:  () => void;
  resume: () => void;
}

export type UseTimerReturn = TimerState & TimerActions;

export function useTimer(): UseTimerReturn {
  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed]     = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return;

    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, TICK_INTERVAL_MS);
  }, []);

  const stop = useCallback(() => {
    clearTick();
    setIsRunning(false);
  }, [clearTick]);

  const pause = stop;

  const resume = start;

  const reset = useCallback(() => {
    clearTick();
    setIsRunning(false);
    setElapsed(0);
  }, [clearTick]);

  // Cleanup ao desmontar
  useEffect(() => () => clearTick(), [clearTick]);

  return {
    elapsedSeconds: elapsed,
    isRunning,
    start,
    stop,
    pause,
    resume,
    reset,
  };
}