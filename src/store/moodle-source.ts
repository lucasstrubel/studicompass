/** Where the Moodle channel gets its data (ADR 0002): example data, a recording of the sandbox, or a connected site. */
export type MoodleSource = "demo" | "recording" | "live";

/** The connected Moodle site; the access key itself never enters the state. */
export interface MoodleSite {
  baseUrl: string;
  siteName: string;
  userName: string;
}

/** Identifies what was synced: the recording or one connected site; null for the example data. */
export function moodleSourceKey(state: {
  moodleSource: MoodleSource;
  moodleSite: MoodleSite | null;
}): string | null {
  if (state.moodleSource === "recording") return "recording";
  return state.moodleSource === "live" && state.moodleSite
    ? `live:${state.moodleSite.baseUrl}`
    : null;
}
