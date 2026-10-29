import { ArrowRight, CalendarClock } from "lucide-react";
import { Link } from "react-router";
import { CitationList } from "@/components/common/CitationList";
import { Countdown } from "@/components/common/Countdown";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { DEMO_NOW } from "@/config/demo";
import { formatRelativeDay, formatTime } from "@/lib/format";
import { selectImportantDecisions, selectRulesById } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";

/**
 * "Jetzt wichtig" (KONZEPT §8 S1 no. 2, US-07): at most two decisions where a special rule applies, text in
 * the chosen hint tone. Soft terracotta tint with a terracotta edge and ink text (§12.2, P5-06): marked as
 * important without outshining the study progress next to it.
 */
export function ImportantCard() {
  const decisions = useDemoStore(selectImportantDecisions);
  const rules = useDemoStore(selectRulesById);

  if (decisions.length === 0) {
    return (
      <section
        aria-labelledby="important"
        className="h-full rounded-xl border bg-card p-4"
      >
        <h2
          id="important"
          className="mb-3 flex items-center gap-2 text-card-title"
        >
          <CalendarClock className="size-4" aria-hidden="true" />
          Jetzt wichtig
        </h2>
        <EmptyState
          title="Gerade steht keine Entscheidung mit Sonderregel an."
          description="StudiCompass meldet sich hier, wenn eine Frist näher rückt und eine Sonderregel greift."
          action={
            <Link
              to="/fristen"
              className="inline-flex items-center gap-1 text-meta font-semibold text-accent-strong"
            >
              Alle Fristen
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section
      aria-labelledby="important"
      className="h-full rounded-xl border border-l-4 border-l-accent bg-accent-soft p-5 text-foreground"
    >
      <h2 id="important" className="flex items-center gap-2 text-card-title">
        <CalendarClock
          className="size-4 text-accent-strong"
          aria-hidden="true"
        />
        Jetzt wichtig
      </h2>
      <ul className="mt-3 space-y-5">
        {decisions.map((decision) => {
          const deadline = new Date(decision.exam.withdrawalDeadline ?? "");
          return (
            <li key={decision.notificationId}>
              <h3 className="text-section-title">
                {decision.module.title}: Abmeldung nur noch bis{" "}
                {formatRelativeDay(deadline, DEMO_NOW)}, {formatTime(deadline)}{" "}
                Uhr
              </h3>
              <p className="mt-2 text-body font-medium">{decision.message}</p>
              <p className="mt-2 text-meta">
                Abmeldefrist:{" "}
                <Countdown
                  until={decision.exam.withdrawalDeadline ?? ""}
                  className="font-semibold"
                />
              </p>
              <Button asChild className="mt-4">
                <Link to={`/entscheidung/${decision.exam.id}`}>
                  Folgen prüfen
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <CitationList
                variant="footer"
                citations={decision.ruleIds.flatMap((id) =>
                  rules[id] ? [rules[id].citation] : [],
                )}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
