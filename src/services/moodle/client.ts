import { MoodleError, type MoodleErrorKind } from "./errors";

export type MoodleParams = Record<string, string | number | number[]>;

/** One call of a Moodle web service function; the result is unchecked JSON. */
export interface MoodleClient {
  call: (wsfunction: string, params?: MoodleParams) => Promise<unknown>;
}

export interface MoodleConnection {
  /** Address of the Moodle site, e.g. "http://localhost:8080". */
  baseUrl: string;
  /** Access key of the user ("Sicherheitsschlüssel" in Moodle). */
  token: string;
}

export const MOODLE_TIMEOUT_MS = 10_000;

/** Moodle reports failures with status 200 and an error code in the body. */
const ERROR_KINDS: Record<string, MoodleErrorKind> = {
  invalidtoken: "invalidToken",
  accessexception: "accessDenied",
  nopermissions: "accessDenied",
  requireloginerror: "accessDenied",
  servicenotavailable: "serviceUnavailable",
  enablewsdescription: "serviceUnavailable",
};

/** Moodle expects arrays as `key[0]=…&key[1]=…`. */
export function encodeParams(params: MoodleParams): URLSearchParams {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (Array.isArray(value))
      value.forEach((item, index) => body.set(`${key}[${index}]`, `${item}`));
    else body.set(key, `${value}`);
  return body;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Talks to the REST web services of a Moodle site straight from the browser (ADR 0003). Every
 * failure becomes a MoodleError; the access key travels only to the given site.
 */
export function createMoodleClient(
  connection: MoodleConnection,
  options: { fetch?: typeof fetch; timeoutMs?: number } = {},
): MoodleClient {
  const request = options.fetch ?? fetch;
  const endpoint = `${connection.baseUrl.replace(/\/+$/, "")}/webservice/rest/server.php`;
  return {
    async call(wsfunction, params = {}) {
      const body = encodeParams(params);
      body.set("wstoken", connection.token);
      body.set("moodlewsrestformat", "json");
      body.set("wsfunction", wsfunction);
      const abort = new AbortController();
      const timer = setTimeout(
        () => abort.abort(),
        options.timeoutMs ?? MOODLE_TIMEOUT_MS,
      );
      let response: Response;
      let payload: unknown;
      try {
        response = await request(endpoint, {
          method: "POST",
          body,
          signal: abort.signal,
        });
        if (!response.ok)
          throw new MoodleError(
            response.status === 403 || response.status === 404
              ? "serviceUnavailable"
              : "unexpected",
          );
        payload = await response.json();
      } catch (error) {
        if (error instanceof MoodleError) throw error;
        if (abort.signal.aborted)
          throw new MoodleError("timeout", { cause: error });
        throw new MoodleError(
          error instanceof SyntaxError ? "unexpected" : "network",
          { cause: error },
        );
      } finally {
        clearTimeout(timer);
      }
      if (isRecord(payload) && typeof payload.exception === "string")
        throw new MoodleError(
          ERROR_KINDS[`${payload.errorcode as string}`] ?? "unexpected",
        );
      return payload;
    },
  };
}
