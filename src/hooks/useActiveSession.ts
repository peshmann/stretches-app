import { useState, useCallback } from 'react';
import { loadActiveSession, saveActiveSession, clearActiveSession } from '../utils/storage';
import type { ActiveSession } from '../data/types';

export function useActiveSession() {
  const [session, setSession] = useState<ActiveSession | null>(() => loadActiveSession());

  const startSession = useCallback((workoutId: string) => {
    const newSession: ActiveSession = {
      workoutId,
      startedAt: new Date().toISOString(),
      currentExerciseIndex: 0,
      currentSet: 1,
      exercisesCompleted: 0,
      exercisesSkipped: 0,
      skippedExerciseIds: [],
      elapsedSeconds: 0,
    };
    saveActiveSession(newSession);
    setSession(newSession);
    return newSession;
  }, []);

  const updateSession = useCallback((updates: Partial<ActiveSession>) => {
    setSession(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      saveActiveSession(updated);
      return updated;
    });
  }, []);

  const endSession = useCallback(() => {
    clearActiveSession();
    setSession(null);
  }, []);

  return { session, startSession, updateSession, endSession };
}
