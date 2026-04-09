export interface Exercise {
  id: string;
  name: string;
  type: 'timed' | 'reps';
  description: string;
  tips: string;
  videoUrl?: string;
  category: string;
  priority?: 'high' | 'critical' | 'essential';
  safety?: string;
  duration?: number;
  maxDuration?: number;
  sets?: number;
  reps?: number;
  restSeconds?: number;
  sides?: number;
}

export interface Workout {
  id: string;
  name: string;
  type: 'gym' | 'stretch';
  description: string;
  scheduledDays: string[];
  estimatedDuration: number;
  preWorkout: Exercise[];
  mainWorkout: Exercise[];
  coolDown: Exercise[];
  safetyWarnings: string[];
}

export interface WorkoutData {
  workouts: Workout[];
  userProfile: {
    conditions: string[];
    restrictions: string[];
    goals: string[];
  };
}

export type Feeling = 'great' | 'good' | 'ok' | 'struggled' | 'pain';

export interface CompletedWorkout {
  workoutId: string;
  date: string;
  durationSeconds: number;
  exercisesCompleted: number;
  exercisesSkipped: number;
  skippedExerciseIds: string[];
  feeling: Feeling;
  notes?: string;
}

export interface ActiveSession {
  workoutId: string;
  startedAt: string;
  currentExerciseIndex: number;
  currentSet: number;
  exercisesCompleted: number;
  exercisesSkipped: number;
  skippedExerciseIds: string[];
  elapsedSeconds: number;
}

export interface UserProgress {
  workouts: CompletedWorkout[];
  stats: {
    totalWorkouts: number;
    currentStreak: number;
    longestStreak: number;
    startDate: string;
  };
}

export interface WorkoutStep {
  exercise: Exercise;
  phase: 'pre-workout' | 'main' | 'cool-down';
  index: number;
  totalSteps: number;
}
