import type { Citation, Module, Rule } from "@/domain/types";

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
