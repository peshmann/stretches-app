# Workout Tracker PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an offline-capable PWA that guides users through gym workouts and daily stretching with timers, bilateral exercise flow, rest periods, and progress tracking.

**Architecture:** Single-page React app with client-side routing. Static workout data bundled at build time, user progress in LocalStorage. No backend. Service worker for offline support via vite-plugin-pwa. Deployed to GitHub Pages.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, vite-plugin-pwa, Web Audio API, Wake Lock API.

**Spec:** `docs/superpowers/specs/2026-04-09-workout-tracker-pwa-design.md`

**Source data:** `C:\Users\User\Documents\Stretches App\workout_data.json`

---

## File Map

```
stretches-app/
├── .github/workflows/deploy.yml        # GitHub Pages deploy action
├── index.html                           # Entry point
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts                       # Vite + PWA plugin config
├── public/
│   ├── icon-192.png                     # PWA icon
│   └── icon-512.png                     # PWA icon
├── src/
│   ├── main.tsx                         # React entry, router setup
│   ├── App.tsx                          # Layout shell + bottom nav + routes
│   ├── index.css                        # Tailwind imports + custom animations + design tokens
│   ├── data/
│   │   ├── types.ts                     # All TypeScript interfaces
│   │   └── workouts.ts                  # Static workout data (typed, from JSON)
│   ├── utils/
│   │   ├── storage.ts                   # LocalStorage read/write helpers
│   │   ├── streak.ts                    # Streak calculation logic
│   │   └── schedule.ts                  # "Today's workout" logic by day of week
│   ├── hooks/
│   │   ├── useTimer.ts                  # Countdown timer with pause/resume
│   │   ├── useAudio.ts                  # Web Audio API synth sounds
│   │   ├── useWakeLock.ts               # Screen wake lock
│   │   ├── useProgress.ts              # CRUD for workout history + stats
│   │   └── useActiveSession.ts          # Interrupted workout state
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx               # Primary/secondary/ghost button variants
│   │   │   ├── Card.tsx                 # Surface card with consistent styling
│   │   │   ├── ProgressRing.tsx         # Circular SVG countdown timer
│   │   │   ├── ConfirmDialog.tsx        # Modal confirmation (skip/exit)
│   │   │   └── BottomNav.tsx            # Fixed bottom navigation
│   │   ├── workout/
│   │   │   ├── ExerciseView.tsx         # Full exercise display (name, desc, tips, video, safety)
│   │   │   ├── TimedExercise.tsx        # Timer flow for timed exercises (inc. bilateral)
│   │   │   ├── RepExercise.tsx          # Set completion flow for rep exercises
│   │   │   ├── RestOverlay.tsx          # Frosted glass rest timer overlay
│   │   │   └── SafetyBanner.tsx         # Orange warning banner
│   │   ├── home/
│   │   │   ├── StreakCard.tsx           # Streak + weekly progress display
│   │   │   └── TodayCard.tsx           # Today's workout / resume prompt
│   │   └── progress/
│   │       ├── Calendar.tsx             # Month calendar with workout dots
│   │       └── RecentWorkouts.tsx       # List of recent completed workouts
│   └── pages/
│       ├── HomePage.tsx                 # Home screen
│       ├── LibraryPage.tsx              # Workout library with expandable cards
│       ├── WorkoutPage.tsx              # Active workout engine + exercise flow
│       ├── PostWorkoutPage.tsx          # Completion celebration + feeling rating
│       └── ProgressPage.tsx             # Stats, calendar, history
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Scaffold Vite + React + TypeScript project**

```bash
cd "C:\Users\User\Documents\code\stretches-app"
npm create vite@latest . -- --template react-ts
```

Select "Ignore files and continue" if prompted about existing files.

- [ ] **Step 2: Install dependencies**

```bash
npm install react-router-dom
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
```

- [ ] **Step 3: Configure Vite with PWA plugin and Tailwind**

Replace `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/stretches-app/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Workout Tracker',
        short_name: 'Workouts',
        description: 'Guided workout tracker for posture correction',
        theme_color: '#0a0e17',
        background_color: '#0a0e17',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
});
```

- [ ] **Step 4: Set up index.css with Tailwind + design tokens + animations**

Replace `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0e17;
  --color-surface: #111827;
  --color-surface-raised: #1f2937;
  --color-primary: #3b82f6;
  --color-primary-glow: #60a5fa;
  --color-accent: #8b5cf6;
  --color-success: #22c55e;
  --color-warning: #f97316;
  --color-danger: #ef4444;
  --color-text: #e8ecf4;
  --color-text-muted: #9ca3af;

  --font-display: 'Outfit', sans-serif;
  --font-body: 'DM Sans', sans-serif;

  --animate-fade-in-up: fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  --animate-slide-in: slide-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
  --animate-slide-in-reverse: slide-in-reverse 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
  --animate-streak-fire: streak-fire 1.5s linear infinite;
  --animate-skeleton-shimmer: skeleton-shimmer 1.8s linear infinite;
  --animate-border-breathe: border-breathe 3s ease-in-out infinite;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes slide-in {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-reverse {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes streak-fire {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes border-breathe {
  0%, 100% { border-color: var(--color-primary); }
  50% { border-color: var(--color-primary-glow); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

body {
  font-family: var(--font-body);
  background-color: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  min-height: 100dvh;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
}
```

- [ ] **Step 5: Set up index.html with Google Fonts**

Replace `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/stretches-app/icon-192.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0a0e17" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="apple-touch-icon" href="/stretches-app/icon-192.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <title>Workout Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Set up main.tsx with router and App.tsx shell**

`src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
```

Note: `HashRouter` is required for GitHub Pages (no server-side routing).

`src/App.tsx` (placeholder shell):

```tsx
import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-dvh bg-bg text-text">
      <main className="max-w-lg mx-auto pb-20">
        <Routes>
          <Route path="/" element={<div className="p-4 font-display text-2xl">Workout Tracker</div>} />
        </Routes>
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Generate PWA icons**

Create simple placeholder icons (blue circle with "W" text) at `public/icon-192.png` and `public/icon-512.png`. Use an SVG-to-PNG approach or a simple canvas script. These can be replaced with proper icons later.

- [ ] **Step 8: Verify dev server runs**

```bash
cd "C:\Users\User\Documents\code\stretches-app"
npm run dev
```

Expected: Vite dev server starts, browser shows "Workout Tracker" text on dark background at `http://localhost:5173/stretches-app/`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS + Tailwind + PWA project"
```

---

## Task 2: Data Layer — Types + Workout Data + Storage Utilities

**Files:**
- Create: `src/data/types.ts`, `src/data/workouts.ts`, `src/utils/storage.ts`, `src/utils/streak.ts`, `src/utils/schedule.ts`

- [ ] **Step 1: Define TypeScript interfaces**

`src/data/types.ts`:

```typescript
export interface Exercise {
  id: string;
  name: string;
  type: 'timed' | 'reps';
  description: string;
  tips: string;
  videoUrl?: string;
  category: string;
  priority?: 'high' | 'critical';
  safety?: string;
  // Timed exercises
  duration?: number;       // seconds
  maxDuration?: number;    // stretch goal seconds
  // Rep exercises
  sets?: number;
  reps?: number;
  restSeconds?: number;
  // Bilateral
  sides?: number;          // 2 = left+right
}

export interface Workout {
  id: string;
  name: string;
  type: 'gym' | 'stretch';
  description: string;
  scheduledDays: string[];
  estimatedDuration: number;  // minutes
  preWorkout: Exercise[];
  mainWorkout: Exercise[];
  coolDown: Exercise[];
  safetyWarnings: string[];
}

export interface WorkoutData {
  workouts: Workout[];
  userProfile: {
    conditions: string[];
    restrictions: string[];
    goals: string[];
  };
}

export type Feeling = 'great' | 'good' | 'ok' | 'struggled' | 'pain';

export interface CompletedWorkout {
  workoutId: string;
  date: string;              // ISO datetime
  durationSeconds: number;
  exercisesCompleted: number;
  exercisesSkipped: number;
  skippedExerciseIds: string[];
  feeling: Feeling;
  notes?: string;
}

export interface ActiveSession {
  workoutId: string;
  startedAt: string;
  currentExerciseIndex: number;
  currentSet: number;
  exercisesCompleted: number;
  exercisesSkipped: number;
  skippedExerciseIds: string[];
  elapsedSeconds: number;
}

export interface UserProgress {
  workouts: CompletedWorkout[];
  stats: {
    totalWorkouts: number;
    currentStreak: number;
    longestStreak: number;
    startDate: string;
  };
}

// A flattened exercise with its phase info, used by the workout engine
export interface WorkoutStep {
  exercise: Exercise;
  phase: 'pre-workout' | 'main' | 'cool-down';
  index: number;        // position in the full step list
  totalSteps: number;
}
```

- [ ] **Step 2: Copy and type the workout data**

Copy `C:\Users\User\Documents\Stretches App\workout_data.json` into the project as `src/data/workouts.ts`, wrapping it in a typed export:

```typescript
import type { WorkoutData } from './types';

const data: WorkoutData = {
  // ... paste the full JSON content here, the structure already matches our types
};

export const workouts = data.workouts;
export const userProfile = data.userProfile;

// Helper: flatten a workout into an ordered list of WorkoutSteps
export function getWorkoutSteps(workoutId: string): import('./types').WorkoutStep[] {
  const workout = workouts.find(w => w.id === workoutId);
  if (!workout) return [];

  const steps: import('./types').WorkoutStep[] = [];
  const addPhase = (exercises: import('./types').Exercise[], phase: import('./types').WorkoutStep['phase']) => {
    exercises.forEach(ex => {
      steps.push({ exercise: ex, phase, index: steps.length, totalSteps: 0 });
    });
  };

  addPhase(workout.preWorkout, 'pre-workout');
  addPhase(workout.mainWorkout, 'main');
  addPhase(workout.coolDown, 'cool-down');

  // Backfill totalSteps
  steps.forEach(s => { s.totalSteps = steps.length; });
  return steps;
}
```

- [ ] **Step 3: Write storage utilities**

`src/utils/storage.ts`:

```typescript
import type { UserProgress, ActiveSession, CompletedWorkout } from '../data/types';

const PROGRESS_KEY = 'workout-tracker-progress';
const SESSION_KEY = 'workout-tracker-active-session';

function getDefaultProgress(): UserProgress {
  return {
    workouts: [],
    stats: {
      totalWorkouts: 0,
      currentStreak: 0,
      longestStreak: 0,
      startDate: new Date().toISOString().split('T')[0],
    },
  };
}

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return getDefaultProgress();
    return JSON.parse(raw) as UserProgress;
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function addCompletedWorkout(workout: CompletedWorkout): UserProgress {
  const progress = loadProgress();
  progress.workouts.push(workout);
  progress.stats.totalWorkouts += 1;
  // Streak recalculated by streak.ts
  saveProgress(progress);
  return progress;
}

export function loadActiveSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveSession;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: ActiveSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearActiveSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
```

- [ ] **Step 4: Write streak calculation**

`src/utils/streak.ts`:

```typescript
import type { UserProgress } from '../data/types';

// Get the date string (YYYY-MM-DD) in local timezone
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Get all unique dates that have at least one completed workout
function getWorkoutDates(progress: UserProgress): Set<string> {
  const dates = new Set<string>();
  for (const w of progress.workouts) {
    dates.add(toDateStr(new Date(w.date)));
  }
  return dates;
}

export function recalculateStreak(progress: UserProgress): { currentStreak: number; longestStreak: number } {
  const dates = getWorkoutDates(progress);
  if (dates.size === 0) return { currentStreak: 0, longestStreak: 0 };

  // Sort dates descending
  const sorted = Array.from(dates).sort().reverse();

  const today = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));

  // Current streak: must include today or yesterday
  let currentStreak = 0;
  if (sorted[0] === today || sorted[0] === yesterday) {
    currentStreak = 1;
    let prevDate = new Date(sorted[0]);
    for (let i = 1; i < sorted.length; i++) {
      const expected = new Date(prevDate);
      expected.setDate(expected.getDate() - 1);
      if (sorted[i] === toDateStr(expected)) {
        currentStreak++;
        prevDate = expected;
      } else {
        break;
      }
    }
  }

  // Longest streak: scan all dates ascending
  const asc = Array.from(dates).sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < asc.length; i++) {
    const prev = new Date(asc[i - 1]);
    const expected = new Date(prev);
    expected.setDate(expected.getDate() + 1);
    if (asc[i] === toDateStr(expected)) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  return { currentStreak, longestStreak: Math.max(longest, progress.stats.longestStreak) };
}
```

- [ ] **Step 5: Write schedule utility**

`src/utils/schedule.ts`:

```typescript
import { workouts } from '../data/workouts';
import type { Workout } from '../data/types';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function getTodayDayName(): string {
  return DAY_NAMES[new Date().getDay()];
}

export function getTodaysWorkouts(): Workout[] {
  const today = getTodayDayName();
  return workouts.filter(w => w.scheduledDays.includes(today));
}

// Returns the primary workout for today (gym takes priority over stretch)
export function getTodayPrimaryWorkout(): Workout | null {
  const todays = getTodaysWorkouts();
  if (todays.length === 0) return null;
  // Gym workouts take priority in the "Today's Workout" card
  return todays.find(w => w.type === 'gym') ?? todays[0];
}

export function isRestDay(): boolean {
  return getTodaysWorkouts().length === 0;
}

// Saturday/Sunday = show "Log Activity" button
export function showLogActivity(): boolean {
  const day = getTodayDayName();
  return day === 'saturday' || day === 'sunday';
}

// Get week completion: how many days this week (Mon-Sun) have workouts
export function getWeekCompletion(workoutDates: string[]): { completed: number; total: number } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const weekDates = new Set<string>();
  for (const d of workoutDates) {
    const date = new Date(d);
    if (date >= monday && date <= sunday) {
      weekDates.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
    }
  }

  // Total expected: 6 days (Mon-Sat, Sunday is rest/optional)
  return { completed: weekDates.size, total: 6 };
}
```

- [ ] **Step 6: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/data/ src/utils/
git commit -m "feat: add data layer — types, workout data, storage, streak, schedule utils"
```

---

## Task 3: Core Hooks — Timer, Audio, Wake Lock

**Files:**
- Create: `src/hooks/useTimer.ts`, `src/hooks/useAudio.ts`, `src/hooks/useWakeLock.ts`

- [ ] **Step 1: Build the timer hook**

`src/hooks/useTimer.ts`:

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerReturn {
  secondsLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  start: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  /** 0 to 1, where 1 = complete */
  progress: number;
}

export function useTimer(onComplete: () => void): UseTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((seconds: number) => {
    clearTimer();
    setTotalSeconds(seconds);
    setSecondsLeft(seconds);
    setIsRunning(true);
    setIsPaused(false);
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          setIsPaused(false);
          onCompleteRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const pause = useCallback(() => {
    if (isRunning && !isPaused) {
      clearTimer();
      setIsPaused(true);
    }
  }, [isRunning, isPaused, clearTimer]);

  const resume = useCallback(() => {
    if (isRunning && isPaused) {
      setIsPaused(false);
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            setIsPaused(false);
            onCompleteRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isRunning, isPaused, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setSecondsLeft(0);
    setIsRunning(false);
    setIsPaused(false);
    setTotalSeconds(0);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  return { secondsLeft, isRunning, isPaused, start, pause, resume, reset, progress };
}
```

- [ ] **Step 2: Build the audio hook**

`src/hooks/useAudio.ts`:

```typescript
import { useRef, useCallback } from 'react';

type SoundType = 'exerciseComplete' | 'switchSides' | 'restOver';

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    // Resume if suspended (browsers require user interaction first)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = 0.3;
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [getContext]);

  const play = useCallback((sound: SoundType) => {
    switch (sound) {
      case 'exerciseComplete':
        // Sharp double-beep
        playTone(880, 0.15, 'square');
        setTimeout(() => playTone(880, 0.15, 'square'), 200);
        break;
      case 'switchSides':
        // Gentle single tone
        playTone(660, 0.3, 'sine');
        break;
      case 'restOver':
        // Upbeat ascending chime
        playTone(523, 0.15, 'sine');
        setTimeout(() => playTone(659, 0.15, 'sine'), 150);
        setTimeout(() => playTone(784, 0.25, 'sine'), 300);
        break;
    }
  }, [playTone]);

  // Call once on first user interaction to unlock audio context
  const unlock = useCallback(() => {
    getContext();
  }, [getContext]);

  return { play, unlock };
}
```

- [ ] **Step 3: Build the wake lock hook**

`src/hooks/useWakeLock.ts`:

```typescript
import { useRef, useCallback, useEffect } from 'react';

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {
      // Wake lock request failed (e.g., low battery, tab not visible)
    }
  }, []);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }, []);

  // Re-acquire on visibility change (wake lock releases when tab is hidden)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
        // Only re-request if we had one before — check via a flag
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      release();
    };
  }, [release]);

  return { request, release };
}
```

- [ ] **Step 4: Verify hooks compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add core hooks — timer, audio (Web Audio API), wake lock"
```

