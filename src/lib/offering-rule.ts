import type { Citation, Consequence, Module, Rule } from "@/domain/types";

const OFFERING_TEXT = {
  WS: "nur im Wintersemester",
  SS: "nur im Sommersemester",
  BOTH: "jedes Semester",
} as const;

/**
 * DR-4 for one module: the rule data only carries the Statistik example, so text and source are built
 * per module (P3-03 review). The verification status follows the rule.
 */
export function offeringRule(module: Module, rule: Rule | undefined): Rule {
  const summary = `${module.title} wird ${OFFERING_TEXT[module.offering]} angeboten. Eine Prüfung ist frühestens im nächsten passenden Semester möglich.`;
  const citation: Citation = {
    document: `Modulhandbuch Wirtschaftsinformatik, Modul ${module.title}`,
    summary,
    verified: rule?.citation.verified ?? false,
  };
  return {
    id: "DR-4",
    title: summary,
    citation,
    officeId: rule?.officeId,
    params: {},
  };
}

/** The rules with DR-4 resolved for the module of the decision. */
export function rulesForModule(
  module: Module,
  rules: Record<string, Rule>,
): Record<string, Rule> {
  return { ...rules, "DR-4": offeringRule(module, rules["DR-4"]) };
}

/** DR-4 as a general rule (KONZEPT §10.3), for rule lists that are not about one module. */
export function generalOfferingRule(rule: Rule | undefined): Rule {
  const summary =
    "Ein Modul, das nur im Winter- oder nur im Sommersemester angeboten wird, kannst du frühestens im nächsten Semester dieses Typs ablegen; Module mit Angebot in jedem Semester schon im nächsten Semester.";
  return {
    id: "DR-4",
    title: summary,
    citation: {
      document: "Modulhandbuch Wirtschaftsinformatik",
      summary,
      verified: rule?.citation.verified ?? false,
    },
    officeId: rule?.officeId,
    params: {},
  };
}

/** Sources of a projected consequence; DR-4 consequences ("offering-<moduleId>") cite their own module. */
export function consequenceCitations(
  consequence: Consequence,
  modules: Module[],
  rules: Record<string, Rule>,
): Citation[] {
  if (!consequence.ruleId) return [];
  if (consequence.ruleId === "DR-4") {
    const module = modules.find(
      (item) => consequence.id === `offering-${item.id}`,
    );
    if (module) return [offeringRule(module, rules["DR-4"]).citation];
    return [generalOfferingRule(rules["DR-4"]).citation];
  }
  const rule = rules[consequence.ruleId];
  return rule ? [rule.citation] : [];
}
