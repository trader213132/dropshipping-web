import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  invert?: boolean;
  className?: string;
}

function barColor(score: number, invert: boolean): string {
  const effective = invert ? 100 - score : score;
  if (effective >= 75) return "bg-violet-600";
  if (effective >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export function ScoreBar({ label, score, invert = false, className }: ScoreBarProps) {
  const effective = invert ? 100 - score : score;
  const colorClass = barColor(score, invert);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-medium tabular-nums text-slate-900 dark:text-white">
          {score}
          {invert && <span className="ml-1 text-slate-400 dark:text-slate-500">(lower is better)</span>}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${effective}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
