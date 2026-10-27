import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS = { demo: "Demo", simulation: "Simulation" } as const;

/** Marks demo data or a simulated state, so nothing passes for a real system action. */
export function DemoBadge({
  variant = "demo",
  className,
}: {
  variant?: keyof typeof LABELS;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-status-info-soft px-2.5 py-1 text-meta text-status-info-foreground",
        className,
      )}
    >
      <FlaskConical className="size-3.5" aria-hidden="true" />
      {LABELS[variant]}
    </span>
  );
}
