import { beforeAll, describe, expect, it } from "vitest";
import { SANDBOX, SEED_MAILS, seedMailbox } from "../infra/mail/seed.ts";
import { BridgeError } from "./errors.ts";
import { fetchInbox } from "./mail.ts";

// Runs against the mail sandbox (npm run mail:up): a real IMAP server with the example mailbox.
const target = {
  host: SANDBOX.host,
  port: SANDBOX.port,
  secure: SANDBOX.secure,
};
const credentials = { user: SANDBOX.user, password: SANDBOX.password };

describe("reading a mailbox over IMAP", () => {
  beforeAll(seedMailbox);

  it("returns the messages with sender, subject, date and text", async () => {
    const mails = await fetchInbox(target, credentials);
    expect(mails).toHaveLength(SEED_MAILS.length);
    expect(mails[0]).toMatchObject({
      from: {
        name: "Zentrale Prüfungsverwaltung",
        address: "pruefungsverwaltung@hochschule.example",
      },
      subject: "Raumänderung: Klausur Programmierung 2 am 27.01.",
      date: "2027-01-22T13:05:00.000Z",
      seen: false,
    });
    expect(mails[0].text).toContain("findet in Raum A 210 statt");
    expect(mails[0].text).toContain("Viele Grüße\nZentrale Prüfungsverwaltung");
  });

  it("reduces an HTML mail to its text", async () => {
    const mail = (await fetchInbox(target, credentials))[2];
    expect(mail.text).toBe(
      "Liebe Studierende,\nam Mittwoch, 10.02., 14 Uhr informieren wir über Zulassung, Stellensuche & Fristen.\nIhr Praktikantenamt",
    );
  });

  it("copes with a missing subject and sender name", async () => {
    const mail = (await fetchInbox(target, credentials))[3];
    expect(mail).toMatchObject({
      subject: "",
      from: { name: "", address: "bibliothek@hochschule.example" },
    });
  });

  it("leaves the read state on the server untouched", async () => {
    const first = await fetchInbox(target, credentials);
    const second = await fetchInbox(target, credentials);
    expect(first.map((mail) => mail.seen)).toEqual(
      SEED_MAILS.map((mail) => mail.seen),
    );
    expect(second.map((mail) => mail.seen)).toEqual(
      first.map((mail) => mail.seen),
    );
  });

  it("returns only the newest messages when asked for fewer", async () => {
    const mails = await fetchInbox(target, credentials, 2);
    expect(mails.map((mail) => mail.subject)).toEqual([
      "Infoveranstaltung Praxissemester WS 2027/28",
      "",
    ]);
  });

  it("reports a wrong password as an authentication failure", async () => {
    const error = await fetchInbox(target, {
      ...credentials,
      password: "falsch",
    }).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(BridgeError);
    expect((error as BridgeError).kind).toBe("auth");
    expect(JSON.stringify(error)).not.toContain("falsch");
  });

  it("reports a server that is not there as unreachable", async () => {
    const error = await fetchInbox({ ...target, port: 1 }, credentials).catch(
      (caught: unknown) => caught,
    );
    expect((error as BridgeError).kind).toBe("unreachable");
  });
});
