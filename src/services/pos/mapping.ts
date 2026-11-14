import { compare } from "@/domain/terms";
import type { Deadline, ExamRecord, Module, Term } from "@/domain/types";
import type { PosData } from "@/services/types";
import type { Transcript, TranscriptEntry } from "./schemas";

const ROMAN: Record<string, string> = { i: "1", ii: "2", iii: "3", iv: "4" };

/** Titles compare without case, punctuation and number style ("Programmierung II" = "Programmierung 2"). */
export function normalizeTitle(title: string): string {
  return title
    .toLocaleLowerCase("de")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(" ")
    .map((word) => ROMAN[word] ?? word)
    .join(" ");
}

function examId(moduleId: string, term: Term, taken: Set<string>): string {
  const base = `pos-${moduleId}-${term.season.toLowerCase()}${term.year}`;
  let id = base;
  for (let count = 2; taken.has(id); count++) id = `${base}-${count}`;
  taken.add(id);
  return id;
}

function exam(
  entry: TranscriptEntry,
  id: string,
  moduleId: string,
): ExamRecord {
  return {
    id,
    moduleId,
    term: entry.term,
    status: entry.status,
    ...(entry.date ? { date: entry.date } : {}),
    ...(entry.room ? { room: entry.room } : {}),
    ...(entry.grade !== undefined ? { grade: entry.grade } : {}),
    ...(entry.attempt !== undefined ? { attempt: entry.attempt } : {}),
    ...(entry.status === "registered" && entry.withdrawalDeadline
      ? { withdrawalDeadline: entry.withdrawalDeadline }
      : {}),
  };
}

/**
 * The record of achievements from the portal as POS data. The portal knows results, not the study
 * plan: programme and modules stay those of the module handbook (`base`), and an entry belongs to
 * the module with the same title. Entries without such a module are named in `unmatched` instead of
 * being dropped silently. The portal sends no messages, so the inbox of the channel is empty.
 */
export function mapTranscript(source: Transcript, base: PosData): PosData {
  const byTitle = new Map<string, Module>(
    base.modules.map((module) => [normalizeTitle(module.title), module]),
  );
  const taken = new Set<string>();
  const exams: ExamRecord[] = [];
  const deadlines: Deadline[] = [];
  const unmatched: string[] = [];
  for (const entry of source.entries) {
    const module = byTitle.get(normalizeTitle(entry.title));
    if (!module) {
      unmatched.push(entry.title);
      continue;
    }
    const record = exam(entry, examId(module.id, entry.term, taken), module.id);
    exams.push(record);
    if (record.withdrawalDeadline)
      deadlines.push({
        id: `d-${record.id}-abm`,
        title: `Abmeldung ${module.title}`,
        dueAt: record.withdrawalDeadline,
        type: "Abmeldung",
        channel: "pos",
        examId: record.id,
      });
  }
  const terms = source.entries.map((entry) => entry.term);
  const startTerm = terms.reduce(
    (first, term) => (compare(term, first) < 0 ? term : first),
    terms[0] ?? base.student.startTerm,
  );
  return {
    program: base.program,
    modules: base.modules,
    student: {
      id: "pos-student",
      firstName: source.student.firstName,
      lastName: source.student.lastName,
      matriculationNo: source.student.matriculationNo,
      startTerm,
      goalRegularTime: base.student.goalRegularTime,
      jobHoursPerWeek: base.student.jobHoursPerWeek,
    },
    exams,
    inbox: [],
    deadlines,
    unmatched: [...new Set(unmatched)],
  };
}
