/** Working title of the app. The name is defined only here (see CLAUDE.md). */
export const APP_NAME = "StudiCompass";

/**
 * Fixed "now" of the prototype (KONZEPT §4, §10.2): Monday, 25.01.2027, 19:30 CET. Components and the
 * domain take the current time only from here – never from new Date() or Date.now().
 */
export const DEMO_NOW = new Date("2027-01-25T19:30:00+01:00");

/**
 * localStorage key of the theme preference ("system" | "light" | "dark"). Read and written only by
 * src/lib/theme.ts; the inline script in index.html reads it before the first render.
 */
export const THEME_STORAGE_KEY = `${APP_NAME.toLowerCase()}:theme`;
