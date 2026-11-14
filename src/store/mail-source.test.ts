import { describe, expect, it, vi } from "vitest";
import { DEMO_STORAGE_KEY } from "@/config/demo";
import { createMockServices } from "@/services/mock";
import { MailError } from "@/services/mail/errors";
import type { MailData } from "@/services/types";
import { createDemoStore, type MailSources } from "./demo-store";
import { selectInbox } from "./selectors";

const liveData: MailData = {
  deadlines: [],
  inbox: [
    {
      id: "mail-7",
      channel: "mail",
      sender: "Studierendensekretariat",
      subject: "Rückmeldung zum Sommersemester",
      preview: "Die Rückmeldefrist beginnt.",
      body: "Die Rückmeldefrist beginnt.",
      receivedAt: "2027-01-24T08:00:00+01:00",
      read: false,
      relevance: "normal",
    },
  ],
};
function makeStore(sources: Partial<MailSources> = {}) {
  const live = vi.fn<MailSources["live"]>(() =>
    Promise.resolve({
      service: { load: () => Promise.resolve(structuredClone(liveData)) },
    }),
  );
  const store = createDemoStore(
    createMockServices({ latencyMs: 0 }),
    undefined,
    undefined,
    { available: () => Promise.resolve(true), live, ...sources },
  );
  return { store, live };
}
const persisted = () => localStorage.getItem(DEMO_STORAGE_KEY) ?? "";
const mailSubjects = (store: ReturnType<typeof makeStore>["store"]) =>
  selectInbox(store.getState())
    .filter((item) => item.channel === "mail")
    .map((item) => item.subject);

describe("mail source (ADR 0005)", () => {
  it("starts on the example mails", async () => {
    const { store } = makeStore();
    await store.getState().hydrate();
    expect(store.getState().mailAccount).toBeNull();
    expect(mailSubjects(store)).toContain(
      "Raumänderung: Klausur Programmierung 2 am 27.01.",
    );
  });

  it("connects a mailbox and shows only its mails in the mail channel", async () => {
    const { store, live } = makeStore();
    await store.getState().hydrate();
    const result = await store
      .getState()
      .connectMail(" 2212345 ", " geheim 4711 ");

    expect(result).toEqual({ ok: true });
    // The user name is trimmed, the password is passed on exactly as typed.
    expect(live.mock.calls[0][0]).toEqual({
      user: "2212345",
      password: " geheim 4711 ",
    });
    expect(store.getState().mailAccount).toEqual({ userName: "2212345" });
    expect(mailSubjects(store)).toEqual(["Rückmeldung zum Sommersemester"]);
    // The other channels keep their data.
    expect(
      selectInbox(store.getState()).some((item) => item.channel === "moodle"),
    ).toBe(true);
  });

  it("hands the modules of the study plan to the adapter", async () => {
    const { store, live } = makeStore();
    await store.getState().hydrate();
    await store.getState().connectMail("2212345", "geheim");
    expect(live.mock.calls[0][1]().map((module) => module.id)).toContain(
      "m-pr2",
    );
  });

  it("never stores the password or the connection", async () => {
    const { store } = makeStore();
    await store.getState().hydrate();
    await store.getState().connectMail("2212345", "geheim-4711");
    store.getState().markRead("mail-7");

    expect(persisted()).not.toContain("geheim-4711");
    expect(JSON.stringify(store.getState())).not.toContain("geheim-4711");
    expect(persisted()).not.toContain("2212345");
    expect(persisted()).not.toContain("mailAccount");
  });

  it("reports a refused login and stays on the example mails", async () => {
    const { store } = makeStore({
      live: () => Promise.reject(new MailError("auth")),
    });
    await store.getState().hydrate();
    const result = await store.getState().connectMail("2212345", "falsch");

    expect(result).toEqual({
      ok: false,
      error: expect.stringContaining("Anmeldung am Mailserver") as string,
    });
    expect(JSON.stringify(result)).not.toContain("falsch");
    expect(store.getState().mailAccount).toBeNull();
    expect(mailSubjects(store)).toContain(
      "Raumänderung: Klausur Programmierung 2 am 27.01.",
    );
  });

  it("asks for both fields before it calls anything", async () => {
    const { store, live } = makeStore();
    for (const [user, password] of [
      ["", "geheim"],
      ["2212345", ""],
    ])
      expect(await store.getState().connectMail(user, password)).toMatchObject({
        ok: false,
      });
    expect(live).not.toHaveBeenCalled();
  });

  it("shows the reason when the mailbox fails later and keeps the mails", async () => {
    let fail = false;
    const { store } = makeStore({
      live: () =>
        Promise.resolve({
          service: {
            load: () =>
              fail
                ? Promise.reject(new MailError("unreachable"))
                : Promise.resolve(liveData),
          },
        }),
    });
    await store.getState().connectMail("2212345", "geheim");
    fail = true;
    await store.getState().retry("mail");
    expect(store.getState().resources.mail).toMatchObject({
      status: "error",
      error: expect.stringContaining("nicht erreichbar") as string,
      data: liveData,
    });
  });

  it("returns to the example mails on disconnect and forgets read marks of the mailbox", async () => {
    const { store } = makeStore();
    await store.getState().hydrate();
    await store.getState().connectMail("2212345", "geheim");
    store.getState().markRead("mail-7");
    store.getState().markRead("i-02");
    await store.getState().disconnectMail();

    expect(store.getState().mailAccount).toBeNull();
    expect(store.getState().readInboxIds).toEqual(["i-02"]);
    expect(mailSubjects(store)).not.toContain("Rückmeldung zum Sommersemester");
  });

  it("drops the mailbox on a reset", async () => {
    const { store } = makeStore();
    await store.getState().connectMail("2212345", "geheim");
    await store.getState().resetDemo();
    expect(store.getState().mailAccount).toBeNull();
    expect(mailSubjects(store)).toContain(
      "Raumänderung: Klausur Programmierung 2 am 27.01.",
    );
  });

  it("finds out whether this server has a bridge", async () => {
    const { store } = makeStore();
    expect(store.getState().mailBridge).toBe("unknown");
    await store.getState().checkMailBridge();
    expect(store.getState().mailBridge).toBe("available");

    const without = makeStore({
      available: () => Promise.reject(new Error("offline")),
    }).store;
    await without.getState().checkMailBridge();
    expect(without.getState().mailBridge).toBe("unavailable");
  });
});
