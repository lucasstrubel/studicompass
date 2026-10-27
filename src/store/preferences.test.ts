import { expect, it } from "vitest";
import { createDemoStore } from "./demo-store";
import { createMockServices } from "@/services/mock";
import { DEMO_STORAGE_KEY } from "@/config/demo";

it("P4-05: Trennen behält Daten, Verbinden lädt neu, Einstellungen überstehen Neuladen", async () => {
  const services = createMockServices({ latencyMs: 0 });
  const store = createDemoStore(services);
  await store.getState().hydrate();
  const old = store.getState().resources.moodle.data;
  await store.getState().setChannelConnected("moodle", false);
  expect(store.getState().resources.moodle.data).toBe(old);
  store.getState().setNotificationType("inbox", false);
  const reloaded = createDemoStore(services);
  expect(reloaded.getState().connectedChannels.moodle).toBe(false);
  expect(reloaded.getState().notificationTypes.inbox).toBe(false);
  await store.getState().setChannelConnected("moodle", true);
  expect(store.getState().resources.moodle.status).toBe("ready");
  await store.getState().resetDemo();
  expect(store.getState().connectedChannels.moodle).toBe(true);
  expect(store.getState().notificationTypes.inbox).toBe(true);
});
it("P4-05: additive Migration erhält alte Einstellungen und validiert neue Felder", () => {
  localStorage.setItem(
    DEMO_STORAGE_KEY,
    JSON.stringify({
      version: 2,
      state: {
        hintTone: "neutral",
        readInboxIds: ["i-02"],
        onboardingComplete: true,
        notificationTypes: { inbox: "no" },
        connectedChannels: { pos: false },
      },
    }),
  );
  const store = createDemoStore(createMockServices({ latencyMs: 0 }));
  expect(store.getState()).toMatchObject({
    hintTone: "neutral",
    readInboxIds: ["i-02"],
    onboardingComplete: true,
    notificationTypes: { inbox: true },
    connectedChannels: { pos: false, mail: true },
  });
});
it("P4-05: verspätete Ladeantwort nach Trennen wird verworfen", async () => {
  const services = createMockServices({ latencyMs: 0 });
  const original = services.mail.load;
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  services.mail.load = async () => {
    await gate;
    return original();
  };
  const store = createDemoStore(services);
  const loading = store.getState().hydrate();
  await store.getState().setChannelConnected("mail", false);
  release();
  await loading;
  expect(store.getState().resources.mail.data).toBeNull();
  expect(store.getState().resources.mail.status).toBe("idle");
});
