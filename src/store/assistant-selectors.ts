import { matchAssistant } from "@/domain/assistant-matching";
import { passedModuleRecords } from "@/domain/progress";
import { compare, format, next, semesterNumber } from "@/domain/terms";
import { DEMO_NOW } from "@/config/demo";
import { formatGrade, formatShortDateTime } from "@/lib/format";
import type { AssistantEntry } from "@/domain/types";
import type { DemoState } from "./demo-store";
import {
  selectAcademicState,
  selectBasePlan,
  selectDecision,
  selectProgress,
} from "./selectors";

export function selectAssistantMatch(state: DemoState, question: string) {
  return matchAssistant(
    question,
    state.resources.assistant.data?.catalog ?? [],
  );
}

/** Personal answers always describe the real demo state, never planner overrides. */
export function selectAssistantPersonal(
  state: DemoState,
  entry: AssistantEntry,
): string {
  const academic = selectAcademicState(state);
  const progress = selectProgress(state);
  const plan = selectBasePlan(state);
  if (!academic || !progress || !plan)
    return "Deine Studiendaten sind gerade nicht verfügbar. Bitte lade POS erneut.";
  const passed = passedModuleRecords(academic.exams);
  switch (entry.resolver) {
    case "nextWithdrawalDeadline": {
      const exam = academic.exams
        .filter(
          (exam) =>
            exam.status === "registered" &&
            exam.withdrawalDeadline &&
            new Date(exam.withdrawalDeadline) > DEMO_NOW,
        )
        .sort((a, b) =>
          (a.withdrawalDeadline ?? "").localeCompare(
            b.withdrawalDeadline ?? "",
          ),
        )[0];
      return exam?.withdrawalDeadline
        ? `${academic.modules.find((module) => module.id === exam.moduleId)?.title}: Abmeldung bis ${formatShortDateTime(new Date(exam.withdrawalDeadline))}.`
        : "Für dich steht aktuell keine offene Abmeldefrist an.";
    }
    case "decisionSummary:e-pr2-ws26": {
      const decision = selectDecision(state, "e-pr2-ws26");
      const result =
        decision.kind === "ready"
          ? decision.outcomes.find((outcome) => outcome.option === "withdraw")
          : plan;
      return result?.projectTerm && result.graduationTerm
        ? `Unternehmensinformatikprojekt: ${format(result.projectTerm)}. Voraussichtlicher Abschluss: ${format(result.graduationTerm)}${decision.kind === "settled" ? " (aktueller Stand)" : " bei einer Abmeldung"}.`
        : "Eine verlässliche Prognose ist aktuell nicht möglich. Bitte frage bei der Prüfungsverwaltung nach.";
    }
    case "openFoundationModules":
      return `Noch offen: ${progress.openFoundationModules.map((module) => module.title).join(", ") || "keine Module des Grundstudiums"}.`;
    case "openFoundationAfterTerm":
      return `Nach diesem Semester wären ${plan.openFoundationAfterTerm} ${plan.openFoundationAfterTerm === 1 ? "Prüfung" : "Prüfungen"} des Grundstudiums offen – vorausgesetzt, du bestehst alle angemeldeten Prüfungen.`;
    case "progressSummary":
      return `Du hast ${progress.earnedEcts} von ${state.resources.pos.data?.program.totalEcts} ECTS. Soll nach ${semesterNumber(academic.currentTerm, academic.student.startTerm) - 1} Semestern: ${progress.targetEcts} ECTS. Es fehlen noch ${(state.resources.pos.data?.program.totalEcts ?? 0) - progress.earnedEcts} ECTS bis zum Abschluss.`;
    case "gradeAverage":
      return progress.gradeAverage === null
        ? "Es liegen noch keine bestandenen benoteten Module vor."
        : `Dein aktueller Schnitt: ${formatGrade(progress.gradeAverage)} aus ${passed.size} bestandenen Modulen (${progress.earnedEcts} ECTS).`;
    case "attemptsOverview": {
      const failed = academic.exams.filter(
        (exam) => exam.status === "failed" && !passed.has(exam.moduleId),
      );
      const retakeNow = (moduleId: string) =>
        academic.exams.some(
          (exam) =>
            exam.moduleId === moduleId &&
            exam.status === "registered" &&
            compare(exam.term, academic.currentTerm) === 0,
        );
      return (
        failed
          .map((exam) => {
            const module = academic.modules.find(
              (item) => item.id === exam.moduleId,
            );
            if ((exam.attempt ?? 1) >= 3)
              return `${module?.title ?? "Prüfung"}: drei Versuche nicht bestanden. Ein weiterer regulärer Versuch ist nicht möglich. Bitte wende dich an die Prüfungsverwaltung.`;
            if (!module) return "";
            return retakeNow(module.id)
              ? `${module.title}: Versuch ${exam.attempt ?? 1} nicht bestanden; die Wiederholung (Versuch ${(exam.attempt ?? 1) + 1} von 3) ist in diesem Prüfungszeitraum angemeldet.`
              : `${module.title}: Versuch ${exam.attempt ?? 1} nicht bestanden; Wiederholung im nächsten Prüfungszeitraum (${format(next(academic.currentTerm))}), Versuch ${(exam.attempt ?? 1) + 1} von 3.`;
          })
          .join(" ") || "Aktuell gibt es keine nicht bestandene offene Prüfung."
      );
    }
    default:
      return entry.personalExample ?? "";
  }
}
