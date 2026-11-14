import { ZodError } from "zod";
import type { MoodleService } from "@/services/types";
import type { MoodleClient, MoodleParams } from "./client";
import { MoodleError } from "./errors";
import { mapMoodle, type MoodleCourseSnapshot } from "./mapping";
import {
  MOODLE_SCHEMAS,
  type MoodleFunction,
  type MoodleResult,
  type MoodleSiteInfo,
} from "./schemas";

export interface MoodleServiceOptions {
  /** "Now" for deciding which due dates are still ahead. */
  now: () => Date;
  timeZone: string;
}

/** Calls a function and checks the response; a response of another shape is an "unexpected" error. */
export async function callMoodle<F extends MoodleFunction>(
  client: MoodleClient,
  wsfunction: F,
  params?: MoodleParams,
): Promise<MoodleResult<F>> {
  const payload = await client.call(wsfunction, params);
  try {
    return MOODLE_SCHEMAS[wsfunction].parse(payload) as MoodleResult<F>;
  } catch (error) {
    if (error instanceof ZodError)
      throw new MoodleError("unexpected", { cause: error });
    throw error;
  }
}

/** Who the access key belongs to; also the cheapest check that address and key work. */
export function fetchSiteInfo(client: MoodleClient): Promise<MoodleSiteInfo> {
  return callMoodle(client, "core_webservice_get_site_info");
}

/**
 * The Moodle channel against the real web services (read only). A site may withhold single
 * functions; the parts that depend on them stay empty instead of failing the whole channel.
 */
export function createMoodleService(
  client: MoodleClient,
  options: MoodleServiceOptions,
): MoodleService {
  return {
    async load() {
      const site = await fetchSiteInfo(client);
      const offered = new Set(site.functions.map((item) => item.name));
      const has = (name: MoodleFunction) =>
        offered.size === 0 || offered.has(name);

      const courses = await callMoodle(client, "core_enrol_get_users_courses", {
        userid: site.userid,
      });
      if (courses.length === 0)
        return { progress: [], deadlines: [], inbox: [] };
      const courseids = courses.map((course) => course.id);

      const [assignments, forums, completions] = await Promise.all([
        has("mod_assign_get_assignments")
          ? callMoodle(client, "mod_assign_get_assignments", { courseids })
          : null,
        has("mod_forum_get_forums_by_courses")
          ? callMoodle(client, "mod_forum_get_forums_by_courses", { courseids })
          : [],
        Promise.all(
          courses.map(async (course) => {
            if (!has("core_completion_get_activities_completion_status"))
              return null;
            const result = await callMoodle(
              client,
              "core_completion_get_activities_completion_status",
              { courseid: course.id, userid: site.userid },
            );
            return result.statuses;
          }),
        ),
      ]);
      const announcements = await Promise.all(
        courses.map(async (course) => {
          const forum = forums.find(
            (item) => item.course === course.id && item.type === "news",
          );
          if (!forum || !has("mod_forum_get_forum_discussions")) return [];
          const result = await callMoodle(
            client,
            "mod_forum_get_forum_discussions",
            { forumid: forum.id },
          );
          return result.discussions;
        }),
      );

      const snapshots: MoodleCourseSnapshot[] = courses.map(
        (course, index) => ({
          course,
          assignments:
            assignments?.courses.find((item) => item.id === course.id)
              ?.assignments ?? [],
          completion: completions[index],
          announcements: announcements[index],
        }),
      );
      return mapMoodle(snapshots, options.now(), options.timeZone);
    },
  };
}