---

## Task 4: UI Foundation — Button, Card, ProgressRing, ConfirmDialog, BottomNav

**Files:**
- Create: all files in `src/components/ui/`

> **IMPORTANT**: Use the `superpowers:frontend-design` skill when implementing this task. The components must follow the design system from the spec: electric blue primary, dark theme, 48px+ touch targets, Smash Club animation patterns.

- [ ] **Step 1: Build Button component**

`src/components/ui/Button.tsx`:

Variants: `primary` (blue bg), `secondary` (surface bg, blue border), `ghost` (transparent), `danger` (red bg).
Sizes: `md` (h-12, default), `lg` (h-14, full width — for main CTAs), `sm` (h-10).
All variants include ripple tap feedback animation.
Must have `min-h-[48px]` on all sizes for touch target compliance.

- [ ] **Step 2: Build Card component**

`src/components/ui/Card.tsx`:

Simple wrapper: `bg-surface rounded-xl border border-white/5 p-4`. Accepts `className` for overrides. Uses `animate-fade-in-up` on mount.

- [ ] **Step 3: Build ProgressRing component**

`src/components/ui/ProgressRing.tsx`:

SVG-based circular progress indicator. Props: `progress` (0-1), `size` (px), `strokeWidth`, `color` (defaults to primary).
Children slot for center content (timer text).
Smooth CSS transition on stroke-dashoffset for animated fill.
Two rings: background track (white/10) and progress arc (blue or grey for rest).

