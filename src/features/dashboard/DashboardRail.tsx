import { useId, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  MessageCircleQuestionMark,
  Send,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { CitationList } from "@/components/common/CitationList";
import { Countdown } from "@/components/common/Countdown";
import { EmptyState } from "@/components/common/EmptyState";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_NOW } from "@/config/demo";
import {
  formatDate,
  formatDateTime,
  formatGrade,
  formatRelativeDay,
} from "@/lib/format";
import {
  selectInbox,
  selectNextDeadline,
  selectRecentGrades,
  selectRulesById,
} from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";

const SUGGESTED_QUESTIONS = ["A-01", "A-03"];
const CHANNELS = ["pos", "moodle", "mail", "website"] as const;

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Next deadline with countdown (US-05). Rendered in the rail on desktop and in the main column below. */
export function NextDeadline({ className }: { className?: string }) {
  // Rendered twice (main column below xl, rail from xl), so the heading id must be unique.
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={className}>
      <h2
        id={headingId}
        className="mb-3 flex items-center gap-2 text-card-title"
      >
        <CalendarClock className="size-4" aria-hidden="true" />
        Nächste Frist
      </h2>
      <ResourceBoundary
        services={[...CHANNELS, "rules"]}
        skeleton={
          <Skeleton
            role="status"
            aria-label="Nächste Frist wird geladen"
            className="h-36 bg-card"
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
  if (!deadline)
    return (
      <EmptyState
        title="Keine offenen Fristen"
        description="Neue Fristen aus POS, Moodle, Mail und Website erscheinen hier."
      />
    );
  const due = new Date(deadline.dueAt);
  return (
    <Card size="sm">
      <CardContent>
        <p className="mb-2 text-meta text-accent-strong">
          {capitalize(formatRelativeDay(due, DEMO_NOW))}
        </p>
        <h3 className="text-card-title">{deadline.title}</h3>
        <p className="mt-2 text-body">
          <Countdown until={deadline.dueAt} className="font-semibold" />
        </p>
        <p className="mt-1 text-meta text-muted-foreground tabular-nums">
          {formatDateTime(due)}
        </p>
        <ChannelBadge channel={deadline.channel} className="mt-3" />
        {deadline.examId && rules["DR-5"] && (
          <CitationList className="mt-3" citations={[rules["DR-5"].citation]} />
        )}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {deadline.examId && (
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
      </CardContent>
    </Card>
  );
}

function InboxPreview() {
  const items = useDemoStore(selectInbox)
    .filter((item) => item.relevance === "high")
    .slice(0, 3);
  if (items.length === 0)
    return <EmptyState title="Nichts Neues im Postfach" />;
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to={`/postfach?eintrag=${item.id}`}
            className="block rounded-xl border bg-card p-3 hover:bg-muted"
          >
            <span className="flex items-center gap-2">
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
            <span className="mt-1 block text-body font-semibold">
              {item.subject}
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
      <ul className="space-y-2">
        {grades.map(({ exam, module }) => (
          <li
            key={exam.id}
            className="flex items-center gap-3 rounded-xl border bg-card p-3"
          >
            <span className="flex-1 text-meta">
              {module.title}
              {exam.date && (
                <span className="block text-muted-foreground">
                  {formatDate(new Date(exam.date))}
                </span>
              )}
            </span>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-card-title tabular-nums">
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

function AssistantTeaser() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");

  return (
    <>
      <p className="mt-2 text-meta text-muted-foreground">
        Fragen zur Prüfungsordnung? Antworten mit Quelle.
      </p>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const text = question.trim();
          if (text)
            void navigate(`/assistent?frage=${encodeURIComponent(text)}`);
        }}
      >
        <label htmlFor="assistant-question" className="sr-only">
          Frage an den Assistenten
        </label>
        <input
          id="assistant-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Deine Frage …"
          className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-card px-3 text-body placeholder:text-muted-foreground"
        />
        <Button type="submit" size="icon" aria-label="Frage stellen">
          <Send aria-hidden="true" />
        </Button>
      </form>
      <div className="mt-3">
        <ResourceBoundary
          services={["assistant"]}
          skeleton={
            <Skeleton
              role="status"
              aria-label="Vorschlagsfragen werden geladen"
              className="h-28 bg-card"
            />
          }
        >
          {() => <SuggestedQuestions />}
        </ResourceBoundary>
      </div>
    </>
  );
}

function SuggestedQuestions() {
  const catalog = useDemoStore(
    (state) => state.resources.assistant.data?.catalog,
  );
  const suggestions = SUGGESTED_QUESTIONS.flatMap(
    (id) => catalog?.find((entry) => entry.id === id) ?? [],
  );
  return (
    <ul className="space-y-2">
      {suggestions.map((entry) => (
        <li key={entry.id}>
          <Link
            to={`/assistent?frage=${entry.id}`}
            className="flex items-start justify-between gap-2 rounded-lg border bg-card p-3 text-meta hover:bg-muted"
          >
            {entry.question}
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function RailSection({
  id,
  title,
  icon,
  className,
  children,
}: {
  id: string;
  title: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={className}>
      <h2 id={id} className="mb-3 flex items-center gap-2 text-card-title">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Right column of the overview (KONZEPT §8 S1): deadline, inbox, grades, assistant. */
export function DashboardRail() {
  return (
    <div className="space-y-7">
      <NextDeadline className="hidden xl:block" />
      <RailSection id="inbox-title" title="Neu im Postfach">
        <ResourceBoundary
          services={[...CHANNELS]}
          skeleton={
            <Skeleton
              role="status"
              aria-label="Postfach wird geladen"
              className="h-48 bg-card"
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
              className="h-44 bg-card"
            />
          }
        >
          {() => <RecentGrades />}
        </ResourceBoundary>
      </RailSection>
      <RailSection
        id="assistant-title"
        title="Frag den Assistenten"
        icon={
          <MessageCircleQuestionMark className="size-4" aria-hidden="true" />
        }
        className="border-t pt-5"
      >
        <AssistantTeaser />
      </RailSection>
    </div>
  );
}
