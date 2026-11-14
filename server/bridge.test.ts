import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createBridge, type BridgeOptions } from "./bridge.ts";
import { mailTarget, UNIVERSITY_MAIL } from "./config.ts";
import { BridgeError } from "./errors.ts";
import { htmlToText, type BridgeMail } from "./mail.ts";

const mail: BridgeMail = {
  uid: 7,
  from: { name: "Prüfungsverwaltung", address: "pv@hochschule.example" },
  subject: "Raumänderung",
  date: "2027-01-22T13:05:00.000Z",
  text: "Raum A 210",
  seen: false,
};
const credentials = { user: "2212345", password: "geheim-4711" };

let server: Server | undefined;
afterEach(() => server?.close());

async function start(options: BridgeOptions = {}) {
  const fetchInbox = vi.fn<NonNullable<BridgeOptions["fetchInbox"]>>(() =>
    Promise.resolve([mail]),
  );
  server = createServer(
    createBridge({ mail: UNIVERSITY_MAIL, fetchInbox, ...options }),
  );
  await new Promise<void>((resolve) => server?.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${port}`;
  const post = (path: string, body: unknown, headers = {}) =>
    fetch(url + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  return { url, post, fetchInbox };
}

describe("bridge", () => {
  it("says which channels it serves", async () => {
    const { url } = await start();
    const response = await fetch(`${url}/health`);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      ok: true,
      channels: { mail: true, pos: false },
    });
  });

  it("reads the mailbox of the fixed mail server with the given credentials", async () => {
    const { post, fetchInbox } = await start();
    const response = await post("/mail", credentials);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ messages: [mail] });
    expect(fetchInbox).toHaveBeenCalledWith(UNIVERSITY_MAIL, credentials);
  });

  it("ignores a target named by the client", async () => {
    const { post, fetchInbox } = await start();
    await post("/mail", { ...credentials, host: "evil.example", port: 25 });
    expect(fetchInbox).toHaveBeenCalledWith(UNIVERSITY_MAIL, credentials);
  });

  it.each([
    ["no password", { user: "2212345" }],
    ["an empty user", { user: "", password: "x" }],
    ["a user with control characters", { user: "a\r\nb", password: "x" }],
    ["an overlong password", { user: "a", password: "x".repeat(300) }],
    ["no object", "[]"],
    ["broken JSON", "{"],
  ])("refuses %s", async (_, body) => {
    const { post, fetchInbox } = await start();
    const response = await post("/mail", body);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "badRequest" });
    expect(fetchInbox).not.toHaveBeenCalled();
  });

  it("refuses bodies that are not JSON, too large or from another site", async () => {
    const { post, fetchInbox } = await start();
    expect(
      (await post("/mail", credentials, { "Content-Type": "text/plain" }))
        .status,
    ).toBe(400);
    expect(
      (await post("/mail", { ...credentials, padding: "x".repeat(5000) }))
        .status,
    ).toBe(400);
    expect(
      (await post("/mail", credentials, { Origin: "https://evil.example" }))
        .status,
    ).toBe(400);
    expect(fetchInbox).not.toHaveBeenCalled();
  });

  it("passes on why the mail server refused, without any detail", async () => {
    const { post } = await start({
      fetchInbox: () => Promise.reject(new BridgeError("auth")),
    });
    const response = await post("/mail", credentials);
    expect(response.status).toBe(401);
    expect(await response.text()).toBe('{"error":"auth"}');
  });

  it("never echoes credentials or internal messages in an error", async () => {
    const { post } = await start({
      fetchInbox: () =>
        Promise.reject(new Error("LOGIN 2212345 geheim-4711 failed")),
    });
    const response = await post("/mail", credentials);
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('{"error":"unexpected"}');
  });

  it("gives up when the mail server does not answer in time", async () => {
    const { post } = await start({
      timeoutMs: 20,
      fetchInbox: () => new Promise(() => undefined),
    });
    const response = await post("/mail", credentials);
    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({ error: "timeout" });
  });

  it("limits the requests per minute", async () => {
    let time = 0;
    const { post, fetchInbox } = await start({
      maxPerMinute: 2,
      now: () => time,
    });
    await post("/mail", credentials);
    await post("/mail", credentials);
    expect((await post("/mail", credentials)).status).toBe(429);
    expect(fetchInbox).toHaveBeenCalledTimes(2);
    time = 61_000;
    expect((await post("/mail", credentials)).status).toBe(200);
  });

  it("knows no other paths", async () => {
    const { url, post } = await start();
    expect((await fetch(`${url}/mail`)).status).toBe(404);
    expect((await post("/pos", credentials)).status).toBe(404);
  });
});

describe("mail target", () => {
  it("is the mail server of the university by default", () => {
    expect(mailTarget({})).toEqual({
      host: "stud.th-mannheim.de",
      port: 993,
      secure: true,
    });
  });

  it("accepts a sandbox on this machine", () => {
    expect(
      mailTarget({ BRIDGE_MAIL_HOST: "localhost", BRIDGE_MAIL_PORT: "3143" }),
    ).toEqual({ host: "localhost", port: 3143, secure: false });
  });

  it("refuses any other host, so the bridge is no open proxy", () => {
    expect(() => mailTarget({ BRIDGE_MAIL_HOST: "mail.example.org" })).toThrow(
      /sandbox on this machine/,
    );
    expect(() =>
      mailTarget({ BRIDGE_MAIL_HOST: "localhost", BRIDGE_MAIL_PORT: "x" }),
    ).toThrow(/port/);
  });
});

describe("htmlToText", () => {
  it("drops markup, styles and scripts and decodes entities", () => {
    expect(
      htmlToText(
        "<style>p{}</style><p>Gr&uuml;&szlig;e &amp; mehr&#33;</p><script>alert(1)</script><div>Zeile&nbsp;2 &#x20AC; &unknown;</div>",
      ).trim(),
    ).toBe("Grüße & mehr!\n Zeile 2 € &unknown;");
  });
});
