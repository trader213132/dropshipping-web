interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

function scoreColor(score: number): string {
  if (score >= 75) return "#7c3aed"; // violet-700
  if (score >= 55) return "#f59e0b"; // amber-500
  return "#ef4444";                  // red-500
}

export function ScoreRing({ score, size = 72, strokeWidth = 6, label, className }: ScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);
  const color = scoreColor(score);

  return (
    <div className={`flex flex-col items-center gap-1 ${className ?? ""}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Score: ${score} out of 100`}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Fill */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-base font-bold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}
