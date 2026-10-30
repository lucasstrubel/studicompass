import { useRef, useState } from "react";
import { FlaskConical, ListChecks, Target, X } from "lucide-react";
import { toast } from "sonner";
import { CitationList } from "@/components/common/CitationList";
import { ConsequenceItem } from "@/components/common/ConsequenceItem";
import { DemoBadge } from "@/components/common/DemoBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WithdrawalNotice } from "@/components/common/WithdrawalNotice";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { milestoneModules, type MilestoneKind } from "@/domain/milestones";
import { compare, format, next } from "@/domain/terms";
import { consequenceCitations, generalOfferingRule } from "@/lib/offering-rule";
import type { Citation, PlanOverride, Term } from "@/domain/types";
import { demoStore } from "@/store/demo-store";
import {
  selectAcademicState,
  selectCanMove,
  selectMoveTargets,
  selectProgress,
  selectRulesById,
  selectTimeline,
} from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";
import {
  SimulationResultDialog,
  type LastMove,
} from "./SimulationResultDialog";
import {
  Timeline,
  type FixedMilestoneNote,
  type MilestoneMarking,
} from "./Timeline";

const PLAN_RULES = ["DR-4", "DR-6", "DR-7", "DR-10"];

/** The last move plus the simulation before it, so "zurücknehmen" restores exactly that step (P5-11 review). */
interface MoveRecord extends LastMove {
  before: PlanOverride[];
  /** Term of every module in the plan shown before the move. */
  termsBefore: Map<string, Term>;
}

/** What the milestone toggle marks, in words (P5-10). */
const MARKED: Record<MilestoneKind, string> = {
  foundationEnd: "Module des Grundstudiums",
  internship: "Module, die vor dem Praxissemester bestanden sein müssen",
  project: "Was vor dem Projektsemester bestanden sein muss",
  thesis: "Was vor der Bachelorarbeit bestanden sein muss",
};

