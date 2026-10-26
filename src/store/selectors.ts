import type { AcademicState, Deadline, InboxItem } from "@/domain/types";
import { DEMO_CURRENT_TERM } from "@/config/demo";
import {
  earnedEcts,
  openFoundationModules,
  targetEcts,
} from "@/domain/progress";
import { gradeAverage } from "@/domain/grades";
import { projectPlan } from "@/domain/projection";
import { trafficLight } from "@/domain/rules";
import { semesterNumber } from "@/domain/terms";
import type { DemoState } from "./demo-store";

function academicState(state: DemoState): AcademicState | null {
  const pos = state.resources.pos.data;
  if (!pos) return null;
  return {
    student: {
      ...pos.student,
      goalRegularTime: state.goalRegularTime,
      jobHoursPerWeek: state.jobHoursPerWeek,
    },
    modules: pos.modules,
    exams: pos.exams.map((exam) =>
      exam.status === "registered" && state.withdrawnExamIds.includes(exam.id)
        ? { ...exam, status: "withdrawn" }
        : exam,
    ),
    currentTerm: DEMO_CURRENT_TERM,
  };
}

function inbox(state: DemoState): InboxItem[] {
  const { pos, moodle, mail, website } = state.resources;
  return [pos, moodle, mail, website]
    .flatMap((resource) => resource.data?.inbox ?? [])
    .map((item) => ({
      ...item,
      read: item.read || state.readInboxIds.includes(item.id),
    }))
    .sort((left, right) => right.receivedAt.localeCompare(left.receivedAt));
}

function deadlines(state: DemoState): Deadline[] {
  const { pos, moodle, mail, website } = state.resources;
  return [pos, moodle, mail, website]
    .flatMap((resource) => resource.data?.deadlines ?? [])
    .sort((left, right) => left.dueAt.localeCompare(right.dueAt));
}

function notifications(state: DemoState) {
  return (state.resources.website.data?.notifications ?? []).map((item) => ({
    ...item,
    read: item.read || state.readNotificationIds.includes(item.id),
    message: item.text[state.hintTone],
  }));
}

/** Current progress uses the last completed semester; the projection uses the current semester. */
function progress(state: DemoState) {
  const academic = selectAcademicState(state);
  if (!academic) return null;
  const earned = earnedEcts(academic.modules, academic.exams);
  const target = targetEcts(
    academic.modules,
    semesterNumber(academic.currentTerm, academic.student.startTerm) - 1,
  );
  return {
    earnedEcts: earned,
    targetEcts: target,
    trafficLight:
      projectPlan(academic).trafficLight === "critical"
        ? "critical"
        : trafficLight(earned, target),
    gradeAverage: gradeAverage(academic.modules, academic.exams),
    openFoundationModules: openFoundationModules(
      academic.modules,
      academic.exams,
    ),
  };
}

function plan(state: DemoState) {
  const academic = selectAcademicState(state);
  return academic ? projectPlan(academic, state.whatIf) : null;
}

/** Stable snapshots for React's external-store subscription, scoped to each immutable store state. */
function memoize<T>(selector: (state: DemoState) => T) {
  const cache = new WeakMap<DemoState, { value: T }>();
  return (state: DemoState): T => {
    const cached = cache.get(state);
    if (cached) return cached.value;
    const value = selector(state);
    cache.set(state, { value });
    return value;
  };
}

export const selectAcademicState = memoize(academicState);
export const selectInbox = memoize(inbox);
export const selectDeadlines = memoize(deadlines);
export const selectNotifications = memoize(notifications);
export const selectProgress = memoize(progress);
export const selectPlan = memoize(plan);
