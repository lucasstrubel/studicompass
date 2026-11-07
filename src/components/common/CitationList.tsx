import { Fragment } from "react";
import type { Citation } from "@/domain/types";
import { compoundParts } from "@/lib/compound-breaks";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function Source({ citation }: { citation: Citation }) {
  return (
    <>
      {/* Break long compounds at their joints in narrow columns (P5-10). */}
      {compoundParts(citation.document).map((part, index) => (
        <Fragment key={index}>
          {index > 0 && <wbr />}
          {part}
        </Fragment>
      ))}
      {citation.section && `, ${citation.section}`}
      {citation.asOf && ` · Stand ${formatDate(new Date(citation.asOf))}`}
    </>
  );
}

function ExampleLabel({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "rounded bg-foreground/7 px-1.5 text-foreground",
        className,
      )}
    >
      Beispiel
    </span>
  );
}

/**
 * Sources (Quelle) of a statement; unverified rules carry the label "Beispiel". The variant "footer" is the
 * last line of a card or row, below its actions, and always visible (P5-09): plain small text, because the
 * statement above it is what matters. The default list stays inside explanations such as "Warum?".
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
          "mt-3 min-w-0 text-meta break-words text-muted-foreground",
          className,
        )}
      >
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
    );
  return (
    <ul aria-label="Quellen" className={cn("space-y-1", className)}>
      {unique.map((citation, index) => (
        <li
          key={`${citation.document}-${index}`}
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted-foreground"
        >
          <span>
            Quelle: <Source citation={citation} />
          </span>
          {!citation.verified && <ExampleLabel />}
        </li>
      ))}
    </ul>
  );
}
