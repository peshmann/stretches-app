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
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center">
        {totalSets > 1 && (
          <span className="text-xs text-text-muted mb-1">Set {currentSet}/{totalSets}</span>
        )}
        <span className="font-display text-2xl font-bold">{reps} reps</span>
        {isBilateral && (
          <span className="text-xs text-text-muted">each side</span>
        )}
      </div>

      <Button variant="primary" size="md" onClick={onSetComplete}>
        Set Complete &#10003;
      </Button>
    </div>
  );
}
