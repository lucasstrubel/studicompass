/** Working title of the app. The name is defined only here (see CLAUDE.md). */
export const APP_NAME = "StudiCompass";

/**
 * localStorage key of the theme preference ("system" | "light" | "dark"). Read and written only by
 * src/lib/theme.ts; the inline script in index.html reads it before the first render.
 */
export const THEME_STORAGE_KEY = `${APP_NAME.toLowerCase()}:theme`;
