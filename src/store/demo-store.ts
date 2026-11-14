import { createStore } from "zustand/vanilla";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import {
  DATA_VERSION,
  DEMO_NOW,
  DEMO_STORAGE_KEY,
  DEMO_TIME_ZONE,
} from "@/config/demo";
import type {
  Channel,
  CourseLink,
  Coursework,
  CourseworkStatus,
  CourseworkStep,
  HintTone,
  Module,
  MoodleChange,
  MoodleCourse,
  MoodleKnown,
  Notification,
  PersonalDeadline,
  PersonalDeadlineKind,
  PlanOverride,
  ProfileName,
} from "@/domain/types";
import { parseWebUrl } from "@/lib/url";
import { parseProfileName } from "@/lib/profile";
import { projectPlan } from "@/domain/projection";
import {
  COURSEWORK_EFFORT_MAX,
  COURSEWORK_STEPS_MAX,
  courseworkFromMoodle,
  unlinkedAssignments,
} from "@/domain/coursework";
import { detectMoodleChanges, knownMoodleItems } from "@/domain/moodle-changes";
import { toInstant } from "@/lib/instant";
import { selectAcademicState, selectNotifications } from "./selectors";
import { selectAssistantMatch } from "./assistant-selectors";
import { createMockServices } from "@/services/mock";
import {
  isChannel,
  type MailService,
  type MoodleService,
  type ServiceData,
  type ServiceKey,
  type Services,
} from "@/services/types";
import { MoodleError } from "@/services/moodle/errors";
import type { MoodleStorage } from "@/services/moodle/storage";
import { MailError } from "@/services/mail/errors";
import { MAIL_ID_PREFIX } from "@/services/mail/mapping";
import {
  moodleSourceKey,
  type MoodleSite,
  type MoodleSource,
} from "./moodle-source";

export type { MoodleSite, MoodleSource };
/** The real Moodle adapter, loaded on demand so the demo ships without it. */
export type MoodleResult = { ok: true } | { ok: false; error: string };
const NOT_CONNECTED: MoodleResult = {
  ok: false,
  error: "Verbinde zuerst ein eigenes Moodle.",
};
function moodleFailure(error: unknown): MoodleResult {
  return {
    ok: false,
    error:
      error instanceof MoodleError
        ? error.message
        : "Das hat nicht geklappt. Versuch es erneut.",
  };
}
/** Format of the backup file; raise when the shape of the own entries changes incompatibly. */
const BACKUP_FORMAT = 1;

/** A detected change together with the source it was seen in. */
export type StoredMoodleChange = MoodleChange & { source: string };
const MOODLE_CHANGES_MAX = 50;
/** Upper bound for the stored value; the recording itself has fewer states and stays on its last one. */
const MOODLE_RECORDING_PHASE_MAX = 9;
const MOODLE_CHANGE_PREFIX = "moodle-change-";

export interface MoodleSources {
  /** The recording has several states; each sync moves on to the next one. */
  recording: (phase: number) => Promise<MoodleService>;
  live: (connection: { baseUrl: string; token: string }) => Promise<{
    service: MoodleService;
    site: { siteName: string; userName: string };
    /** Missing in tests that do not exercise the backup. */
    storage?: MoodleStorage;
  }>;
}
// The sandbox is seeded for the demo date and POS stays simulated, so every mode shares the demo clock.
const moodleOptions = { now: () => DEMO_NOW, timeZone: DEMO_TIME_ZONE };
const defaultMoodleSources: MoodleSources = {
  recording: async (phase) =>
    (await import("@/services/moodle")).createRecordedMoodleService(
      moodleOptions,
      phase,
    ),
  live: async (connection) =>
    (await import("@/services/moodle")).connectMoodle(
      connection,
      moodleOptions,
    ),
};
/** The real mail adapter behind the bridge (docs/adr/0005), loaded on demand like the Moodle one. */
export interface MailSources {
  /** Whether the server the page comes from has a bridge. */
  available: () => Promise<boolean>;
  /** Logs in and returns the service for that mailbox; rejects with a MailError. */
  live: (
    credentials: { user: string; password: string },
    modules: () => Module[],
  ) => Promise<{ service: MailService }>;
}
const defaultMailSources: MailSources = {
  available: async () =>
    (await import("@/services/mail")).mailBridgeAvailable(),
  live: async (credentials, modules) =>
    (await import("@/services/mail")).connectMail(credentials, {
      modules,
      timeZone: DEMO_TIME_ZONE,
    }),
};
export type MailBridgeState = "unknown" | "available" | "unavailable";
const LOAD_ERROR =
  "Die Beispieldaten konnten nicht geladen werden. Versuch es erneut.";

