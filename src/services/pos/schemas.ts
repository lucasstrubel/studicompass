import { z } from "zod";

// zod would probe for `new Function` to compile its checks; the Content Security Policy forbids that.
z.config({ jitless: true });

const term = z.object({
  season: z.enum(["WS", "SS"]),
  year: z.number().int().min(1990).max(2100),
});

/**
 * The record of achievements ("Leistungsübersicht") as the bridge hands it over: a neutral form
 * between the pages of the portal and the app, so a change of the portal touches only the bridge.
 * Unknown fields are dropped.
 */
export const transcript = z.object({
  student: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    matriculationNo: z.string().min(1),
  }),
  entries: z.array(
    z.object({
      /** Number of the exam in the portal, if it shows one. */
      number: z.string().optional(),
      title: z.string().min(1),
      term,
      status: z.enum(["passed", "failed", "registered", "withdrawn"]),
      grade: z.number().min(1).max(5).optional(),
      attempt: z.number().int().min(1).max(9).optional(),
      /** Date only ("2027-01-27"). */
      date: z.iso.date().optional(),
      room: z.string().optional(),
      /** ISO instant with offset, only for registered exams. */
      withdrawalDeadline: z.iso.datetime({ offset: true }).optional(),
    }),
  ),
});

export type Transcript = z.infer<typeof transcript>;
export type TranscriptEntry = Transcript["entries"][number];