- [ ] **Step 4: Build ConfirmDialog component**

`src/components/ui/ConfirmDialog.tsx`:

Modal overlay with frosted glass backdrop (`backdrop-blur-sm bg-black/60`).
Props: `open`, `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`, `variant` ('default' | 'danger').
Centered card with two buttons. Confirm button uses variant colour (blue default, red for danger).

- [ ] **Step 5: Build BottomNav component**

`src/components/ui/BottomNav.tsx`:

Fixed bottom bar, 3 items: Home (house icon), Library (book icon), Progress (chart icon).
Uses React Router `NavLink` for active state. Active item: blue icon + glow. Inactive: muted grey.
`min-h-[56px]`, `bg-surface/80 backdrop-blur-md border-t border-white/5`.
Icons: use simple inline SVGs (no icon library needed for 3 icons).

- [ ] **Step 6: Wire BottomNav into App.tsx**

Update `src/App.tsx` to include `<BottomNav />` below the `<Routes>`.

- [ ] **Step 7: Verify in browser**

```bash
npm run dev
```

Check: dark background, bottom nav visible with 3 icons, active state highlights blue.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/ src/App.tsx
git commit -m "feat: add UI foundation — Button, Card, ProgressRing, ConfirmDialog, BottomNav"
```

---

## Task 5: Home Screen

**Files:**
- Create: `src/components/home/StreakCard.tsx`, `src/components/home/TodayCard.tsx`, `src/pages/HomePage.tsx`
- Create: `src/hooks/useProgress.ts`, `src/hooks/useActiveSession.ts`

- [ ] **Step 1: Build useProgress hook**

`src/hooks/useProgress.ts`:

```typescript
import { useState, useCallback } from 'react';
import { loadProgress, saveProgress, addCompletedWorkout } from '../utils/storage';
import { recalculateStreak } from '../utils/streak';
import type { UserProgress, CompletedWorkout } from '../data/types';

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const p = loadProgress();
    const streaks = recalculateStreak(p);
    p.stats.currentStreak = streaks.currentStreak;
    p.stats.longestStreak = streaks.longestStreak;
    saveProgress(p);
    return p;
  });

  const completeWorkout = useCallback((workout: CompletedWorkout) => {
    const updated = addCompletedWorkout(workout);
    const streaks = recalculateStreak(updated);
    updated.stats.currentStreak = streaks.currentStreak;
    updated.stats.longestStreak = streaks.longestStreak;
    saveProgress(updated);
    setProgress({ ...updated });
    return updated;
  }, []);

  const logActivity = useCallback(() => {
    // Log a "manual activity" for streak purposes (e.g., badminton)
    const workout: CompletedWorkout = {
      workoutId: 'manual-activity',
      date: new Date().toISOString(),
      durationSeconds: 0,
      exercisesCompleted: 0,
      exercisesSkipped: 0,
      skippedExerciseIds: [],
      feeling: 'good',
      notes: 'Manual activity log',
    };
    return completeWorkout(workout);
  }, [completeWorkout]);

  const refresh = useCallback(() => {
    const p = loadProgress();
    const streaks = recalculateStreak(p);
    p.stats.currentStreak = streaks.currentStreak;
    p.stats.longestStreak = streaks.longestStreak;
    saveProgress(p);
    setProgress({ ...p });
  }, []);

  return { progress, completeWorkout, logActivity, refresh };
}
```

- [ ] **Step 2: Build useActiveSession hook**

`src/hooks/useActiveSession.ts`:

```typescript
import { useState, useCallback } from 'react';
import { loadActiveSession, saveActiveSession, clearActiveSession } from '../utils/storage';
import type { ActiveSession } from '../data/types';

