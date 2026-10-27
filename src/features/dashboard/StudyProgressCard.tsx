import { ArrowRight, CircleHelp, OctagonAlert } from "lucide-react";
import { Link } from "react-router";
import { CitationList } from "@/components/common/CitationList";
import { EctsProgress } from "@/components/common/EctsProgress";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, semesterNumber } from "@/domain/terms";
import {
  selectAcademicState,
  selectBasePlan,
  selectProgress,
  selectRulesById,
} from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";

const CALCULATION_RULES = ["DR-1", "DR-2", "DR-3"];

/** Hero card of the overview (KONZEPT §8 S1 no. 1, US-03): actual, target, gap, status and forecast. */
export function StudyProgressCard() {
  const progress = useDemoStore(selectProgress);
  const plan = useDemoStore(selectBasePlan);
  const academic = useDemoStore(selectAcademicState);
  const program = useDemoStore((state) => state.resources.pos.data?.program);
  const rules = useDemoStore(selectRulesById);
  if (!progress || !plan || !academic || !program) return null;

  const completedSemesters =
    semesterNumber(academic.currentTerm, academic.student.startTerm) - 1;
  const deficit = progress.targetEcts - progress.earnedEcts;
  const graduationSemester = plan.graduationTerm
    ? semesterNumber(plan.graduationTerm, academic.student.startTerm)
    : null;
  const delay =
    graduationSemester === null
      ? null
      : graduationSemester - program.regularSemesters;
  const calculationRules = CALCULATION_RULES.flatMap((id) =>
    rules[id] ? [rules[id]] : [],
  );

  return (
    <Card size="sm" className="h-full">
      <CardContent className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <h2 id="study-progress" className="text-card-title">
            Dein Studienstand
          </h2>
          <StatusBadge status={progress.trafficLight} />
        </div>
        <p className="mt-4 flex flex-wrap items-baseline gap-2">
          <span className="text-figure tabular-nums">
            {progress.earnedEcts}
          </span>
          <span className="text-body text-muted-foreground">
            ECTS von {program.totalEcts}
          </span>
        </p>
        <EctsProgress
          className="mt-3"
          earned={progress.earnedEcts}
          total={program.totalEcts}
          target={progress.targetEcts}
        />
        <p className="mt-3 text-body tabular-nums">
          {deficit > 0
            ? `${deficit} ECTS hinter dem Regelverlauf`
            : "Im Regelverlauf"}{" "}
          <span className="text-muted-foreground">
            (Soll nach {completedSemesters} Semestern: {progress.targetEcts})
          </span>
        </p>
        {plan.internshipShift !== null &&
          plan.internshipShift > 0 &&
          plan.internshipTerm && (
            <p className="mt-2 flex items-start gap-2 text-body font-semibold text-status-critical-foreground">
              <OctagonAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              Dein Praxissemester verschiebt sich voraussichtlich auf{" "}
              {format(plan.internshipTerm)}.
            </p>
          )}
        <dl className="mt-4 grid gap-3 border-t pt-4 text-body sm:grid-cols-2">
          <div>
            <dt className="text-meta text-muted-foreground">
              Ende dieses Semesters
            </dt>
            <dd className="mt-1 tabular-nums">
              <span className="font-semibold">
                {plan.ectsEndOfTerm} von {plan.targetEndOfTerm}
              </span>{" "}
              – wenn du alle angemeldeten Prüfungen bestehst
            </dd>
          </div>
          <div>
            <dt className="text-meta text-muted-foreground">
              Voraussichtlicher Abschluss
            </dt>
            <dd className="mt-1">
              {plan.graduationTerm ? (
                <>
                  <span className="font-semibold">
                    {format(plan.graduationTerm)}
                  </span>{" "}
                  {delay !== null && delay > 0
                    ? `– ${delay} Semester nach der Regelstudienzeit`
                    : "– in Regelstudienzeit"}
                </>
              ) : (
                "Nicht planbar – bitte wende dich an das Prüfungsamt."
              )}
            </dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="link" className="h-auto px-0">
                <CircleHelp aria-hidden="true" />
                Wie wird das berechnet?
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 space-y-3">
              <PopoverTitle className="text-card-title">
                So rechnet StudiCompass
              </PopoverTitle>
              <ul className="space-y-2 text-body">
                {calculationRules.map((rule) => (
                  <li key={rule.id}>{rule.citation.summary}</li>
                ))}
              </ul>
              <CitationList
                citations={calculationRules.map((rule) => rule.citation)}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" asChild>
            <Link to="/verlauf">
              Studienverlauf ansehen
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
