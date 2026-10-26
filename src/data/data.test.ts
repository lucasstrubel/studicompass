import { describe, expect, it } from "vitest";
import { modules } from "./modules";
import { exams } from "./exams";
import { rules } from "./rules";
import { offices } from "./offices";
import { inbox } from "./inbox";
import { deadlines } from "./deadlines";
import { notifications } from "./notifications";
import { assistantCatalog } from "./assistant-catalog";
import { assistantFallback } from "./assistant-fallback";

describe("INHALTE: consistent example data", () => {
  it("contains 210 ECTS, 30 per semester and 48 passed ECTS", () => {
    expect(modules.reduce((sum, module) => sum + module.ects, 0)).toBe(210);
    for (let semester = 1; semester <= 7; semester++) {
      expect(
        modules
          .filter((module) => module.plannedSemester === semester)
          .reduce((sum, module) => sum + module.ects, 0),
      ).toBe(30);
    }
    const passed = new Set(
      exams
        .filter((exam) => exam.status === "passed")
        .map((exam) => exam.moduleId),
    );
    expect(passed.size).toBe(8);
    expect(
      modules
        .filter((module) => passed.has(module.id))
        .reduce((sum, module) => sum + module.ects, 0),
    ).toBe(48);
  });

  it("resolves all module, exam, office, rule and follow-up references", () => {
    const moduleIds = modules.map((module) => module.id);
    const examIds = exams.map((exam) => exam.id);
    const officeIds = offices.map((office) => office.id);
    const ruleIds = rules.map((rule) => rule.id);
    const answerIds = assistantCatalog.map((entry) => entry.id);
    for (const exam of exams) expect(moduleIds).toContain(exam.moduleId);
    for (const item of [...inbox, ...deadlines]) {
      if (item.moduleId) expect(moduleIds).toContain(item.moduleId);
    }
    for (const deadline of deadlines) {
      if (deadline.examId) expect(examIds).toContain(deadline.examId);
    }
    for (const rule of rules) {
      expect(rule.citation.verified).toBe(false);
      if (rule.officeId) expect(officeIds).toContain(rule.officeId);
    }
    for (const entry of assistantCatalog) {
      expect(entry.question).not.toBe("");
      expect(entry.shortAnswer).not.toBe("");
      for (const id of entry.ruleIds) expect(ruleIds).toContain(id);
      for (const id of entry.officeIds) expect(officeIds).toContain(id);
      for (const id of entry.followUpIds) expect(answerIds).toContain(id);
    }
    for (const notification of notifications) {
      for (const id of notification.ruleIds) expect(ruleIds).toContain(id);
    }
    expect(assistantCatalog).toHaveLength(8);
    expect(assistantCatalog.filter((entry) => entry.suggested)).toHaveLength(6);
    expect(inbox).toHaveLength(12);
    expect(inbox.every((item) => item.body.length > item.preview.length)).toBe(
      true,
    );
    expect(
      assistantFallback.officeIds.every((id) => officeIds.includes(id)),
    ).toBe(true);
    expect(deadlines.find((item) => item.id === "d-pruef-ss27")).toMatchObject({
      startsAt: "2027-05-10",
      dueAt: "2027-05-24",
    });
  });
});
