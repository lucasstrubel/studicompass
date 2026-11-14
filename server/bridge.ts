import type { IncomingMessage, ServerResponse } from "node:http";
import { mailTarget, type MailTarget } from "./config.ts";
import { BRIDGE_STATUS, BridgeError, type BridgeErrorKind } from "./errors.ts";
import type { BridgeMail, MailCredentials } from "./mail.ts";

/**
 * The bridge: a small stateless server part for the channels a browser cannot reach itself
 * (docs/adr/0005). Every request carries the credentials; nothing is stored or logged, and the
 * targets are fixed. For now it only runs inside the local dev and preview server.
 */
export interface BridgeOptions {
  mail?: MailTarget;
  fetchInbox?: (
    target: MailTarget,
    credentials: MailCredentials,
  ) => Promise<BridgeMail[]>;
  /** Requests to the university per minute, so a loop in the app cannot lock the account. */
  maxPerMinute?: number;
  timeoutMs?: number;
  now?: () => number;
}

export type BridgeHandler = (
  request: IncomingMessage,
  response: ServerResponse,
) => void;

const BODY_MAX_BYTES = 4096;
const USER = /^[\w.@-]{1,64}$/;

function send(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  // A JSON content type forces browsers to ask first (preflight) before another site may post here.
  if (!/^application\/json\b/i.test(request.headers["content-type"] ?? ""))
    throw new BridgeError("badRequest");
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request as AsyncIterable<Buffer>) {
    size += chunk.length;
    if (size > BODY_MAX_BYTES) throw new BridgeError("badRequest");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new BridgeError("badRequest");
  }
}

function readCredentials(body: unknown): MailCredentials {
  const value = (typeof body === "object" && body !== null ? body : {}) as {
    user?: unknown;
    password?: unknown;
  };
  if (
    typeof value.user !== "string" ||
    !USER.test(value.user) ||
    typeof value.password !== "string" ||
    value.password.length === 0 ||
    value.password.length > 256
  )
    throw new BridgeError("badRequest");
  return { user: value.user, password: value.password };
}

/** Requests from another site are refused; the bridge answers only the app it is served with. */
function sameOrigin(request: IncomingMessage): boolean {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
}

function withTimeout<T>(task: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new BridgeError("timeout")), ms);
    task.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new BridgeError("unexpected"));
      },
    );
  });
}

export function createBridge(options: BridgeOptions = {}): BridgeHandler {
  const mail = options.mail ?? mailTarget();
  const fetchInbox =
    options.fetchInbox ??
    (async (target, credentials) =>
      (await import("./mail.ts")).fetchInbox(target, credentials));
  const maxPerMinute = options.maxPerMinute ?? 12;
  const timeoutMs = options.timeoutMs ?? 30_000;
  const now = options.now ?? Date.now;
  let recent: number[] = [];

  function throttle() {
    recent = recent.filter((time) => time > now() - 60_000);
    if (recent.length >= maxPerMinute) throw new BridgeError("tooMany");
    recent.push(now());
  }

  async function route(request: IncomingMessage): Promise<unknown> {
    const path = (request.url ?? "/").split("?")[0];
    if (!sameOrigin(request)) throw new BridgeError("badRequest");
    if (path === "/health" && request.method === "GET")
      return { ok: true, channels: { mail: true, pos: false } };
    if (path === "/mail" && request.method === "POST") {
      const credentials = readCredentials(await readJson(request));
      throttle();
      return {
        messages: await withTimeout(fetchInbox(mail, credentials), timeoutMs),
      };
    }
    throw new BridgeError("notFound");
  }

  return (request, response) => {
    route(request).then(
      (body) => send(response, 200, body),
      (error: unknown) => {
        const kind: BridgeErrorKind =
          error instanceof BridgeError ? error.kind : "unexpected";
        send(response, BRIDGE_STATUS[kind], { error: kind });
      },
    );
  };
}
