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

/** Upper part of the overview's hero (US-03): actual, target, gap, status and forecast, above the course line. */
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 id="study-progress" className="text-section-title">
          Dein Studienstand
        </h2>
        <StatusBadge status={progress.trafficLight} />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:ml-auto sm:gap-x-5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="link" className="h-auto px-0 text-meta">
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
              </ul>
              <CitationList
                citations={calculationRules.map((rule) => rule.citation)}
              />
            </PopoverContent>
          </Popover>
          <Button variant="link" className="h-auto px-0 text-meta" asChild>
            <Link to="/verlauf">
              Studienverlauf ansehen
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-x-12 gap-y-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end">
        <div>
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
              ? `${deficit} ECTS hinter dem Regelverlauf`
              : "Im Regelverlauf"}{" "}
            <span className="text-muted-foreground">
              (Soll nach {completedSemesters} Semestern: {progress.targetEcts})
            </span>
          </p>
        </div>
        <dl className="grid gap-x-8 gap-y-3 text-body sm:grid-cols-2">
          <div>
            <dt className="text-meta text-muted-foreground">
              Ende dieses Semesters
            </dt>
            <dd className="tabular-nums">
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
            <dd>
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
