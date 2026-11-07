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
 * "Jetzt wichtig" (US-07): at most two decisions where a special rule applies, text in the chosen hint tone.
 * The soft brand surface marks it as important without any further decoration; its one button is the main
 * action of the page.
 */
export function ImportantCard() {
  const decisions = useDemoStore(selectImportantDecisions);
  const rules = useDemoStore(selectRulesById);

  if (decisions.length === 0) {
    return (
      <section
        aria-labelledby="important"
        className="rounded-2xl border bg-card p-5 md:px-7"
      >
        <h2
          id="important"
          className="flex items-center gap-2 text-section-title"
        >
          <CalendarClock className="size-5" aria-hidden="true" />
          Jetzt wichtig
        </h2>
        <EmptyState
          title="Gerade steht keine Entscheidung mit Sonderregel an."
          description="StudiCompass meldet sich hier, wenn eine Frist näher rückt und eine Sonderregel greift."
          action={
            <Link
              to="/fristen"
              className="inline-flex items-center gap-1 rounded-sm text-meta font-semibold text-accent-strong"
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
      className="rounded-2xl bg-accent-soft p-5 text-foreground md:px-7 md:py-6"
    >
      <h2 id="important" className="flex items-center gap-2 text-section-title">
        <CalendarClock
          className="size-5 text-accent-strong"
          aria-hidden="true"
        />
        Jetzt wichtig
      </h2>
      <ul className="mt-3 space-y-6">
        {decisions.map((decision) => {
          const deadline = new Date(decision.exam.withdrawalDeadline ?? "");
          return (
            <li key={decision.notificationId}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-10">
                <div className="min-w-0 max-w-prose">
                  <h3 className="text-card-title">
                    {decision.module.title}: Abmeldung nur noch bis{" "}
                    {formatRelativeDay(deadline, DEMO_NOW)},{" "}
                    {formatTime(deadline)} Uhr
                  </h3>
                  <p className="mt-1 text-body">{decision.message}</p>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                  <Button asChild>
                    <Link to={`/entscheidung/${decision.exam.id}`}>
                      Folgen prüfen
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                  <p className="text-meta">
                    Abmeldefrist:{" "}
                    <Countdown
                      until={decision.exam.withdrawalDeadline ?? ""}
                      className="font-semibold"
                    />
                  </p>
                </div>
              </div>
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
