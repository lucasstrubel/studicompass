import { FLAGS, LATENCY_MS } from "@/config/demo";
import { program } from "@/data/program";
import { student } from "@/data/student";
import { modules } from "@/data/modules";
import { exams } from "@/data/exams";
import { inbox } from "@/data/inbox";
import { deadlines } from "@/data/deadlines";
import { notifications } from "@/data/notifications";
import { moodleProgress } from "@/data/moodle-progress";
import { rules } from "@/data/rules";
import { offices } from "@/data/offices";
import { assistantCatalog } from "@/data/assistant-catalog";
import { assistantFallback } from "@/data/assistant-fallback";
import type { Channel } from "@/domain/types";
import type { ServiceKey, Services } from "@/services/types";

export interface MockOptions {
  latencyMs?: number;
  shouldFail?: (service: ServiceKey) => boolean;
}

/** Independent in-memory mocks; every response is a fresh copy, never a shared fixture. */
export function createMockServices(options: MockOptions = {}): Services {
  function service<T>(key: ServiceKey, data: T) {
    return {
      async load(): Promise<T> {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, options.latencyMs ?? LATENCY_MS),
        );
        if (options.shouldFail?.(key) ?? FLAGS.simulateErrors) {
          throw new Error(
            "Die Beispieldaten konnten nicht geladen werden. Versuch es erneut.",
          );
        }
        return structuredClone(data);
      },
    };
  }
  const content = (channel: Channel) => ({
    inbox: inbox.filter((item) => item.channel === channel),
    deadlines: deadlines.filter((item) => item.channel === channel),
  });
  return {
    pos: service("pos", {
      program,
      student,
      modules,
      exams,
      ...content("pos"),
    }),
    moodle: service("moodle", {
      progress: moodleProgress,
      ...content("moodle"),
    }),
    mail: service("mail", content("mail")),
    website: service("website", { notifications, ...content("website") }),
    rules: service("rules", { rules, offices }),
    assistant: service("assistant", {
      catalog: assistantCatalog,
      fallback: assistantFallback,
    }),
  };
}
