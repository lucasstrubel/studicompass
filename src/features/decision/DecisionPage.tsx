import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Mail,
  MessageCircleQuestionMark,
  Target,
  Undo2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { ConsequenceItem } from "@/components/common/ConsequenceItem";
import { Countdown } from "@/components/common/Countdown";
import { DemoBadge } from "@/components/common/DemoBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Consequence, ExamRecord, Module, Rule } from "@/domain/types";
import { format } from "@/domain/terms";
import { formatDate, formatShortDateTime } from "@/lib/format";
import {
  selectDecision,
  selectInbox,
  selectRulesById,
  selectUndoableExamId,
  type DecisionView,
} from "@/store/selectors";
import { demoStore } from "@/store/demo-store";
import { useDemoStore } from "@/store/use-demo-store";
import { ComparisonTable } from "./ComparisonTable";
import { focusMainContent } from "@/lib/focus";
import { rulesForModule } from "@/lib/offering-rule";

/**
 * Toast after a simulated decision, with "Rückgängig" for 8 s (US-08). The undo only applies while this
 * exam's decision is still the latest one; a newer decision has replaced the snapshot otherwise.
 */
function showUndoToast(message: string, examId: string) {
  toast.success(message, {
    duration: 8000,
    description: "Simulation – im echten Betrieb passiert das im POS.",
    action: {
      label: "Rückgängig",
      onClick: () => {
        const state = demoStore.getState();
        if (selectUndoableExamId(state) === examId) state.undo();
        else
          toast.info("Rückgängig nicht mehr möglich", {
            description:
              "Eine neuere Entscheidung hat diese Simulation abgelöst.",
          });
      },
    },
  });
}

function citationsFor(ruleId: string | undefined, rules: Record<string, Rule>) {
  return ruleId && rules[ruleId] ? [rules[ruleId].citation] : [];
}

