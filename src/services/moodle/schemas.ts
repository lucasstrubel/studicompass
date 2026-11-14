import { z } from "zod";

// zod would probe for `new Function` to compile its checks; the Content Security Policy forbids that.
z.config({ jitless: true });

/**
 * The parts of the Moodle responses the app reads (Moodle 4.5, see docs/adr/0004-moodle-spike.md).
 * Unknown fields are dropped, so recordings stay small and only checked data reaches the mapping.
 */
const siteInfo = z.object({
  sitename: z.string(),
  siteurl: z.string().default(""),
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
          /** Unix seconds of the last change to the settings of the assignment. */
          timemodified: z.number().default(0),
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

const contents = z.array(
  z.object({
    name: z.string(),
    modules: z.array(
      z.object({
        /** Course module id (cmid). */
        id: z.number(),
        name: z.string(),
        modname: z.string(),
        url: z.string().optional(),
        uservisible: z.boolean().default(true),
        contents: z
          .array(
            z.object({
              type: z.string(),
              filename: z.string(),
              /** Unix seconds; null for some external files. */
              timemodified: z.number().nullable().default(null),
            }),
          )
          .default([]),
      }),
    ),
  }),
);

const grades = z.object({
  usergrades: z.array(
    z.object({
      gradeitems: z.array(
        z.object({
          itemtype: z.string(),
          itemmodule: z.string().nullable().default(null),
          /** Id of the activity instance, e.g. the assignment id. */
          iteminstance: z.number(),
          graderaw: z.number().nullable().default(null),
          grademax: z.number().default(0),
        }),
      ),
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
  core_course_get_contents: contents,
  gradereport_user_get_grade_items: grades,
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
export type MoodleSection = MoodleResult<"core_course_get_contents">[number];
export type MoodleGradeItem =
  MoodleResult<"gradereport_user_get_grade_items">["usergrades"][number]["gradeitems"][number];
export type MoodleDiscussion =
  MoodleResult<"mod_forum_get_forum_discussions">["discussions"][number];
