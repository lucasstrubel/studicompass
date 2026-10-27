import { createStore } from "zustand/vanilla";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { DATA_VERSION, DEMO_NOW, DEMO_STORAGE_KEY } from "@/config/demo";
import type {
  Channel,
  HintTone,
  Notification,
  PlanOverride,
} from "@/domain/types";
import { projectPlan } from "@/domain/projection";
import { selectAcademicState } from "./selectors";
import {
  readStoredTheme,
  writeStoredTheme,
  type ThemePreference,
} from "@/lib/theme";
import { createMockServices } from "@/services/mock";
import type { ServiceData, ServiceKey, Services } from "@/services/types";

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
}

export interface DemoState extends Preferences {
  setChannelConnected: (channel: Channel, connected: boolean) => Promise<void>;
  setNotificationType: (type: Notification["type"], enabled: boolean) => void;
  resources: Resources;
  theme: ThemePreference;
  snapshot: SimulationSnapshot | null;
  whatIf: PlanOverride[];
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
  setTheme: (theme: ThemePreference) => void;
  setHintTone: (tone: HintTone) => void;
  completeOnboarding: (preferences?: {
    goalRegularTime: boolean;
    jobHoursPerWeek: number;
  }) => void;
  resetDemo: () => Promise<void>;
}

function defaultPreferences(): Preferences {
  return {
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
  };
}

function readSnapshot(value: unknown): SimulationSnapshot | null {
  if (!isRecord(value)) return null;
  return {
    withdrawnExamIds: stringArray(value.withdrawnExamIds),
    confirmedExamIds: stringArray(value.confirmedExamIds),
  };
}

/** Persist user changes and the undo point, never fixture copies, loading state, theme, or what-if. */
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
  return createStore<DemoState>()(
    persist(
      (set, get) => {
        async function load<K extends ServiceKey>(
          key: K,
          force = false,
        ): Promise<void> {
          const channel =
            key === "pos"
              ? "pos"
              : key === "moodle"
                ? "moodle"
                : key === "mail"
                  ? "mail"
                  : key === "website"
                    ? "website"
                    : null;
          if (channel && !get().connectedChannels[channel]) return;
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
          theme: readStoredTheme(),
          snapshot: null,
          whatIf: [],
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
          setTheme(theme) {
            writeStoredTheme(theme);
            set({ theme });
          },
          setHintTone: (hintTone) => set({ hintTone }),
          completeOnboarding(preferences) {
            if (
              preferences &&
              (!Number.isFinite(preferences.jobHoursPerWeek) ||
                preferences.jobHoursPerWeek < 0 ||
                preferences.jobHoursPerWeek > 168)
            )
              return;
            set({ ...preferences, onboardingComplete: true });
          },
          async resetDemo() {
            for (const key of SERVICE_KEYS) requests[key]++;
            pending.clear();
            set({
              ...defaultPreferences(),
              resources: emptyResources(),
              snapshot: null,
              whatIf: [],
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
          version === 2
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
