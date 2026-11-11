import { Link } from "react-router";
import { ArrowRight, CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { CitationList } from "@/components/common/CitationList";
import { Countdown } from "@/components/common/Countdown";
import { OwnEntryBadge } from "@/components/common/OwnEntryBadge";
import { CHANNEL_LABELS } from "@/components/common/labels";
import type { Citation, PersonalDeadline } from "@/domain/types";
import { formatDate, formatDateTime } from "@/lib/format";
import { deadlineInstant } from "@/lib/zoned-time";
import { downloadDeadlines } from "@/lib/ics";
import type { CalendarItem } from "./calendar-model";

const TEXT_LINK =
  "inline-flex items-center gap-1 rounded-sm text-meta font-semibold text-accent-strong";

/** One row of a deadline list; identical sources and actions in the list and selected calendar day (P5-14). */
export function DeadlineItem({
  item,
  moduleTitle,
  moduleId,
  own,
  onEdit,
  onRemove,
}: {
  item: CalendarItem;
  moduleTitle?: string;
  moduleId?: string;
  own?: PersonalDeadline;
  onEdit: (entry: PersonalDeadline, button: HTMLElement) => void;
  onRemove: (entry: PersonalDeadline) => void;
}) {
  const citation: Citation = item.channel
    ? {
        // The title stands right above; the source only names where the date comes from.
        document: `${CHANNEL_LABELS[item.channel]} (Demodaten)`,
        summary: item.title,
        verified: false,
      }
    : {
        document: "Von dir eingetragen",
        summary: "Eigener Eintrag",
        verified: true,
      };
  return (
    <li className="min-w-0 p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
        <div className="min-w-0 flex-1 basis-64">
          <h3 className="text-card-title break-words">{item.title}</h3>
          <p className="flex flex-wrap items-center gap-x-2 text-meta text-muted-foreground tabular-nums">
            <span>
              {item.startsAt && `${formatDate(new Date(item.startsAt))} bis `}
              {item.dueAt.length === 10
                ? formatDate(new Date(item.dueAt))
                : formatDateTime(new Date(item.dueAt))}
              {` · ${item.type}`}
              {moduleTitle && ` · ${moduleTitle}`}
            </span>
            {item.channel ? (
              <ChannelBadge channel={item.channel} />
            ) : (
              <OwnEntryBadge />
            )}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <p className="text-body font-semibold tabular-nums">
            <Countdown until={deadlineInstant(item.dueAt)} />
          </p>
          {item.origin !== "exam" && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Zum Kalender hinzufügen"
              title="Zum Kalender hinzufügen"
              onClick={() => downloadDeadlines([item], `${item.id}.ics`)}
            >
              <CalendarPlus aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
      {(item.examId || moduleId || own) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          {item.examId && (
            <Link to={`/entscheidung/${item.examId}`} className={TEXT_LINK}>
              Folgen prüfen
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
          {!item.examId && moduleId && (
            <Link to={`/module/${moduleId}`} className={TEXT_LINK}>
              {item.origin === "coursework"
                ? "Prüfungsvorleistung im Modul"
                : "Zum Modul"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
          {own && (
            <span className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(event) => onEdit(own, event.currentTarget)}
              >
                <Pencil aria-hidden="true" />
                Bearbeiten
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`${own.title} löschen`}
                onClick={() => onRemove(own)}
              >
                <Trash2 aria-hidden="true" />
                Löschen
              </Button>
            </span>
          )}
        </div>
      )}
      <CitationList
        variant="footer"
        className="mt-1.5"
        citations={[citation]}
      />
    </li>
  );
}
