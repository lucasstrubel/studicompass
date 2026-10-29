import { useRef, useState } from "react";
import { Link } from "react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { ChannelStatus } from "@/components/common/ChannelStatus";
import { CHANNEL_LABELS } from "@/components/common/labels";
import { Countdown } from "@/components/common/Countdown";
import { CitationList } from "@/components/common/CitationList";
import { EmptyState } from "@/components/common/EmptyState";
import { OwnEntryBadge } from "@/components/common/OwnEntryBadge";
import { useDemoStore } from "@/store/use-demo-store";
import { selectAgenda } from "@/store/selectors";
import { DEMO_NOW } from "@/config/demo";
import type { AgendaItem, Citation, PersonalDeadline } from "@/domain/types";
import { formatDate, formatDateTime } from "@/lib/format";
import { downloadDeadlines } from "@/lib/ics";
import { DeadlineDialog } from "./DeadlineDialog";
import { deadlineInstant, groupDeadlines } from "./deadline-groups";
import { CHANNELS } from "@/services/types";

/** Source of an own entry: Niklas himself, so no "Beispiel" label (KONZEPT §12.4). */
const OWN_SOURCE: Citation = {
  document: "Von dir eingetragen",
  summary: "Eigener Eintrag",
  verified: true,
};

function source(item: AgendaItem): Citation {
  return item.channel
    ? {
        document: `${CHANNEL_LABELS[item.channel]} – ${item.title} (Demodaten)`,
        summary: item.title,
        verified: false,
      }
    : OWN_SOURCE;
}

/**
 * Fristen (KONZEPT §8 S7): channel deadlines, own dates and Prüfungsvorleistungen with a due date, grouped
 * relative to DEMO_NOW (P5-13, US-21). Own dates can be added, edited and deleted here.
 */
export function DeadlinesPage() {
  const agenda = useDemoStore(selectAgenda);
  const pos = useDemoStore((state) => state.resources.pos.data);
  const resources = useDemoStore((state) => state.resources);
  const connected = useDemoStore((state) => state.connectedChannels);
  const personal = useDemoStore((state) => state.personalDeadlines);
  const savePersonalDeadline = useDemoStore(
    (state) => state.savePersonalDeadline,
  );
  const removePersonalDeadline = useDemoStore(
    (state) => state.removePersonalDeadline,
  );
  // null: closed; "new": add; otherwise the own entry being edited.
  const [dialog, setDialog] = useState<PersonalDeadline | "new" | null>(null);
  // The button that opened the dialog, to return the keyboard focus there.
  const opener = useRef<HTMLElement | null>(null);
  const openDialog = (
    target: PersonalDeadline | "new",
    button: HTMLElement,
  ) => {
    opener.current = button;
    setDialog(target);
  };
  const loading = CHANNELS.some(
    (channel) =>
      connected[channel] &&
      (resources[channel].status === "loading" ||
        resources[channel].status === "idle"),
  );
  const incomplete = CHANNELS.some(
    (channel) => resources[channel].data === null,
  );
  const groups = groupDeadlines(agenda, DEMO_NOW);
  const future = groups.flatMap((group) => group.items);

  const remove = (entry: PersonalDeadline) => {
    removePersonalDeadline(entry.id);
    toast(`Termin gelöscht: ${entry.title}`, {
      action: {
        label: "Rückgängig",
        onClick: () => savePersonalDeadline(entry),
      },
    });
  };

  return (
    <div className="space-y-5">
      <ChannelStatus />
      {loading && (
        <Skeleton
          role="status"
          aria-label="Fristen werden geladen"
          className="h-24"
        />
      )}
      {!loading && incomplete && (
        <p role="status" className="text-body text-muted-foreground">
          Die Fristen sind unvollständig. Prüfe den Sync-Status und verbinde
          getrennte Kanäle in den Einstellungen erneut.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button onClick={(event) => openDialog("new", event.currentTarget)}>
          <Plus aria-hidden="true" />
          Termin hinzufügen
        </Button>
        <Button
          variant="outline"
          disabled={future.length === 0}
          onClick={() => downloadDeadlines(future)}
        >
          Alle Fristen zum Kalender hinzufügen
        </Button>
      </div>
      {groups.map((group) => (
        <section key={group.title} aria-label={group.title}>
          <h2 className="mb-3 text-section-title">{group.title}</h2>
          {group.items.length === 0 ? (
            loading || incomplete ? null : (
              <p className="text-body text-muted-foreground">
                Keine Fristen in diesem Zeitraum.
              </p>
            )
          ) : (
            <ul className="space-y-3">
              {group.items.map((deadline) => {
                const moduleId =
                  deadline.moduleId ??
                  pos?.exams.find((exam) => exam.id === deadline.examId)
                    ?.moduleId;
                const module = pos?.modules.find(
                  (module) => module.id === moduleId,
                );
                const own =
                  deadline.origin === "personal"
                    ? personal.find((entry) => entry.id === deadline.sourceId)
                    : undefined;
                return (
                  <li
                    key={deadline.id}
                    className="space-y-3 rounded-xl border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-card-title">{deadline.title}</h3>
                        <p className="text-body tabular-nums">
                          {deadline.startsAt &&
                            `${formatDate(new Date(deadline.startsAt))} bis `}
                          {deadline.dueAt.length === 10
                            ? formatDate(new Date(deadline.dueAt))
                            : formatDateTime(new Date(deadline.dueAt))}
                        </p>
                        <p className="text-meta">
                          <Countdown until={deadlineInstant(deadline.dueAt)} />{" "}
                          · {deadline.type}
                          {module && ` · ${module.title}`}
                        </p>
                      </div>
                      {deadline.channel ? (
                        <ChannelBadge channel={deadline.channel} />
                      ) : (
                        <OwnEntryBadge />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {deadline.examId && (
                        <Button variant="outline" asChild>
                          <Link to={`/entscheidung/${deadline.examId}`}>
                            Folgen prüfen
                          </Link>
                        </Button>
                      )}
                      {!deadline.examId && moduleId && (
                        <Button variant="outline" asChild>
                          <Link to={`/module/${moduleId}`}>
                            {deadline.origin === "coursework"
                              ? "Prüfungsvorleistung im Modul"
                              : "Zum Modul"}
                          </Link>
                        </Button>
                      )}
                      {own && (
                        <>
                          <Button
                            variant="outline"
                            onClick={(event) =>
                              openDialog(own, event.currentTarget)
                            }
                          >
                            <Pencil aria-hidden="true" />
                            Bearbeiten
                          </Button>
                          <Button
                            variant="outline"
                            aria-label={`${own.title} löschen`}
                            onClick={() => remove(own)}
                          >
                            <Trash2 aria-hidden="true" />
                            Löschen
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        onClick={() =>
                          downloadDeadlines([deadline], `${deadline.id}.ics`)
                        }
                      >
                        Zum Kalender hinzufügen
                      </Button>
                    </div>
                    <CitationList
                      variant="footer"
                      className="mt-0"
                      citations={[source(deadline)]}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
      {future.length === 0 && !loading && !incomplete && (
        <EmptyState title="Keine anstehenden Fristen" />
      )}
      {dialog && (
        <DeadlineDialog
          key={dialog === "new" ? "new" : dialog.id}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          entry={dialog === "new" ? undefined : dialog}
          onSaved={(title) => toast(`Termin gespeichert: ${title}`)}
          returnFocus={() => opener.current}
        />
      )}
    </div>
  );
}
