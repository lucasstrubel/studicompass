import { describe, expect, it, vi } from "vitest";
import { createMockServices } from "@/services/mock";
import { PosError } from "./errors";
import { connectPos, loadPos } from "./index";
import { mapTranscript, normalizeTitle } from "./mapping";
import type { Transcript } from "./schemas";

const base = () => createMockServices({ latencyMs: 0 }).pos.load();
const credentials = { user: "2212345", password: "geheim-4711" };
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const source: Transcript = {
  student: {
    firstName: "Mara",
    lastName: "Lindner",
    matriculationNo: "2212345",
  },
  entries: [
    {
      number: "1010",
      title: "Einführung in die Informatik",
      term: { season: "WS", year: 2025 },
      status: "passed",
      grade: 2.3,
      attempt: 1,
      date: "2026-02-03",
    },
    {
      title: "Programmierung I",
      term: { season: "WS", year: 2025 },
      status: "failed",
      grade: 5,
      attempt: 1,
    },
    {
      title: "PROGRAMMIERUNG 1",
      term: { season: "SS", year: 2026 },
      status: "passed",
      grade: 2.7,
      attempt: 2,
    },
    {
      title: "Programmierung 2",
      term: { season: "WS", year: 2026 },
      status: "registered",
      date: "2027-01-27",
      room: "A 210",
      withdrawalDeadline: "2027-01-26T23:59:00+01:00",
    },
    {
      title: "Studium Generale: Rhetorik",
      term: { season: "SS", year: 2026 },
      status: "passed",
      grade: 1.3,
    },
  ],
};

describe("normalizeTitle", () => {
  it("ignores case, punctuation and the style of numbers", () => {
    expect(normalizeTitle("Programmierung II")).toBe("programmierung 2");
    expect(normalizeTitle("  Web-basierte   Systeme ")).toBe(
      "web basierte systeme",
    );
    expect(normalizeTitle("Einführung in die Informatik")).toBe(
      "einführung in die informatik",
    );
  });
});

describe("mapTranscript", () => {
  it("turns entries into exams of the modules with the same title", async () => {
    const data = mapTranscript(source, await base());
    expect(data.exams).toEqual([
      {
        id: "pos-m-ei-ws2025",
        moduleId: "m-ei",
        term: { season: "WS", year: 2025 },
        status: "passed",
        date: "2026-02-03",
        grade: 2.3,
        attempt: 1,
      },
      {
        id: "pos-m-pr1-ws2025",
        moduleId: "m-pr1",
        term: { season: "WS", year: 2025 },
        status: "failed",
        grade: 5,
        attempt: 1,
      },
      {
        id: "pos-m-pr1-ss2026",
        moduleId: "m-pr1",
        term: { season: "SS", year: 2026 },
        status: "passed",
        grade: 2.7,
        attempt: 2,
      },
      {
        id: "pos-m-pr2-ws2026",
        moduleId: "m-pr2",
        term: { season: "WS", year: 2026 },
        status: "registered",
        date: "2027-01-27",
        room: "A 210",
        withdrawalDeadline: "2027-01-26T23:59:00+01:00",
      },
    ]);
  });

  it("names entries without a module instead of dropping them silently", async () => {
    expect(mapTranscript(source, await base()).unmatched).toEqual([
      "Studium Generale: Rhetorik",
    ]);
  });

  it("takes name and matriculation number from the portal, the study plan from the handbook", async () => {
    const handbook = await base();
    const data = mapTranscript(source, handbook);
    expect(data.student).toEqual({
      id: "pos-student",
      firstName: "Mara",
      lastName: "Lindner",
      matriculationNo: "2212345",
      startTerm: { season: "WS", year: 2025 },
      goalRegularTime: true,
      jobHoursPerWeek: 15,
    });
    expect(data.modules).toEqual(handbook.modules);
    expect(data.program).toEqual(handbook.program);
  });

  it("derives the withdrawal deadline entry from a registered exam and sends no messages", async () => {
    const data = mapTranscript(source, await base());
    expect(data.deadlines).toEqual([
      {
        id: "d-pos-m-pr2-ws2026-abm",
        title: "Abmeldung Programmierung 2",
        dueAt: "2027-01-26T23:59:00+01:00",
        type: "Abmeldung",
        channel: "pos",
        examId: "pos-m-pr2-ws2026",
      },
    ]);
    expect(data.inbox).toEqual([]);
  });

  it("keeps two entries of one module in one semester apart", async () => {
    const entry = source.entries[1];
    const data = mapTranscript(
      { ...source, entries: [entry, entry] },
      await base(),
    );
    expect(data.exams.map((exam) => exam.id)).toEqual([
      "pos-m-pr1-ws2025",
      "pos-m-pr1-ws2025-2",
    ]);
  });

  it("copes with an empty record", async () => {
    const handbook = await base();
    const data = mapTranscript({ ...source, entries: [] }, handbook);
    expect(data.exams).toEqual([]);
    expect(data.student.startTerm).toEqual(handbook.student.startTerm);
  });
});

describe("POS service", () => {
  it("reads the record through the bridge and maps it", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(() =>
      Promise.resolve(json(source)),
    );
    const data = await loadPos(credentials, { base, fetch });
    expect(fetch.mock.calls[0][0]).toBe("/api/bridge/pos");
    expect(data.exams).toHaveLength(4);
  });

  it("logs in once when connecting and again on a later load", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(() =>
      Promise.resolve(json(source)),
    );
    const { service } = await connectPos(credentials, { base, fetch });
    await service.load();
    expect(fetch).toHaveBeenCalledTimes(1);
    await service.load();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each([
    [json({ error: "notAvailable" }, 501), "unavailable"],
    [json({ error: "auth" }, 401), "auth"],
    [json({ student: {}, entries: [] }), "unexpected"],
    [
      json({
        ...source,
        entries: [{ ...source.entries[0], status: "bestanden" }],
      }),
      "unexpected",
    ],
  ])("turns a failure into a PosError (%#)", async (response, kind) => {
    const error = await loadPos(credentials, {
      base,
      fetch: () => Promise.resolve(response),
    }).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(PosError);
    expect((error as PosError).kind).toBe(kind);
    expect(`${(error as Error).message}`).not.toContain(credentials.password);
  });
});