function ConsequenceList({
  title,
  consequences,
  rules,
}: {
  title: string;
  consequences: Consequence[];
  rules: Record<string, Rule>;
}) {
  if (consequences.length === 0) return null;
  return (
    <section aria-label={title} className="space-y-2">
      <h3 className="text-card-title">{title}</h3>
      <ul className="space-y-2">
        {consequences.map((consequence) => (
          <li key={consequence.id}>
            <ConsequenceItem
              consequence={consequence}
              citations={citationsFor(consequence.ruleId, rules)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function HelpOffers({ exam, module }: { exam: ExamRecord; module: Module }) {
  const inbox = useDemoStore(selectInbox).filter(
    (item) => item.moduleId === module.id,
  );
  const progress = useDemoStore((state) =>
    state.resources.moodle.data?.progress.find(
      (item) => item.moduleId === module.id,
    ),
  );
  const advice = useDemoStore((state) =>
    state.resources.rules.data?.offices.find((office) => office.id === "o-sb"),
  );
  return (
    <section aria-labelledby="help" className="space-y-3">
      <h2 id="help" className="text-section-title">
        Was dir jetzt helfen kann
      </h2>
      {/* Messages and Moodle progress come from the channels: show their loading and errors here. */}
      <ResourceBoundary
        services={["pos", "moodle", "mail", "website"]}
        skeleton={
          <Skeleton
            role="status"
            aria-label="Hilfsangebote werden geladen"
            className="h-24"
          />
        }
      >
        {() => null}
      </ResourceBoundary>
      <ul className="grid gap-3 md:grid-cols-2">
        {inbox.map((item) => (
          <li key={item.id}>
            <Link
              to={`/postfach?eintrag=${item.id}`}
              className="flex h-full flex-col gap-1 rounded-xl border bg-card p-3 hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                <ChannelBadge channel={item.channel} />
                <span className="text-meta text-muted-foreground">
                  {item.sender}
                </span>
              </span>
              <span className="text-body font-semibold">{item.subject}</span>
              <span className="text-meta text-muted-foreground">
                {item.preview}
              </span>
            </Link>
          </li>
        ))}
        {progress && (
          <li className="flex flex-col gap-1 rounded-xl border bg-card p-3">
            <ChannelBadge channel="moodle" />
            <span className="text-body font-semibold">
              Moodle-Kurs {module.title}
            </span>
            <span className="text-meta text-muted-foreground">
              {progress.label}
              {progress.detail && ` · ${progress.detail}`}
            </span>
          </li>
        )}
        <li>
          <Link
            to={`/assistent?module=${module.id}`}
            className="flex h-full flex-col gap-1 rounded-xl border bg-card p-3 hover:bg-muted"
          >
            <span className="flex items-center gap-2 text-body font-semibold">
              <MessageCircleQuestionMark
                className="size-4"
                aria-hidden="true"
              />
              Assistent fragen
            </span>
            <span className="text-meta text-muted-foreground">
              Fragen zu {module.title} – mit Quelle aus SPO und Modulhandbuch.
            </span>
          </Link>
        </li>
        {advice && (
          <li className="flex flex-col gap-1 rounded-xl border bg-card p-3">
            <span className="flex items-center gap-2 text-body font-semibold">
              <Mail className="size-4" aria-hidden="true" />
              {advice.name}
            </span>
            <span className="text-meta text-muted-foreground">
              {advice.email}
              {advice.hours && ` · ${advice.hours}`}
            </span>
          </li>
        )}
      </ul>
      <p className="text-meta text-muted-foreground">
        Diese Angebote sind keine Empfehlung – die Entscheidung liegt bei dir.
        Termin der Prüfung:{" "}
        {exam.date ? formatShortDateTime(new Date(exam.date)) : "–"}.
      </p>
    </section>
  );
}

function DecisionActions({
  exam,
  module,
}: {
  exam: ExamRecord;
  module: Module;
}) {
  const navigate = useNavigate();
  const withdrawExam = useDemoStore((state) => state.withdrawExam);
  const confirmAttend = useDemoStore((state) => state.confirmAttend);

  return (
    <section aria-labelledby="decide" className="space-y-3">
      <h2 id="decide" className="text-section-title">
        Deine Entscheidung
      </h2>
      <p className="text-body text-muted-foreground">
        StudiCompass informiert, entscheiden tust du. Beide Wege sind möglich.
      </p>
      {/* Both actions look the same on purpose: the app informs, it does not steer (CLAUDE.md). */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            if (!confirmAttend(exam.id)) return;
            showUndoToast(`${module.title}: Du trittst an`, exam.id);
            void navigate("/");
          }}
        >
          Ich trete an
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="lg">
              Abmeldung vornehmen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Von {module.title} abmelden?</AlertDialogTitle>
              <AlertDialogDescription>
                Im echten Betrieb leitet StudiCompass dich zur Abmeldung ins POS
                weiter. Im Prototyp wird sie simuliert.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Zurück zum Vergleich</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!withdrawExam(exam.id)) return;
                  showUndoToast(
                    `${module.title}: Abmeldung simuliert`,
                    exam.id,
                  );
                  void navigate("/");
                }}
              >
                Abmeldung simulieren
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}

function ReadyView({
  view,
  rules,
  updatedAt,
}: {
  view: Extract<DecisionView, { kind: "ready" }>;
  rules: Record<string, Rule>;
  updatedAt: string | null;
}) {
  const { exam, module, outcomes } = view;
  const goalRegularTime = useDemoStore((state) => state.goalRegularTime);
  const moduleRules = rulesForModule(module, rules);
  const withdraw = outcomes.find((outcome) => outcome.option === "withdraw");
  const fail = outcomes.find((outcome) => outcome.option === "attendFail");
  const baseline = outcomes.find((outcome) => outcome.option === "attendPass");

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${module.title} – antreten oder abmelden?`}
        meta={
          exam.withdrawalDeadline && (
            <span className="inline-flex flex-wrap items-center gap-1.5 rounded-full border border-input px-3 py-1 text-meta">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Abmeldung bis{" "}
              {formatShortDateTime(new Date(exam.withdrawalDeadline))} ·{" "}
              <Countdown until={exam.withdrawalDeadline} />
            </span>
          )
        }
        description={
          view.hint && <p className="text-foreground">{view.hint}</p>
        }
      />
      <div className="space-y-3">
        <p className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 text-body">
          <Target className="size-4 shrink-0" aria-hidden="true" />
          <span>
            {goalRegularTime
              ? `Dein Ziel: Abschluss in Regelstudienzeit (${format(view.regularGraduationTerm)})`
              : "Dein Ziel: Studium im eigenen Tempo"}
          </span>
          {baseline?.graduationTerm && (
            <span className="text-muted-foreground">
              · Prognose ohne Abmeldung: {format(baseline.graduationTerm)}
            </span>
          )}
        </p>
        {view.confirmed && (
          <p className="text-meta text-muted-foreground">
            Du hast vermerkt, dass du antrittst. Du kannst trotzdem vergleichen.
          </p>
        )}
      </div>

      <section aria-labelledby="comparison" className="space-y-3">
        <h2 id="comparison" className="text-section-title">
          Vergleich der Optionen
        </h2>
        <ComparisonTable
          module={module}
          currentTerm={exam.term}
          outcomes={outcomes}
          rules={moduleRules}
        />
      </section>

      <section aria-labelledby="consequences" className="space-y-4">
        <h2 id="consequences" className="text-section-title">
          Was sich ändert
        </h2>
        {withdraw && (
          <ConsequenceList
            title="Wenn du dich abmeldest"
            consequences={withdraw.consequences}
            rules={moduleRules}
          />
        )}
        {fail && (
          <ConsequenceList
            title="Zusätzlich, wenn du antrittst und nicht bestehst"
            consequences={fail.consequences.filter(
              (item) =>
                !withdraw?.consequences.some((other) => other.id === item.id),
            )}
            rules={moduleRules}
          />
        )}
        <ConsequenceList
          title="Gilt unabhängig von deiner Entscheidung"
          consequences={view.baseHints}
          rules={moduleRules}
        />
      </section>

      <HelpOffers exam={exam} module={module} />
      <DecisionActions exam={exam} module={module} />

      <footer className="border-t pt-4 text-meta text-muted-foreground">
        Prognose auf Basis deiner Daten und der Regeln (Stand{" "}
        {updatedAt ? formatDate(new Date(updatedAt)) : "unbekannt"}).
        Verbindlich ist die Auskunft des Prüfungsamts. Die Prognose verteilt
        Module nicht individuell neu; sie zeigt die Wirkung der Sonderregeln.
      </footer>
    </div>
  );
}

function SettledView({ exam, module }: { exam: ExamRecord; module: Module }) {
  const canUndo = useDemoStore(selectUndoableExamId) === exam.id;
  const undo = useDemoStore((state) => state.undo);
  const withdrawn = exam.status === "withdrawn";
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Folgen-Check: ${module.title}`}
        meta={withdrawn && <DemoBadge variant="simulation" />}
      />
      <EmptyState
        title={
          withdrawn
            ? `Abmeldung von ${module.title} simuliert`
            : `Für ${module.title} steht in diesem Semester keine Entscheidung an`
        }
        description={
          withdrawn
            ? "Die Übersicht und der Studienverlauf zeigen schon den neuen Stand. Im echten Betrieb meldest du dich im POS ab."
            : "Der Folgen-Check vergleicht nur angemeldete Prüfungen dieses Semesters."
        }
        action={
          <div className="flex flex-wrap gap-2">
            {withdrawn && canUndo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  undo();
                  // The comparison replaces this view; keep the focus on the page (P3-06 review).
                  focusMainContent();
                }}
              >
                <Undo2 aria-hidden="true" />
                Rückgängig
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft aria-hidden="true" />
                Zur Übersicht
              </Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}

function DecisionContent({ examId }: { examId: string }) {
  const view = useDemoStore((state) => selectDecision(state, examId));
  const rules = useDemoStore(selectRulesById);
  const updatedAt = useDemoStore((state) => state.resources.pos.updatedAt);

  switch (view.kind) {
    case "ready":
      return <ReadyView view={view} rules={rules} updatedAt={updatedAt} />;
    case "settled":
      return <SettledView exam={view.exam} module={view.module} />;
    case "blocked":
      return (
        <div className="space-y-6">
          <PageHeader title={`Folgen-Check: ${view.module.title}`} />
          <EmptyState
            title="Dazu kann StudiCompass keine Prognose rechnen"
            description={`${view.reason} Wende dich bitte an das Prüfungsamt.`}
            action={
              <Link
                to="/assistent?frage=A-04"
                className="inline-flex items-center gap-1 text-meta font-semibold text-accent-strong"
              >
                Was gilt bei Prüfungsversuchen?
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
        </div>
      );
    default:
      return (
        <div className="space-y-6">
          <PageHeader title="Folgen-Check" />
          <EmptyState
            title="Diese Prüfung gibt es nicht"
            description="Der Link verweist auf keine Prüfung aus deinem POS."
            action={
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-meta font-semibold text-accent-strong"
              >
                Zur Übersicht
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
        </div>
      );
  }
}

/** Folgen-Check (KONZEPT §8 S4, hero flow §9): compare attending and withdrawing before deciding. */
export function DecisionPage() {
  const { examId = "" } = useParams();
  return (
    <ResourceBoundary
      services={["pos", "rules"]}
      header={<h1 className="mb-6 text-page-title">Folgen-Check</h1>}
      skeleton={
        <Skeleton
          role="status"
          aria-label="Folgen-Check wird geladen"
          className="h-96"
        />
      }
    >
      {() => <DecisionContent examId={examId} />}
    </ResourceBoundary>
  );
}
