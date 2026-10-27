import { CircleCheck, OctagonAlert, TriangleAlert } from "lucide-react";
import type { TrafficLight } from "@/domain/types";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "./labels";

const STATUS_STYLES: Record<
  TrafficLight,
  { Icon: typeof CircleCheck; className: string }
> = {
  onTrack: {
    Icon: CircleCheck,
    className: "bg-status-on-track-soft text-status-on-track-foreground",
  },
  tight: {
    Icon: TriangleAlert,
    className: "bg-status-tight-soft text-status-tight-foreground",
  },
  critical: {
    Icon: OctagonAlert,
    className: "bg-status-critical-soft text-status-critical-foreground",
  },
};

/** Traffic-light status as icon + text + colour (KONZEPT §12.4), never colour alone. */
export function StatusBadge({
  status,
  className,
}: {
  status: TrafficLight;
  className?: string;
}) {
  const { Icon, className: statusClassName } = STATUS_STYLES[status];
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-meta",
        statusClassName,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
