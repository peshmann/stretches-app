import { Card } from '../ui/Card';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  weekCompleted: number;
  weekTotal: number;
}

export function StreakCard({ currentStreak, longestStreak, weekCompleted, weekTotal }: StreakCardProps) {
  return (
    <Card className="py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-2xl font-display font-bold animate-streak-fire"
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
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>Best: {longestStreak}</span>
          <span>{weekCompleted}/{weekTotal} this week</span>
        </div>
      </div>
    </Card>
  );
}
