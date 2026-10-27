import { OctagonAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Loading error of an area, with the time of the last successful update and a retry. */
export function ErrorState({
  title = "Konnte nicht geladen werden",
  message,
  updatedAt,
  onRetry,
  retryLabel = "Erneut laden",
  className,
}: {
  title?: string;
  message: string;
  updatedAt?: string | null;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border bg-status-critical-soft p-4 text-status-critical-foreground",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-card-title">
        <OctagonAlert className="size-4.5 shrink-0" aria-hidden="true" />
        {title}
      </p>
      <p className="text-meta">{message}</p>
      {updatedAt && (
        <p className="text-meta">
          Zuletzt aktualisiert: {formatDateTime(new Date(updatedAt))}
        </p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw aria-hidden="true" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
