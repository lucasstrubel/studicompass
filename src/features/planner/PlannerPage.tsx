import { useState } from "react";
import { FlaskConical, Target, X } from "lucide-react";
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
import { allowedMoveTerms, projectPlan } from "@/domain/projection";
import { compare, format, next } from "@/domain/terms";
import { consequenceCitations, generalOfferingRule } from "@/lib/offering-rule";
import type { PlanOverride, Term } from "@/domain/types";
import {
  selectAcademicState,
  selectProgress,
  selectRulesById,
  selectTimeline,
} from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";
import { Timeline } from "./Timeline";

const PLAN_RULES = ["DR-4", "DR-6", "DR-7", "DR-10"];

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
  const [simulation, setSimulation] = useState(whatIf.length > 0);
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

  /**
   * Terms the menu offers: allowed by DR-4 and actually reached with the other active moves – a milestone
   * shift can push a module later than an earlier target (P3-04 review).
   */
  const moveTargets = (moduleId: string): Term[] => {
    const others = whatIf.filter((item) => item.moduleId !== moduleId);
    const now = plan.modules.find((item) => item.moduleId === moduleId)?.term;
    return allowedMoveTerms(academic, moduleId, 8)
      .filter((term) => {
        if (now && compare(now, term) === 0) return false;
        try {
          const result = projectPlan(academic, [
            ...others,
            { moduleId, action: "move", term },
          ]);
          const placed = result.modules.find(
            (item) => item.moduleId === moduleId,
          )?.term;
          return placed !== undefined && compare(placed, term) === 0;
        } catch {
          return false;
        }
      })
      .slice(0, 4);
  };

  const move = (moduleId: string, term: Term) => {
    const overrides: PlanOverride[] = [
      ...whatIf.filter((item) => item.moduleId !== moduleId),
      { moduleId, action: "move", term },
    ];
    try {
      setWhatIf(overrides);
    } catch {
      toast.error("Diese Verschiebung ist laut Angebot nicht zulässig.");
    }
  };
  const stopSimulation = () => {
    clearWhatIf();
    setSimulation(false);
  };

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
              checked={simulation}
              onCheckedChange={(checked) =>
                checked ? setSimulation(true) : stopSimulation()
              }
            />
            Simulation
          </label>
        </div>
        {timeline.simulating && (
          <div
            role="status"
            className="space-y-3 rounded-xl border border-status-info bg-status-info-soft p-3 text-status-info-foreground"
          >
            <div className="flex flex-wrap items-center gap-3">
              <DemoBadge variant="simulation" className="bg-card" />
              <StatusBadge status={plan.trafficLight} />
              <p className="flex-1 text-body">
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
              <Button variant="outline" size="sm" onClick={stopSimulation}>
                <X aria-hidden="true" />
                Simulation verwerfen
              </Button>
            </div>
            {plan.consequences.length > 0 && (
              <ul className="space-y-2 text-foreground">
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
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="timeline" className="space-y-3">
        <h2 id="timeline" className="text-section-title">
          Semester für Semester
          {timeline.simulating && (
            <span className="ml-2 align-middle">
              <DemoBadge variant="simulation" />
            </span>
          )}
        </h2>
        {timeline.terms.length === 0 ? (
          <EmptyState
            title="Kein Verlauf planbar"
            description="Für ein Modul sind alle Prüfungsversuche genutzt. Das Prüfungsamt klärt, wie es weitergeht."
          />
        ) : (
          <Timeline
            terms={timeline.terms}
            currentTerm={academic.currentTerm}
            simulation={simulation}
            canMove={(moduleId) =>
              allowedMoveTerms(academic, moduleId, 1).length > 0
            }
            moveTargets={moveTargets}
            onMove={move}
            load={{ jobHours, citation: loadCitation }}
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
            <CitationList citations={planRules.map((rule) => rule.citation)} />
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
      skeleton={
        <div className="space-y-4">
          <h1 className="text-page-title">Studienverlauf</h1>
          <Skeleton
            role="status"
            aria-label="Studienverlauf wird geladen"
            className="h-96"
          />
        </div>
      }
    >
      {() => <PlannerContent />}
    </ResourceBoundary>
  );
}
