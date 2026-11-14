import { z } from "zod";
import type { MoodleClient, MoodleConnection } from "./client";
import { MOODLE_TIMEOUT_MS } from "./client";
import { MoodleError } from "./errors";

/** Name of the app's file in the user's private files in Moodle. */
export const MOODLE_BACKUP_FILE = "studicompass.json";

/** Moodle as the backend for the user's own entries (ADR 0004): one JSON file in their private files. */
export interface MoodleStorage {
  /** Writes the file, replacing an earlier one; returns when Moodle stored it (ISO instant). */
  save: (text: string) => Promise<string | null>;
  /** The stored text, or null when there is no file yet. */
  load: () => Promise<{ text: string; savedAt: string | null } | null>;
}

const uploaded = z.array(z.object({ itemid: z.number() })).min(1);
const files = z.object({
  files: z.array(
    z.object({
      contextid: z.number(),
      filename: z.string(),
      isdir: z.boolean().default(false),
      /** Unix seconds. */
      timemodified: z.number().nullable().default(null),
    }),
  ),
});

export function createMoodleStorage(
  connection: MoodleConnection,
  client: MoodleClient,
  userId: number,
  options: { fetch?: typeof fetch; timeoutMs?: number } = {},
): MoodleStorage {
  const request = options.fetch ?? fetch;
  const base = connection.baseUrl.replace(/\/+$/, "");

  /** Requests outside the REST endpoint (upload, download) with the same timeout and error mapping. */
  async function send(url: string, init?: RequestInit): Promise<Response> {
    const abort = new AbortController();
    const timer = setTimeout(
      () => abort.abort(),
      options.timeoutMs ?? MOODLE_TIMEOUT_MS,
    );
    try {
      return await request(url, { ...init, signal: abort.signal });
    } catch (error) {
      throw new MoodleError(abort.signal.aborted ? "timeout" : "network", {
        cause: error,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  async function find() {
    const payload = await client.call("core_files_get_files", {
      contextid: -1,
      contextlevel: "user",
      instanceid: userId,
      component: "user",
      filearea: "private",
      itemid: 0,
      filepath: "/",
      filename: "",
    });
    const parsed = files.safeParse(payload);
    if (!parsed.success) throw new MoodleError("unexpected");
    return parsed.data.files.find(
      (file) => !file.isdir && file.filename === MOODLE_BACKUP_FILE,
    );
  }
  const instant = (seconds: number | null | undefined) =>
    seconds ? new Date(seconds * 1000).toISOString() : null;

  return {
    async save(text) {
      const form = new FormData();
      form.set("token", connection.token);
      form.set("filearea", "draft");
      form.set("itemid", "0");
      form.set(
        "file_1",
        new Blob([text], { type: "application/json" }),
        MOODLE_BACKUP_FILE,
      );
      const response = await send(`${base}/webservice/upload.php`, {
        method: "POST",
        body: form,
      });
      const payload: unknown = await response.json().catch(() => null);
      const parsed = uploaded.safeParse(payload);
      if (!parsed.success)
        throw new MoodleError(
          (payload as { errorcode?: string } | null)?.errorcode ===
            "invalidtoken"
            ? "invalidToken"
            : "accessDenied",
        );
      // Moves the uploaded draft into the private files; a file of the same name is replaced.
      await client.call("core_user_add_user_private_files", {
        draftid: parsed.data[0].itemid,
      });
      return instant((await find())?.timemodified);
    },
    async load() {
      const file = await find();
      if (!file) return null;
      // Moodle serves files only with the key as a query parameter.
      const response = await send(
        `${base}/webservice/pluginfile.php/${file.contextid}/user/private/${MOODLE_BACKUP_FILE}?token=${encodeURIComponent(connection.token)}`,
      );
      if (!response.ok) throw new MoodleError("accessDenied");
      return {
        text: await response.text(),
        savedAt: instant(file.timemodified),
      };
    },
  };
}
