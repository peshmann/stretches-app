import { useState, useCallback, useEffect, useRef } from 'react';
import type { Exercise } from '../../data/types';
import { useTimer } from '../../hooks/useTimer';
import { useAudio } from '../../hooks/useAudio';
import { ProgressRing } from '../ui/ProgressRing';
import { Button } from '../ui/Button';

interface TimedExerciseProps {
  exercise: Exercise;
  currentSet: number;
  totalSets: number;
  onSetComplete: () => void;
  onAudioUnlock: () => void;
}

type TimerState = 'idle' | 'running' | 'paused' | 'switching' | 'complete';
type Side = 'left' | 'right';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}`;
}

export function TimedExercise({ exercise, currentSet, totalSets, onSetComplete, onAudioUnlock }: TimedExerciseProps) {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentSide, setCurrentSide] = useState<Side>('left');
  const { play, unlock } = useAudio();
  const audioUnlockedRef = useRef(false);
  const isBilateral = exercise.sides === 2;
  const duration = exercise.duration ?? 30;

  const handleTimerComplete = useCallback(() => {
    if (isBilateral && currentSide === 'left') {
      play('switchSides');
      setTimerState('switching');
    } else {
      play('exerciseComplete');
      setTimerState('complete');
      onSetComplete();
    }
  }, [isBilateral, currentSide, play, onSetComplete]);

  const timer = useTimer(handleTimerComplete);

  // Reset state when exercise or set changes
  useEffect(() => {
    setTimerState('idle');
    setCurrentSide('left');
    timer.reset();
  }, [exercise.id, currentSet]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle the switching state: wait 3s then auto-start right side
  const timerStart = timer.start;
  useEffect(() => {
    if (timerState !== 'switching') return;
    const timeout = setTimeout(() => {
      setCurrentSide('right');
      setTimerState('running');
      timerStart(duration);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [timerState, duration, timerStart]);

  const handleStart = () => {
    if (!audioUnlockedRef.current) {
      unlock();
      onAudioUnlock();
      audioUnlockedRef.current = true;
    }
    setTimerState('running');
    timer.start(duration);
  };

  const handlePause = () => {
    timer.pause();
    setTimerState('paused');
  };

  const handleResume = () => {
    timer.resume();
    setTimerState('running');
  };

  const sideLabel = isBilateral
    ? currentSide === 'left' ? 'Left Side' : 'Right Side'
    : null;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {totalSets > 1 && (
        <span className="font-display text-lg text-text-muted">
          Set {currentSet} of {totalSets}
        </span>
      )}

      {sideLabel && timerState !== 'switching' && (
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">
          {sideLabel}
        </span>
      )}

      {timerState === 'switching' ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <ProgressRing progress={1} size={200} strokeWidth={8} color="stroke-primary" trackColor="stroke-white/10">
            <span className="font-display text-lg font-bold text-primary">Switch</span>
          </ProgressRing>
          <p className="font-display text-xl font-bold text-primary animate-pulse">
            Switch to Right Side
          </p>
        </div>
      ) : (
        <>
          <ProgressRing
            progress={timerState === 'idle' ? 0 : timer.progress}
            size={200}
            strokeWidth={8}
            color="stroke-primary"
            trackColor="stroke-white/10"
          >
            <div className="flex flex-col items-center">
              <span className="font-display text-5xl font-bold tabular-nums">
                {timerState === 'idle' ? formatTime(duration) : formatTime(timer.secondsLeft)}
              </span>
              {timerState === 'paused' && (
                <span className="text-xs uppercase tracking-wider text-text-muted mt-1">Paused</span>
              )}
            </div>
          </ProgressRing>

          {timerState === 'idle' && (
            <Button variant="primary" size="lg" onClick={handleStart}>
              Start Timer
            </Button>
          )}

          {timerState === 'running' && (
            <Button variant="ghost" size="lg" onClick={handlePause}>
              Pause
            </Button>
          )}

          {timerState === 'paused' && (
            <Button variant="primary" size="lg" onClick={handleResume}>
              Resume
            </Button>
          )}
        </>
      )}
    </div>
  );
}
