import type { UserProgress } from '../data/types';

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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

  const sorted = Array.from(dates).sort().reverse();
  const today = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));

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
