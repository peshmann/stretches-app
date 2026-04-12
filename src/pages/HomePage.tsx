import { useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useActiveSession } from '../hooks/useActiveSession';
import { getTodayPrimaryWorkout, showLogActivity, getWeekCompletion } from '../utils/schedule';
import { workouts } from '../data/workouts';
import { StreakCard } from '../components/home/StreakCard';
import { TodayCard } from '../components/home/TodayCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { progress, logActivity } = useProgress();
  const { session, startSession, endSession } = useActiveSession();

  const todayWorkout = getTodayPrimaryWorkout();
  const todayStr = toDateStr(new Date());

  const completedToday = todayWorkout
    ? progress.workouts.some(
        w => w.workoutId === todayWorkout.id && toDateStr(new Date(w.date)) === todayStr
      )
    : false;

  const weekCompletion = getWeekCompletion(progress.workouts.map(w => w.date));

  const handleStart = (workoutId: string) => {
    startSession(workoutId);
    navigate(`/workout/${workoutId}`);
  };

  const handleResume = () => {
    if (session) {
      navigate(`/workout/${session.workoutId}`, { state: { resume: true } });
    }
  };

  const handleLogActivity = () => {
    logActivity();
  };

  // Resolve the active session's workout for TodayCard
  const activeSessionWorkout = session
    ? workouts.find(w => w.id === session.workoutId) ?? null
    : null;

  // Use active session workout if it matches today's, otherwise show today's workout
  const todayCardWorkout = activeSessionWorkout && todayWorkout && activeSessionWorkout.id === todayWorkout.id
    ? todayWorkout
    : todayWorkout;

  const todayCardSession = session && todayWorkout && session.workoutId === todayWorkout.id
    ? session
    : null;

  return (
    <div className="pt-4 pb-4 flex flex-col gap-3">
      <h1 className="font-display text-2xl font-bold">Workout Tracker</h1>

      <StreakCard
        currentStreak={progress.stats.currentStreak}
        longestStreak={progress.stats.longestStreak}
        weekCompleted={weekCompletion.completed}
        weekTotal={weekCompletion.total}
      />

      <TodayCard
        workout={todayCardWorkout}
        activeSession={todayCardSession}
        completedToday={completedToday}
        onStart={handleStart}
        onResume={handleResume}
        onClear={endSession}
      />

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">All Workouts</h2>
        <div className="grid gap-3">
          {workouts.map(w => {
            const typeBadge = w.type === 'gym' ? 'Gym' : 'Stretch';
            const badgeColor = w.type === 'gym' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent';
            return (
              <Card
                key={w.id}
                className="cursor-pointer active:scale-[0.98] transition-transform"
              >
                <button
                  className="w-full text-left flex items-center justify-between"
                  onClick={() => navigate(`/workout/${w.id}`)}
                >
                  <div>
                    <h3 className="font-display font-semibold">{w.name}</h3>
                    <p className="text-text-muted text-sm">~{w.estimatedDuration} min</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${badgeColor}`}>
                    {typeBadge}
                  </span>
                </button>
              </Card>
            );
          })}
        </div>
      </div>

      {showLogActivity() && (
        <Button variant="ghost" size="md" onClick={handleLogActivity}>
          Log Activity
        </Button>
      )}
    </div>
  );
}
