import { Card } from '../ui/Card';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  weekCompleted: number;
  weekTotal: number;
}

export function StreakCard({ currentStreak, longestStreak, weekCompleted, weekTotal }: StreakCardProps) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-1 py-2">
        <span
          className="text-6xl font-display font-bold animate-streak-fire"
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #60a5fa, #8b5cf6, #3b82f6)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {currentStreak}
        </span>
        <span className="text-text-muted text-sm">day streak</span>
        <span className="text-text-muted text-xs mt-1">Best: {longestStreak} days</span>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-text-muted text-xs">{weekCompleted}/{weekTotal} this week</span>
          <div className="flex gap-1.5">
            {Array.from({ length: weekTotal }, (_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < weekCompleted ? 'bg-primary' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
