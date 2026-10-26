/** Domain objects from KONZEPT §10.1; WS years denote the starting year. */
export type Season = "WS" | "SS";
export interface Term {
  season: Season;
  year: number;
}
export type Offering = "WS" | "SS" | "BOTH";
export type Phase = "foundation" | "main";
export type Channel = "pos" | "moodle" | "mail" | "website";

export interface Citation {
  document: string;
  /** Only specify a section after verification. */
  section?: string;
  summary: string;
  asOf?: string;
  /** Unverified citations must be labelled „Beispiel“ in the UI. */
  verified: boolean;
}

export interface Office {
  id: string;
  name: string;
  email: string;
  hours?: string;
}

export interface Module {
  id: string;
  title: string;
  ects: number;
  plannedSemester: number;
  phase: Phase;
  offering: Offering;
  examType: string;
  description: string;
  lecturer?: string;
  isMilestone?: "internship" | "project" | "thesis";
}

export type ExamStatus = "passed" | "failed" | "registered" | "withdrawn";
export interface ExamRecord {
  id: string;
  moduleId: string;
  term: Term;
  status: ExamStatus;
  date?: string;
  room?: string;
  withdrawalDeadline?: string;
  grade?: number;
  /** Withdrawal does not count as an attempt (DR-5). */
  attempt?: number;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  matriculationNo: string;
  email?: string;
  startTerm: Term;
  goalRegularTime: boolean;
  jobHoursPerWeek: number;
}

export interface Deadline {
  id: string;
  title: string;
  dueAt: string;
  startsAt?: string;
  type: string;
  channel: Channel;
  moduleId?: string;
  examId?: string;
}

export interface InboxItem {
  id: string;
  channel: Channel;
  sender: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string;
  read: boolean;
  relevance: "high" | "normal";
  moduleId?: string;
}

export interface Rule {
  id: string;
  title: string;
  citation: Citation;
  officeId?: string;
  params: Record<string, number | string>;
}

export type TrafficLight = "onTrack" | "tight" | "critical";
export type Severity = "info" | "tight" | "critical";
export interface Consequence {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  ruleId?: string;
}

export type DecisionOption = "attendPass" | "attendFail" | "withdraw";
export interface DecisionOutcome {
  option: DecisionOption;
  status: "projected" | "blocked";
  blockedModuleIds: string[];
  nextAttemptTerm?: Term;
  attemptsUsed: number;
  ectsEndOfTerm: number;
  targetEndOfTerm: number;
  trafficLight: TrafficLight;
  internshipTerm: Term | null;
  internshipShift: number | null;
  graduationTerm: Term | null;
  openFoundationAfterTerm: number;
  consequences: Consequence[];
}

export interface Program {
  id: string;
  title: string;
  university: string;
  totalEcts: number;
  regularSemesters: number;
  foundationSemesters: number;
  citation: Citation;
}

export type HintTone = "neutral" | "direct";
export interface Notification {
  id: string;
  type: "decision" | "inbox" | "milestone" | "deadline";
  href: string;
  text: Record<HintTone, string>;
  read: boolean;
  ruleIds: string[];
}

export type AssistantResolver =
  | "nextWithdrawalDeadline"
  | "decisionSummary:e-stat-ws26"
  | "openFoundationModules"
  | "attemptsOverview"
  | "openFoundationAfterTerm"
  | "progressSummary"
  | "gradeAverage";

export interface AssistantAction {
  label: string;
  href: string;
}

export interface AssistantEntry {
  id: string;
  question: string;
  suggested: boolean;
  keywords: string[];
  shortAnswer: string;
  resolver?: AssistantResolver;
  personalExample?: string;
  details?: string;
  ruleIds: string[];
  officeIds: string[];
  actions: AssistantAction[];
  followUpIds: string[];
}

export interface AssistantFallback {
  id: "F-01";
  question: string;
  answer: string;
  officeIds: string[];
  actionLabel: string;
  draft: string;
}

export interface MoodleProgress {
  moduleId: string;
  label: string;
  completed?: number;
  total?: number;
  detail?: string;
}

/** Explicit input for pure calculations; no store, data or system-clock dependency. */
export interface AcademicState {
  student: Student;
  modules: Module[];
  exams: ExamRecord[];
  currentTerm: Term;
}

export type PlanOverride =
  | { moduleId: string; action: "withdraw" | "fail" }
  | { moduleId: string; action: "move"; term: Term };

export interface PlannedModule {
  moduleId: string;
  term: Term;
  passed: boolean;
}

export interface TermProjection {
  term: Term;
  ects: number;
  cumulativeEcts: number;
  targetEcts: number;
  trafficLight: TrafficLight;
}

export interface PlanProjection {
  status: "projected" | "blocked";
  blockedModuleIds: string[];
  modules: PlannedModule[];
  terms: TermProjection[];
  foundationCompletionTerm: Term | null;
  internshipTerm: Term | null;
  internshipShift: number | null;
  graduationTerm: Term | null;
  ectsEndOfTerm: number;
  targetEndOfTerm: number;
  trafficLight: TrafficLight;
  openFoundationAfterTerm: number;
  consequences: Consequence[];
}

export interface ProjectedPlan extends PlanProjection {
  status: "projected";
  foundationCompletionTerm: Term;
  internshipTerm: Term;
  internshipShift: number;
  graduationTerm: Term;
}
