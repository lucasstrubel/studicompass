/** Domain objects; WS years denote the starting year. */
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
  /** Example responsibilities (P5-15). */
  topics?: string[];
}

/** Local display name; the POS fixture and academic calculations remain unchanged (P5-15). */
export interface ProfileName {
  firstName: string;
  lastName: string;
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
  projectTerm: Term | null;
  projectShift: number | null;
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

/** Hint at the top of the Folgen-Check for one exam, in both hint tones. */
export interface DecisionHint {
  examId: string;
  text: Record<HintTone, string>;
}
export interface Notification {
  id: string;
  createdAt: string;
  type: "decision" | "inbox" | "milestone" | "deadline";
  href: string;
  text: Record<HintTone, string>;
  /** Text once the simulation has settled the notification: its exam withdrawn or its milestones moved. */
  simulatedText?: Record<HintTone, string>;
  read: boolean;
  ruleIds: string[];
}

export type AssistantResolver =
  | "nextWithdrawalDeadline"
  | "decisionSummary:e-pr2-ws26"
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
  /** Direct sources for answers such as A-09 that describe offices instead of SPO rules. */
  citations?: Citation[];
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

/** Stand of a Prüfungsvorleistung (P5-13): offen / erbracht / nicht erbracht. */
export type CourseworkStatus = "open" | "done" | "failed";
/** A Prüfungsvorleistung that Niklas enters for a module of the current semester (P5-13, US-25). */
export interface Coursework {
  id: string;
  moduleId: string;
  title: string;
  /** Date only ("2027-01-29"); optional. */
  dueAt?: string;
  status: CourseworkStatus;
}
/** Whether the exam may be taken (DR-13); "none" when no Prüfungsvorleistung is entered. */
export type ExamAdmission = "none" | "open" | "admitted" | "notAdmitted";

export type PersonalDeadlineKind =
  "submission" | "coursework" | "appointment" | "other";
/** A date Niklas enters himself (P5-13, US-21); no channel. */
export interface PersonalDeadline {
  id: string;
  title: string;
  /** Date only or an ISO instant with offset, like channel deadlines. */
  dueAt: string;
  kind: PersonalDeadlineKind;
  moduleId?: string;
}

/** One entry of the deadline list: channel deadlines and own entries side by side (P5-13). */
export interface AgendaItem {
  /** Unique within the list, e.g. "d-pr2-abm", "own-…", "pvl-…". */
  id: string;
  title: string;
  dueAt: string;
  startsAt?: string;
  type: string;
  origin: "channel" | "personal" | "coursework";
  channel?: Channel;
  moduleId?: string;
  examId?: string;
  /** Id of the own entry or Prüfungsvorleistung, for editing. */
  sourceId?: string;
}

/** A link to a course that Niklas adds himself (P5-12); only http(s) addresses. */
export interface CourseLink {
  id: string;
  label: string;
  url: string;
}

export interface MoodleProgress {
  moduleId: string;
  label: string;
  completed?: number;
  total?: number;
  detail?: string;
}

export type MoodleItemKind =
  "file" | "assignment" | "announcement" | "activity";
/** One thing in a Moodle course: a file, an assignment, an announcement or another activity. */
export interface MoodleCourseItem {
  id: string;
  kind: MoodleItemKind;
  title: string;
  /** Section of the course page ("Vorlesung"); announcements have none. */
  section?: string;
  url?: string;
  /** Differs as soon as the item changes in Moodle (file replaced, due date moved). */
  signature: string;
  /** Assignments only. */
  dueAt?: string;
  submitted?: boolean;
  grade?: { points: number; max: number };
}
export interface MoodleCourse {
  id: string;
  /** Module the course belongs to; missing when the course carries no module id. */
  moduleId?: string;
  title: string;
  url: string;
  items: MoodleCourseItem[];
}

/** What the app remembers of an item to notice changes on the next sync. */
export interface MoodleKnownItem {
  signature: string;
  points?: number;
}
/** Keyed by `courseId/itemId`. */
export type MoodleKnown = Record<string, MoodleKnownItem>;

export type MoodleChangeType = "added" | "updated" | "graded";
/** Something that changed in a Moodle course since the last sync ("Neu in Moodle"). */
export interface MoodleChange {
  id: string;
  courseId: string;
  moduleId?: string;
  courseTitle: string;
  kind: MoodleItemKind;
  type: MoodleChangeType;
  title: string;
  url?: string;
  grade?: { points: number; max: number };
  dueAt?: string;
  detectedAt: string;
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
  projectTerm: Term | null;
  projectShift: number | null;
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
