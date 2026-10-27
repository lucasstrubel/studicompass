import { BookOpen } from "lucide-react";
import type { Citation } from "@/domain/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Sources (Quelle, KONZEPT §14) of a statement; unverified rules carry the label "Beispiel". */
export function CitationList({
  citations,
  className,
}: {
  citations: Citation[];
  className?: string;
}) {
  // Several rules often cite the same document; each source is listed once.
  const unique = citations.filter(
    (citation, index) =>
      citations.findIndex(
        (other) =>
          other.document === citation.document &&
          other.section === citation.section,
      ) === index,
  );
  if (unique.length === 0) return null;
  return (
    <ul aria-label="Quellen" className={cn("space-y-1.5", className)}>
      {unique.map((citation, index) => (
        <li
          key={`${citation.document}-${index}`}
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted-foreground"
        >
          <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
          <span>
            Quelle: {citation.document}
            {citation.section && `, ${citation.section}`}
            {citation.asOf && ` · Stand ${formatDate(new Date(citation.asOf))}`}
          </span>
          {!citation.verified && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">
              Beispiel
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