export interface LoadState<T> {
  status: "idle" | "loading" | "ready" | "error";
  data: T | null;
  updatedAt: string | null;
  error: string | null;
}
type Resources = { [K in ServiceKey]: LoadState<ServiceData[K]> };
const SERVICE_KEYS = [
  "pos",
  "moodle",
  "mail",
  "website",
  "rules",
  "assistant",
] as const;
interface SimulationSnapshot {
  withdrawnExamIds: string[];
  confirmedExamIds: string[];
}
interface Preferences {
  /** Optional local display name; null uses the student's name from POS (P5-15). */
  profileName: ProfileName | null;
  connectedChannels: Record<Channel, boolean>;
  notificationTypes: Record<Notification["type"], boolean>;
  readInboxIds: string[];
  readNotificationIds: string[];
  withdrawnExamIds: string[];
  confirmedExamIds: string[];
  hintTone: HintTone;
  onboardingComplete: boolean;
  goalRegularTime: boolean;
  jobHoursPerWeek: number;
  /** The assistant's speech bubble was shown; it appears once per demo state (P5-07), a reset shows it again. */
  assistantHintSeen: boolean;
  /** Planner view: hide completed semesters and passed modules (P5-10). */
  plannerHideCompleted: boolean;
  /** Own notes per module id (P5-12, US-23). */
  moduleNotes: Record<string, string>;
  /** Own course links per module id (P5-12, US-24). */
  courseLinks: Record<string, CourseLink[]>;
  /** Own address that replaces the simulated Moodle link of a module (P5-12). */
  moodleUrls: Record<string, string>;
  /** Prüfungsvorleistungen Niklas enters for modules of the current semester (P5-13, US-25). */
  coursework: Coursework[];
  /** Dates Niklas enters himself (P5-13, US-21). */
  personalDeadlines: PersonalDeadline[];
  /** "live" lasts for the session only: after a reload the channel is back on example data. */
  moodleSource: MoodleSource;
  /** Per synced source: what the courses looked like at the last sync. */
  moodleKnown: Record<string, MoodleKnown>;
  /** Changes found by later syncs, newest first ("Neu in Moodle"). */
  moodleChanges: StoredMoodleChange[];
  /** Which recorded state the recording shows; each sync moves on, a reload stays where it was. */
  moodleRecordingPhase: number;
}

/** Upper bounds for own entries, so the local demo state stays small. */
export const NOTE_MAX_LENGTH = 2000;
export const LINK_LABEL_MAX_LENGTH = 60;
export const ENTRY_TITLE_MAX_LENGTH = 80;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
const COURSEWORK_STATUSES: CourseworkStatus[] = ["open", "done", "failed"];
const PERSONAL_KINDS: PersonalDeadlineKind[] = [
  "submission",
  "coursework",
  "appointment",
  "other",
];

function validTitle(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= ENTRY_TITLE_MAX_LENGTH
  );
}
function validDueAt(value: unknown, dateOnly = false): value is string {
  return (
    typeof value === "string" &&
    (DATE_ONLY.test(value) || (!dateOnly && INSTANT.test(value))) &&
    !Number.isNaN(Date.parse(value))
  );
}

function validEffort(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= COURSEWORK_EFFORT_MAX
  );
}
/** The steps of an own plan as stored; entries of another shape are dropped. */
function readSteps(value: unknown): CourseworkStep[] {
  return Array.isArray(value)
    ? value
        .flatMap((step: unknown): CourseworkStep[] =>
          isRecord(step) &&
          typeof step.id === "string" &&
          validTitle(step.title)
            ? [
                {
                  id: step.id,
                  title: step.title.trim(),
                  done: step.done === true,
                },
              ]
            : [],
        )
        .slice(0, COURSEWORK_STEPS_MAX)
    : [];
}
/** Plan and Moodle reference of a Prüfungsvorleistung; empty parts are left out. */
function courseworkExtras(item: {
  steps?: unknown;
  effortHours?: unknown;
  moodleRef?: unknown;
}): Pick<Coursework, "steps" | "effortHours" | "moodleRef"> {
  const steps = readSteps(item.steps);
  return {
    ...(steps.length > 0 ? { steps } : {}),
    ...(validEffort(item.effortHours) ? { effortHours: item.effortHours } : {}),
    ...(typeof item.moodleRef === "string" && item.moodleRef
      ? { moodleRef: item.moodleRef }
      : {}),
  };
}

/** Typing indicator of the assistant (0.6–1.2 s). */
export const ASSISTANT_DELAY_MS = 800;

/** One question in the assistant conversation; id = catalog entry, null = fallback. */
export interface AssistantMessage {
  question: string;
  id: string | null;
}

