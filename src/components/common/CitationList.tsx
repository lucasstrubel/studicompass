import { BookOpen } from "lucide-react";
import type { Citation } from "@/domain/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function Source({ citation }: { citation: Citation }) {
  return (
    <>
      {citation.document}
      {citation.section && `, ${citation.section}`}
      {citation.asOf && ` · Stand ${formatDate(new Date(citation.asOf))}`}
    </>
  );
}

function ExampleLabel({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full bg-muted px-2 py-0.5 text-foreground",
        className,
      )}
    >
      Beispiel
    </span>
  );
}

/**
 * Sources (Quelle, KONZEPT §14) of a statement; unverified rules carry the label "Beispiel". The variant
 * "footer" is the last line of a card, below its actions, in one compact line (KONZEPT §12.4, P5-09);
 * the default list stays inside explanations such as "Warum?".
 */
export function CitationList({
  citations,
  variant = "list",
  className,
}: {
  citations: Citation[];
  variant?: "list" | "footer";
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
  if (variant === "footer")
    return (
      <div
        className={cn(
          "mt-4 flex items-start gap-2 border-t pt-3 text-meta text-muted-foreground",
          className,
        )}
      >
        <BookOpen className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          {unique.length > 1 ? "Quellen: " : "Quelle: "}
          <ul aria-label="Quellen" className="inline">
            {unique.map((citation, index) => (
              <li key={`${citation.document}-${index}`} className="inline">
                {index > 0 && <span aria-hidden="true"> · </span>}
                <Source citation={citation} />
                {/* Break opportunity without a text space, so narrow columns wrap the label. */}
                {!citation.verified && (
                  <>
                    <wbr />
                    <ExampleLabel className="ml-1.5 inline-block" />
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  return (
    <ul aria-label="Quellen" className={cn("space-y-1.5", className)}>
      {unique.map((citation, index) => (
        <li
          key={`${citation.document}-${index}`}
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted-foreground"
        >
          <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
          <span>
            Quelle: <Source citation={citation} />
          </span>
          {!citation.verified && <ExampleLabel />}
        </li>
      ))}
    </ul>
  );
}
