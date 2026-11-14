import { encodeParams, type MoodleClient, type MoodleParams } from "./client";
import { MoodleError } from "./errors";
import { MOODLE_SCHEMAS, type MoodleFunction } from "./schemas";

/** Checked responses of a Moodle site, keyed by function and parameters. */
export type MoodleCalls = Record<string, unknown>;

/**
 * Data mode "Aufzeichnung": the sandbox recorded in consecutive states. Phase 0 is the seeded
 * state, phase 1 follows after the lecturer added a file, an announcement and a grade.
 */
export interface MoodleRecording {
  /** ISO instant of the recording. */
  recordedAt: string;
  /** Moodle release of the recorded site. */
  release: string;
  phases: MoodleCalls[];
}

function callKey(wsfunction: string, params: MoodleParams = {}): string {
  const query = encodeParams(params);
  query.sort();
  return `${wsfunction}?${query.toString()}`;
}

/** Answers from a recording instead of the network; the service and the mapping run unchanged. */
export function createReplayClient(
  recording: MoodleRecording,
  phase = 0,
): MoodleClient {
  // A sync beyond the last recorded state finds nothing new.
  const calls = recording.phases[
    Math.min(Math.max(phase, 0), recording.phases.length - 1)
  ] as MoodleCalls | undefined;
  return {
    call(wsfunction, params) {
      const key = callKey(wsfunction, params);
      return calls && key in calls
        ? Promise.resolve(structuredClone(calls[key]))
        : Promise.reject(new MoodleError("unexpected"));
    },
  };
}

/** Passes calls through and keeps the checked responses, without the access key. */
export function createRecordingClient(inner: MoodleClient) {
  const calls: MoodleCalls = {};
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
