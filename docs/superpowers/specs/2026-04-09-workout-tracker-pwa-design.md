# Workout Tracker PWA — Design Spec

## Overview

A Progressive Web App that replaces static PDF workout guides with an interactive, guided workout experience. Built for a single user managing upper and lower crossed syndrome through 2x weekly gym sessions and daily stretching.

**Hosted on GitHub Pages** at `https://peshmann.github.io/stretches-app/`.

---

## Users & Context

- Single user, not technical
- 5'11", 77kg, diagnosed with upper and lower crossed syndrome
- Conditions: rounded shoulders, lower back pain, rhomboid pain, weak core, occasional knee pain
- Current routine: Session A (Mon/Tue), Session B (Thu/Fri), Daily Stretching (every day)
- Saturday: Badminton (logged but not guided)
- Primary use: at the gym, phone in hand or nearby, possibly wearing gloves

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | React 19 + TypeScript | Type safety for structured workout data |
| Build | Vite | Fast builds, native PWA plugin |
| Styling | Tailwind CSS v4 | Utility-first, dark mode built-in |
| PWA | vite-plugin-pwa | Handles service worker, precaching, manifest |
| Storage | LocalStorage | Simple, no backend needed |
| Audio | HTML5 Audio API | Timer completion sounds |
| Routing | React Router v7 | Client-side navigation between screens |
| Fonts | Outfit (display) + DM Sans (body) | Proven pairing from Smash Club |
| Hosting | GitHub Pages | Free HTTPS, auto-deploy via GitHub Actions |

No backend. No accounts. No cloud sync. Workout data is static JSON bundled at build time. User progress lives in LocalStorage.

---

## Design System

### Color Palette (Dark Mode Only)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0a0e17` | Page background |
| `--surface` | `#111827` | Card backgrounds |
| `--surface-raised` | `#1f2937` | Elevated cards, modals |
| `--primary` | `#3b82f6` (blue-500) | CTAs, active states, timers |
| `--primary-glow` | `#60a5fa` (blue-400) | Glows, highlights, hover states |
| `--accent` | `#8b5cf6` (purple) | Streak badges, achievements |
| `--success` | `#22c55e` | Completed exercises, checkmarks |
| `--warning` | `#f97316` | Safety warnings |
| `--danger` | `#ef4444` | Pain indicators, stop actions |
| `--text` | `#e8ecf4` | Primary text |
| `--text-muted` | `#9ca3af` | Secondary text, labels |

### Typography

