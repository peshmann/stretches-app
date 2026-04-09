import { useState, useCallback } from 'react';
import { loadProgress, saveProgress, addCompletedWorkout } from '../utils/storage';
import { recalculateStreak } from '../utils/streak';
import type { UserProgress, CompletedWorkout } from '../data/types';

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const p = loadProgress();
    const streaks = recalculateStreak(p);
    p.stats.currentStreak = streaks.currentStreak;
    p.stats.longestStreak = streaks.longestStreak;
    saveProgress(p);
    return p;
  });

  const completeWorkout = useCallback((workout: CompletedWorkout) => {
    const updated = addCompletedWorkout(workout);
    const streaks = recalculateStreak(updated);
    updated.stats.currentStreak = streaks.currentStreak;
    updated.stats.longestStreak = streaks.longestStreak;
    saveProgress(updated);
    setProgress({ ...updated });
    return updated;
  }, []);

  const logActivity = useCallback(() => {
    const workout: CompletedWorkout = {
      workoutId: 'manual-activity',
      date: new Date().toISOString(),
      durationSeconds: 0,
      exercisesCompleted: 0,
      exercisesSkipped: 0,
      skippedExerciseIds: [],
      feeling: 'good',
      notes: 'Manual activity log',
    };
    return completeWorkout(workout);
  }, [completeWorkout]);

  const refresh = useCallback(() => {
    const p = loadProgress();
    const streaks = recalculateStreak(p);
    p.stats.currentStreak = streaks.currentStreak;
    p.stats.longestStreak = streaks.longestStreak;
    saveProgress(p);
    setProgress({ ...p });
  }, []);

  return { progress, completeWorkout, logActivity, refresh };
}
