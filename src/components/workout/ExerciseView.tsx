import { useState } from 'react';
import type { Exercise, WorkoutStep } from '../../data/types';
import { exerciseGifs } from '../../data/exerciseGifs';

interface ExerciseViewProps {
  exercise: Exercise;
  phase: WorkoutStep['phase'];
  compact?: boolean;
}

const phaseLabels: Record<WorkoutStep['phase'], string> = {
  'pre-workout': 'PRE-WORKOUT',
  'main': 'MAIN WORKOUT',
  'cool-down': 'COOL-DOWN',
};

export function ExerciseView({ exercise, phase, compact = false }: ExerciseViewProps) {
  const [showInfo, setShowInfo] = useState(false);
  const gifUrl = exerciseGifs[exercise.id];

  if (compact) {
    return (
      <div className="flex flex-col items-center text-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {phaseLabels[phase]}
        </span>
        <h2 className="font-display text-xl font-bold leading-tight">{exercise.name}</h2>

        {exercise.sides === 2 && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/20 text-success">
            Each side
          </span>
        )}

        {gifUrl && (
          <div className="rounded-xl overflow-hidden bg-black/20 w-full max-w-[200px]">
            <img
              src={gifUrl}
              alt={`${exercise.name} demonstration`}
              className="w-full max-h-[140px] object-contain"
              loading="lazy"
            />
          </div>
        )}

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-xs text-primary hover:text-primary-glow transition-colors"
        >
          {showInfo ? 'Hide details' : 'Show details'}
        </button>

        {showInfo && (
          <div className="text-left w-full space-y-2 bg-surface rounded-lg p-3 text-xs max-h-[120px] overflow-y-auto">
            <p className="text-text-muted">{exercise.description}</p>
            {exercise.tips && (
              <p className="text-primary/80">Tip: {exercise.tips}</p>
            )}
            {exercise.videoUrl && (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:text-primary-glow"
              >
                Watch video
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full view (used in Library detail expand)
  return (
    <div className="flex flex-col gap-3">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {phaseLabels[phase]}
        </span>
        <h2 className="font-display text-2xl font-bold mt-1">{exercise.name}</h2>
        {exercise.sides === 2 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success/20 text-success mt-2 inline-block">
            Each side
          </span>
        )}
      </div>

      {gifUrl && (
        <div className="rounded-xl overflow-hidden bg-black/20">
          <img
            src={gifUrl}
            alt={`${exercise.name} demonstration`}
            className="w-full max-h-[250px] object-contain"
            loading="lazy"
          />
        </div>
      )}

      <p className="text-text-muted text-sm leading-relaxed">{exercise.description}</p>

      {exercise.tips && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-2">
          <span className="text-base leading-none">&#128161;</span>
          <p className="text-sm text-text-muted">{exercise.tips}</p>
        </div>
      )}

      {exercise.videoUrl && (
        <a
          href={exercise.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-glow transition-colors w-fit"
        >
          <span>&#9654;</span>
          Watch video
        </a>
      )}
    </div>
  );
}
