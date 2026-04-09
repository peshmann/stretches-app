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

export function getTodayPrimaryWorkout(): Workout | null {
  const todays = getTodaysWorkouts();
  if (todays.length === 0) return null;
  return todays.find(w => w.type === 'gym') ?? todays[0];
}

export function isRestDay(): boolean {
  return getTodaysWorkouts().length === 0;
}

export function showLogActivity(): boolean {
  const day = getTodayDayName();
  return day === 'saturday' || day === 'sunday';
}

export function getWeekCompletion(workoutDates: string[]): { completed: number; total: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();
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
      weekDates.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      );
    }
  }

  return { completed: weekDates.size, total: 6 };
}
