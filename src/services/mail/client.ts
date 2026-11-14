import { MailError, type MailErrorKind } from "./errors";

/** Path of the bridge on the server the page comes from (docs/adr/0005). */
export const BRIDGE_URL = "/api/bridge";
export const MAIL_TIMEOUT_MS = 35_000;

export interface MailCredentials {
  /** Account name at the university's mail server. */
  user: string;
  password: string;
}

/** Reads the mailbox through the bridge; the result is unchecked JSON. */
export interface MailClient {
  fetchInbox: () => Promise<unknown>;
}

interface ClientOptions {
  fetch?: typeof fetch;
  timeoutMs?: number;
}

/** Error kinds of the bridge (server/errors.ts) as the user needs to hear about them. */
const ERROR_KINDS: Record<string, MailErrorKind> = {
  auth: "auth",
  tooMany: "tooMany",
  unreachable: "unreachable",
  timeout: "timeout",
  notFound: "unavailable",
  notAvailable: "unavailable",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * A static deployment has no bridge: its server answers every path with the page itself. Anything
 * that is not JSON therefore means "no bridge here".
 */
async function readJson(response: Response): Promise<unknown> {
  if (!/^application\/json\b/i.test(response.headers.get("content-type") ?? ""))
    throw new MailError("unavailable");
  try {
    return (await response.json()) as unknown;
  } catch (error) {
    throw new MailError("unexpected", { cause: error });
  }
}

async function request(
  path: string,
  init: RequestInit,
  options: ClientOptions,
): Promise<unknown> {
  const abort = new AbortController();
  const timer = setTimeout(
    () => abort.abort(),
    options.timeoutMs ?? MAIL_TIMEOUT_MS,
  );
  try {
    const response = await (options.fetch ?? fetch)(BRIDGE_URL + path, {
      ...init,
      signal: abort.signal,
    });
    const payload = await readJson(response);
    if (!response.ok)
      throw new MailError(
        (isRecord(payload) && ERROR_KINDS[`${payload.error as string}`]) ||
          "unexpected",
      );
    return payload;
  } catch (error) {
    if (error instanceof MailError) throw error;
    throw new MailError(abort.signal.aborted ? "timeout" : "network", {
      cause: error,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Whether this server has a bridge that reads mail. */
export async function mailBridgeAvailable(
  options: ClientOptions = {},
): Promise<boolean> {
  try {
    const health = await request("/health", { method: "GET" }, options);
    return (
      isRecord(health) &&
      isRecord(health.channels) &&
      health.channels.mail === true
    );
  } catch {
    return false;
  }
}

/** The password travels only in the body of the request to the bridge, never in an address. */
export function createMailClient(
  credentials: MailCredentials,
  options: ClientOptions = {},
): MailClient {
  return {
    fetchInbox: () =>
      request(
        "/mail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        },
        options,
      ),
  };
}
