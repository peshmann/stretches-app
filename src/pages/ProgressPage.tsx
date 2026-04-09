import { useProgress } from '../hooks/useProgress';
import { getWeekCompletion } from '../utils/schedule';
import { Card } from '../components/ui/Card';
import { StreakCard } from '../components/home/StreakCard';
import { Calendar } from '../components/progress/Calendar';
import { RecentWorkouts } from '../components/progress/RecentWorkouts';

function formatStartDate(iso: string): string {
  if (!iso) return 'Today';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export default function ProgressPage() {
  const { progress } = useProgress();
  const weekDates = progress.workouts.map(w => w.date);
  const { completed, total } = getWeekCompletion(weekDates);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold pt-6 pb-4">Progress</h1>

      {/* Streak */}
      <StreakCard
        currentStreak={progress.stats.currentStreak}
        longestStreak={progress.stats.longestStreak}
        weekCompleted={completed}
        weekTotal={total}
      />

      {/* Weekly summary */}
      <Card>
        <h2 className="font-display font-semibold mb-2">This Week</h2>
        <p className="text-text-muted text-sm mb-2">{completed}/{total} completed</p>
        <div className="bg-white/10 rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </Card>

      {/* Calendar */}
      <Calendar workouts={progress.workouts} />

      {/* Stats row */}
      <Card>
        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-display font-bold">{progress.stats.totalWorkouts}</p>
            <p className="text-xs text-text-muted">Total Workouts</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold">{formatStartDate(progress.stats.startDate)}</p>
            <p className="text-xs text-text-muted">Member Since</p>
          </div>
        </div>
      </Card>

      {/* Recent workouts */}
      <RecentWorkouts workouts={progress.workouts} />
    </div>
  );
}
