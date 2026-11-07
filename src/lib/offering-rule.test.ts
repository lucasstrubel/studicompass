import { describe, expect, it } from "vitest";
import { rules } from "@/data/rules";
import { modules } from "@/data/modules";
import { consequenceCitations } from "./offering-rule";

const byId = Object.fromEntries(rules.map((rule) => [rule.id, rule]));

describe("consequenceCitations", () => {
  it("cites the module's own handbook entry for its offering (DR-4)", () => {
    const [citation] = consequenceCitations(
      {
        id: "offering-m-wi3",
        severity: "info",
        title: "Wirtschaftsinformatik 3: nächster Termin",
        detail: "SS 2027; Angebot: jedes Semester.",
        ruleId: "DR-4",
      },
      modules,
      byId,
    );
    expect(citation.document).toBe(
      "Modulhandbuch UIB, Modul Wirtschaftsinformatik 3",
    );
    expect(citation.summary).toContain("jedes Semester");
    expect(citation.verified).toBe(true);
  });

  it("uses the rule's own source otherwise", () => {
    expect(
      consequenceCitations(
        {
          id: "load-SS-2027",
          severity: "tight",
          title: "Hohe Belastung",
          detail: "",
          ruleId: "DR-10",
        },
        modules,
        byId,
      ),
    ).toEqual([byId["DR-10"].citation]);
  });
});