export function useActiveSession() {
  const [session, setSession] = useState<ActiveSession | null>(() => loadActiveSession());

  const startSession = useCallback((workoutId: string) => {
    const newSession: ActiveSession = {
      workoutId,
      startedAt: new Date().toISOString(),
      currentExerciseIndex: 0,
      currentSet: 1,
      exercisesCompleted: 0,
      exercisesSkipped: 0,
      skippedExerciseIds: [],
      elapsedSeconds: 0,
    };
    saveActiveSession(newSession);
    setSession(newSession);
    return newSession;
  }, []);

  const updateSession = useCallback((updates: Partial<ActiveSession>) => {
    setSession(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      saveActiveSession(updated);
      return updated;
    });
  }, []);

  const endSession = useCallback(() => {
    clearActiveSession();
    setSession(null);
  }, []);

  return { session, startSession, updateSession, endSession };
}
```

- [ ] **Step 3: Build StreakCard**

`src/components/home/StreakCard.tsx`:

Displays current streak (large number with fire gradient animation), longest streak (smaller), and weekly completion bar (e.g., "4/6 this week" with progress dots or mini bar).

Streak number uses `font-display text-4xl font-bold` with the `streak-fire` animated gradient background on the text (using `background-clip: text`).

- [ ] **Step 4: Build TodayCard**

`src/components/home/TodayCard.tsx`:

Props: workout (today's primary), activeSession (for resume), onStart, onResume.

Three states:
1. **Normal**: shows workout name, type badge, estimated duration, large "Start" button
2. **Resume available**: shows "Resume Session A (5/12 done)" with Resume button + smaller "Start Fresh" link
3. **Completed**: shows green checkmark + "Completed" text, muted styling

Uses `border-breathe` animation to draw attention.

- [ ] **Step 5: Build HomePage**

`src/pages/HomePage.tsx`:

Composes: StreakCard, TodayCard, QuickAccess cards (3 smaller workout cards), and conditional "Log Activity" button (Sat/Sun only).

Uses `useProgress`, `useActiveSession`, schedule utilities.

Navigation: "Start" navigates to `/workout/:workoutId`, quick access cards navigate to `/workout/:id`.

- [ ] **Step 6: Wire HomePage into App.tsx routes**

Update `src/App.tsx`:

```tsx
import HomePage from './pages/HomePage';
// ... inside Routes:
<Route path="/" element={<HomePage />} />
```

- [ ] **Step 7: Verify in browser**

Home screen shows: streak card (0 streak for new user), today's workout card, 3 quick access cards, bottom nav.

- [ ] **Step 8: Commit**

```bash
git add src/components/home/ src/pages/HomePage.tsx src/hooks/useProgress.ts src/hooks/useActiveSession.ts src/App.tsx
git commit -m "feat: add Home screen — streak card, today's workout, quick access"
```

---

## Task 6: Workout Library Screen

**Files:**
- Create: `src/pages/LibraryPage.tsx`

- [ ] **Step 1: Build LibraryPage**

`src/pages/LibraryPage.tsx`:

Displays 3 workout cards. Each card shows:
- Workout name + type badge ("Gym" blue, "Stretch" purple)
- Exercise count, estimated duration
- Safety warnings count (orange badge if > 0)

Tapping a card toggles expansion to show:
- Safety warnings section (orange background, `userProfile.restrictions` listed)
- Exercise list grouped by phase headers ("Pre-Workout", "Main Workout", "Cool-Down")
- Each exercise row: name, type indicator (clock icon for timed, dumbbell icon for reps), duration or sets x reps, priority badge if high/critical, video link icon
- "Start Workout" button at bottom

Uses `useState` for expanded card ID. Exercise list items stagger-animate in on expand.

Navigation: "Start Workout" navigates to `/workout/:workoutId`.

- [ ] **Step 2: Wire into App.tsx**

```tsx
import LibraryPage from './pages/LibraryPage';
// ...
<Route path="/library" element={<LibraryPage />} />
```

- [ ] **Step 3: Verify in browser**

Library screen shows 3 cards. Tapping expands to show exercise list with phase grouping. Start button navigates (will 404 for now — workout page not built yet).

- [ ] **Step 4: Commit**

```bash
git add src/pages/LibraryPage.tsx src/App.tsx
git commit -m "feat: add Workout Library screen with expandable exercise lists"
```

---

## Task 7: Active Workout Engine — Exercise State Machine

**Files:**
- Create: `src/pages/WorkoutPage.tsx`, `src/components/workout/ExerciseView.tsx`, `src/components/workout/TimedExercise.tsx`, `src/components/workout/RepExercise.tsx`, `src/components/workout/RestOverlay.tsx`, `src/components/workout/SafetyBanner.tsx`

This is the largest and most complex task. The workout page acts as a state machine progressing through exercises.

- [ ] **Step 1: Build SafetyBanner**

`src/components/workout/SafetyBanner.tsx`:

Simple component. Props: `message: string`. Renders an orange banner: `bg-warning/10 border border-warning/30 text-warning rounded-lg p-3`. Warning icon + message text.

- [ ] **Step 2: Build ExerciseView**

`src/components/workout/ExerciseView.tsx`:

Display-only component showing exercise details. Props: `exercise: Exercise`, `phase: string`.

Layout:
- Phase label (small, muted, uppercase)
- Exercise name (large, `font-display text-2xl font-bold`)
- Priority badge if `exercise.priority` exists (blue for high, purple for critical)
- Description paragraph
- Tips in an info card (`bg-primary/5 border border-primary/20`)
- Safety banner if `exercise.safety` exists
- Video link button (opens in new tab)
- If bilateral: "Each side" label

- [ ] **Step 3: Build RestOverlay**

`src/components/workout/RestOverlay.tsx`:

Frosted glass overlay that appears during rest periods. Props: `secondsLeft`, `progress`, `onSkip`.

Full-screen overlay: `fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center`.
Center content: "Rest" label, ProgressRing (grey color) with time, "Skip Rest" button (large, ghost variant).

- [ ] **Step 4: Build TimedExercise component**

`src/components/workout/TimedExercise.tsx`:

Handles the timer flow for timed exercises, including bilateral.

Props:
```typescript
interface TimedExerciseProps {
  exercise: Exercise;
  currentSet: number;
  totalSets: number;
  onSetComplete: () => void;
  onTimerStart: () => void; // for audio unlock
}
```

State machine states: `idle` → `running` → `switchingSides` → `running` → `complete`

For non-bilateral:
- Shows ProgressRing with duration countdown
- "Start Timer" button (idle state)
- Pause/Resume button (running state)
- On complete → calls `onSetComplete()`

For bilateral (`exercise.sides === 2`):
- Same timer, but shows "Left Side" label
- On left complete → play switchSides sound → show "Switch to Right Side" for 3 seconds → auto-start right timer
- On right complete → calls `onSetComplete()`

Uses `useTimer` hook and `useAudio` hook.

- [ ] **Step 5: Build RepExercise component**

`src/components/workout/RepExercise.tsx`:

Props:
```typescript
interface RepExerciseProps {
  exercise: Exercise;
  currentSet: number;
  totalSets: number;
  onSetComplete: () => void;
}
```

Simpler than timed:
- Shows rep count (large number), "each side" label if bilateral
- Large "Set Complete" button
- On tap → calls `onSetComplete()`

- [ ] **Step 6: Build WorkoutPage — the state machine**

`src/pages/WorkoutPage.tsx`:

This is the orchestrator. Uses `useParams()` to get `workoutId`, calls `getWorkoutSteps()` to get the flattened exercise list.

State:
```typescript
const [stepIndex, setStepIndex] = useState(initialIndex); // from activeSession or 0
const [currentSet, setCurrentSet] = useState(initialSet);  // from activeSession or 1
const [isResting, setIsResting] = useState(false);
const [showSkipConfirm, setShowSkipConfirm] = useState(false);
const [showExitConfirm, setShowExitConfirm] = useState(false);
const [exercisesCompleted, setExercisesCompleted] = useState(0);
const [exercisesSkipped, setExercisesSkipped] = useState(0);
const [skippedIds, setSkippedIds] = useState<string[]>([]);
const [slideDirection, setSlideDirection] = useState<'forward' | 'back'>('forward');
```

Core flow:

```
handleSetComplete():
  if currentSet < totalSets:
    setCurrentSet(prev => prev + 1)
    setIsResting(true)  // starts rest overlay
  else:
    exercisesCompleted++
    advanceToNextExercise()

