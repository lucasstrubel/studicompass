import { DEMO_NOW, DEMO_TIME_ZONE } from "@/config/demo";

/** The demo date as yyyy-mm-dd in German time: default and earliest choice of date fields (P5-13). */
export const DEMO_DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: DEMO_TIME_ZONE,
}).format(DEMO_NOW);
