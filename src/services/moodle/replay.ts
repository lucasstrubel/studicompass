import { encodeParams, type MoodleClient, type MoodleParams } from "./client";
import { MoodleError } from "./errors";
import { MOODLE_SCHEMAS, type MoodleFunction } from "./schemas";

/** Checked responses of a Moodle site, keyed by function and parameters (data mode "Aufzeichnung"). */
export interface MoodleRecording {
  /** ISO instant of the recording. */
  recordedAt: string;
  /** Moodle release of the recorded site. */
  release: string;
  calls: Record<string, unknown>;
}

function callKey(wsfunction: string, params: MoodleParams = {}): string {
  const query = encodeParams(params);
  query.sort();
  return `${wsfunction}?${query.toString()}`;
}

/** Answers from a recording instead of the network; the service and the mapping run unchanged. */
export function createReplayClient(recording: MoodleRecording): MoodleClient {
  return {
    call(wsfunction, params) {
      const key = callKey(wsfunction, params);
      return key in recording.calls
        ? Promise.resolve(structuredClone(recording.calls[key]))
        : Promise.reject(new MoodleError("unexpected"));
    },
  };
}

/** Passes calls through and keeps the checked responses, without the access key. */
export function createRecordingClient(inner: MoodleClient) {
  const calls: Record<string, unknown> = {};
  const client: MoodleClient = {
    async call(wsfunction, params) {
      const payload = await inner.call(wsfunction, params);
      const schema = MOODLE_SCHEMAS[wsfunction as MoodleFunction];
      calls[callKey(wsfunction, params)] = schema.parse(payload);
      return payload;
    },
  };
  return { client, calls };
}
