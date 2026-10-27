import { cn } from "@/lib/utils";

/** ECTS bar (always blue, KONZEPT §12.2) with the target marker; the numbers stay visible below it (§12.4). */
export function EctsProgress({
  earned,
  total,
  target,
  label = "Erreichte ECTS",
  className,
}: {
  earned: number;
  total: number;
  target: number;
  label?: string;
  className?: string;
}) {
  const percent = (value: number) =>
    Math.min(100, Math.max(0, (value / total) * 100));
  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={earned}
        aria-valuetext={`${earned} von ${total} ECTS, Soll ${target}`}
        className="relative h-2 rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-tone-blue"
          style={{ width: `${percent(earned)}%` }}
        />
        <span
          aria-hidden="true"
          className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 bg-foreground"
          style={{ left: `${percent(target)}%` }}
        />
      </div>
      <p
        aria-hidden="true"
        className="flex justify-between gap-3 text-meta text-muted-foreground tabular-nums"
      >
        <span>
          Ist {earned} · Soll {target}
        </span>
        <span>{total} ECTS</span>
      </p>
    </div>
  );
}
