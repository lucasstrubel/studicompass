import { describe, expect, it, vi } from "vitest";
import type { Module } from "@/domain/types";
import { createMailClient, mailBridgeAvailable } from "./client";
import { MailError } from "./errors";
import { mapMail, moduleOfMail } from "./mapping";
import { createMailService } from "./service";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
const page = () =>
  new Response("<!doctype html><html></html>", {
    headers: { "Content-Type": "text/html" },
  });
const credentials = { user: "2212345", password: "geheim-4711" };
const modules = [
  { id: "m-pr1", title: "Programmierung" },
  { id: "m-pr2", title: "Programmierung 2" },
  { id: "m-dm", title: "Datenmanagement" },
] as Module[];
const message = {
  uid: 12,
  from: { name: "Zentrale Prüfungsverwaltung", address: "pv@example.org" },
  subject: "Raumänderung: Klausur Programmierung 2 am 27.01.",
  date: "2027-01-22T13:05:00.000Z",
  text: "Liebe Studierende,\n\ndie Klausur findet in Raum A 210 statt.",
  seen: false,
};

async function kindOf(task: Promise<unknown>) {
  const error = await task.catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(MailError);
  return (error as MailError).kind;
}

describe("mail client", () => {
  it("posts the credentials in the body, to the bridge of this server only", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(() =>
      Promise.resolve(json({ messages: [] })),
    );
    await createMailClient(credentials, { fetch }).fetchInbox();
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("/api/bridge/mail");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  });

  it.each([
    ["auth", 401, "auth"],
    ["tooMany", 429, "tooMany"],
    ["unreachable", 502, "unreachable"],
    ["timeout", 504, "timeout"],
    ["notFound", 404, "unavailable"],
    ["unexpected", 500, "unexpected"],
    ["somethingNew", 500, "unexpected"],
  ])("turns the bridge error %s into %s", async (error, status, kind) => {
    const fetch = () => Promise.resolve(json({ error }, status));
    expect(
      await kindOf(createMailClient(credentials, { fetch }).fetchInbox()),
    ).toBe(kind);
  });

  it("reads a page instead of JSON as a server without a bridge", async () => {
    const fetch = () => Promise.resolve(page());
    expect(
      await kindOf(createMailClient(credentials, { fetch }).fetchInbox()),
    ).toBe("unavailable");
    expect(await mailBridgeAvailable({ fetch })).toBe(false);
  });

  it("tells a failed and a slow request apart", async () => {
    expect(
      await kindOf(
        createMailClient(credentials, {
          fetch: () => Promise.reject(new TypeError("Failed to fetch")),
        }).fetchInbox(),
      ),
    ).toBe("network");
    expect(
      await kindOf(
        createMailClient(credentials, {
          timeoutMs: 5,
          fetch: (_, init) =>
            new Promise((_resolve, reject) =>
              init?.signal?.addEventListener("abort", () =>
                reject(new DOMException("aborted", "AbortError")),
              ),
            ),
        }).fetchInbox(),
      ),
    ).toBe("timeout");
  });

  it("never puts the password into an error", async () => {
    const error = await createMailClient(credentials, {
      fetch: () => Promise.resolve(json({ error: "auth" }, 401)),
    })
      .fetchInbox()
      .catch((caught: unknown) => caught);
    expect(`${(error as Error).message}${JSON.stringify(error)}`).not.toContain(
      credentials.password,
    );
  });

  it("recognises a bridge that serves mail", async () => {
    expect(
      await mailBridgeAvailable({
        fetch: () =>
          Promise.resolve(json({ ok: true, channels: { mail: true } })),
      }),
    ).toBe(true);
    expect(
      await mailBridgeAvailable({
        fetch: () =>
          Promise.resolve(json({ ok: true, channels: { mail: false } })),
      }),
    ).toBe(false);
  });
});

describe("mail mapping", () => {
  it("turns a message into an inbox item in German time", () => {
    expect(mapMail([message], modules, "Europe/Berlin")).toEqual({
      deadlines: [],
      inbox: [
        {
          id: "mail-12",
          channel: "mail",
          sender: "Zentrale Prüfungsverwaltung",
          subject: "Raumänderung: Klausur Programmierung 2 am 27.01.",
          preview: "Liebe Studierende, die Klausur findet in Raum A 210 statt.",
          body: "Liebe Studierende,\n\ndie Klausur findet in Raum A 210 statt.",
          receivedAt: "2027-01-22T14:05:00+01:00",
          read: false,
          relevance: "normal",
          moduleId: "m-pr2",
        },
      ],
    });
  });

  it("fills what a mail leaves out", () => {
    const [item] = mapMail(
      [
        {
          ...message,
          from: { name: " ", address: "bibliothek@example.org" },
          subject: "",
          text: "",
          seen: true,
        },
      ],
      modules,
      "Europe/Berlin",
    ).inbox;
    expect(item).toMatchObject({
      sender: "bibliothek@example.org",
      subject: "(Kein Betreff)",
      preview: "",
      body: "Diese Mail enthält keinen Text.",
      read: true,
    });
    expect(item).not.toHaveProperty("moduleId");
  });

  it("shortens a long text to a preview at a word boundary", () => {
    const [item] = mapMail(
      [{ ...message, text: "Wort ".repeat(100) }],
      [],
      "Europe/Berlin",
    ).inbox;
    expect(item.preview.length).toBeLessThanOrEqual(142);
    expect(item.preview.endsWith("Wort …")).toBe(true);
  });

  it("assigns the module with the longest title in the subject", () => {
    expect(moduleOfMail("Klausur PROGRAMMIERUNG 2", modules)).toBe("m-pr2");
    expect(moduleOfMail("Tutorium Programmierung", modules)).toBe("m-pr1");
    expect(moduleOfMail("Mensa geschlossen", modules)).toBeUndefined();
  });
});

describe("mail service", () => {
  const options = { modules: () => modules, timeZone: "Europe/Berlin" };

  it("loads and maps the mailbox", async () => {
    const service = createMailService(
      { fetchInbox: () => Promise.resolve({ messages: [message] }) },
      options,
    );
    expect((await service.load()).inbox[0].id).toBe("mail-12");
  });

  it("rejects a response of another shape instead of showing wrong data", async () => {
    for (const payload of [
      { messages: [{ ...message, date: "gestern" }] },
      { messages: "none" },
      null,
    ])
      expect(
        await kindOf(
          createMailService(
            { fetchInbox: () => Promise.resolve(payload) },
            options,
          ).load(),
        ),
      ).toBe("unexpected");
  });
});
