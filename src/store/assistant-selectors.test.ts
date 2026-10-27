import { expect, it } from "vitest";
import { createDemoStore } from "./demo-store";
import { createMockServices } from "@/services/mock";
import { selectAssistantPersonal } from "./assistant-selectors";
import { selectActionableDeadlines, selectNotifications } from "./selectors";

it("P4-01: Resolver berücksichtigen Abmeldung und Rückgängig, aber keine Was-wäre-wenn-Daten", async () => {
  const store = createDemoStore(createMockServices({ latencyMs: 0 }));
  await store.getState().hydrate();
  const entry = store
    .getState()
    .resources.assistant.data!.catalog.find((item) => item.id === "A-05")!;
  expect(selectAssistantPersonal(store.getState(), entry)).toContain(
    "2 Prüfungen",
  );
  store.getState().setWhatIf([{ moduleId: "m-stat", action: "withdraw" }]);
  expect(selectAssistantPersonal(store.getState(), entry)).toContain(
    "2 Prüfungen",
  );
  store.getState().withdrawExam("e-stat-ws26");
  expect(
    selectActionableDeadlines(store.getState()).some(
      (deadline) => deadline.id === "d-stat-abm",
    ),
  ).toBe(false);
  expect(
    selectNotifications(store.getState()).find((item) => item.id === "n-01")
      ?.message,
  ).toContain("Abmeldung simuliert");
  expect(selectAssistantPersonal(store.getState(), entry)).toContain(
    "3 Prüfungen",
  );
  store.getState().undo();
  expect(selectAssistantPersonal(store.getState(), entry)).toContain(
    "2 Prüfungen",
  );
});

it("Gegencheck: Simulationstexte folgen dem Hinweis-Stil, Meilensteine nur bei Verschiebung", async () => {
  const store = createDemoStore(createMockServices({ latencyMs: 0 }));
  await store.getState().hydrate();
  const message = (id: string) =>
    selectNotifications(store.getState()).find((item) => item.id === id)
      ?.message;
  const original = message("n-03");
  store.getState().withdrawExam("e-mkt-ws26");
  expect(message("n-03")).toBe(original);
  store.getState().undo();
  store.getState().withdrawExam("e-stat-ws26");
  expect(message("n-03")).toContain("Simulation");
  store.getState().setHintTone("neutral");
  const neutral = message("n-01");
  store.getState().setHintTone("direct");
  expect(message("n-01")).toContain("Abmeldung simuliert");
  expect(message("n-01")).not.toBe(neutral);
});