handleRestComplete():
  setIsResting(false)
  // Timer auto-starts on next render (TimedExercise idle → user taps start)

handleSkip():
  show ConfirmDialog → on confirm:
    exercisesSkipped++
    skippedIds.push(exercise.id)
    advanceToNextExercise()

advanceToNextExercise():
  setCurrentSet(1)
  setSlideDirection('forward')
  if stepIndex < steps.length - 1:
    setStepIndex(prev => prev + 1)
    saveActiveSession(...)  // persist state
  else:
    navigate to /post-workout with completion data

handleExit():
  show ConfirmDialog → on confirm:
    saveActiveSession(current state)
    navigate('/')
```

Top bar: Exit button (left), workout name (center), "3/12" step counter (right).
Progress bar: thin bar below top bar, width = `(stepIndex / totalSteps) * 100%`.

Exercise display area uses `slideDirection` to animate with `animate-slide-in` or `animate-slide-in-reverse`.

Renders either `<TimedExercise>` or `<RepExercise>` based on `step.exercise.type`.

Uses `useWakeLock` (request on mount, release on unmount/exit).
Uses `useActiveSession` to persist and restore state.
Uses `useAudio` — unlocks audio context on first "Start Timer" / "Set Complete" tap.

The rest timer uses a separate `useTimer` instance. When `isResting` is true, `<RestOverlay>` appears with the rest countdown.

- [ ] **Step 7: Wire WorkoutPage into App.tsx**

```tsx
import WorkoutPage from './pages/WorkoutPage';
// ...
<Route path="/workout/:workoutId" element={<WorkoutPage />} />
```

Note: WorkoutPage should NOT render the BottomNav. Update App.tsx to conditionally hide BottomNav when on the workout route.

- [ ] **Step 8: Test the full workout flow in browser**

Test with Daily Stretching (shortest workout):
1. Start from Home or Library
2. Verify first exercise shows with timer
3. Start timer, verify countdown works
4. Verify bilateral exercise shows "Left Side" → switch chime → "Right Side"
5. Verify rest timer auto-starts between sets
6. Skip rest works
7. Pause/resume works
8. Skip exercise shows confirmation
9. Exit shows confirmation
10. Progress through all exercises to completion
11. Verify it navigates to post-workout (will be placeholder for now)

- [ ] **Step 9: Commit**

```bash
git add src/components/workout/ src/pages/WorkoutPage.tsx src/App.tsx
git commit -m "feat: add active workout engine — timer flow, bilateral, rest, skip/exit confirms"
```

---

## Task 8: Post-Workout Screen

**Files:**
- Create: `src/pages/PostWorkoutPage.tsx`

- [ ] **Step 1: Build PostWorkoutPage**

`src/pages/PostWorkoutPage.tsx`:

Receives workout completion data via React Router state (`useLocation().state`):
```typescript
interface PostWorkoutState {
  workoutId: string;
  durationSeconds: number;
  exercisesCompleted: number;
  exercisesSkipped: number;
  skippedExerciseIds: string[];
}
```

Layout:
- Confetti animation on entry (use canvas-confetti — `npm install canvas-confetti` and `npm install -D @types/canvas-confetti`)
- "Workout Complete!" heading (large, `font-display`)
- Duration formatted as "42 minutes" or "12 minutes"
- Exercises: "8/10 completed" with green/muted colour
- Feeling selector: 5 large buttons in a row/grid. Each is a Card with emoji + label:
  - Great (green), Good (blue), OK (grey), Struggled (orange), Pain (red)
  - Selected state: filled background + border-breathe animation
- Optional notes: textarea with placeholder "Any notes about this workout?"
- "Done" button (large, primary, disabled until feeling selected)

On "Done":
1. Call `useProgress().completeWorkout()` with full data
2. Clear active session
3. Navigate to `/` (home)

- [ ] **Step 2: Wire into App.tsx**

```tsx
import PostWorkoutPage from './pages/PostWorkoutPage';
// ...
<Route path="/post-workout" element={<PostWorkoutPage />} />
```

- [ ] **Step 3: Test the full flow**

Run through a short workout (Daily Stretching), complete it, verify:
- Confetti fires
- Feeling buttons work
- Notes field works
- "Done" saves to LocalStorage and returns to Home
- Home now shows updated streak (1) and weekly progress

- [ ] **Step 4: Commit**

```bash
npm install canvas-confetti && npm install -D @types/canvas-confetti
git add src/pages/PostWorkoutPage.tsx src/App.tsx package.json package-lock.json
git commit -m "feat: add post-workout screen — confetti, feeling rating, notes"
```

---

## Task 9: Progress Screen

**Files:**
- Create: `src/components/progress/Calendar.tsx`, `src/components/progress/RecentWorkouts.tsx`, `src/pages/ProgressPage.tsx`

- [ ] **Step 1: Build Calendar component**

`src/components/progress/Calendar.tsx`:

Props: `workouts: CompletedWorkout[]`.

Renders current month as a grid:
- Month/year header with prev/next month arrows
- Day-of-week headers (Mo Tu We Th Fr Sa Su)
- Day cells: each cell shows the day number
- Dot indicators below the number:
  - Blue dot if a gym workout was completed that day
  - Purple dot if stretching was completed
  - Both dots if both types done
  - No dot if no workout
  - Future days: muted text, no dots
  - Today: ring border highlight (primary)

Grid layout: 7 columns, CSS grid. Each cell is a small square.

State: `currentMonth` (Date object), navigate with arrows.

- [ ] **Step 2: Build RecentWorkouts component**

`src/components/progress/RecentWorkouts.tsx`:

Props: `workouts: CompletedWorkout[]`.

Shows the last 10 workouts in a list. Each item:
- Date (formatted: "Apr 9, 2026")
- Workout name (lookup from workouts data by ID, handle "manual-activity" as "Activity Logged")
- Feeling emoji/badge
- Notes preview (first 50 chars, truncated)

Stagger animation on mount.

- [ ] **Step 3: Build ProgressPage**

`src/pages/ProgressPage.tsx`:

Composes:
- StreakCard (reused from Home — already built)
- Weekly summary (same `getWeekCompletion` from schedule utils, displayed as "4/6 this week" with a progress bar)
- Calendar
- RecentWorkouts
- Total workouts counter at bottom

Uses `useProgress` hook.

- [ ] **Step 4: Wire into App.tsx**

```tsx
import ProgressPage from './pages/ProgressPage';
// ...
<Route path="/progress" element={<ProgressPage />} />
```

- [ ] **Step 5: Verify in browser**

After completing a workout, Progress screen should show: streak, weekly summary, calendar with a dot on today, recent workout entry.

- [ ] **Step 6: Commit**

```bash
git add src/components/progress/ src/pages/ProgressPage.tsx src/App.tsx
git commit -m "feat: add Progress screen — calendar, streak, recent workouts"
```

---

## Task 10: Polish — Animations, Transitions, Visual Refinements

**Files:**
- Modify: various component files, `src/index.css`

> **IMPORTANT**: Use the `superpowers:frontend-design` skill for this task. Focus on making the app feel premium and gym-friendly.

- [ ] **Step 1: Add stagger animations to list views**

Add stagger delay to exercise lists in LibraryPage and RecentWorkouts. Each item gets `animation-delay: ${index * 50}ms` via inline style + the `animate-fade-in-up` class.

- [ ] **Step 2: Add direction-aware workout transitions**

In WorkoutPage, wrap the exercise display in a keyed container that applies `animate-slide-in` (forward) or `animate-slide-in-reverse` (backward based on skip vs advance). Use `key={stepIndex}` to trigger re-mount animation.

- [ ] **Step 3: Add ripple effect to buttons**

Add a CSS-based ripple effect to Button component. On click, create a `::after` pseudo-element that expands from the click point. Use `pointer-events: none` on the ripple.

Simpler alternative: scale-down-then-up animation on tap (`active:scale-95 transition-transform`).

- [ ] **Step 4: Add streak fire gradient**

In StreakCard, apply the streak-fire gradient to the streak number:

```css
.streak-text {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #60a5fa, #8b5cf6, #3b82f6);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: streak-fire 1.5s linear infinite;
}
```

- [ ] **Step 5: Add glass effect to rest overlay**

Ensure RestOverlay uses `backdrop-blur-md bg-black/50` for the frosted glass look. Rest timer ring should use a muted grey color (`#4b5563`) to distinguish from exercise timer (blue).

