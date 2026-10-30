import { Link } from "react-router";
import { Pencil, Trash2 } from "lucide-react";
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

/** Identical sources and actions in the list and selected calendar day (P5-14). */
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
        document: `${CHANNEL_LABELS[item.channel]} – ${item.title} (Demodaten)`,
        summary: item.title,
        verified: false,
      }
    : {
        document: "Von dir eingetragen",
        summary: "Eigener Eintrag",
        verified: true,
      };
  return (
    <li className="min-w-0 space-y-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-card-title break-words">{item.title}</h3>
          <p className="text-body tabular-nums">
            {item.startsAt && `${formatDate(new Date(item.startsAt))} bis `}
            {item.dueAt.length === 10
              ? formatDate(new Date(item.dueAt))
              : formatDateTime(new Date(item.dueAt))}
          </p>
          <p className="text-meta">
            <Countdown until={deadlineInstant(item.dueAt)} /> · {item.type}
            {moduleTitle && ` · ${moduleTitle}`}
          </p>
        </div>
        {item.channel ? (
          <ChannelBadge channel={item.channel} />
        ) : (
          <OwnEntryBadge />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {item.examId && (
          <Button variant="outline" asChild>
            <Link to={`/entscheidung/${item.examId}`}>Folgen prüfen</Link>
          </Button>
        )}
        {!item.examId && moduleId && (
          <Button variant="outline" asChild>
            <Link to={`/module/${moduleId}`}>
              {item.origin === "coursework"
                ? "Prüfungsvorleistung im Modul"
                : "Zum Modul"}
            </Link>
          </Button>
        )}
        {own && (
          <>
            <Button
              variant="outline"
              onClick={(event) => onEdit(own, event.currentTarget)}
            >
              <Pencil aria-hidden="true" />
              Bearbeiten
            </Button>
            <Button
              variant="outline"
              aria-label={`${own.title} löschen`}
              onClick={() => onRemove(own)}
            >
              <Trash2 aria-hidden="true" />
              Löschen
            </Button>
          </>
        )}
        {item.origin !== "exam" && (
          <Button
            variant="outline"
            onClick={() => downloadDeadlines([item], `${item.id}.ics`)}
          >
            Zum Kalender hinzufügen
          </Button>
        )}
      </div>
      <CitationList variant="footer" className="mt-0" citations={[citation]} />
    </li>
  );
}