- **Display**: Outfit, 600-800 weight (headings, timer numbers)
- **Body**: DM Sans, 400-600 weight (descriptions, tips, labels)
- Timer numbers: Outfit 700, 48-64px (readable from arm's length)

### Touch Targets

- Minimum 48px height for all interactive elements
- Primary action buttons: 56px+ height, full width
- Spacing between targets: minimum 8px gap
- Bottom nav items: 56px min-height

### Animations (from Smash Club)

- `fadeInUp`: Card/list entrance (400ms, spring easing)
- `stagger-children`: Sequential delays for lists
- `ripple`: Material-style tap feedback on buttons/cards
- `wizardSlideIn` / `wizardSlideInReverse`: Direction-aware exercise transitions
- `streak-fire`: Animated gradient for streak counter (blue/purple instead of orange/lime)
- `skeleton-shimmer`: Loading placeholders with blue gradient sweep
- `border-breathe`: Pulsing border on featured elements
- All animations respect `prefers-reduced-motion: reduce`

---

## Screens

### 1. Home Screen

**Purpose**: At-a-glance status + one-tap workout start.

**Layout**:
- Top: App title + settings icon
- Streak card: Current streak with fire animation, weekly progress (e.g. "4/6 this week")
- Today's workout card: Large, prominent, shows workout name + estimated duration + "Start" button
- Quick access: 3 smaller cards for Session A, Session B, Daily Stretching
- "Log Activity" button: for non-guided days (e.g. badminton Saturday) — marks the day as active for streak purposes
- Bottom nav: Home (active) | Library | Progress

**Behaviour**:
- Today's workout determined by day of week (Mon/Tue = Session A, etc.)
- If today's workout is already completed, card shows checkmark and "Completed" state
- Sunday shows "Rest Day" or offers Daily Stretching

### 2. Workout Library Screen

**Purpose**: Browse and preview all workouts before starting.

**Layout**:
- 3 workout cards (Session A, Session B, Daily Stretching)
- Each card shows: name, type badge (Gym/Stretch), exercise count, estimated duration, safety warnings count
- Tapping a card expands to show full exercise list grouped by phase (Pre-workout / Main / Cool-down)
- Each exercise row: name, type icon (timer/reps), duration/sets info
- "Start Workout" button at bottom of expanded view
- Video link button on each exercise for form preview

### 3. Active Workout Screen

**Purpose**: The core experience. Guides user through every exercise, set, and rest period.

**Layout** (full-screen focus):
- Top bar: Exit button (left), workout name (center), progress indicator "3/12" (right)
- Progress bar: thin line showing position in overall workout
- Phase label: "Pre-Workout" / "Main Workout" / "Cool-Down"
- Exercise name: large, prominent
- Exercise description + tips: scrollable area below name
- Safety warning: orange banner if exercise has one (e.g. "Don't go below parallel")
- Video link button
- Timer/action area (bottom half — see Timer System below)
- Navigation: "Skip Exercise" (subtle) at very bottom

**Exercise flow varies by type:**

#### Timed Exercise (no sides)
Example: Plank — 3 sets x 30s, 60s rest

```
[Set 1 of 3]
[====== 00:30 ======]  ← circular countdown, large numbers
[Start Timer]          ← big blue button

After timer completes → beep → auto-start 60s rest timer
After rest completes → chime → show "Set 2 of 3" + [Start Timer]
After final set → slide to next exercise
```

#### Timed Exercise (bilateral)
Example: Hip Flexor Stretch — 60s per side

```
[Left Side]
[====== 00:60 ======]
[Start Timer]

After left timer completes → "switch" chime →
3-second transition: "Switch to Right Side" →
Auto-start right side timer →

After right completes → beep → next exercise (or rest if sets > 1)
```

#### Rep-based Exercise (no sides)
Example: Cable Face Pulls — 4 sets x 15 reps, 60s rest

```
[Set 1 of 4]
15 reps
[Set Complete ✓]      ← big blue button

After tap → auto-start 60s rest timer
[Skip Rest →]
After rest → "Set 2 of 4" + [Set Complete ✓]
After final set → slide to next exercise
```

#### Rep-based Exercise (bilateral)
Example: Dead Bug — 3 sets x 10 reps each side, 60s rest

```
[Set 1 of 3]
10 reps each side
[Set Complete ✓]

(No automatic side switching for rep exercises — user manages sides within the set)
Rest timer after each set as normal.
```

**Design note on bilateral reps**: For exercises like Dead Bug where you alternate arms/legs within a set, we don't split into explicit left/right phases. The rep count is "10 each side" and the user manages alternation naturally. Bilateral auto-switching only applies to **timed** exercises where you hold a position on one side.

### 4. Post-Workout Screen

**Purpose**: Log feeling, celebrate completion.

**Layout**:
- Confetti animation on entry
- "Workout Complete!" heading
- Duration: how long the workout took
- Exercises completed vs skipped count
- Feeling selector: 5 large buttons (Great / Good / OK / Struggled / Pain)
- Optional text note field
- "Done" button → returns to Home with updated streak

### 5. Progress Screen

**Purpose**: Track consistency and trends.

**Layout**:
- Streak card: current streak (with fire animation), longest streak
- Weekly summary: completion rate for current week
- Calendar view: current month, each day colour-coded:
  - Blue dot: gym workout completed
  - Purple dot: stretching completed
  - Both: blue + purple
  - Empty: no workout
  - Grey: future days
- Recent workouts list: date, workout name, feeling rating, notes preview
- Total workouts counter (all-time)

---

## Timer System

### Visual Design
- Large circular progress ring (Smash Club progress ring pattern)
- Time displayed in center: Outfit 700, 48px minimum
- Ring colour: blue (exercise), muted grey (rest)
- Ring animates smoothly as time decreases

### Audio Alerts (3 distinct sounds)
1. **Exercise complete**: Sharp double-beep (marks end of timed exercise or rest)
2. **Switch sides**: Gentle single tone (reposition for bilateral)
3. **Rest over**: Upbeat ascending chime (get ready)

Sounds are short synthesised tones via Web Audio API (no audio files to cache). Works even if phone is in pocket.

### Rest Timer
- Auto-starts immediately after completing a set
- Displays as a smaller timer with frosted glass overlay (glass-overlay pattern from Smash Club)
- "Skip Rest" button always visible and large
- Different background treatment to distinguish from exercise timer

### Wake Lock
- Screen stays awake during active workout via Wake Lock API
- Released when workout is paused or completed

---

## Data Architecture

### Static Data (bundled at build time)
The workout data from `workout_data.json` is imported directly. Three workouts, each with pre-workout, main, and cool-down phases.

### LocalStorage Schema

**Key: `workout-tracker-progress`**
```typescript
interface UserProgress {
  workouts: CompletedWorkout[];
  stats: {
    totalWorkouts: number;
    currentStreak: number;
    longestStreak: number;
    startDate: string; // ISO date
  };
  settings: {
    preferredTimes: {
      gym: string;      // "18:00"
      stretch: string;  // "07:00"
    };
  };
}

interface CompletedWorkout {
  workoutId: string;       // "session-a" | "session-b" | "daily-stretch"
  date: string;            // ISO datetime
  durationSeconds: number;
  exercisesCompleted: number;
  exercisesSkipped: number;
  skippedExerciseIds: string[];
  feeling: "great" | "good" | "ok" | "struggled" | "pain";
  notes?: string;
}
```

### Streak Calculation
- A "streak day" = any day with at least one completed workout
- Streak resets if a full calendar day passes with no workout
- Streak is recalculated on each workout completion and on app open
- Badminton Saturday: user can manually log it via a "Log Activity" button on the home screen (no guided mode, just marks the day as active for streak purposes)

---

## PWA Configuration

### Manifest
- Name: "Workout Tracker"
- Short name: "Workouts"
- Theme colour: `#0a0e17`
- Background colour: `#0a0e17`
- Display: `standalone`
- Orientation: `portrait`
- Icons: generated at 192x192 and 512x512

### Service Worker (via vite-plugin-pwa)
- Precache all app assets on first load
- Runtime cache for Google Fonts (Outfit + DM Sans)
- Offline-first: serve from cache, no network needed after install
- Update prompt: when new version detected, show "Update available" banner

### GitHub Pages Deploy
- GitHub Actions workflow: on push to `main`, build and deploy to `gh-pages` branch
- Vite `base` config set to `/stretches-app/`

---

## Phase 1 Scope (This Build)

**Included:**
- Home screen with today's workout + streak + weekly progress
- Workout library with exercise preview
- Full guided workout mode with timers, bilateral auto-switching, rest timers
- Post-workout feeling rating + optional notes
- Progress screen with calendar, streak, recent workouts
- All animations and design system
- PWA: installable, offline, service worker
- GitHub Pages deployment
- Audio alerts for timers
- Safety warnings on relevant exercises
- Wake Lock during workouts
- Manual "Log Activity" for non-guided days (badminton)

**Deferred to Phase 2+:**
- Push notification reminders
- Workout scheduling / preferred times
- Pain level tracking (0-10 per body area)
- Weight/rep logging per exercise
- Exercise-level completion tracking (which specific exercises skipped)
- Export to CSV

---

## Safety Requirements

These are non-negotiable:

1. Pre-workout exercises are **mandatory** — no "Skip to Main Workout" option. User must progress through each pre-workout exercise (they can skip individual exercises but must see each one).
2. Safety warnings display as **orange banners** on exercises that have them (goblet squat depth restriction, etc.)
3. The `userProfile.restrictions` from workout data are shown on a "Your Restrictions" section in the Library view.
4. Exercises marked `priority: "high"` or `priority: "critical"` get a subtle blue/purple badge to signal importance.

---

## Out of Scope

- Multi-user support
- Cloud sync / accounts
- Backend / API
- Exercise video embedding (links only)
- Custom workout creation
- Progressive overload tracking
- Integration with health platforms
