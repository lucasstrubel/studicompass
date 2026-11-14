/**
 * Calls the bridge on the server the page comes from (docs/adr/0005). The channels behind it (mail,
 * POS) share this transport and give the failures their own German texts.
 */
export const BRIDGE_URL = "/api/bridge";
export const BRIDGE_TIMEOUT_MS = 35_000;

export type BridgeFailureKind =
  | "unavailable"
  | "network"
  | "timeout"
  | "auth"
  | "unreachable"
  | "tooMany"
  | "unexpected";

/** A failed call of the bridge; the channel adapters turn it into their own error. */
export class BridgeFailure extends Error {
  readonly kind: BridgeFailureKind;
  constructor(kind: BridgeFailureKind, options?: ErrorOptions) {
    super(kind, options);
    this.name = "BridgeFailure";
    this.kind = kind;
  }
}

export interface BridgeCredentials {
  /** Account name at the university. */
  user: string;
  password: string;
}

export interface BridgeOptions {
  fetch?: typeof fetch;
  timeoutMs?: number;
}

/** Error kinds of the bridge (server/errors.ts) as the user needs to hear about them. */
const ERROR_KINDS: Record<string, BridgeFailureKind> = {
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
    throw new BridgeFailure("unavailable");
  try {
    return (await response.json()) as unknown;
  } catch (error) {
    throw new BridgeFailure("unexpected", { cause: error });
  }
}

async function request(
  path: string,
  init: RequestInit,
  options: BridgeOptions,
): Promise<unknown> {
  const abort = new AbortController();
  const timer = setTimeout(
    () => abort.abort(),
    options.timeoutMs ?? BRIDGE_TIMEOUT_MS,
  );
  try {
    const response = await (options.fetch ?? fetch)(BRIDGE_URL + path, {
      ...init,
      signal: abort.signal,
    });
    const payload = await readJson(response);
    if (!response.ok)
      throw new BridgeFailure(
        (isRecord(payload) && ERROR_KINDS[`${payload.error as string}`]) ||
          "unexpected",
      );
    return payload;
  } catch (error) {
    if (error instanceof BridgeFailure) throw error;
    throw new BridgeFailure(abort.signal.aborted ? "timeout" : "network", {
      cause: error,
    });
  } finally {
    clearTimeout(timer);
  }
}

export interface BridgeChannels {
  mail: boolean;
  pos: boolean;
}

/** Which channels the bridge of this server reads; none when there is no bridge. */
export async function bridgeChannels(
  options: BridgeOptions = {},
): Promise<BridgeChannels> {
  try {
    const health = await request("/health", { method: "GET" }, options);
    const channels =
      isRecord(health) && isRecord(health.channels) ? health.channels : {};
    return { mail: channels.mail === true, pos: channels.pos === true };
  } catch {
    return { mail: false, pos: false };
  }
}

/** Reads one channel. The password travels only in the body of the request, never in an address. */
export function readChannel(
  channel: keyof BridgeChannels,
  credentials: BridgeCredentials,
  options: BridgeOptions = {},
): Promise<unknown> {
  return request(
    `/${channel}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    },
    options,
  );
}
