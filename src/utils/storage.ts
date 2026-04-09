import type { UserProgress, ActiveSession, CompletedWorkout } from '../data/types';

const PROGRESS_KEY = 'workout-tracker-progress';
const SESSION_KEY = 'workout-tracker-active-session';

function getDefaultProgress(): UserProgress {
  return {
    workouts: [],
    stats: {
      totalWorkouts: 0,
      currentStreak: 0,
      longestStreak: 0,
      startDate: new Date().toISOString().split('T')[0],
    },
  };
}

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return getDefaultProgress();
    return JSON.parse(raw) as UserProgress;
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function addCompletedWorkout(workout: CompletedWorkout): UserProgress {
  const progress = loadProgress();
  progress.workouts.push(workout);
  progress.stats.totalWorkouts += 1;
  saveProgress(progress);
  return progress;
}

export function loadActiveSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveSession;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: ActiveSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearActiveSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
