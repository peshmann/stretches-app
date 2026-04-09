import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Workout, ActiveSession } from '../../data/types';
import { workouts } from '../../data/workouts';

interface TodayCardProps {
  workout: Workout | null;
  activeSession: ActiveSession | null;
  completedToday: boolean;
  onStart: (workoutId: string) => void;
  onResume: () => void;
}

function getTotalExercises(workout: Workout): number {
  return workout.preWorkout.length + workout.mainWorkout.length + workout.coolDown.length;
}

export function TodayCard({ workout, activeSession, completedToday, onStart, onResume }: TodayCardProps) {
  // Completed state
  if (completedToday && workout) {
    return (
      <Card className="opacity-70">
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-success font-semibold">Completed</span>
          <span className="text-text-muted text-sm">{workout.name}</span>
        </div>
      </Card>
    );
  }

  // Resume state
  if (activeSession && workout) {
    const total = getTotalExercises(workout);
    return (
      <Card className="border-warning/30">
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="font-display font-semibold text-lg">Resume {workout.name}</h3>
            <p className="text-text-muted text-sm mt-1">
              {activeSession.exercisesCompleted}/{total} exercises done
            </p>
          </div>
          <Button size="lg" onClick={onResume}>Resume Workout</Button>
          <button
            className="text-text-muted text-sm hover:text-text transition-colors min-h-[48px]"
            onClick={() => onStart(workout.id)}
          >
            Start Fresh
          </button>
        </div>
      </Card>
    );
  }

  // Rest day state
  if (!workout) {
    const stretching = workouts.find(w => w.id === 'daily-stretch');
    return (
      <Card>
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="font-display font-semibold text-lg">Rest Day</h3>
            <p className="text-text-muted text-sm mt-1">No workout scheduled today. Take it easy!</p>
          </div>
          {stretching && (
            <Button variant="secondary" size="lg" onClick={() => onStart(stretching.id)}>
              Do Daily Stretching
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Normal state
  const typeBadge = workout.type === 'gym' ? 'Gym' : 'Stretch';
  const badgeColor = workout.type === 'gym' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent';

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg">{workout.name}</h3>
            <p className="text-text-muted text-sm mt-1">~{workout.estimatedDuration} min</p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
            {typeBadge}
          </span>
        </div>
        <Button size="lg" onClick={() => onStart(workout.id)}>Start Workout</Button>
      </div>
    </Card>
  );
}
