import { afterEach, describe, expect, it, vi } from "vitest";
import { createMoodleClient, encodeParams } from "./client";
import { MoodleError } from "./errors";

const connection = { baseUrl: "http://moodle.example/", token: "key" };

function respond(body: unknown, status = 200) {
  return vi.fn<typeof fetch>(() =>
    Promise.resolve(
      new Response(typeof body === "string" ? body : JSON.stringify(body), {
        status,
      }),
    ),
  );
}
async function kindOf(promise: Promise<unknown>) {
  const error = await promise.catch((reason: unknown) => reason);
  expect(error).toBeInstanceOf(MoodleError);
  return (error as MoodleError).kind;
}

afterEach(() => vi.useRealTimers());

describe("encodeParams", () => {
  it("writes arrays the way Moodle expects them", () => {
    expect(encodeParams({ userid: 3, courseids: [2, 5] }).toString()).toBe(
      "userid=3&courseids%5B0%5D=2&courseids%5B1%5D=5",
    );
  });
});

describe("createMoodleClient", () => {
  it("posts function, format and access key to the REST endpoint", async () => {
    const request = respond({ sitename: "Sandbox" });
    const client = createMoodleClient(connection, { fetch: request });

    await expect(
      client.call("core_webservice_get_site_info", { userid: 3 }),
    ).resolves.toEqual({ sitename: "Sandbox" });

    const [url, init] = request.mock.calls[0];
    expect(url).toBe("http://moodle.example/webservice/rest/server.php");
    expect(init?.method).toBe("POST");
    expect(Object.fromEntries(init?.body as URLSearchParams)).toEqual({
      userid: "3",
      wstoken: "key",
      moodlewsrestformat: "json",
      wsfunction: "core_webservice_get_site_info",
    });
  });

  it.each([
    ["invalidtoken", "invalidToken"],
    ["accessexception", "accessDenied"],
    ["servicenotavailable", "serviceUnavailable"],
    ["somethingelse", "unexpected"],
  ])("maps the Moodle error code %s to %s", async (errorcode, kind) => {
    const client = createMoodleClient(connection, {
      fetch: respond({ exception: "moodle_exception", errorcode }),
    });
    expect(await kindOf(client.call("any"))).toBe(kind);
  });

  it("treats a missing endpoint as a site without web services", async () => {
    const client = createMoodleClient(connection, {
      fetch: respond("Not found", 404),
    });
    expect(await kindOf(client.call("any"))).toBe("serviceUnavailable");
  });

  it("reports a response that is not JSON as unexpected", async () => {
    const client = createMoodleClient(connection, {
      fetch: respond("<html>Login</html>"),
    });
    expect(await kindOf(client.call("any"))).toBe("unexpected");
  });

  it("reports a failed request as a network error", async () => {
    const client = createMoodleClient(connection, {
      fetch: vi.fn<typeof fetch>(() =>
        Promise.reject(new TypeError("Failed to fetch")),
      ),
    });
    expect(await kindOf(client.call("any"))).toBe("network");
  });

  it("gives up after the timeout", async () => {
    vi.useFakeTimers();
    const request = vi.fn<typeof fetch>(
      (_url, init) =>
        new Promise((_resolve, reject) =>
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          ),
        ),
    );
    const client = createMoodleClient(connection, {
      fetch: request,
      timeoutMs: 50,
    });
    const kind = kindOf(client.call("any"));
    await vi.advanceTimersByTimeAsync(50);
    expect(await kind).toBe("timeout");
  });

  it("never puts the access key into the error", async () => {
    const client = createMoodleClient(
      { baseUrl: "http://moodle.example", token: "secret-key" },
      { fetch: respond({ exception: "x", errorcode: "invalidtoken" }) },
    );
    const error = await client.call("any").catch((reason: unknown) => reason);
    expect(JSON.stringify(error) + String(error)).not.toContain("secret-key");
  });
});