export interface DemoState extends Preferences {
  setChannelConnected: (channel: Channel, connected: boolean) => Promise<void>;
  /** The connected site in data mode "live", otherwise null; never persisted. */
  moodleSite: MoodleSite | null;
  /** Switches the Moodle channel between example data and the recording and reloads it. */
  setMoodleSource: (source: Exclude<MoodleSource, "live">) => Promise<void>;
  /** Checks address and access key, then loads the channel from that site; the error text is for the user. */
  connectMoodle: (
    baseUrl: string,
    token: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  /** The connected university mailbox, otherwise null (example mails); never persisted. */
  mailAccount: { userName: string } | null;
  /** Whether this server can reach a mailbox at all; the public demo cannot. */
  mailBridge: MailBridgeState;
  checkMailBridge: () => Promise<void>;
  /** Logs in at the mail server and shows that mailbox instead of the example mails. */
  connectMail: (
    user: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  /** Forgets the mailbox and returns to the example mails. */
  disconnectMail: () => Promise<void>;
  /** Syncs the Moodle channel again; changes since the last sync become "Neu in Moodle". */
  refreshMoodle: () => Promise<void>;
  /**
   * What is known about the backup of the own entries in the connected Moodle: when it was last
   * written (ISO instant, by Moodle's clock), "none" when there is no file, null when not looked up yet.
   */
  moodleBackupAt: string | null;
  /** Looks up whether the connected Moodle holds a backup. */
  checkMoodleBackup: () => Promise<MoodleResult>;
  /** Writes the own entries (Prüfungsvorleistungen, notes, links, dates) into the private files in Moodle. */
  saveToMoodle: () => Promise<MoodleResult>;
  /** Replaces the own entries with the backup from Moodle. */
  restoreFromMoodle: () => Promise<MoodleResult>;
  setNotificationType: (type: Notification["type"], enabled: boolean) => void;
  resources: Resources;
  snapshot: SimulationSnapshot | null;
  whatIf: PlanOverride[];
  /** Shared by the assistant page and the assistant window; in memory only, never persisted. */
  assistantThread: AssistantMessage[];
  /** Question whose answer is being prepared; it survives closing the window or changing the page. */
  assistantPending: AssistantMessage | null;
  hydrate: () => Promise<void>;
  retry: (service: ServiceKey) => Promise<void>;
  markRead: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  withdrawExam: (id: string) => boolean;
  undo: () => void;
  confirmAttend: (id: string) => boolean;
  setWhatIf: (overrides: PlanOverride[]) => void;
  clearWhatIf: () => void;
  /** Asks a catalog question (id) or free text; ignored while another answer is pending. */
  askAssistant: (question: string, id?: string) => void;
  markAssistantHintSeen: () => void;
  setPlannerHideCompleted: (hide: boolean) => void;
  setModuleNote: (moduleId: string, text: string) => void;
  /** Adds or updates a course link; returns false for an invalid label or address. */
  saveCourseLink: (
    moduleId: string,
    link: { id?: string; label: string; url: string },
  ) => boolean;
  removeCourseLink: (moduleId: string, id: string) => void;
  /** Sets the own Moodle address (false if invalid); null returns to the simulated link. */
  setMoodleUrl: (moduleId: string, url: string | null) => boolean;
  /** Adds or updates a Prüfungsvorleistung; false for an invalid title or date. */
  saveCoursework: (item: Omit<Coursework, "id"> & { id?: string }) => boolean;
  removeCoursework: (id: string) => void;
  /** Takes assignments of the module's Moodle course over as Prüfungsvorleistungen; returns how many were added. */
  importMoodleCoursework: (moduleId: string, itemIds: string[]) => number;
  /** Adds or updates an own date; false for an invalid title or date (the form checks the demo time). */
  savePersonalDeadline: (
    entry: Omit<PersonalDeadline, "id"> & { id?: string },
  ) => boolean;
  removePersonalDeadline: (id: string) => void;
  setHintTone: (tone: HintTone) => void;
  /** Save all editable profile fields together; false leaves the current profile untouched. */
  saveProfile: (
    profile: ProfileName & {
      goalRegularTime: boolean;
      jobHoursPerWeek: number;
    },
  ) => boolean;
  completeOnboarding: (preferences?: {
    goalRegularTime: boolean;
    jobHoursPerWeek: number;
    profileName?: ProfileName | null;
  }) => void;
  resetDemo: () => Promise<void>;
}

function defaultPreferences(): Preferences {
  return {
    profileName: null,
    connectedChannels: { pos: true, moodle: true, mail: true, website: true },
    notificationTypes: {
      decision: true,
      inbox: true,
      milestone: true,
      deadline: true,
    },
    readInboxIds: [],
    readNotificationIds: [],
    withdrawnExamIds: [],
    confirmedExamIds: [],
    hintTone: "direct",
    onboardingComplete: false,
    goalRegularTime: true,
    jobHoursPerWeek: 15,
    assistantHintSeen: false,
    plannerHideCompleted: false,
    moduleNotes: {},
    courseLinks: {},
    moodleUrls: {},
    coursework: [],
    personalDeadlines: [],
    moodleSource: "demo",
    moodleKnown: {},
    moodleChanges: [],
    moodleRecordingPhase: 0,
  };
}
/** Read marks of real mails belong to one mailbox and go when it is connected or disconnected. */
function withoutMailIds(ids: string[]): string[] {
  return ids.filter((id) => !id.startsWith(MAIL_ID_PREFIX));
}
function emptyResource<T>(): LoadState<T> {
  return { status: "idle", data: null, updatedAt: null, error: null };
}
function emptyResources(): Resources {
  return {
    pos: emptyResource(),
    moodle: emptyResource(),
    mail: emptyResource(),
    website: emptyResource(),
    rules: emptyResource(),
    assistant: emptyResource(),
  };
}

/** Defensive access also supports browser privacy settings that disable storage. */
const safeStorage: StateStorage = {
  getItem(name) {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* Session state remains usable. */
    }
  },
  removeItem(name) {
    try {
      localStorage.removeItem(name);
    } catch {
      /* Session state remains usable. */
    }
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item: unknown): item is string => typeof item === "string")
    : [];
}

