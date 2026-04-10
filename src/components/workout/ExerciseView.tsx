import { useState } from 'react';
import type { Exercise, WorkoutStep } from '../../data/types';
import { SafetyBanner } from './SafetyBanner';
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

const priorityStyles: Record<string, string> = {
  high: 'bg-primary/20 text-primary',
  critical: 'bg-accent/20 text-accent',
  essential: 'bg-accent/20 text-accent',
};

export function ExerciseView({ exercise, phase }: ExerciseViewProps) {
  const [showGif, setShowGif] = useState(true);
  const gifUrl = exerciseGifs[exercise.id];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {phaseLabels[phase]}
        </span>
        <h2 className="font-display text-2xl font-bold mt-1">{exercise.name}</h2>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {exercise.priority && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityStyles[exercise.priority]}`}>
              {exercise.priority}
            </span>
          )}
          {exercise.sides === 2 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success/20 text-success">
              Each side
            </span>
          )}
        </div>
      </div>

      {gifUrl && (
        <>
          <button
            onClick={() => setShowGif(!showGif)}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-glow transition-colors mb-0"
          >
            {showGif ? '\u25BC Hide Demo' : '\u25B6 Show Demo'}
          </button>
          {showGif && (
            <div className="relative rounded-xl overflow-hidden bg-black/20 mb-0">
              <img
                src={gifUrl}
                alt={`${exercise.name} demonstration`}
                className="w-full max-h-[250px] object-contain"
                loading="lazy"
              />
            </div>
          )}
        </>
      )}

      <p className="text-text-muted text-sm leading-relaxed">{exercise.description}</p>

      {exercise.tips && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-2">
          <span className="text-base leading-none">&#128161;</span>
          <p className="text-sm text-text-muted">{exercise.tips}</p>
        </div>
      )}

      {exercise.safety && <SafetyBanner message={exercise.safety} />}

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
