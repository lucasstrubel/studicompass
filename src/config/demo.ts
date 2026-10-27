/** Working title of the app. The name is defined only here (see CLAUDE.md). */
export const APP_NAME = "StudiCompass";

/**
 * Fixed "now" of the prototype (KONZEPT §4, §10.2): Monday, 25.01.2027, 19:30 CET. Components and the
 * domain take the current time only from here – never from new Date() or Date.now().
 */
export const DEMO_NOW = new Date("2027-01-25T19:30:00+01:00");

/** Time zone of the demo (TH Mannheim): dates and times appear as in Germany on every device. */
export const DEMO_TIME_ZONE = "Europe/Berlin";

/** Semester containing DEMO_NOW (KONZEPT §10.2). */
export const DEMO_CURRENT_TERM = { season: "WS", year: 2026 } as const;

/** Observable mock-service latency, within the specified 300–700 ms range. */
export const LATENCY_MS = 500;

/** Development switch; mocks read this on each request. No external requests are made. */
export const FLAGS = { simulateErrors: false };

/** Increment whenever the dummy data changes to discard older persisted demo states. */
export const DATA_VERSION = 3;
export const DEMO_STORAGE_KEY = `${APP_NAME.toLowerCase()}:demo`;

/**
 * localStorage key of the theme preference ("system" | "light" | "dark"). Read and written only by
 * src/lib/theme.ts; the inline script in index.html reads it before the first render.
 */
export const THEME_STORAGE_KEY = `${APP_NAME.toLowerCase()}:theme`;