function readPreferences(value: unknown): Preferences {
  const defaults = defaultPreferences();
  if (!isRecord(value)) return defaults;
  return {
    profileName: parseProfileName(value.profileName),
    connectedChannels: {
      pos:
        !isRecord(value.connectedChannels) ||
        value.connectedChannels.pos !== false,
      moodle:
        !isRecord(value.connectedChannels) ||
        value.connectedChannels.moodle !== false,
      mail:
        !isRecord(value.connectedChannels) ||
        value.connectedChannels.mail !== false,
      website:
        !isRecord(value.connectedChannels) ||
        value.connectedChannels.website !== false,
    },
    notificationTypes: {
      decision:
        !isRecord(value.notificationTypes) ||
        value.notificationTypes.decision !== false,
      inbox:
        !isRecord(value.notificationTypes) ||
        value.notificationTypes.inbox !== false,
      milestone:
        !isRecord(value.notificationTypes) ||
        value.notificationTypes.milestone !== false,
      deadline:
        !isRecord(value.notificationTypes) ||
        value.notificationTypes.deadline !== false,
    },
    readInboxIds: stringArray(value.readInboxIds),
    readNotificationIds: stringArray(value.readNotificationIds),
    withdrawnExamIds: stringArray(value.withdrawnExamIds),
    confirmedExamIds: stringArray(value.confirmedExamIds),
    hintTone: value.hintTone === "neutral" ? "neutral" : "direct",
    onboardingComplete: value.onboardingComplete === true,
    goalRegularTime:
      typeof value.goalRegularTime === "boolean"
        ? value.goalRegularTime
        : defaults.goalRegularTime,
    jobHoursPerWeek:
      typeof value.jobHoursPerWeek === "number" &&
      Number.isFinite(value.jobHoursPerWeek) &&
      value.jobHoursPerWeek >= 0 &&
      value.jobHoursPerWeek <= 168
        ? value.jobHoursPerWeek
        : defaults.jobHoursPerWeek,
    assistantHintSeen: value.assistantHintSeen === true,
    plannerHideCompleted: value.plannerHideCompleted === true,
    moodleSource: value.moodleSource === "recording" ? "recording" : "demo",
    moodleRecordingPhase:
      typeof value.moodleRecordingPhase === "number" &&
      Number.isInteger(value.moodleRecordingPhase) &&
      value.moodleRecordingPhase >= 0 &&
      value.moodleRecordingPhase <= MOODLE_RECORDING_PHASE_MAX
        ? value.moodleRecordingPhase
        : 0,
    ...readMoodleMemory(value),
    ...readOwnEntries(value),
  };
}

const MOODLE_KINDS = ["file", "assignment", "announcement", "activity"];
const MOODLE_CHANGE_TYPES = ["added", "updated", "graded"];
function readGrade(value: unknown): MoodleChange["grade"] {
  return isRecord(value) &&
    typeof value.points === "number" &&
    typeof value.max === "number"
    ? { points: value.points, max: value.max }
    : undefined;
}
/** What is remembered of earlier syncs; anything of another shape is dropped. */
function readMoodleMemory(value: Record<string, unknown>) {
  const moodleKnown: Record<string, MoodleKnown> = {};
  if (isRecord(value.moodleKnown))
    for (const [source, items] of Object.entries(value.moodleKnown)) {
      if (!isRecord(items)) continue;
      const known: MoodleKnown = {};
      for (const [key, item] of Object.entries(items))
        if (isRecord(item) && typeof item.signature === "string")
          known[key] = {
            signature: item.signature,
            ...(typeof item.points === "number" ? { points: item.points } : {}),
          };
      moodleKnown[source] = known;
    }
  const moodleChanges = Array.isArray(value.moodleChanges)
    ? value.moodleChanges
        .flatMap((item: unknown): StoredMoodleChange[] => {
          if (!isRecord(item)) return [];
          const { id, source, courseId, courseTitle, kind, type, title } = item;
          if (
            typeof id !== "string" ||
            typeof source !== "string" ||
            typeof courseId !== "string" ||
            typeof courseTitle !== "string" ||
            typeof title !== "string" ||
            typeof item.detectedAt !== "string" ||
            !MOODLE_KINDS.includes(kind as string) ||
            !MOODLE_CHANGE_TYPES.includes(type as string)
          )
            return [];
          const grade = readGrade(item.grade);
          const url =
            typeof item.url === "string" ? parseWebUrl(item.url) : null;
          return [
            {
              id,
              source,
              courseId,
              courseTitle,
              title,
              kind: kind as MoodleChange["kind"],
              type: type as MoodleChange["type"],
              detectedAt: item.detectedAt,
              ...(typeof item.moduleId === "string"
                ? { moduleId: item.moduleId }
                : {}),
              ...(url ? { url } : {}),
              ...(grade ? { grade } : {}),
              ...(typeof item.dueAt === "string" ? { dueAt: item.dueAt } : {}),
            },
          ];
        })
        .slice(0, MOODLE_CHANGES_MAX)
    : [];
  return { moodleKnown, moodleChanges };
}

/** A course link as stored; anything else (old shapes, unsafe addresses) is dropped. */
function readCourseLink(value: unknown): CourseLink | null {
  if (!isRecord(value)) return null;
  const { id, label, url } = value;
  if (typeof id !== "string" || typeof label !== "string") return null;
  const safe = typeof url === "string" ? parseWebUrl(url) : null;
  const text = label.trim().slice(0, LINK_LABEL_MAX_LENGTH);
  return safe && text ? { id, label: text, url: safe } : null;
}

