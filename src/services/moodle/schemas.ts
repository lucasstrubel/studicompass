import { z } from "zod";

/**
 * The parts of the Moodle responses the app reads (Moodle 4.5, see docs/adr/0004-moodle-spike.md).
 * Unknown fields are dropped, so recordings stay small and only checked data reaches the mapping.
 */
const siteInfo = z.object({
  sitename: z.string(),
  userid: z.number(),
  fullname: z.string(),
  release: z.string().optional(),
  functions: z.array(z.object({ name: z.string() })).default([]),
});

const courses = z.array(
  z.object({
    id: z.number(),
    shortname: z.string(),
    fullname: z.string(),
    /** Empty when the site does not maintain it. */
    idnumber: z.string().default(""),
  }),
);

const assignments = z.object({
  courses: z.array(
    z.object({
      id: z.number(),
      assignments: z.array(
        z.object({
          id: z.number(),
          cmid: z.number(),
          name: z.string(),
          /** Unix seconds; 0 means no due date. */
          duedate: z.number(),
        }),
      ),
    }),
  ),
});

const completion = z.object({
  statuses: z.array(
    z.object({
      cmid: z.number(),
      modname: z.string(),
      /** 0 = open, 1 = complete, 2 = complete with pass, 3 = complete with fail. */
      state: z.number(),
      hascompletion: z.boolean().default(true),
    }),
  ),
});

const forums = z.array(
  z.object({ id: z.number(), course: z.number(), type: z.string() }),
);

const discussions = z.object({
  discussions: z.array(
    z.object({
      /** Id of the discussion (the response's `id` is the first post). */
      discussion: z.number(),
      name: z.string(),
      message: z.string(),
      userfullname: z.string(),
      /** Unix seconds. */
      timemodified: z.number(),
    }),
  ),
});

export const MOODLE_SCHEMAS = {
  core_webservice_get_site_info: siteInfo,
  core_enrol_get_users_courses: courses,
  mod_assign_get_assignments: assignments,
  core_completion_get_activities_completion_status: completion,
  mod_forum_get_forums_by_courses: forums,
  mod_forum_get_forum_discussions: discussions,
} as const;

export type MoodleFunction = keyof typeof MOODLE_SCHEMAS;
export type MoodleResult<F extends MoodleFunction> = z.infer<
  (typeof MOODLE_SCHEMAS)[F]
>;

export type MoodleSiteInfo = MoodleResult<"core_webservice_get_site_info">;
export type MoodleCourse = MoodleResult<"core_enrol_get_users_courses">[number];
export type MoodleAssignment =
  MoodleResult<"mod_assign_get_assignments">["courses"][number]["assignments"][number];
export type MoodleCompletionStatus =
  MoodleResult<"core_completion_get_activities_completion_status">["statuses"][number];
export type MoodleDiscussion =
  MoodleResult<"mod_forum_get_forum_discussions">["discussions"][number];
