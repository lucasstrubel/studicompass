import { describe, expect, it } from "vitest";
import type { Coursework } from "./types";
import { examAdmission } from "./coursework";

const item = (status: Coursework["status"]): Coursework => ({
  id: status,
  moduleId: "m-stat",
  title: "Übungsblätter",
  status,
});

describe("examAdmission (DR-13)", () => {
  it("is 'none' without any Prüfungsvorleistung", () => {
    expect(examAdmission([])).toBe("none");
  });
  it("admits only when every Prüfungsvorleistung is achieved", () => {
    expect(examAdmission([item("done")])).toBe("admitted");
    expect(examAdmission([item("done"), item("open")])).toBe("open");
  });
  it("refuses as soon as one is not achieved", () => {
    expect(examAdmission([item("done"), item("failed")])).toBe("notAdmitted");
    expect(examAdmission([item("open"), item("failed")])).toBe("notAdmitted");
  });
});
