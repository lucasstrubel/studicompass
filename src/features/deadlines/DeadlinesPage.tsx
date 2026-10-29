import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { ChannelStatus } from "@/components/common/ChannelStatus";
import { CHANNEL_LABELS } from "@/components/common/labels";
import { Countdown } from "@/components/common/Countdown";
import { CitationList } from "@/components/common/CitationList";
import { EmptyState } from "@/components/common/EmptyState";
import { useDemoStore } from "@/store/use-demo-store";
import { selectActionableDeadlines } from "@/store/selectors";
import { DEMO_NOW } from "@/config/demo";
import { formatDate, formatDateTime } from "@/lib/format";
import { downloadDeadlines } from "@/lib/ics";

import { deadlineInstant, groupDeadlines } from "./deadline-groups";
import { CHANNELS } from "@/services/types";

export function DeadlinesPage() {
  const deadlines = useDemoStore(selectActionableDeadlines);
  const pos = useDemoStore((state) => state.resources.pos.data);
  const resources = useDemoStore((state) => state.resources);
  const connected = useDemoStore((state) => state.connectedChannels);
  const loading = CHANNELS.some(
    (channel) =>
      connected[channel] &&
      (resources[channel].status === "loading" ||
        resources[channel].status === "idle"),
  );
  const incomplete = CHANNELS.some(
    (channel) => resources[channel].data === null,
  );
  const groups = groupDeadlines(deadlines, DEMO_NOW);
  const future = groups.flatMap((group) => group.items);
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
      <Button
        variant="outline"
        disabled={future.length === 0}
        onClick={() => downloadDeadlines(future)}
      >
        Alle Fristen zum Kalender hinzufügen
      </Button>
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
                      <ChannelBadge channel={deadline.channel} />
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
                          <Link to={`/module/${moduleId}`}>Zum Modul</Link>
                        </Button>
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
                      citations={[
                        {
                          document: `${CHANNEL_LABELS[deadline.channel]} – ${deadline.title} (Demodaten)`,
                          summary: deadline.title,
                          verified: false,
                        },
                      ]}
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
    </div>
  );
}