function readOwnEntries(value: Record<string, unknown>) {
  const notes: Record<string, string> = {};
  if (isRecord(value.moduleNotes))
    for (const [id, text] of Object.entries(value.moduleNotes))
      if (typeof text === "string" && text.trim())
        notes[id] = text.slice(0, NOTE_MAX_LENGTH);
  const links: Record<string, CourseLink[]> = {};
  if (isRecord(value.courseLinks))
    for (const [id, list] of Object.entries(value.courseLinks)) {
      const valid = Array.isArray(list)
        ? list.flatMap((item) => readCourseLink(item) ?? [])
        : [];
      if (valid.length > 0) links[id] = valid;
    }
  const moodle: Record<string, string> = {};
  if (isRecord(value.moodleUrls))
    for (const [id, url] of Object.entries(value.moodleUrls)) {
      const safe = typeof url === "string" ? parseWebUrl(url) : null;
      if (safe) moodle[id] = safe;
    }
  const coursework = Array.isArray(value.coursework)
    ? value.coursework.flatMap((item: unknown): Coursework[] => {
        if (!isRecord(item)) return [];
        const { id, moduleId, title, dueAt, status } = item;
        if (
          typeof id !== "string" ||
          typeof moduleId !== "string" ||
          !validTitle(title) ||
          !COURSEWORK_STATUSES.includes(status as CourseworkStatus) ||
          (dueAt !== undefined && !validDueAt(dueAt, true))
        )
          return [];
        return [
          {
            id,
            moduleId,
            title: title.trim(),
            status: status as CourseworkStatus,
            ...(dueAt ? { dueAt } : {}),
            ...courseworkExtras(item),
          },
        ];
      })
    : [];
  const personal = Array.isArray(value.personalDeadlines)
    ? value.personalDeadlines.flatMap((item: unknown): PersonalDeadline[] => {
        if (!isRecord(item)) return [];
        const { id, title, dueAt, kind, moduleId } = item;
        if (
          typeof id !== "string" ||
          !validTitle(title) ||
          !validDueAt(dueAt) ||
          !PERSONAL_KINDS.includes(kind as PersonalDeadlineKind)
        )
          return [];
        return [
          {
            id,
            title: title.trim(),
            dueAt,
            kind: kind as PersonalDeadlineKind,
            ...(typeof moduleId === "string" ? { moduleId } : {}),
          },
        ];
      })
    : [];
  return {
    moduleNotes: notes,
    courseLinks: links,
    moodleUrls: moodle,
    coursework,
    personalDeadlines: personal,
  };
}

function readSnapshot(value: unknown): SimulationSnapshot | null {
  if (!isRecord(value)) return null;
  return {
    withdrawnExamIds: stringArray(value.withdrawnExamIds),
    confirmedExamIds: stringArray(value.confirmedExamIds),
  };
}

/** Persist user changes and the undo point, never fixture copies, loading state, what-if, or the assistant conversation. */
function readPersisted(
  value: unknown,
): Preferences & { snapshot: SimulationSnapshot | null } {
  return {
    ...readPreferences(value),
    snapshot: readSnapshot(isRecord(value) ? value.snapshot : null),
  };
}

