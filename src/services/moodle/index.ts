import recording from "@/data/recordings/moodle.json";
import type { MoodleService } from "@/services/types";
import { createMoodleClient, type MoodleConnection } from "./client";
import { createReplayClient } from "./replay";
import {
  createMoodleService,
  fetchSiteInfo,
  type MoodleServiceOptions,
} from "./service";

export interface MoodleSite {
  siteName: string;
  userName: string;
}

/** Data mode "Aufzeichnung": recorded responses of the sandbox, no network. */
export function createRecordedMoodleService(
  options: MoodleServiceOptions,
  phase = 0,
): MoodleService {
  return createMoodleService(createReplayClient(recording, phase), options);
}

/** Data mode "Live": checks address and access key first, then returns the service for that site. */
export async function connectMoodle(
  connection: MoodleConnection,
  options: MoodleServiceOptions,
): Promise<{ service: MoodleService; site: MoodleSite }> {
  const client = createMoodleClient(connection);
  const info = await fetchSiteInfo(client);
  return {
    service: createMoodleService(client, options),
    site: { siteName: info.sitename, userName: info.fullname },
  };
}
