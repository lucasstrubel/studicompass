import type {
  AcademicState,
  Consequence,
  Deadline,
  DecisionOutcome,
  ExamRecord,
  InboxItem,
  Module,
  MoodleProgress,
  PlanProjection,
  Rule,
  Term,
} from "@/domain/types";
import { DEMO_CURRENT_TERM, DEMO_NOW } from "@/config/demo";
import { compareDecision, hasSpecialRuleImpact } from "@/domain/decision";
import {
  earnedEcts,
  openFoundationModules,
  targetEcts,
} from "@/domain/progress";
import { gradeAverage } from "@/domain/grades";
import { allowedMoveTerms, projectPlan } from "@/domain/projection";
import { trafficLight } from "@/domain/rules";
import { compare, next, semesterNumber } from "@/domain/terms";
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

/** Projection without what-if overrides: the real plan, also while the planner simulates. */
function basePlan(state: DemoState) {
  const academic = selectAcademicState(state);
  return academic ? projectPlan(academic) : null;
}

export interface CurrentExam {
  exam: ExamRecord;
  module: Module;
  progress: MoodleProgress | null;
}

/** Exams of the current semester that are registered or (simulated) withdrawn, by exam date. */
function currentExams(state: DemoState): CurrentExam[] {
  const academic = selectAcademicState(state);
  if (!academic) return [];
  const progress = state.resources.moodle.data?.progress ?? [];
  return academic.exams
    .filter(
      (exam) =>
        compare(exam.term, academic.currentTerm) === 0 &&
        (exam.status === "registered" || exam.status === "withdrawn"),
    )
    .flatMap((exam) => {
      const module = academic.modules.find((item) => item.id === exam.moduleId);
      if (!module) return [];
      return [
        {
          exam,
          module,
          progress:
            progress.find((item) => item.moduleId === module.id) ?? null,
        },
      ];
    })
    .sort((left, right) =>
      (left.exam.date ?? "").localeCompare(right.exam.date ?? ""),
    );
}

/** The first deadline after DEMO_NOW (US-05); a withdrawal deadline ends with the (simulated) withdrawal. */
function nextDeadline(state: DemoState): Deadline | null {
  const settled = new Set(
    (selectAcademicState(state)?.exams ?? [])
      .filter((exam) => exam.status !== "registered")
      .map((exam) => exam.id),
  );
  return (
    selectDeadlines(state).find(
      (deadline) =>
        new Date(deadline.dueAt) > DEMO_NOW &&
        !(deadline.examId && settled.has(deadline.examId)),
    ) ?? null
  );
}

export interface ImportantDecision {
  notificationId: string;
  message: string;
  exam: ExamRecord;
  module: Module;
  ruleIds: string[];
}

/**
 * "Jetzt wichtig" (KONZEPT §8 S1): decision notifications whose exam is still registered, whose withdrawal
 * deadline lies after DEMO_NOW and where a special rule applies; at most two.
 */
