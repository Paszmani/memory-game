import { useCallback, useEffect, useRef, useState } from 'react';

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export interface UseSaveStateReturn<T> {
  localValue:   T;
  status:       SaveStatus;
  isDirty:      boolean;
  isSaving:     boolean;
  savedAt:      Date | null;
  update:       (partial: Partial<T> | ((prev: T) => T)) => void;
  save:         () => Promise<void>;
  reset:        () => void;
}

const SAVED_FEEDBACK_MS = 2500;

export function useSaveState<T extends object>(
  initialValue: T,
  onSave: (value: T) => Promise<void>,
): UseSaveStateReturn<T> {
  const [localValue, setLocalValue] = useState<T>(initialValue);
  const [status,     setStatus]     = useState<SaveStatus>('idle');
  const [savedAt,    setSavedAt]    = useState<Date | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincroniza se initialValue mudar externamente
  useEffect(() => {
    setLocalValue(initialValue);
    setStatus('idle');
  }, [initialValue]);

  const update = useCallback((partial: Partial<T> | ((prev: T) => T)) => {
    setLocalValue((prev) => {
      const next = typeof partial === 'function'
        ? partial(prev)
        : { ...prev, ...partial };
      return next;
    });
    setStatus('dirty');
  }, []);

  const save = useCallback(async () => {
    setStatus('saving');
    try {
      await onSave(localValue);
      setSavedAt(new Date());
      setStatus('saved');

      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setStatus('idle'), SAVED_FEEDBACK_MS);
    } catch {
      setStatus('error');
    }
  }, [localValue, onSave]);

  const reset = useCallback(() => {
    setLocalValue(initialValue);
    setStatus('idle');
  }, [initialValue]);

  useEffect(() => () => {
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
  }, []);

  return {
    localValue,
    status,
    isDirty:  status === 'dirty' || status === 'error',
    isSaving: status === 'saving',
    savedAt,
    update,
    save,
    reset,
  };
}