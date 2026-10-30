import { createStore } from "zustand/vanilla";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { DATA_VERSION, DEMO_NOW, DEMO_STORAGE_KEY } from "@/config/demo";
import type {
  Channel,
  CourseLink,
  Coursework,
  CourseworkStatus,
  HintTone,
  Notification,
  PersonalDeadline,
  PersonalDeadlineKind,
  PlanOverride,
  ProfileName,
} from "@/domain/types";
import { parseWebUrl } from "@/lib/url";
import { parseProfileName } from "@/lib/profile";
import { projectPlan } from "@/domain/projection";
import { selectAcademicState } from "./selectors";
import { selectAssistantMatch } from "./assistant-selectors";
import { createMockServices } from "@/services/mock";
import {
  isChannel,
  type ServiceData,
  type ServiceKey,
  type Services,
} from "@/services/types";

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

/** Typing indicator of the assistant (KONZEPT §8 S5: 0.6–1.2 s). */
export const ASSISTANT_DELAY_MS = 800;

/** One question in the assistant conversation; id = catalog entry, null = fallback (KONZEPT §11). */
export interface AssistantMessage {
  question: string;
  id: string | null;
}

export interface DemoState extends Preferences {
  setChannelConnected: (channel: Channel, connected: boolean) => Promise<void>;
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
  };
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
    ...readOwnEntries(value),
  };
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
                moodle: () => services.moodle.load(),
                mail: () => services.mail.load(),
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
            } catch {
              if (requests[key] === request)
                update({
                  ...get().resources[key],
                  status: "error",
                  error:
                    "Die Beispieldaten konnten nicht geladen werden. Versuch es erneut.",
                });
            } finally {
              if (requests[key] === request) pending.delete(key);
            }
          })();
          pending.set(key, task);
          return task;
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
              readNotificationIds:
                get().resources.website.data?.notifications.map(
                  (item) => item.id,
                ) ?? [],
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
            set({
              ...defaultPreferences(),
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