export function createDemoStore(
  services: Services = createMockServices(),
  storage: StateStorage = safeStorage,
  moodleSources: MoodleSources = defaultMoodleSources,
  mailSources: MailSources = defaultMailSources,
) {
  // A reset invalidates in-flight requests; a retry supersedes older requests for the same resource.
  const requests: Record<ServiceKey, number> = {
    pos: 0,
    moodle: 0,
    mail: 0,
    website: 0,
    rules: 0,
    assistant: 0,
  };
  const pending = new Map<ServiceKey, Promise<void>>();
  let assistantTimer: ReturnType<typeof setTimeout> | undefined;
  // Held outside the state so the access key is never persisted or exposed to the UI.
  let liveMoodle: MoodleService | null = null;
  let liveStorage: MoodleStorage | null = null;
  // Holds the password of the mailbox in its closure; like the access key it never enters the state.
  let liveMail: MailService | null = null;
  return createStore<DemoState>()(
    persist(
      (set, get) => {
        async function load<K extends ServiceKey>(
          key: K,
          force = false,
        ): Promise<void> {
          if (isChannel(key) && !get().connectedChannels[key]) return;
          const active = pending.get(key);
          if (!force && active) return active;
          const request = ++requests[key];
          const update = (value: LoadState<ServiceData[K]>) =>
            set((state) => ({
              resources: { ...state.resources, [key]: value },
            }));
          update({ ...get().resources[key], status: "loading", error: null });
          const task = (async () => {
            try {
              // Keep the key/payload relationship explicit without casting a union result.
              const loaders: {
                [P in ServiceKey]: () => Promise<ServiceData[P]>;
              } = {
                pos: () => services.pos.load(),
                moodle: async () => {
                  const source = get().moodleSource;
                  if (source === "live" && liveMoodle) return liveMoodle.load();
                  if (source === "recording")
                    return (
                      await moodleSources.recording(get().moodleRecordingPhase)
                    ).load();
                  return services.moodle.load();
                },
                mail: () => (liveMail ?? services.mail).load(),
                website: () => services.website.load(),
                rules: () => services.rules.load(),
                assistant: () => services.assistant.load(),
              };
              const data = await loaders[key]();
              if (requests[key] !== request) return;
              update({
                status: "ready",
                data,
                updatedAt: DEMO_NOW.toISOString(),
                error: null,
              });
              if (key === "moodle")
                rememberMoodle((data as ServiceData["moodle"]).courses);
            } catch (error) {
              if (requests[key] === request)
                update({
                  ...get().resources[key],
                  status: "error",
                  error:
                    error instanceof MoodleError || error instanceof MailError
                      ? error.message
                      : LOAD_ERROR,
                });
            } finally {
              if (requests[key] === request) pending.delete(key);
            }
          })();
          pending.set(key, task);
          return task;
        }
        /** The first sync of a source is the baseline; later syncs report what changed against it. */
        function rememberMoodle(courses: MoodleCourse[]) {
          const source = moodleSourceKey(get());
          if (!source) return;
          const known = get().moodleKnown[source] as MoodleKnown | undefined;
          const found = known
            ? detectMoodleChanges(
                known,
                courses,
                toInstant(DEMO_NOW, DEMO_TIME_ZONE),
              ).map((change) => ({ ...change, source }))
            : [];
          set((state) => ({
            moodleKnown: {
              ...state.moodleKnown,
              [source]: knownMoodleItems(courses),
            },
            moodleChanges: [
              ...found,
              ...state.moodleChanges.filter(
                (old) => !found.some((change) => change.id === old.id),
              ),
            ].slice(0, MOODLE_CHANGES_MAX),
          }));
        }
        const snapshot = (): SimulationSnapshot => ({
          withdrawnExamIds: [...get().withdrawnExamIds],
          confirmedExamIds: [...get().confirmedExamIds],
        });
        return {
          ...defaultPreferences(),
          resources: emptyResources(),
          snapshot: null,
          whatIf: [],
          assistantThread: [],
          assistantPending: null,
          hydrate: async () => {
            await Promise.all(SERVICE_KEYS.map((key) => load(key)));
          },
          retry: (key) => load(key, true),
          moodleSite: null,
          async setMoodleSource(source) {
            liveMoodle = null;
            liveStorage = null;
            // The recording starts over each time, so its story can be replayed.
            const moodleKnown = { ...get().moodleKnown };
            delete moodleKnown.recording;
            set((state) => ({
              moodleSource: source,
              moodleSite: null,
              moodleBackupAt: null,
              moodleRecordingPhase: 0,
              moodleKnown,
              moodleChanges: state.moodleChanges.filter(
                (change) => change.source !== "recording",
              ),
              readInboxIds: state.readInboxIds.filter(
                (id) => !id.startsWith(MOODLE_CHANGE_PREFIX),
              ),
              readNotificationIds: state.readNotificationIds.filter(
                (id) => !id.startsWith(MOODLE_CHANGE_PREFIX),
              ),
            }));
            await load("moodle", true);
          },
          moodleBackupAt: null,
          async checkMoodleBackup() {
            if (!liveStorage) return NOT_CONNECTED;
            try {
              const backup = await liveStorage.load();
              set({
                moodleBackupAt: backup ? (backup.savedAt ?? "none") : "none",
              });
              return { ok: true };
            } catch (error) {
              return moodleFailure(error);
            }
          },
          async saveToMoodle() {
            if (!liveStorage) return NOT_CONNECTED;
            try {
              const savedAt = await liveStorage.save(
                JSON.stringify({
                  app: "studicompass",
                  format: BACKUP_FORMAT,
                  ...readOwnEntries({ ...get() }),
                }),
              );
              set({ moodleBackupAt: savedAt ?? "none" });
              return { ok: true };
            } catch (error) {
              return moodleFailure(error);
            }
          },
          async restoreFromMoodle() {
            if (!liveStorage) return NOT_CONNECTED;
            try {
              const backup = await liveStorage.load();
              if (!backup) {
                set({ moodleBackupAt: "none" });
                return {
                  ok: false,
                  error: "In diesem Moodle liegt noch keine Sicherung.",
                };
              }
              let parsed: unknown = null;
              try {
                parsed = JSON.parse(backup.text);
              } catch {
                /* handled below */
              }
              if (
                !isRecord(parsed) ||
                parsed.app !== "studicompass" ||
                parsed.format !== BACKUP_FORMAT
              )
                return {
                  ok: false,
                  error:
                    "Die Sicherung in Moodle lässt sich nicht lesen. Deine Einträge hier bleiben unverändert.",
                };
              // The same reader as for the browser storage: anything of another shape is dropped.
              set({
                ...readOwnEntries(parsed),
                moodleBackupAt: backup.savedAt ?? "none",
              });
              return { ok: true };
            } catch (error) {
              return moodleFailure(error);
            }
          },
          async refreshMoodle() {
            if (get().moodleSource === "recording")
              set((state) => ({
                moodleRecordingPhase: Math.min(
                  state.moodleRecordingPhase + 1,
                  MOODLE_RECORDING_PHASE_MAX,
                ),
              }));
            await load("moodle", true);
          },
          async connectMoodle(baseUrl, token) {
            const address = parseWebUrl(baseUrl)?.replace(/\/+$/, "");
            if (!address || !token.trim())
              return {
                ok: false,
                error:
                  "Gib die Adresse deines Moodle und den Zugriffsschlüssel an.",
              };
            try {
              const { service, site, storage } = await moodleSources.live({
                baseUrl: address,
                token: token.trim(),
              });
              liveMoodle = service;
              liveStorage = storage ?? null;
              set({
                moodleBackupAt: null,
                moodleSource: "live",
                moodleSite: { baseUrl: address, ...site },
              });
            } catch (error) {
              return {
                ok: false,
                error:
                  error instanceof MoodleError
                    ? error.message
                    : "Die Verbindung zu Moodle ist fehlgeschlagen. Versuch es erneut.",
              };
            }
            await load("moodle", true);
            return { ok: true };
          },
          mailAccount: null,
          mailBridge: "unknown",
          async checkMailBridge() {
            const available = await mailSources.available().catch(() => false);
            set({ mailBridge: available ? "available" : "unavailable" });
          },
          async connectMail(user, password) {
            const userName = user.trim();
            if (!userName || !password)
              return {
                ok: false,
                error: "Gib deine Benutzerkennung und dein Passwort an.",
              };
            try {
              const { service } = await mailSources.live(
                { user: userName, password },
                () => get().resources.pos.data?.modules ?? [],
              );
              liveMail = service;
            } catch (error) {
              return {
                ok: false,
                error:
                  error instanceof MailError
                    ? error.message
                    : "Die Verbindung zum Postfach ist fehlgeschlagen. Versuch es erneut.",
              };
            }
            set((state) => ({
              mailAccount: { userName },
              readInboxIds: withoutMailIds(state.readInboxIds),
            }));
            await load("mail", true);
            return { ok: true };
          },
          async disconnectMail() {
            liveMail = null;
            set((state) => ({
              mailAccount: null,
              readInboxIds: withoutMailIds(state.readInboxIds),
            }));
            await load("mail", true);
          },
          async setChannelConnected(channel, connected) {
            if (!connected) {
              requests[channel]++;
              pending.delete(channel);
              set((state) => ({
                connectedChannels: {
                  ...state.connectedChannels,
                  [channel]: false,
                },
                resources: {
                  ...state.resources,
                  [channel]: {
                    ...state.resources[channel],
                    status: state.resources[channel].data ? "ready" : "idle",
                    error: null,
                  },
                },
              }));
              return;
            }
            set((state) => ({
              connectedChannels: {
                ...state.connectedChannels,
                [channel]: true,
              },
            }));
            await load(channel, true);
          },
          setNotificationType: (type, enabled) =>
            set((state) => ({
              notificationTypes: {
                ...state.notificationTypes,
                [type]: enabled,
              },
            })),
          markRead: (id) =>
            set((state) => ({
              readInboxIds: [...new Set([...state.readInboxIds, id])],
            })),
          markNotificationRead: (id) =>
            set((state) => ({
              readNotificationIds: [
                ...new Set([...state.readNotificationIds, id]),
              ],
            })),
          markAllNotificationsRead: () =>
            set({
              readNotificationIds: selectNotifications(get()).map(
                (item) => item.id,
              ),
            }),
          withdrawExam(id) {
            const exam = get().resources.pos.data?.exams.find(
              (item) => item.id === id,
            );
            const deadline = exam?.withdrawalDeadline
              ? Date.parse(exam.withdrawalDeadline)
              : NaN;
            if (
              !exam ||
              exam.status !== "registered" ||
              get().withdrawnExamIds.includes(id) ||
              !Number.isFinite(deadline) ||
              deadline < DEMO_NOW.getTime()
            )
              return false;
            set({
              snapshot: snapshot(),
              withdrawnExamIds: [...get().withdrawnExamIds, id],
              confirmedExamIds: get().confirmedExamIds.filter(
                (item) => item !== id,
              ),
              whatIf: [],
            });
            return true;
          },
          undo() {
            const saved = get().snapshot;
            if (saved) set({ ...saved, snapshot: null, whatIf: [] });
          },
          confirmAttend(id) {
            const exam = get().resources.pos.data?.exams.find(
              (item) => item.id === id,
            );
            if (
              !exam ||
              exam.status !== "registered" ||
              get().withdrawnExamIds.includes(id)
            )
              return false;
            set({
              snapshot: snapshot(),
              confirmedExamIds: [...new Set([...get().confirmedExamIds, id])],
            });
            return true;
          },
          setWhatIf(overrides) {
            const state = selectAcademicState(get());
            if (!state) throw new Error("Lade zuerst die Beispieldaten.");
            projectPlan(state, overrides);
            set({ whatIf: structuredClone(overrides) });
          },
          clearWhatIf: () => set({ whatIf: [] }),
          askAssistant(question, id) {
            const text = question.trim();
            if (!text || get().assistantPending) return;
            const message = {
              question: text,
              id: id ?? selectAssistantMatch(get(), text),
            };
            set({ assistantPending: message });
            assistantTimer = setTimeout(() => {
              set((state) => ({
                assistantThread: [...state.assistantThread, message],
                assistantPending: null,
              }));
            }, ASSISTANT_DELAY_MS);
          },
          markAssistantHintSeen: () => set({ assistantHintSeen: true }),
          setPlannerHideCompleted: (plannerHideCompleted) =>
            set({ plannerHideCompleted }),
          setModuleNote(moduleId, text) {
            const notes = { ...get().moduleNotes };
            if (text.trim()) notes[moduleId] = text.slice(0, NOTE_MAX_LENGTH);
            else delete notes[moduleId];
            set({ moduleNotes: notes });
          },
          saveCourseLink(moduleId, link) {
            const url = parseWebUrl(link.url);
            const label = link.label.trim();
            if (!url || !label || label.length > LINK_LABEL_MAX_LENGTH)
              return false;
            const list = get().courseLinks[moduleId] ?? [];
            const saved = { id: link.id ?? crypto.randomUUID(), label, url };
            set({
              courseLinks: {
                ...get().courseLinks,
                [moduleId]: link.id
                  ? list.map((item) => (item.id === link.id ? saved : item))
                  : [...list, saved],
              },
            });
            return true;
          },
          removeCourseLink(moduleId, id) {
            const list = (get().courseLinks[moduleId] ?? []).filter(
              (item) => item.id !== id,
            );
            const links = { ...get().courseLinks, [moduleId]: list };
            if (list.length === 0) delete links[moduleId];
            set({ courseLinks: links });
          },
          saveCoursework(item) {
            if (
              !validTitle(item.title) ||
              (item.dueAt !== undefined && !validDueAt(item.dueAt, true))
            )
              return false;
            const saved: Coursework = {
              id: item.id ?? crypto.randomUUID(),
              moduleId: item.moduleId,
              title: item.title.trim(),
              status: item.status,
              ...(item.dueAt ? { dueAt: item.dueAt } : {}),
              ...courseworkExtras(item),
            };
            // An unknown id (e.g. undo after deleting) adds the entry again.
            const list = get().coursework;
            set({
              coursework: list.some((entry) => entry.id === saved.id)
                ? list.map((entry) => (entry.id === saved.id ? saved : entry))
                : [...list, saved],
            });
            return true;
          },
          removeCoursework: (id) =>
            set({
              coursework: get().coursework.filter((item) => item.id !== id),
            }),
          importMoodleCoursework(moduleId, itemIds) {
            const course = get().resources.moodle.data?.courses.find(
              (item) => item.moduleId === moduleId,
            );
            if (!course) return 0;
            const existing = get().coursework;
            const added = unlinkedAssignments(
              existing.filter((item) => item.moduleId === moduleId),
              course,
            )
              .filter((item) => itemIds.includes(item.id))
              .map((item) => ({
                id: crypto.randomUUID(),
                ...courseworkFromMoodle(moduleId, course, item),
                title: item.title.trim().slice(0, ENTRY_TITLE_MAX_LENGTH),
              }))
              .filter((item) => validTitle(item.title));
            set({ coursework: [...existing, ...added] });
            return added.length;
          },
          savePersonalDeadline(entry) {
            if (!validTitle(entry.title) || !validDueAt(entry.dueAt))
              return false;
            const saved: PersonalDeadline = {
              id: entry.id ?? crypto.randomUUID(),
              title: entry.title.trim(),
              dueAt: entry.dueAt,
              kind: entry.kind,
              ...(entry.moduleId ? { moduleId: entry.moduleId } : {}),
            };
            // An unknown id (e.g. undo after deleting) adds the entry again.
            const list = get().personalDeadlines;
            set({
              personalDeadlines: list.some((item) => item.id === saved.id)
                ? list.map((item) => (item.id === saved.id ? saved : item))
                : [...list, saved],
            });
            return true;
          },
          removePersonalDeadline: (id) =>
            set({
              personalDeadlines: get().personalDeadlines.filter(
                (item) => item.id !== id,
              ),
            }),
          setMoodleUrl(moduleId, input) {
            const urls = { ...get().moodleUrls };
            if (input === null) delete urls[moduleId];
            else {
              const url = parseWebUrl(input);
              if (!url) return false;
              urls[moduleId] = url;
            }
            set({ moodleUrls: urls });
            return true;
          },
          setHintTone: (hintTone) => set({ hintTone }),
          saveProfile(profile) {
            const name = parseProfileName(profile);
            if (
              !name ||
              !Number.isFinite(profile.jobHoursPerWeek) ||
              profile.jobHoursPerWeek < 0 ||
              profile.jobHoursPerWeek > 168 ||
              typeof profile.goalRegularTime !== "boolean"
            )
              return false;
            set({
              profileName: name,
              goalRegularTime: profile.goalRegularTime,
              jobHoursPerWeek: profile.jobHoursPerWeek,
            });
            return true;
          },
          completeOnboarding(preferences) {
            if (
              preferences &&
              (!Number.isFinite(preferences.jobHoursPerWeek) ||
                preferences.jobHoursPerWeek < 0 ||
                preferences.jobHoursPerWeek > 168)
            )
              return;
            if (
              preferences?.profileName !== undefined &&
              preferences.profileName !== null &&
              !parseProfileName(preferences.profileName)
            )
              return;
            set({
              ...preferences,
              ...(preferences?.profileName !== undefined
                ? { profileName: parseProfileName(preferences.profileName) }
                : {}),
              onboardingComplete: true,
            });
          },
          async resetDemo() {
            for (const key of SERVICE_KEYS) requests[key]++;
            pending.clear();
            clearTimeout(assistantTimer);
            liveMoodle = null;
            liveStorage = null;
            liveMail = null;
            set({
              ...defaultPreferences(),
              mailAccount: null,
              moodleSite: null,
              moodleBackupAt: null,
              resources: emptyResources(),
              snapshot: null,
              whatIf: [],
              assistantThread: [],
              assistantPending: null,
            });
            await get().hydrate();
          },
        };
      },
      {
        name: DEMO_STORAGE_KEY,
        version: DATA_VERSION,
        storage: createJSONStorage(() => storage),
        partialize: (state) => readPersisted(state),
        migrate: (persisted, version) =>
          version === 2 || version === 3
            ? readPersisted(persisted)
            : { ...defaultPreferences(), snapshot: null },
        merge: (persisted, current) => ({
          ...current,
          ...readPersisted(persisted),
        }),
      },
    ),
  );
}

export const demoStore = createDemoStore();
