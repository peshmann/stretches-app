import { ProgressRing } from '../ui/ProgressRing';
import { Button } from '../ui/Button';

interface RestOverlayProps {
  secondsLeft: number;
  progress: number;
  onSkip: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}`;
}

export function RestOverlay({ secondsLeft, progress, onSkip }: RestOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
      <span className="font-display text-xl text-text-muted">Rest</span>
      <ProgressRing progress={progress} size={200} strokeWidth={8} color="stroke-white/40" trackColor="stroke-white/10">
        <span className="font-display text-4xl font-bold tabular-nums">{formatTime(secondsLeft)}</span>
      </ProgressRing>
      <Button variant="ghost" size="lg" onClick={onSkip} className="max-w-[200px]">
        Skip Rest
      </Button>
    </div>
  );
}
