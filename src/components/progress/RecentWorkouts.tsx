import { Card } from '../ui/Card';
import { workouts as workoutData } from '../../data/workouts';
import type { CompletedWorkout, Feeling } from '../../data/types';

interface RecentWorkoutsProps {
  workouts: CompletedWorkout[];
}

function getWorkoutName(workoutId: string): string {
  if (workoutId === 'manual-activity') return 'Activity Logged';
  return workoutData.find(w => w.id === workoutId)?.name ?? workoutId;
}

const feelingColors: Record<Feeling, string> = {
  great: 'bg-success/20 text-success',
  good: 'bg-primary/20 text-primary',
  ok: 'bg-text-muted/20 text-text-muted',
  struggled: 'bg-warning/20 text-warning',
  pain: 'bg-danger/20 text-danger',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  const recent = [...workouts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  if (recent.length === 0) {
    return (
      <Card>
        <p className="text-text-muted text-sm text-center py-4">No workouts yet. Start your first one!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold">Recent Workouts</h2>
      {recent.map((w, index) => (
        <Card
          key={`${w.workoutId}-${w.date}`}
          className="animate-fade-in-up"
          animate={false}
        >
          <div style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in-up">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-muted">{formatDate(w.date)}</p>
                <p className="font-medium truncate">{getWorkoutName(w.workoutId)}</p>
                {w.notes && (
                  <p className="text-xs text-text-muted mt-1">
                    {w.notes.length > 60 ? `${w.notes.slice(0, 60)}...` : w.notes}
                  </p>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${feelingColors[w.feeling]}`}>
                {w.feeling}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
