import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getWorkoutSteps, workouts } from '../data/workouts';
import { useTimer } from '../hooks/useTimer';
import { useAudio } from '../hooks/useAudio';
import { useWakeLock } from '../hooks/useWakeLock';
import { saveActiveSession, clearActiveSession, loadActiveSession } from '../utils/storage';
import { ExerciseView } from '../components/workout/ExerciseView';
import { TimedExercise } from '../components/workout/TimedExercise';
import { RepExercise } from '../components/workout/RepExercise';
import { RestOverlay } from '../components/workout/RestOverlay';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/Button';

export default function WorkoutPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { play } = useAudio();
  const wakeLock = useWakeLock();

  const steps = getWorkoutSteps(workoutId ?? '');
  const workout = workouts.find(w => w.id === workoutId);

  const resumeState = location.state as { resume?: boolean } | null;
  const existingSession = resumeState?.resume ? loadActiveSession() : null;

  const [stepIndex, setStepIndex] = useState(existingSession?.currentExerciseIndex ?? 0);
  const [currentSet, setCurrentSet] = useState(existingSession?.currentSet ?? 1);
  const [isResting, setIsResting] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exercisesCompleted, setExercisesCompleted] = useState(existingSession?.exercisesCompleted ?? 0);
  const [exercisesSkipped, setExercisesSkipped] = useState(existingSession?.exercisesSkipped ?? 0);
  const [skippedIds, setSkippedIds] = useState<string[]>(existingSession?.skippedExerciseIds ?? []);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'back'>('forward');
  const [startTime] = useState(() => Date.now());

  // Swipe detection
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // Only horizontal swipes (more horizontal than vertical, min 60px)
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && stepIndex < steps.length - 1) {
        // Swipe left → next exercise (skip without counting)
        setSlideDirection('forward');
        setStepIndex(prev => prev + 1);
        setCurrentSet(1);
      } else if (deltaX > 0 && stepIndex > 0) {
        // Swipe right → previous exercise
        setSlideDirection('back');
        setStepIndex(prev => prev - 1);
        setCurrentSet(1);
      }
    }
  }, [stepIndex, steps.length]);

  // Wake lock
  useEffect(() => {
    wakeLock.request();
    return () => { wakeLock.release(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Rest timer
  const handleRestComplete = useCallback(() => {
    play('restOver');
    setIsResting(false);
  }, [play]);

  const restTimer = useTimer(handleRestComplete);

  const currentStep = steps[stepIndex];

  const advanceExercise = useCallback(() => {
    setCurrentSet(1);
    setSlideDirection('forward');
    if (stepIndex < steps.length - 1) {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      saveActiveSession({
        workoutId: workoutId ?? '',
        startedAt: new Date(startTime).toISOString(),
        currentExerciseIndex: nextIndex,
        currentSet: 1,
        exercisesCompleted: exercisesCompleted + 1,
        exercisesSkipped,
        skippedExerciseIds: skippedIds,
        elapsedSeconds: Math.floor((Date.now() - startTime) / 1000),
      });
    } else {
      clearActiveSession();
      navigate('/post-workout', {
        state: {
          workoutId,
          durationSeconds: Math.floor((Date.now() - startTime) / 1000),
          exercisesCompleted: exercisesCompleted + 1,
          exercisesSkipped,
          skippedExerciseIds: skippedIds,
        },
      });
    }
  }, [stepIndex, steps.length, workoutId, startTime, exercisesCompleted, exercisesSkipped, skippedIds, navigate]);

  const handleSetComplete = useCallback(() => {
    if (!currentStep) return;
    const exercise = currentStep.exercise;
    const totalSets = exercise.sets ?? 1;

    if (currentSet < totalSets) {
      setCurrentSet(prev => prev + 1);
      if (exercise.restSeconds) {
        setIsResting(true);
        restTimer.start(exercise.restSeconds);
      }
    } else {
      setExercisesCompleted(prev => prev + 1);
      advanceExercise();
    }
  }, [currentStep, currentSet, restTimer, advanceExercise]);

  const handleSkipRest = useCallback(() => {
    restTimer.reset();
    setIsResting(false);
  }, [restTimer]);

  const confirmSkip = useCallback(() => {
    if (!currentStep) return;
    setExercisesSkipped(prev => prev + 1);
    setSkippedIds(prev => [...prev, currentStep.exercise.id]);
    advanceExercise();
    setShowSkipConfirm(false);
  }, [currentStep, advanceExercise]);

  const confirmExit = useCallback(() => {
    saveActiveSession({
      workoutId: workoutId ?? '',
      startedAt: new Date(startTime).toISOString(),
      currentExerciseIndex: stepIndex,
      currentSet,
      exercisesCompleted,
      exercisesSkipped,
      skippedExerciseIds: skippedIds,
      elapsedSeconds: Math.floor((Date.now() - startTime) / 1000),
    });
    navigate('/');
  }, [workoutId, startTime, stepIndex, currentSet, exercisesCompleted, exercisesSkipped, skippedIds, navigate]);

  // Guard: invalid workout
  if (!workout || steps.length === 0) {
    return (
      <div className="pt-12 text-center">
        <p className="text-text-muted">Workout not found.</p>
        <Button variant="ghost" size="md" className="mt-4" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </div>
    );
  }

  if (!currentStep) return null;

  const progressPercent = ((stepIndex + 1) / steps.length) * 100;
  const totalSets = currentStep.exercise.sets ?? 1;

  return (
    <div
      className="flex flex-col h-dvh overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      ref={contentRef}
    >
      {/* Top bar */}
      <div className="shrink-0 bg-bg border-b border-white/5">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-2">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1 text-text-muted hover:text-text transition-colors text-sm min-h-[44px]"
          >
            <span>&larr;</span> Exit
          </button>
          <span className="font-display font-semibold text-sm truncate max-w-[180px]">{workout.name}</span>
          <span className="text-text-muted text-sm tabular-nums">
            {stepIndex + 1}/{steps.length}
          </span>
        </div>
        <div className="h-0.5 bg-white/5">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Exercise content — fills remaining space, no scroll */}
      <div className="flex-1 min-h-0 max-w-lg mx-auto w-full px-4 flex flex-col">
        <div
          key={stepIndex}
          className={`flex-1 min-h-0 flex flex-col justify-between py-3 ${
            slideDirection === 'forward' ? 'animate-slide-in' : 'animate-slide-in-reverse'
          }`}
        >
          {/* Top: exercise info */}
          <div className="shrink-0">
            <ExerciseView exercise={currentStep.exercise} phase={currentStep.phase} compact />
          </div>

          {/* Middle: timer or rep action */}
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-2">
            {currentStep.exercise.type === 'timed' ? (
              <TimedExercise
                exercise={currentStep.exercise}
                currentSet={currentSet}
                totalSets={totalSets}
                onSetComplete={handleSetComplete}
                onAudioUnlock={() => {}}
              />
            ) : (
              <RepExercise
                exercise={currentStep.exercise}
                currentSet={currentSet}
                totalSets={totalSets}
                onSetComplete={handleSetComplete}
              />
            )}
          </div>

          {/* Bottom: skip + swipe hint */}
          <div className="shrink-0 flex flex-col items-center gap-1 pb-1">
            <Button variant="ghost" size="sm" onClick={() => setShowSkipConfirm(true)}>
              Skip Exercise
            </Button>
            <span className="text-[10px] text-text-muted/40">swipe left/right to browse</span>
          </div>
        </div>
      </div>

      {/* Rest overlay */}
      {isResting && (
        <RestOverlay
          secondsLeft={restTimer.secondsLeft}
          progress={restTimer.progress}
          onSkip={handleSkipRest}
        />
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={showSkipConfirm}
        title="Skip Exercise?"
        message={`Skip ${currentStep.exercise.name}?`}
        confirmLabel="Skip"
        cancelLabel="Keep Going"
        variant="default"
        onConfirm={confirmSkip}
        onCancel={() => setShowSkipConfirm(false)}
      />

      <ConfirmDialog
        open={showExitConfirm}
        title="Exit Workout?"
        message="Progress will be saved. You can resume later."
        confirmLabel="Exit"
        cancelLabel="Stay"
        variant="danger"
        onConfirm={confirmExit}
        onCancel={() => setShowExitConfirm(false)}
      />
    </div>
  );
}
