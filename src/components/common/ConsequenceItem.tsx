import { useId, useState } from "react";
import { ChevronDown, Info, OctagonAlert, TriangleAlert } from "lucide-react";
import type { Citation, Consequence, Severity } from "@/domain/types";
import { cn } from "@/lib/utils";
import { CitationList } from "./CitationList";

const SEVERITIES: Record<
  Severity,
  { label: string; Icon: typeof Info; className: string }
> = {
  critical: {
    label: "Kritisch",
    Icon: OctagonAlert,
    className: "text-status-critical-foreground",
  },
  tight: {
    label: "Knapp",
    Icon: TriangleAlert,
    className: "text-status-tight-foreground",
  },
  info: {
    label: "Info",
    Icon: Info,
    className: "text-status-info-foreground",
  },
};

/** One consequence with severity (icon + text), title and a "Warum?" disclosure with its sources. */
export function ConsequenceItem({
  consequence,
  citations = [],
  className,
}: {
  consequence: Consequence;
  citations?: Citation[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const {
    label,
    Icon,
    className: severityClassName,
  } = SEVERITIES[consequence.severity];

  return (
    <div
      data-severity={consequence.severity}
      className={cn("flex gap-3 rounded-xl border bg-card p-3", className)}
    >
      <Icon
        className={cn("mt-0.5 size-4.5 shrink-0", severityClassName)}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold">
          <span className={cn("mr-1.5 text-meta", severityClassName)}>
            {label}:
          </span>
          {consequence.title}
        </p>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={() => setOpen((value) => !value)}
          className="mt-1 inline-flex items-center gap-1 rounded-sm text-meta text-accent-strong hover:underline"
        >
          Warum?
          <span className="sr-only"> – {consequence.title}</span>
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
        <div id={detailsId} hidden={!open} className="mt-2 space-y-2">
          <p className="text-body">{consequence.detail}</p>
          <CitationList citations={citations} />
        </div>
      </div>
    </div>
  );
}
