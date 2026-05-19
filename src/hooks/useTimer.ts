import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(() => {
    if (intervalRef.current) {
      return;
    }

    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((currentValue) => currentValue + 1);
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setElapsedSeconds(0);
  }, [stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    elapsedSeconds,
    isRunning,
    start,
    stop,
    reset,
  };
}