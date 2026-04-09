import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useProgress } from '../hooks/useProgress';
import { clearActiveSession } from '../utils/storage';
import { workouts } from '../data/workouts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import type { Feeling } from '../data/types';

interface PostWorkoutState {
  workoutId: string;
  durationSeconds: number;
  exercisesCompleted: number;
  exercisesSkipped: number;
  skippedExerciseIds: string[];
}

const feelings: { value: Feeling; label: string; color: string; selectedColor: string }[] = [
  { value: 'great', label: 'Great', color: 'border-green-500/30 text-green-400', selectedColor: 'bg-green-500/20 border-green-500 text-green-400' },
  { value: 'good', label: 'Good', color: 'border-blue-500/30 text-blue-400', selectedColor: 'bg-blue-500/20 border-blue-500 text-blue-400' },
  { value: 'ok', label: 'OK', color: 'border-white/10 text-text-muted', selectedColor: 'bg-white/10 border-white/30 text-text-muted' },
  { value: 'struggled', label: 'Struggled', color: 'border-orange-500/30 text-orange-400', selectedColor: 'bg-orange-500/20 border-orange-500 text-orange-400' },
  { value: 'pain', label: 'Pain', color: 'border-red-500/30 text-red-400', selectedColor: 'bg-red-500/20 border-red-500 text-red-400' },
];

export default function PostWorkoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeWorkout } = useProgress();
  const [selectedFeeling, setSelectedFeeling] = useState<Feeling | null>(null);
  const [notes, setNotes] = useState('');

  const state = location.state as PostWorkoutState | null;

  useEffect(() => {
    if (!state) {
      navigate('/', { replace: true });
      return;
    }
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#60a5fa', '#22c55e'],
    });
  }, [state, navigate]);

  if (!state) return null;

  const workout = workouts.find(w => w.id === state.workoutId);
  const durationMin = Math.round(state.durationSeconds / 60);
  const allCompleted = state.exercisesSkipped === 0;

  function handleDone() {
    if (!selectedFeeling) return;
    completeWorkout({
      workoutId: state.workoutId,
      date: new Date().toISOString(),
      durationSeconds: state.durationSeconds,
      exercisesCompleted: state.exercisesCompleted,
      exercisesSkipped: state.exercisesSkipped,
      skippedExerciseIds: state.skippedExerciseIds,
      feeling: selectedFeeling,
      notes: notes || undefined,
    });
    clearActiveSession();
    navigate('/');
  }

  return (
    <div className="pt-8 pb-8 flex flex-col gap-6 animate-fade-in-up">
      {/* Heading */}
      <div className="text-center">
        <div className="text-5xl mb-3">&#10003;</div>
        <h1 className="font-display text-3xl font-bold">Workout Complete!</h1>
      </div>

      {/* Stats summary */}
      <Card>
        <div className="text-center space-y-2">
          <p className="text-text-muted text-sm">{workout?.name ?? 'Workout'}</p>
          <p className="font-display text-4xl font-bold">{durationMin} min</p>
          <p className={`text-sm ${allCompleted ? 'text-green-400' : 'text-text-muted'}`}>
            {state.exercisesCompleted}/{state.exercisesCompleted + state.exercisesSkipped} exercises completed
          </p>
        </div>
      </Card>

      {/* Feeling selector */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-center">How did it feel?</h2>
        <div className="grid grid-cols-3 gap-2">
          {feelings.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setSelectedFeeling(f.value)}
              className={`rounded-xl border p-3 text-center font-semibold text-sm transition-all duration-200 active:scale-95
                ${selectedFeeling === f.value ? f.selectedColor : f.color}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <textarea
          placeholder="Any notes about this workout?"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full bg-surface rounded-xl border border-white/5 p-3 text-text placeholder:text-text-muted/50 min-h-[80px] resize-y focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Done button */}
      <Button size="lg" disabled={!selectedFeeling} onClick={handleDone}>
        Done
      </Button>
    </div>
  );
}