- [ ] **Step 6: Review touch targets**

Audit all interactive elements. Ensure:
- All buttons are minimum 48px tall
- Primary CTAs (Start Timer, Set Complete, Start Workout) are 56px
- Skip/Exit buttons have enough padding
- Bottom nav items are 56px

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add visual polish — animations, transitions, ripple, streak fire, glass overlay"
```

---

## Task 11: PWA Icons + GitHub Actions Deploy

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `public/icon-192.png`, `public/icon-512.png` (generate proper icons)

- [ ] **Step 1: Generate PWA icons**

Create a simple but clean icon: dark blue circle (#0a0e17) with a blue dumbbell silhouette or a simple "W" in Outfit font. Generate at 192x192 and 512x512.

Use a canvas-based script or an online tool. The icons just need to be recognisable on a home screen.

- [ ] **Step 2: Create GitHub Actions deploy workflow**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Create GitHub repo and push**

```bash
cd "C:\Users\User\Documents\code\stretches-app"
gh repo create peshmann/stretches-app --private --source=. --push
```

- [ ] **Step 4: Enable GitHub Pages**

```bash
gh api repos/peshmann/stretches-app/pages -X POST -f build_type=workflow
```

Or manually: repo Settings → Pages → Source: GitHub Actions.

- [ ] **Step 5: Verify deployment**

Wait for the GitHub Actions workflow to complete:

```bash
gh run list --limit 1
gh run watch
```

Then visit `https://peshmann.github.io/stretches-app/` and verify:
- App loads with dark theme
- Can navigate between screens
- Install prompt appears (or "Add to Home Screen" option in browser menu)

