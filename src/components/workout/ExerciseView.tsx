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
  const gifUrl = exerciseGifs[exercise.id];

  if (compact) {
    return (
      <div className="flex gap-3 items-start">
        {/* GIF thumbnail */}
        {gifUrl && (
          <div className="shrink-0 rounded-lg overflow-hidden bg-black/20 w-20 h-20">
            <img
              src={gifUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            {phaseLabels[phase]}
          </span>
          <h2 className="font-display text-lg font-bold leading-tight">{exercise.name}</h2>
          {exercise.sides === 2 && (
            <span className="text-[10px] font-semibold text-success">Each side</span>
          )}
          <p className="text-xs text-text-muted leading-snug mt-1 line-clamp-2">{exercise.description}</p>
          {exercise.tips && (
            <p className="text-[11px] text-primary/70 leading-snug mt-1 line-clamp-1">
              Tip: {exercise.tips}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full view (Library detail expand)
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
