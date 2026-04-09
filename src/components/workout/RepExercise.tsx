import type { Exercise } from '../../data/types';
import { Button } from '../ui/Button';

interface RepExerciseProps {
  exercise: Exercise;
  currentSet: number;
  totalSets: number;
  onSetComplete: () => void;
}

export function RepExercise({ exercise, currentSet, totalSets, onSetComplete }: RepExerciseProps) {
  const reps = exercise.reps ?? 10;
  const isBilateral = exercise.sides === 2;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {totalSets > 1 && (
        <span className="font-display text-lg text-text-muted">
          Set {currentSet} of {totalSets}
        </span>
      )}

      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-4xl font-bold">{reps} reps</span>
        {isBilateral && (
          <span className="text-sm text-text-muted">each side</span>
        )}
      </div>

      <Button variant="primary" size="lg" onClick={onSetComplete}>
        Set Complete &#10003;
      </Button>
    </div>
  );
}
