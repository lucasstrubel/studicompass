import { DEMO_NOW } from "@/config/demo";
import type { InboxItem } from "@/domain/types";
import { formatShortDateTime } from "@/lib/format";
import type { DemoState } from "./demo-store";
import { selectAcademicState, selectDeadlines } from "./selectors";

export function selectInboxReason(state: DemoState, item: InboxItem): string {
  if (item.relevance !== "high") return "";
  const upcoming = (date: string) =>
    Date.parse(date) >= DEMO_NOW.getTime() &&
    Date.parse(date) <= DEMO_NOW.getTime() + 7 * 86400000;
  const exam = selectAcademicState(state)?.exams.find(
    (exam) =>
      exam.moduleId === item.moduleId &&
      exam.status === "registered" &&
      exam.date &&
      upcoming(exam.date),
  );
  if (exam?.date)
    return `Wichtig, weil: Prüfung am ${formatShortDateTime(new Date(exam.date))}.`;
  const deadline = selectDeadlines(state).find(
    (deadline) =>
      deadline.moduleId === item.moduleId &&
      item.moduleId &&
      upcoming(deadline.dueAt),
  );
  if (deadline)
    return `Wichtig, weil: ${deadline.title} bis ${formatShortDateTime(new Date(deadline.dueAt))}.`;
  return item.moduleId
    ? "Wichtig, weil: Diese Nachricht betrifft deine anstehende Prüfung oder Abgabe."
    : "Wichtig, weil: Diese Nachricht betrifft dein Praxissemester als nächsten Meilenstein.";
}