function importantDecisions(state: DemoState): ImportantDecision[] {
  const academic = selectAcademicState(state);
  if (!academic) return [];
  return selectNotifications(state)
    .filter((item) => item.type === "decision")
    .flatMap((item) => {
      const examId = /^\/entscheidung\/([^/?#]+)$/.exec(item.href)?.[1];
      const exam = academic.exams.find((entry) => entry.id === examId);
      const module = academic.modules.find(
        (entry) => entry.id === exam?.moduleId,
      );
      if (
        !exam ||
        !module ||
        exam.status !== "registered" ||
        !exam.withdrawalDeadline ||
        new Date(exam.withdrawalDeadline) <= DEMO_NOW
      )
        return [];
      try {
        if (!hasSpecialRuleImpact(compareDecision(academic, exam.id)))
          return [];
      } catch {
        return [];
      }
      return [
        {
          notificationId: item.id,
          message: item.message,
          exam,
          module,
          ruleIds: item.ruleIds,
        },
      ];
    })
    .slice(0, 2);
}

export interface RecentGrade {
  exam: ExamRecord;
  module: Module;
}

/** The three most recent passed exams (right column "Letzte Noten"). */
function recentGrades(state: DemoState): RecentGrade[] {
  const academic = selectAcademicState(state);
  if (!academic) return [];
  return academic.exams
    .filter((exam) => exam.status === "passed" && exam.grade !== undefined)
    .sort((left, right) => (right.date ?? "").localeCompare(left.date ?? ""))
    .slice(0, 3)
    .flatMap((exam) => {
      const module = academic.modules.find((item) => item.id === exam.moduleId);
      return module ? [{ exam, module }] : [];
    });
}

export interface MilestoneSummary {
  internshipTerm: Term | null;
  internshipShift: number | null;
  graduationTerm: Term | null;
  openFoundation: Module[];
  registeredNow: Module[];
  /** Open foundation modules that are not registered now, with the term the plan expects them in. */
  later: { module: Module; term: Term }[];
}

/** Next milestone (KONZEPT §8 S1 no. 4): internship term and what is still missing for it (DR-6). */
function milestone(state: DemoState): MilestoneSummary | null {
  const plan = selectBasePlan(state);
  const progress = selectProgress(state);
  if (!plan || !progress) return null;
  const registered = new Set(
    selectCurrentExams(state)
      .filter((item) => item.exam.status === "registered")
      .map((item) => item.module.id),
  );
  const open = progress.openFoundationModules;
  return {
    internshipTerm: plan.internshipTerm,
    internshipShift: plan.internshipShift,
    graduationTerm: plan.graduationTerm,
    openFoundation: open,
    registeredNow: open.filter((module) => registered.has(module.id)),
    later: open
      .filter((module) => !registered.has(module.id))
      .flatMap((module) => {
        const term = plan.modules.find(
          (item) => item.moduleId === module.id,
        )?.term;
        return term ? [{ module, term }] : [];
      }),
  };
}

function rulesById(state: DemoState): Record<string, Rule> {
  return Object.fromEntries(
    (state.resources.rules.data?.rules ?? []).map((rule) => [rule.id, rule]),
  );
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
export const selectBasePlan = memoize(basePlan);
export const selectCurrentExams = memoize(currentExams);
export const selectNextDeadline = memoize(nextDeadline);
export const selectImportantDecisions = memoize(importantDecisions);
export const selectRecentGrades = memoize(recentGrades);
export const selectMilestone = memoize(milestone);
export const selectRulesById = memoize(rulesById);

export type DecisionView =
  | { kind: "unknown" }
  | { kind: "settled"; exam: ExamRecord; module: Module }
  | { kind: "blocked"; exam: ExamRecord; module: Module; reason: string }
  | {
      kind: "ready";
      exam: ExamRecord;
      module: Module;
      outcomes: DecisionOutcome[];
      /** Hints of the current plan that apply whatever Niklas decides (e.g. DR-10 load). */
      baseHints: Consequence[];
      hint: string | null;
      regularGraduationTerm: Term;
      confirmed: boolean;
    };

function decisionView(state: DemoState, examId: string): DecisionView {
  const academic = selectAcademicState(state);
  const program = state.resources.pos.data?.program;
  const plan = selectBasePlan(state);
  if (!academic || !program || !plan) return { kind: "unknown" };
  const exam = academic.exams.find((entry) => entry.id === examId);
  const module = academic.modules.find((entry) => entry.id === exam?.moduleId);
  if (!exam || !module) return { kind: "unknown" };
  if (
    exam.status !== "registered" ||
    compare(exam.term, academic.currentTerm) !== 0
  )
    return { kind: "settled", exam, module };
  let outcomes: DecisionOutcome[];
  try {
    outcomes = compareDecision(academic, exam.id);
  } catch (error) {
    return {
      kind: "blocked",
      exam,
      module,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
  let regularGraduationTerm = academic.student.startTerm;
  for (let semester = 1; semester < program.regularSemesters; semester++)
    regularGraduationTerm = next(regularGraduationTerm);
  const hint = state.resources.rules.data?.decisionHints.find(
    (item) => item.examId === exam.id,
  );
  return {
    kind: "ready",
    exam,
    module,
    outcomes,
    // Only hints that no option changes; e.g. the DR-10 load differs when withdrawing Marketing (48 vs. 42).
    baseHints: plan.consequences.filter(
      (hint) =>
        !outcomes.some((outcome) =>
          outcome.consequences.some((item) => item.id === hint.id),
        ),
    ),
    hint: hint ? hint.text[state.hintTone] : null,
    regularGraduationTerm,
    confirmed: state.confirmedExamIds.includes(exam.id),
  };
}

const decisionCache = new WeakMap<DemoState, Map<string, DecisionView>>();

/** Folgen-Check of one exam (KONZEPT §8 S4); cached per store state and exam, like the other selectors. */
export function selectDecision(state: DemoState, examId: string): DecisionView {
  let byExam = decisionCache.get(state);
  if (!byExam) {
    byExam = new Map();
    decisionCache.set(state, byExam);
  }
  let view = byExam.get(examId);
  if (!view) {
    view = decisionView(state, examId);
    byExam.set(examId, view);
  }
  return view;
}

/**
 * The exam whose simulated decision "Rückgängig" would reverse: the one decision between the snapshot and
 * the current state. Undo controls of other exams must not call undo (P3-03 review).
 */
export function selectUndoableExamId(state: DemoState): string | null {
  const saved = state.snapshot;
  if (!saved) return null;
  const changed = [
    ...state.withdrawnExamIds.filter(
      (id) => !saved.withdrawnExamIds.includes(id),
    ),
    ...state.confirmedExamIds.filter(
      (id) => !saved.confirmedExamIds.includes(id),
    ),
  ];
  return changed.length === 1 ? changed[0] : null;
}

export type TimelineStatus = "passed" | "registered" | "retake" | "planned";

export interface TimelineModule {
  module: Module;
  status: TimelineStatus;
  grade?: number;
  /** Registered exam of the current term; links to the Folgen-Check. */
  examId?: string;
  /** Term in the real plan when the simulation moved this module. */
  movedFrom: Term | null;
}

export interface TimelineTerm {
  term: Term;
  semester: number;
  ects: number;
  earnedEcts: number;
  modules: TimelineModule[];
  milestones: ("foundationEnd" | "internship" | "project" | "thesis")[];
}

export interface Timeline {
  terms: TimelineTerm[];
  /** Plan shown: the what-if projection while simulating, the real plan otherwise. */
  plan: PlanProjection;
  basePlan: PlanProjection;
  simulating: boolean;
}

/** Studienverlauf (KONZEPT §8 S2): semesters with modules, status, ECTS and milestone markers. */
function timeline(state: DemoState): Timeline | null {
  const academic = selectAcademicState(state);
  const plan = selectPlan(state);
  const basePlan = selectBasePlan(state);
  if (!academic || !plan || !basePlan) return null;
  const { modules, exams, currentTerm, student } = academic;
  const baseTerms = new Map(
    basePlan.modules.map((item) => [item.moduleId, item.term]),
  );
  const statusOf = (
    module: Module,
  ): Omit<TimelineModule, "module" | "movedFrom"> => {
    const history = exams.filter((exam) => exam.moduleId === module.id);
    const passed = history.find((exam) => exam.status === "passed");
    if (passed) return { status: "passed", grade: passed.grade };
    const registered = history.find(
      (exam) =>
        exam.status === "registered" && compare(exam.term, currentTerm) === 0,
    );
    if (registered) return { status: "registered", examId: registered.id };
    return { status: history.length > 0 ? "retake" : "planned" };
  };
  const milestoneTerm = (kind: "internship" | "project" | "thesis") => {
    const module = modules.find((item) => item.isMilestone === kind);
    return module
      ? plan.modules.find((item) => item.moduleId === module.id)?.term
      : undefined;
  };
  const markers: [
    TimelineTerm["milestones"][number],
    Term | null | undefined,
  ][] = [
    ["foundationEnd", plan.foundationCompletionTerm],
    ["internship", plan.internshipTerm],
    ["project", milestoneTerm("project")],
    ["thesis", milestoneTerm("thesis")],
  ];

  const terms: TimelineTerm[] = plan.terms.map((item) => {
    const inTerm = plan.modules
      .filter((entry) => compare(entry.term, item.term) === 0)
      .flatMap((entry) => {
        const module = modules.find(
          (candidate) => candidate.id === entry.moduleId,
        );
        if (!module) return [];
        const baseTerm = baseTerms.get(module.id);
        return [
          {
            module,
            ...statusOf(module),
            movedFrom:
              baseTerm && compare(baseTerm, entry.term) !== 0 ? baseTerm : null,
          },
        ];
      });
    return {
      term: item.term,
      semester: semesterNumber(item.term, student.startTerm),
      ects: item.ects,
      earnedEcts: inTerm
        .filter((entry) => entry.status === "passed")
        .reduce((sum, entry) => sum + entry.module.ects, 0),
      modules: inTerm,
      milestones: markers
        .filter(([, term]) => term && compare(term, item.term) === 0)
        .map(([kind]) => kind),
    };
  });
  return { terms, plan, basePlan, simulating: state.whatIf.length > 0 };
}

export const selectTimeline = memoize(timeline);

/** Whether a module may be moved at all in the what-if (DR-4; passed modules stay put). */
export function selectCanMove(state: DemoState, moduleId: string): boolean {
  const academic = selectAcademicState(state);
  return academic ? allowedMoveTerms(academic, moduleId, 1).length > 0 : false;
}

/**
 * Terms the "Verschieben nach …" menu offers (US-10): allowed by DR-4 and actually reached together with
 * the other active moves – a milestone shift can push a module later than an earlier target. At most four.
 */
export function selectMoveTargets(state: DemoState, moduleId: string): Term[] {
  const academic = selectAcademicState(state);
  const plan = selectPlan(state);
  if (!academic || !plan) return [];
  const others = state.whatIf.filter((item) => item.moduleId !== moduleId);
  const now = plan.modules.find((item) => item.moduleId === moduleId)?.term;
  return allowedMoveTerms(academic, moduleId, 8)
    .filter((term) => {
      if (now && compare(now, term) === 0) return false;
      try {
        const placed = projectPlan(academic, [
          ...others,
          { moduleId, action: "move", term },
        ]).modules.find((item) => item.moduleId === moduleId)?.term;
        return placed !== undefined && compare(placed, term) === 0;
      } catch {
        return false;
      }
    })
    .slice(0, 4);
}
