import { DEMO_NOW } from "@/config/demo";
import { formatCountdown, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Remaining time until `until`, measured from DEMO_NOW (e.g. "noch 1 Tag, 4 Std."). */
export function Countdown({
  until,
  className,
}: {
  until: string;
  className?: string;
}) {
  const date = new Date(until);
  return (
    <time
      dateTime={until}
      title={formatDateTime(date)}
      className={cn("tabular-nums", className)}
    >
      {formatCountdown(date, DEMO_NOW)}
    </time>
  );
}
