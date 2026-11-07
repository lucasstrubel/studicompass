import { ArrowRight, CircleHelp, OctagonAlert } from "lucide-react";
import { Link } from "react-router";
import { CitationList } from "@/components/common/CitationList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
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

/** Upper part of the overview's main card (US-03): actual, target, gap, status and forecast, above the course line. */
export function StudyProgressCard() {
  const progress = useDemoStore(selectProgress);
  const plan = useDemoStore(selectBasePlan);
  const academic = useDemoStore(selectAcademicState);
  const program = useDemoStore((state) => state.resources.pos.data?.program);
  const rules = useDemoStore(selectRulesById);
  if (!progress || !plan || !academic || !program) return null;

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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 id="study-progress" className="text-section-title">
          Dein Studienstand
        </h2>
        <StatusBadge status={progress.trafficLight} />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:ml-auto sm:gap-x-5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="link" className="h-auto px-0">
                <CircleHelp aria-hidden="true" />
                Wie wird das berechnet?
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-3">
              <PopoverTitle className="text-card-title">
                So rechnet StudiCompass
              </PopoverTitle>
              <ul className="space-y-2 text-body">
                {calculationRules.map((rule) => (
                  <li key={rule.id}>{rule.citation.summary}</li>
                ))}
                <li>
                  Prognosen gelten, wenn du alle angemeldeten Prüfungen
                  bestehst.
                </li>
              </ul>
              <CitationList
                citations={calculationRules.map((rule) => rule.citation)}
              />
            </PopoverContent>
          </Popover>
          <Button variant="link" className="h-auto px-0" asChild>
            <Link to="/verlauf">
              Studienverlauf ansehen
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-x-12 gap-y-4 sm:grid-cols-2 lg:grid-cols-[auto_auto_minmax(0,1fr)] lg:items-end">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="text-figure tabular-nums">
              {progress.earnedEcts}
            </span>
            <span className="text-body text-muted-foreground">
              ECTS von {program.totalEcts}
            </span>
          </p>
          <p className="text-body tabular-nums">
            {deficit > 0
              ? `${deficit} ECTS hinter dem Soll von ${progress.targetEcts}`
              : "Im Regelverlauf"}
          </p>
        </div>
        {/* Forecasts are named as such; the assumption behind them sits in "Wie wird das berechnet?". */}
        <dl className="contents">
          <div>
            <dt className="text-body text-muted-foreground">
              Semesterende (Prognose)
            </dt>
            <dd className="text-section-title tabular-nums">
              {plan.ectsEndOfTerm} von {plan.targetEndOfTerm}
            </dd>
          </div>
          <div>
            <dt className="text-body text-muted-foreground">
              Abschluss (Prognose)
            </dt>
            <dd>
              {plan.graduationTerm ? (
                <>
                  <span className="text-section-title tabular-nums">
                    {format(plan.graduationTerm)}
                  </span>{" "}
                  <span className="text-body">
                    {delay !== null && delay > 0
                      ? `– ${delay} Semester später`
                      : "– in Regelstudienzeit"}
                  </span>
                </>
              ) : (
                <span className="text-body">
                  Nicht planbar – bitte wende dich an das Prüfungsamt.
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>
      {plan.internshipShift !== null &&
        plan.internshipShift > 0 &&
        plan.internshipTerm && (
          <p className="flex items-start gap-2 rounded-lg bg-status-critical-soft px-3 py-2 text-body font-semibold text-status-critical-foreground">
            <OctagonAlert className="mt-1 size-4 shrink-0" aria-hidden="true" />
            Dein Praxissemester verschiebt sich voraussichtlich auf{" "}
            {format(plan.internshipTerm)}.
          </p>
        )}
    </div>
  );
}