function PlannerContent() {
  const timeline = useDemoStore(selectTimeline);
  const academic = useDemoStore(selectAcademicState);
  const progress = useDemoStore(selectProgress);
  const program = useDemoStore((state) => state.resources.pos.data?.program);
  const rules = useDemoStore(selectRulesById);
  const goalRegularTime = useDemoStore((state) => state.goalRegularTime);
  const whatIf = useDemoStore((state) => state.whatIf);
  const setWhatIf = useDemoStore((state) => state.setWhatIf);
  const clearWhatIf = useDemoStore((state) => state.clearWhatIf);
  const hideCompleted = useDemoStore((state) => state.plannerHideCompleted);
  const setHideCompleted = useDemoStore(
    (state) => state.setPlannerHideCompleted,
  );
  const [simulation, setSimulation] = useState(whatIf.length > 0);
  const [milestone, setMilestone] = useState<MilestoneKind | null>(null);
  // Result dialog after each move (P5-11); it reports on the last move and can be reopened.
  const [resultOpen, setResultOpen] = useState(false);
  const [lastMove, setLastMove] = useState<MoveRecord | null>(null);
  // Where the keyboard focus goes when the dialog closes: the moved module's menu or the switch.
  const focusAfterClose = useRef<string | null>(null);
  const switchRef = useRef<HTMLButtonElement>(null);
  if (!timeline || !academic || !progress || !program) return null;

  const { plan, basePlan } = timeline;
  let regularGraduation = academic.student.startTerm;
  for (let semester = 1; semester < program.regularSemesters; semester++)
    regularGraduation = next(regularGraduation);
  const inRegularTime =
    basePlan.graduationTerm !== null &&
    compare(basePlan.graduationTerm, regularGraduation) <= 0;
  const planRules = PLAN_RULES.flatMap((id) =>
    id === "DR-4"
      ? [generalOfferingRule(rules[id])]
      : rules[id]
        ? [rules[id]]
        : [],
  );

  const jobHours = academic.student.jobHoursPerWeek;
  const loadCitation = rules["DR-10"]?.citation;

  // Milestone toggle (US-26): the modules that belong to the chosen milestone and the rule behind it.
  const assignment = milestone
    ? milestoneModules(milestone, academic.modules)
    : null;
  const marking: MilestoneMarking | null =
    milestone && assignment
      ? { kind: milestone, moduleIds: new Set(assignment.moduleIds) }
      : null;
  const markingRule: { summary: string; citation: Citation } | null =
    assignment === null
      ? null
      : assignment.ruleId === null
        ? {
            summary: `Zum Grundstudium gehören die Module der Fachsemester 1–${program.foundationSemesters}.`,
            citation: program.citation,
          }
        : rules[assignment.ruleId]
          ? {
              summary: rules[assignment.ruleId].citation.summary,
              citation: rules[assignment.ruleId].citation,
            }
          : null;
  // Milestone modules never move by hand; each box says what it depends on (feedback P5-F18).
  const fixedNotes: Partial<Record<MilestoneKind, FixedMilestoneNote>> = {
    internship: {
      text: "Rutscht automatisch nach hinten, wenn Module des Grundstudiums fehlen.",
      citation: rules["DR-6"]?.citation,
    },
    project: {
      text: "Folgt auf das Praxissemester und rutscht mit ihm.",
      citation: rules["DR-11"]?.citation,
    },
    thesis: {
      text: "Folgt auf Praxis- und Projektsemester und rutscht mit ihnen.",
      citation: rules["DR-12"]?.citation,
    },
  };

  // "Abgeschlossenes ausblenden" (P5-10): past semesters with only passed modules disappear, the other
  // semesters drop their passed modules.
  const completed = (item: (typeof timeline.terms)[number]) =>
    compare(item.term, academic.currentTerm) < 0 &&
    item.modules.length > 0 &&
    item.modules.every((entry) => entry.status === "passed");
  const shownTerms = hideCompleted
    ? timeline.terms
        .filter((item) => !completed(item))
        .map((item) => ({
          ...item,
          modules: item.modules.filter((entry) => entry.status !== "passed"),
        }))
    : timeline.terms;
  const hiddenTerms = timeline.terms.length - shownTerms.length;

  // Read lazily from the current store state when a menu opens (the targets need projections).
  const moveTargets = (moduleId: string) =>
    selectMoveTargets(demoStore.getState(), moduleId);
  const canMove = (moduleId: string) =>
    selectCanMove(demoStore.getState(), moduleId);

  const move = (moduleId: string, term: Term) => {
    const before = whatIf;
    const termsBefore = new Map(
      plan.modules.map((item) => [item.moduleId, item.term]),
    );
    const overrides: PlanOverride[] = [
      ...whatIf.filter((item) => item.moduleId !== moduleId),
      { moduleId, action: "move", term },
    ];
    try {
      setWhatIf(overrides);
    } catch {
      toast.error("Diese Verschiebung ist laut Angebot nicht zulässig.");
      return;
    }
    const module = academic.modules.find((item) => item.id === moduleId);
    setLastMove({
      moduleId,
      title: module?.title ?? moduleId,
      term,
      before,
      termsBefore,
    });
    focusAfterClose.current = moduleId;
    setResultOpen(true);
  };
  const stopSimulation = () => {
    clearWhatIf();
    setSimulation(false);
    setLastMove(null);
    // The discard button disappears with the status; keep the keyboard focus on the switch (P3-06).
    switchRef.current?.focus();
  };
  const discardFromDialog = () => {
    focusAfterClose.current = null;
    setResultOpen(false);
    clearWhatIf();
    setSimulation(false);
    setLastMove(null);
  };
  const undoMove = () => {
    if (!lastMove) return;
    if (lastMove.before.length > 0) setWhatIf(lastMove.before);
    else clearWhatIf();
    setLastMove(null);
    setResultOpen(false);
  };
  const restoreFocus = (event: Event) => {
    event.preventDefault();
    const moduleId = focusAfterClose.current;
    const trigger = moduleId
      ? document.querySelector<HTMLElement>(`[data-move-trigger="${moduleId}"]`)
      : null;
    (trigger ?? switchRef.current)?.focus();
  };
  // Modules that moved along with the last move, e.g. after a milestone shift (feedback "bricht alles"):
  // effective terms before and after that move, including modules moved earlier by hand (P5-11 review).
  // Without a recorded move the dialog compares with the real plan.
  const termsBefore =
    lastMove?.termsBefore ??
    new Map(basePlan.modules.map((item) => [item.moduleId, item.term]));
  const shifted = plan.modules
    .filter((item) => {
      const before = termsBefore.get(item.moduleId);
      return (
        item.moduleId !== lastMove?.moduleId &&
        before !== undefined &&
        compare(before, item.term) !== 0
      );
    })
    .flatMap((item) => {
      const module = academic.modules.find(
        (candidate) => candidate.id === item.moduleId,
      );
      return module ? [module.title] : [];
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Studienverlauf"
        meta={<StatusBadge status={progress.trafficLight} />}
        description={
          basePlan.graduationTerm ? (
            <p className="text-foreground">
              {timeline.simulating
                ? "Echter Plan ohne Simulation – voraussichtlicher Abschluss: "
                : "Voraussichtlicher Abschluss: "}
              <span className="font-semibold">
                {format(basePlan.graduationTerm)}
              </span>{" "}
              –{" "}
              {inRegularTime
                ? "in Regelstudienzeit"
                : "nach der Regelstudienzeit"}
            </p>
          ) : (
            "Ohne weiteren Prüfungsversuch lässt sich kein Abschluss planen. Wende dich an das Prüfungsamt."
          )
        }
      />
      <WithdrawalNotice />
      {goalRegularTime && (
        <p className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 text-body">
          <Target className="size-4 shrink-0" aria-hidden="true" />
          Dein Ziel: Abschluss in Regelstudienzeit ({format(regularGraduation)})
        </p>
      )}

      <section
        aria-labelledby="what-if"
        className="space-y-3 rounded-xl border p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="what-if"
              className="flex items-center gap-2 text-section-title"
            >
              <FlaskConical className="size-5" aria-hidden="true" />
              Was-wäre-wenn
            </h2>
            <p className="text-meta text-muted-foreground">
              Verschiebe offene Module in zulässige Semester. Deine echten Daten
              bleiben unverändert.
            </p>
          </div>
          <label className="flex items-center gap-2 text-body font-medium">
            <Switch
              ref={switchRef}
              checked={simulation}
              onCheckedChange={(checked) =>
                checked ? setSimulation(true) : stopSimulation()
              }
            />
            Simulation
          </label>
        </div>
        <p className="text-meta text-muted-foreground">
          {simulation
            ? "Ziehe ein offenes Modul in ein anderes Semester oder nutze „Verschieben“. Danach siehst du sofort, was sich ändert."
            : "Schalte die Simulation ein, um Module zu verschieben."}
        </p>
      </section>

      {timeline.simulating && (
        // Stays at the top while scrolling through the semesters (P5-11, feedback: scrolling was awkward).
        <div
          role="status"
          aria-label="Simulationsstatus"
          className="panel-shadow sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-status-info bg-status-info-soft p-3 text-status-info-foreground"
        >
          <DemoBadge variant="simulation" className="bg-card" />
          <StatusBadge status={plan.trafficLight} />
          <p className="min-w-0 flex-1 text-body">
            Abschluss in der Simulation:{" "}
            <span className="font-semibold">
              {plan.graduationTerm
                ? format(plan.graduationTerm)
                : "nicht planbar"}
            </span>
            {basePlan.graduationTerm &&
              ` (echter Plan: ${format(basePlan.graduationTerm)})`}
            {plan.internshipTerm &&
              ` · Praxissemester ${format(plan.internshipTerm)}`}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-card"
              onClick={() => {
                focusAfterClose.current = null;
                setResultOpen(true);
              }}
            >
              <ListChecks aria-hidden="true" />
              Folgen ansehen
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-card"
              onClick={stopSimulation}
            >
              <X aria-hidden="true" />
              Simulation verwerfen
            </Button>
          </div>
        </div>
      )}
      <SimulationResultDialog
        open={resultOpen && timeline.simulating}
        onOpenChange={setResultOpen}
        move={lastMove}
        plan={plan}
        basePlan={basePlan}
        shifted={shifted}
        consequences={
          plan.consequences.length > 0 && (
            <ul className="space-y-2">
              {plan.consequences.map((consequence) => (
                <li key={consequence.id}>
                  <ConsequenceItem
                    consequence={consequence}
                    citations={consequenceCitations(
                      consequence,
                      academic.modules,
                      rules,
                    )}
                  />
                </li>
              ))}
            </ul>
          )
        }
        onUndoMove={undoMove}
        onDiscard={discardFromDialog}
        onCloseAutoFocus={restoreFocus}
      />

      <section aria-labelledby="timeline" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="timeline" className="text-section-title">
            Semester für Semester
            {timeline.simulating && (
              <span className="ml-2 align-middle">
                <DemoBadge variant="simulation" />
              </span>
            )}
          </h2>
          <label className="flex items-center gap-2 text-body font-medium">
            <Switch
              checked={hideCompleted}
              onCheckedChange={setHideCompleted}
            />
            Abgeschlossenes ausblenden
          </label>
        </div>
        <p className="text-meta text-muted-foreground">
          Tipp: Ein Klick auf einen Meilenstein markiert die Module, die dazu
          gehören.
          {hideCompleted &&
            hiddenTerms > 0 &&
            ` ${hiddenTerms} abgeschlossene ${hiddenTerms === 1 ? "Semester ist" : "Semester sind"} ausgeblendet, bestandene Module ebenso.`}
        </p>
        {milestone && markingRule && (
          <div
            role="status"
            aria-label="Markierte Module"
            className="rounded-xl border border-tone-violet bg-tone-violet-soft p-3 text-body"
          >
            <p>
              <span className="font-semibold">
                Markiert: {MARKED[milestone]}.
              </span>{" "}
              {markingRule.summary}
            </p>
            <CitationList
              variant="footer"
              className="mt-2 pt-2"
              citations={[markingRule.citation]}
            />
          </div>
        )}
        {timeline.terms.length === 0 ? (
          <EmptyState
            title="Kein Verlauf planbar"
            description="Für ein Modul sind alle Prüfungsversuche genutzt. Das Prüfungsamt klärt, wie es weitergeht."
          />
        ) : (
          <Timeline
            terms={shownTerms}
            currentTerm={academic.currentTerm}
            simulation={simulation}
            canMove={canMove}
            moveTargets={moveTargets}
            onMove={move}
            load={{ jobHours, citation: loadCitation }}
            marking={marking}
            onToggleMilestone={(kind) =>
              setMilestone((current) => (current === kind ? null : kind))
            }
            fixedNotes={fixedNotes}
          />
        )}
        <p className="text-meta text-muted-foreground">
          Vereinfachung: Die Prognose verteilt Module nicht individuell neu; sie
          zeigt die Wirkung der Sonderregeln. Angemeldete Prüfungen gelten als
          bestanden.
        </p>
      </section>

      <Accordion type="single" collapsible>
        <AccordionItem value="rules">
          <AccordionTrigger className="text-card-title">
            Welche Regeln gelten?
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <ul className="space-y-2 text-body">
              {planRules.map((rule) => (
                <li key={rule.id}>{rule.citation.summary}</li>
              ))}
            </ul>
            <CitationList
              variant="footer"
              className="mt-0"
              citations={planRules.map((rule) => rule.citation)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/** Studienverlauf (KONZEPT §8 S2, US-04, US-09, US-10). */
export function PlannerPage() {
  return (
    <ResourceBoundary
      services={["pos", "rules"]}
      header={<h1 className="mb-6 text-page-title">Studienverlauf</h1>}
      skeleton={
        <Skeleton
          role="status"
          aria-label="Studienverlauf wird geladen"
          className="h-96"
        />
      }
    >
      {() => <PlannerContent />}
    </ResourceBoundary>
  );
}
