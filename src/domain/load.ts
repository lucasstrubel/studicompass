/**
 * DR-10, an example rule of the app: how many planned ECTS a semester may hold before it counts as heavy.
 * A side job from 15 hours a week lowers the limit to the regular 30 ECTS, so every semester above the
 * regular plan is flagged; without such a job the hint only appears above 36 ECTS.
 */
export const LOAD_RULE = {
  maxRegularLoad: 36,
  maxLoadWithJob: 30,
  jobHoursFrom: 15,
} as const;

/** ECTS above which a semester counts as heavy for someone working this many hours a week. */
export function loadLimit(jobHoursPerWeek: number): number {
  return jobHoursPerWeek >= LOAD_RULE.jobHoursFrom
    ? LOAD_RULE.maxLoadWithJob
    : LOAD_RULE.maxRegularLoad;
}