- [ ] **Step 6: Test PWA install on phone**

Open the URL on your phone. Verify:
- "Add to Home Screen" / install banner appears
- App opens in standalone mode (no browser chrome)
- Offline: turn on airplane mode, app still works
- Timer sounds play
- Wake lock keeps screen on during workout

- [ ] **Step 7: Commit deploy workflow**

```bash
git add .github/
git commit -m "ci: add GitHub Actions workflow for GitHub Pages deployment"
git push
```

---

## Task 12: End-to-End Testing + Bug Fixes

**Files:**
- Modify: any files as needed for fixes

- [ ] **Step 1: Full Session A walkthrough**

Start Session A from Home. Progress through every exercise:
- Verify pre-workout exercises appear first (foam rolling, cat-cow, clamshells, neck flexors)
- Verify main workout transitions correctly (cardio timer, dead bug sets, face pulls, etc.)
- Verify cool-down stretches appear last
- Verify bilateral exercises auto-switch sides
- Verify rest timers auto-start with correct durations
- Verify safety warnings appear on goblet squat
- Complete and verify post-workout screen

- [ ] **Step 2: Full Session B walkthrough**

Same as above for Session B. Pay attention to:
- Side plank is timed + bilateral + multi-set (most complex exercise)
- Band pull-aparts have 45s rest (shorter than others)

