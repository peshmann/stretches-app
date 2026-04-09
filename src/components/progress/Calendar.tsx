import { useState } from 'react';
import { Card } from '../ui/Card';
import type { CompletedWorkout } from '../../data/types';

interface CalendarProps {
  workouts: CompletedWorkout[];
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function Calendar({ workouts }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Monday=0 ... Sunday=6
  const firstDayRaw = new Date(year, month, 1).getDay();
  const startOffset = firstDayRaw === 0 ? 6 : firstDayRaw - 1;

  // Build a lookup: "YYYY-MM-DD" -> { gym: boolean, stretch: boolean }
  const workoutMap = new Map<string, { gym: boolean; stretch: boolean }>();
  for (const w of workouts) {
    const d = new Date(w.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const entry = workoutMap.get(key) ?? { gym: false, stretch: false };
    if (w.workoutId === 'session-a' || w.workoutId === 'session-b') {
      entry.gym = true;
    } else if (w.workoutId === 'daily-stretch') {
      entry.stretch = true;
    }
    workoutMap.set(key, entry);
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 text-text-muted hover:text-text transition-colors"
          aria-label="Previous month"
        >
          &lt;
        </button>
        <span className="font-display font-semibold">{getMonthLabel(currentMonth)}</span>
        <button
          onClick={nextMonth}
          className="p-2 text-text-muted hover:text-text transition-colors"
          aria-label="Next month"
        >
          &gt;
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs text-text-muted font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }

          const cellDate = new Date(year, month, day);
          cellDate.setHours(0, 0, 0, 0);
          const isToday = isSameDay(cellDate, today);
          const isFuture = cellDate > today;
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const entry = workoutMap.get(key);

          return (
            <div
              key={key}
              className={`flex flex-col items-center py-1.5 rounded-lg text-sm
                ${isToday ? 'ring-1 ring-primary' : ''}
                ${isFuture ? 'text-text-muted/30' : ''}`}
            >
              <span>{day}</span>
              {!isFuture && entry && (
                <div className="flex gap-0.5 mt-0.5">
                  {entry.gym && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  {entry.stretch && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
