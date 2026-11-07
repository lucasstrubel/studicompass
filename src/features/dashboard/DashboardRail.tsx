import { useId } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { OwnEntryBadge } from "@/components/common/OwnEntryBadge";
import { deadlineInstant } from "@/lib/zoned-time";
import { CitationList } from "@/components/common/CitationList";
import { Countdown } from "@/components/common/Countdown";
import { EmptyState } from "@/components/common/EmptyState";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDateTime, formatGrade } from "@/lib/format";
import {
  selectImportantDecisions,
  selectInbox,
  selectNextDeadline,
  selectRecentGrades,
  selectRulesById,
} from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";
import { CHANNELS } from "@/services/types";
import { MilestoneCard } from "./MilestoneCard";
import { moduleToneStyle } from "./module-art";

/** Next deadline with countdown (US-05). Rendered in the rail on desktop and in the main column below. */
export function NextDeadline({ className }: { className?: string }) {
  // Rendered twice (main column below xl, rail from xl), so the heading id must be unique.
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={className}>
      <h2 id={headingId} className="mb-3 text-section-title">
        Nächste Frist
      </h2>
      <ResourceBoundary
        services={[...CHANNELS, "rules"]}
        skeleton={
          <Skeleton
            role="status"
            aria-label="Nächste Frist wird geladen"
            className="h-36"
          />
        }
      >
        {() => <NextDeadlineCard />}
      </ResourceBoundary>
    </section>
  );
}

function NextDeadlineCard() {
  const deadline = useDemoStore(selectNextDeadline);
  const rules = useDemoStore(selectRulesById);
  const decisions = useDemoStore(selectImportantDecisions);
  if (!deadline)
    return (
      <EmptyState
        title="Keine offenen Fristen"
        description="Neue Fristen aus POS, Moodle, Mail und Website erscheinen hier."
      />
    );
  // A date-only deadline runs until the end of its day and shows no time (P5-13 review).
  const dateOnly = deadline.dueAt.length === 10;
  const due = new Date(deadlineInstant(deadline.dueAt));
  // "Jetzt wichtig" already leads to the Folgen-Check of this exam.
  const raised = decisions.some(
    (decision) => decision.exam.id === deadline.examId,
  );
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="text-card-title">{deadline.title}</h3>
      <p className="mt-1 text-section-title tabular-nums">
        <Countdown until={deadlineInstant(deadline.dueAt)} />
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-meta text-muted-foreground tabular-nums">
        {dateOnly ? formatDate(due) : formatDateTime(due)}
        {deadline.channel ? (
          <ChannelBadge channel={deadline.channel} />
        ) : (
          <OwnEntryBadge />
        )}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {deadline.examId && !raised && (
          <Link
            to={`/entscheidung/${deadline.examId}`}
            className="inline-flex items-center gap-1 rounded-sm text-meta font-semibold text-accent-strong"
          >
            Folgen prüfen
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
        <Link
          to="/fristen"
          className="inline-flex items-center gap-1 rounded-sm text-meta font-semibold text-accent-strong"
        >
          Alle Fristen
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      {deadline.examId && rules["DR-5"] && (
        <CitationList variant="footer" citations={[rules["DR-5"].citation]} />
      )}
    </div>
  );
}

function InboxPreview() {
  const items = useDemoStore(selectInbox)
    .filter((item) => item.relevance === "high")
    .slice(0, 3);
  if (items.length === 0)
    return <EmptyState title="Nichts Neues im Postfach" />;
  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to={`/postfach?eintrag=${item.id}`}
            className="block px-4 py-3 transition-colors hover:bg-muted focus-visible:-outline-offset-2"
          >
            <span className="block text-body font-medium">{item.subject}</span>
            <span className="mt-0.5 flex items-center gap-2">
              <ChannelBadge channel={item.channel} />
              <span className="min-w-0 truncate text-meta text-muted-foreground">
                {item.sender}
              </span>
              {!item.read && (
                <span className="ml-auto flex items-center gap-1 text-meta text-accent-strong">
                  <span
                    className="size-2 rounded-full bg-accent-strong"
                    aria-hidden="true"
                  />
                  neu
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function RecentGrades() {
  const grades = useDemoStore(selectRecentGrades);
  if (grades.length === 0)
    return <EmptyState title="Noch keine bestandenen Prüfungen" />;
  return (
    <>
      <ul className="divide-y rounded-xl border bg-card">
        {grades.map(({ exam, module }) => (
          <li key={exam.id} className="flex items-center gap-3 px-4 py-3">
            <span className="min-w-0 flex-1 text-body font-medium">
              {module.title}
              {exam.date && (
                <span className="block text-meta font-normal text-muted-foreground">
                  {formatDate(new Date(exam.date))}
                </span>
              )}
            </span>
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--module-tone-soft) text-body font-semibold tabular-nums"
              style={moduleToneStyle(module.id)}
            >
              <span className="sr-only">Note </span>
              {formatGrade(exam.grade ?? 0)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex items-center gap-2 text-meta text-muted-foreground">
        Kanal: <ChannelBadge channel="pos" />
      </p>
    </>
  );
}

function RailSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-3 text-section-title">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Right column of the overview: deadline, milestone, inbox, grades. */
export function DashboardRail() {
  return (
    <div className="space-y-8">
      <NextDeadline className="hidden xl:block" />
      <section aria-labelledby="milestone">
        <ResourceBoundary
          services={["pos", "rules"]}
          skeleton={
            <Skeleton
              role="status"
              className="h-40"
              aria-label="Meilenstein wird geladen"
            />
          }
        >
          {() => <MilestoneCard />}
        </ResourceBoundary>
      </section>
      <RailSection id="inbox-title" title="Neu im Postfach">
        <ResourceBoundary
          services={[...CHANNELS]}
          skeleton={
            <Skeleton
              role="status"
              aria-label="Postfach wird geladen"
              className="h-48"
            />
          }
        >
          {() => <InboxPreview />}
        </ResourceBoundary>
      </RailSection>
      <RailSection id="grades-title" title="Letzte Noten">
        <ResourceBoundary
          services={["pos"]}
          skeleton={
            <Skeleton
              role="status"
              aria-label="Noten werden geladen"
              className="h-44"
            />
          }
        >
          {() => <RecentGrades />}
        </ResourceBoundary>
      </RailSection>
    </div>
  );
}
