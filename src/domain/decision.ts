import type { AcademicState, DecisionOption, DecisionOutcome } from "./types";
import { compare } from "./terms";
import { nextOfferingTerm } from "./rules";
import { projectPlan } from "./projection";
import { usedAttempts } from "./progress";

/** KONZEPT §10.4/§10.5: attendPass / attendFail / withdraw, with DR-5/DR-8 attempts.
 * Requires a registered current-term exam; rejects unknown or already settled exams.
 */
export function compareDecision(
  state: AcademicState,
  examId: string,
): DecisionOutcome[] {
  const exam = state.exams.find((entry) => entry.id === examId);
  const module = state.modules.find((entry) => entry.id === exam?.moduleId);
  if (
    !exam ||
    !module ||
    exam.status !== "registered" ||
    compare(exam.term, state.currentTerm) !== 0
  )
    throw new RangeError(
      "Die Prüfung ist in diesem Semester nicht angemeldet.",
    );
  const attemptsBefore = usedAttempts(state.exams, module.id);
  if (attemptsBefore >= 3)
    throw new RangeError("Es sind bereits drei Prüfungsversuche genutzt.");
  const options: DecisionOption[] = ["attendPass", "attendFail", "withdraw"];
  // §10.5 step 9: every option lists only differences from the baseline, attendPass included.
  const baseline = projectPlan(state).consequences;
  return options.map((option) => {
    const projection = projectPlan(
      state,
      option === "attendPass"
        ? []
        : [
            {
              moduleId: module.id,
              action: option === "attendFail" ? "fail" : "withdraw",
            },
          ],
    );
    const attemptsUsed = attemptsBefore + (option === "withdraw" ? 0 : 1);
    const consequences = projection.consequences.filter(
      (item) =>
        !baseline.some(
          (previous) =>
            previous.id === item.id &&
            previous.detail === item.detail &&
            previous.severity === item.severity,
        ),
    );
    if (option === "attendFail")
      consequences.push({
        id: "attempt-used",
        severity: attemptsUsed === 3 ? "critical" : "info",
        title: "Prüfungsversuch zählt",
        detail: `${attemptsUsed} von 3 Versuchen genutzt.`,
        ruleId: "DR-8",
      });
    if (option === "withdraw")
      consequences.push({
        id: "attempt-unchanged",
        severity: "info",
        title: "Kein Prüfungsversuch verbraucht",
        detail: `${attemptsUsed} von 3 Versuchen genutzt. Eine Abmeldung zählt nicht als Versuch.`,
        ruleId: "DR-5",
      });
    const priority = { critical: 0, tight: 1, info: 2 };
    consequences.sort(
      (left, right) => priority[left.severity] - priority[right.severity],
    );
    return {
      option,
      status: projection.status,
      blockedModuleIds: projection.blockedModuleIds,
      ...(option !== "attendPass" && attemptsUsed < 3
        ? { nextAttemptTerm: nextOfferingTerm(module, state.currentTerm) }
        : {}),
      attemptsUsed,
      ectsEndOfTerm: projection.ectsEndOfTerm,
      targetEndOfTerm: projection.targetEndOfTerm,
      trafficLight: projection.trafficLight,
      internshipTerm: projection.internshipTerm,
      internshipShift: projection.internshipShift,
      graduationTerm: projection.graduationTerm,
      openFoundationAfterTerm: projection.openFoundationAfterTerm,
      consequences,
    };
  });
}
