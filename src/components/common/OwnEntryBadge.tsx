import { PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

/** Marks a date or Prüfungsvorleistung Niklas entered himself; it has no Kanal (KONZEPT §12.4, P5-13). */
export function OwnEntryBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-meta text-muted-foreground",
        className,
      )}
    >
      <PenLine className="size-3.5" aria-hidden="true" />
      Eigener Eintrag
    </span>
  );
}
