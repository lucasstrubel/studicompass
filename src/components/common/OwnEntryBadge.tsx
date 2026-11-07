import { PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

/** Marks a date or Prüfungsvorleistung the student entered; it has no Kanal (P5-13). Quiet metadata, not a chip. */
export function OwnEntryBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 text-meta text-muted-foreground",
        className,
      )}
    >
      <PenLine className="size-3.5" aria-hidden="true" />
      Eigener Eintrag
    </span>
  );
}
