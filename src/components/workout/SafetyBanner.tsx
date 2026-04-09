interface SafetyBannerProps {
  message: string;
}

export function SafetyBanner({ message }: SafetyBannerProps) {
  return (
    <div className="bg-warning/10 border border-warning/30 text-warning rounded-lg p-3 flex items-start gap-2">
      <span className="text-lg leading-none">&#9888;</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}
