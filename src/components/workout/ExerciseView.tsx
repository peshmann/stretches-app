import type { Exercise, WorkoutStep } from '../../data/types';
import { exerciseGifs } from '../../data/exerciseGifs';

interface ExerciseViewProps {
  exercise: Exercise;
  phase: WorkoutStep['phase'];
}

const phaseLabels: Record<WorkoutStep['phase'], string> = {
  'pre-workout': 'PRE-WORKOUT',
  'main': 'MAIN WORKOUT',
  'cool-down': 'COOL-DOWN',
};

export function ExerciseView({ exercise, phase }: ExerciseViewProps) {
  const gifUrl = exerciseGifs[exercise.id];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {phaseLabels[phase]}
        </span>
        <h2 className="font-display text-xl font-bold mt-0.5">{exercise.name}</h2>
        {exercise.sides === 2 && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/20 text-success mt-1 inline-block">
            Each side
          </span>
        )}
      </div>

      {gifUrl && (
        <div className="rounded-xl overflow-hidden bg-black/20">
          <img
            src={gifUrl}
            alt={`${exercise.name} demonstration`}
            className="w-full max-h-[150px] object-contain"
            loading="lazy"
          />
        </div>
      )}

      <p className="text-text-muted text-xs leading-relaxed">{exercise.description}</p>

      {exercise.tips && (
        <p className="text-xs text-primary/70 leading-relaxed">
          Tip: {exercise.tips}
        </p>
      )}

      {exercise.videoUrl && (
        <a
          href={exercise.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-glow transition-colors w-fit"
        >
          &#9654; Watch video
        </a>
      )}
    </div>
  );
}
