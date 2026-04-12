import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { workouts, userProfile } from '../data/workouts';
import { exerciseGifs } from '../data/exerciseGifs';
import type { Workout, Exercise } from '../data/types';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${m}:00`;
}

function formatExerciseInfo(exercise: Exercise): string {
  if (exercise.type === 'timed') {
    const dur = formatDuration(exercise.duration ?? 0);
    return exercise.sides === 2 ? `${dur} each side` : dur;
  }
  const sets = exercise.sets ?? 1;
  const reps = exercise.reps ?? 0;
  const info = sets > 1 ? `${sets} x ${reps}` : `${reps} reps`;
  return exercise.sides === 2 ? `${info} each side` : info;
}

function getExerciseCount(workout: Workout): number {
  return workout.preWorkout.length + workout.mainWorkout.length + workout.coolDown.length;
}

function getSafetyCount(workout: Workout): number {
  return workout.safetyWarnings.length;
}

interface PhaseProps {
  title: string;
  exercises: Exercise[];
  indexOffset: number;
  expandedExerciseId: string | null;
  onExerciseTap: (id: string) => void;
}

function PhaseSection({ title, exercises, indexOffset, expandedExerciseId, onExerciseTap }: PhaseProps) {
  if (exercises.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
        {title}
      </h4>
      <div className="space-y-1">
        {exercises.map((exercise, i) => {
          const globalIndex = indexOffset + i;
          const gifUrl = exerciseGifs[exercise.id];
          const isDetailOpen = expandedExerciseId === exercise.id;
          return (
            <div
              key={exercise.id}
              className="rounded-lg bg-white/[0.03] animate-fade-in-up"
              style={{ animationDelay: `${globalIndex * 50}ms`, opacity: 0 }}
            >
              <div
                className="flex items-center justify-between py-2 px-3 cursor-pointer"
                onClick={() => onExerciseTap(exercise.id)}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {gifUrl && (
                    <img
                      src={gifUrl}
                      alt=""
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <span className="text-sm text-text truncate">{exercise.name}</span>
                  {exercise.priority === 'critical' && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-accent" />
                  )}
                  {exercise.priority === 'high' && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {exercise.type === 'timed' ? (
                    <span className="text-xs text-text-muted">
                      <svg className="inline w-3 h-3 mr-0.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {formatExerciseInfo(exercise)}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">
                      <span className="inline-block px-1 py-0.5 rounded bg-white/10 text-[10px] font-medium mr-1">reps</span>
                      {formatExerciseInfo(exercise)}
                    </span>
                  )}
                  <svg
                    className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isDetailOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded exercise detail */}
              {isDetailOpen && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-3">
                  {gifUrl && (
                    <img
                      src={gifUrl}
                      alt={`${exercise.name} demonstration`}
                      className="w-full max-w-xs rounded-lg mx-auto"
                      loading="lazy"
                    />
                  )}
                  {exercise.description && (
                    <p className="text-sm text-text-muted">{exercise.description}</p>
                  )}
                  {exercise.tips && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Tips</span>
                      <p className="text-sm text-text-muted mt-0.5">{exercise.tips}</p>
                    </div>
                  )}
                  {exercise.safety && (
                    <div className="rounded-lg bg-warning/10 border border-warning/20 p-2">
                      <span className="text-xs font-semibold text-warning">Safety</span>
                      <p className="text-xs text-warning/80 mt-0.5">{exercise.safety}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {exercise.priority && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        exercise.priority === 'critical'
                          ? 'bg-accent/20 text-accent'
                          : exercise.priority === 'high'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-white/10 text-text-muted'
                      }`}>
                        {exercise.priority}
                      </span>
                    )}
                    {exercise.videoUrl && (
                      <a
                        href={exercise.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Watch Video
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleCardClick(workoutId: string) {
    setExpandedId((prev) => (prev === workoutId ? null : workoutId));
    setExpandedExerciseId(null);
  }

  function handleExerciseTap(exerciseId: string) {
    setExpandedExerciseId((prev) => (prev === exerciseId ? null : exerciseId));
  }

  return (
    <div className="pt-6 pb-4 space-y-4">
      <h1 className="font-display text-2xl font-bold">Workout Library</h1>

      {workouts.map((workout) => {
        const isExpanded = expandedId === workout.id;
        const exerciseCount = getExerciseCount(workout);
        const safetyCount = getSafetyCount(workout);
        const isGym = workout.type === 'gym';

        return (
          <Card key={workout.id} className="cursor-pointer transition-all duration-300">
            {/* Collapsed header - always visible */}
            <div
              onClick={() => handleCardClick(workout.id)}
              className="flex items-start justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display font-bold text-lg">{workout.name}</h2>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isGym
                        ? 'bg-primary/20 text-primary'
                        : 'bg-accent/20 text-accent'
                    }`}
                  >
                    {isGym ? 'Gym' : 'Stretch'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
                  <span>{exerciseCount} exercises</span>
                  <span>~{workout.estimatedDuration} min</span>
                  {safetyCount > 0 && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-warning/20 text-warning">
                      {safetyCount} warning{safetyCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-text-muted shrink-0 mt-1 transition-transform duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="mt-4 border-t border-white/5 pt-4">
                {/* Safety warnings */}
                {workout.safetyWarnings.length > 0 && (
                  <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 mb-4">
                    <h3 className="text-sm font-semibold text-warning mb-1">Safety Warnings</h3>
                    <ul className="space-y-1">
                      {workout.safetyWarnings.map((warning, i) => (
                        <li key={i} className="text-xs text-warning/80 flex gap-2">
                          <span className="shrink-0">--</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* User restrictions */}
                {userProfile.restrictions.length > 0 && (
                  <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 mb-4">
                    <h3 className="text-sm font-semibold text-danger mb-1">Your Restrictions</h3>
                    <ul className="space-y-1">
                      {userProfile.restrictions.map((restriction, i) => (
                        <li key={i} className="text-xs text-danger/80 flex gap-2">
                          <span className="shrink-0">--</span>
                          <span>{restriction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Exercise phases */}
                <PhaseSection
                  title="Pre-Workout"
                  exercises={workout.preWorkout}
                  indexOffset={0}
                  expandedExerciseId={expandedExerciseId}
                  onExerciseTap={handleExerciseTap}
                />
                <PhaseSection
                  title="Main Workout"
                  exercises={workout.mainWorkout}
                  indexOffset={workout.preWorkout.length}
                  expandedExerciseId={expandedExerciseId}
                  onExerciseTap={handleExerciseTap}
                />
                <PhaseSection
                  title="Cool-Down"
                  exercises={workout.coolDown}
                  indexOffset={workout.preWorkout.length + workout.mainWorkout.length}
                  expandedExerciseId={expandedExerciseId}
                  onExerciseTap={handleExerciseTap}
                />

                <div className="mt-6">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/workout/${workout.id}`);
                    }}
                  >
                    Start Workout
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