- [ ] **Step 3: Full Daily Stretching walkthrough**

- No pre-workout or cool-down phases
- All exercises are timed
- Most are bilateral
- Should complete in ~12 minutes

- [ ] **Step 4: Test resume flow**

1. Start Session A
2. Complete 3 exercises
3. Tap Exit → confirm → go to Home
4. Home shows "Resume Session A (3/X done)"
5. Tap Resume → verify it starts at exercise 4
6. Tap "Start Fresh" instead → verify it starts from exercise 1

- [ ] **Step 5: Test streak calculation**

1. Complete a workout → streak should be 1
2. Manually edit localStorage to add a workout for yesterday → refresh → streak should be 2
3. Manually edit to add a gap day → refresh → streak should reset appropriately

- [ ] **Step 6: Test Log Activity (Saturday/Sunday)**

Change device date to Saturday (or test with overridden schedule logic). Verify "Log Activity" button appears and tapping it marks the day as active.

- [ ] **Step 7: Fix any discovered bugs**

Address any issues found in steps 1-6.

- [ ] **Step 8: Final commit and push**

```bash
git add -A
git commit -m "fix: end-to-end test fixes and polish"
git push
```

---

## Summary

| Task | Description | Depends On |
|------|-------------|------------|
| 1 | Project scaffolding | — |
| 2 | Data layer (types, workouts, storage, streak, schedule) | 1 |
| 3 | Core hooks (timer, audio, wake lock) | 1 |
| 4 | UI foundation (Button, Card, ProgressRing, ConfirmDialog, BottomNav) | 1 |
| 5 | Home screen | 2, 4 |
| 6 | Workout Library screen | 2, 4 |
| 7 | Active Workout engine | 2, 3, 4 |
| 8 | Post-Workout screen | 4, 5 (useProgress) |
| 9 | Progress screen | 2, 4, 5 |
| 10 | Visual polish + animations | 4, 5, 6, 7, 8, 9 |
| 11 | PWA icons + GitHub Actions deploy | all above |
| 12 | End-to-end testing + fixes | all above |

Tasks 2, 3, 4 can run in parallel after Task 1. Tasks 5, 6 can run in parallel. Task 7 is the critical path.
