import type {
  AcademicState,
  Consequence,
  Module,
  PlanOverride,
  PlanProjection,
  ProjectedPlan,
  PlannedModule,
  Term,
} from "./types";
import { compare, format, next, semesterNumber } from "./terms";
import { passedModuleRecords, targetEcts, usedAttempts } from "./progress";
import { nextOfferingTerm, trafficLight } from "./rules";

/** Return the calendar semester at a one-based curriculum position. */
function curriculumTerm(start: Term, semester: number): Term {
  let term = { ...start };
  for (let index = 1; index < semester; index++) term = next(term);
  return term;
}

function latest(terms: Term[], fallback: Term): Term {
  return terms.reduce(
    (result, term) => (compare(term, result) > 0 ? term : result),
    fallback,
  );
}

function offeredAtOrAfter(module: Module, term: Term): Term {
  return module.offering === "BOTH" || module.offering === term.season
    ? term
    : next(term);
}

function calculate(
  state: AcademicState,
  overrides: PlanOverride[],
): ProjectedPlan {
  const { modules, exams, student, currentTerm } = state;
  const internship = modules.find(
    (module) => module.isMilestone === "internship",
  );
  if (!internship || modules.length === 0)
    throw new RangeError("Der Studienverlaufsplan braucht ein Praxissemester.");
  const passed = passedModuleRecords(exams);
  const byId = new Map(modules.map((module) => [module.id, module]));
  const changes = new Map<string, PlanOverride>();
  for (const override of overrides) {
    const module = byId.get(override.moduleId);
    if (!module || passed.has(module.id) || changes.has(module.id))
      throw new RangeError("Das Modul kann nicht verschoben werden.");
    if (
      override.action === "move" &&
      (compare(override.term, currentTerm) <= 0 ||
        compare(
          override.term,
          curriculumTerm(student.startTerm, module.plannedSemester),
        ) < 0 ||
        (module.offering !== "BOTH" &&
          module.offering !== override.term.season))
    )
      throw new RangeError(
        "Das Modul wird in diesem Semester nicht angeboten oder der Termin liegt zu früh.",
      );
    changes.set(module.id, override);
  }

  let planned: PlannedModule[] = modules.map((module) => {
    const successful = passed.get(module.id);
    if (successful)
      return {
        moduleId: module.id,
        term: { ...successful.term },
        passed: true,
      };
    const override = changes.get(module.id);
    if (override)
      return {
        moduleId: module.id,
        term:
          override.action === "move"
            ? { ...override.term }
            : nextOfferingTerm(module, currentTerm),
        passed: false,
      };
    const history = exams.filter((exam) => exam.moduleId === module.id);
    const registered = history.some(
      (exam) =>
        exam.status === "registered" && compare(exam.term, currentTerm) === 0,
    );
    const curriculum = curriculumTerm(
      student.startTerm,
      module.plannedSemester,
    );
    // A curriculum slot that has passed without an attempt is caught up after the current term (DR-4).
    const term = registered
      ? { ...currentTerm }
      : history.length > 0 || compare(curriculum, currentTerm) <= 0
        ? nextOfferingTerm(module, currentTerm)
        : curriculum;
    return { moduleId: module.id, term, passed: false };
  });
  const termOf = (id: string): Term => {
    const item = planned.find((entry) => entry.moduleId === id);
    if (!item) throw new RangeError("Modul fehlt im Studienverlaufsplan.");
    return item.term;
  };
  const foundationCompletionTerm = latest(
    modules
      .filter((module) => module.phase === "foundation")
      .map((module) => termOf(module.id)),
    student.startTerm,
  );
  const regularInternship = curriculumTerm(
    student.startTerm,
    internship.plannedSemester,
  );
  const internshipTerm = passed.has(internship.id)
    ? termOf(internship.id)
    : offeredAtOrAfter(
        internship,
        latest(
          [
            regularInternship,
            next(foundationCompletionTerm),
            termOf(internship.id),
          ],
          regularInternship,
        ),
      );
  const internshipShift = Math.max(
    0,
    semesterNumber(internshipTerm, regularInternship) - 1,
  );

  // §10.5 steps 6–7: shift every unpassed module from the internship onward, then reapply DR-4.
  planned = planned.map((entry) => {
    const module = byId.get(entry.moduleId);
    if (
      !module ||
      entry.passed ||
      module.plannedSemester < internship.plannedSemester
    )
      return entry;
    if (module.id === internship.id)
      return { ...entry, term: { ...internshipTerm } };
    const shifted = curriculumTerm(
      student.startTerm,
      module.plannedSemester + internshipShift,
    );
    return {
      ...entry,
      term: offeredAtOrAfter(module, latest([shifted, entry.term], shifted)),
    };
  });
  const graduationTerm = latest(
    planned.map((entry) => entry.term),
    student.startTerm,
  );
  const openFoundationAfterTerm = planned.filter(
    (entry) =>
      byId.get(entry.moduleId)?.phase === "foundation" &&
      compare(entry.term, currentTerm) > 0,
  ).length;
  const regularGraduation = curriculumTerm(
    student.startTerm,
    Math.max(...modules.map((module) => module.plannedSemester)),
  );
  const milestoneShift =
    modules.some(
      (module) =>
        module.isMilestone &&
        compare(
          termOf(module.id),
          curriculumTerm(student.startTerm, module.plannedSemester),
        ) > 0,
    ) || compare(graduationTerm, regularGraduation) > 0
      ? 1
      : 0;
  const ectsThrough = (term: Term) =>
    planned.reduce(
      (sum, entry) =>
        sum +
        (compare(entry.term, term) <= 0
          ? (byId.get(entry.moduleId)?.ects ?? 0)
          : 0),
      0,
    );
  const ectsEndOfTerm = ectsThrough(currentTerm);
  const targetEndOfTerm = targetEcts(
    modules,
    semesterNumber(currentTerm, student.startTerm),
  );
  const terms = [];
  for (
    let term = { ...student.startTerm };
    compare(term, graduationTerm) <= 0;
    term = next(term)
  ) {
    const cumulativeEcts = ectsThrough(term);
    const target = targetEcts(modules, semesterNumber(term, student.startTerm));
    // DR-7 concerns eligibility for the semester following the current term, not past terms.
    const isCurrent = compare(term, currentTerm) === 0;
    terms.push({
      term,
      ects: planned.reduce(
        (sum, entry) =>
          sum +
          (compare(entry.term, term) === 0
            ? (byId.get(entry.moduleId)?.ects ?? 0)
            : 0),
        0,
      ),
      cumulativeEcts,
      targetEcts: target,
      trafficLight: trafficLight(
        cumulativeEcts,
        target,
        compare(term, currentTerm) >= 0 ? milestoneShift : 0,
        isCurrent ? openFoundationAfterTerm : 0,
      ),
    });
  }
  const consequences: Consequence[] = [];
  if (internshipShift > 0)
    consequences.push({
      id: "internship-shift",
      severity: "critical",
      title: "Praxissemester verschiebt sich",
      detail: `Frühestens ${format(internshipTerm)} statt ${format(regularInternship)}: Das Grundstudium muss vorher abgeschlossen sein.`,
      ruleId: "DR-6",
    });
  for (const module of modules) {
    if (!module.isMilestone || module.isMilestone === "internship") continue;
    const regular = curriculumTerm(student.startTerm, module.plannedSemester);
    const actual = termOf(module.id);
    if (compare(actual, regular) > 0)
      consequences.push({
        id: `milestone-${module.id}`,
        severity: "critical",
        title: `${module.title} verschiebt sich`,
        detail: `${format(actual)} statt ${format(regular)}.`,
        ruleId: internshipShift > 0 ? "DR-6" : "DR-4",
      });
  }
  if (compare(graduationTerm, regularGraduation) > 0)
    consequences.push({
      id: "graduation-shift",
      severity: "critical",
      title: "Abschluss verschiebt sich",
      detail: `Voraussichtlich ${format(graduationTerm)} statt ${format(regularGraduation)}.`,
      ruleId: internshipShift > 0 ? "DR-6" : "DR-4",
    });
  if (openFoundationAfterTerm >= 3)
    consequences.push({
      id: "foundation-limit",
      severity: openFoundationAfterTerm > 3 ? "critical" : "tight",
      title:
        openFoundationAfterTerm > 3
          ? "Grenze überschritten"
          : "Grenze erreicht",
      detail: `${openFoundationAfterTerm} Prüfungen des Grundstudiums sind nach diesem Semester offen. Für Prüfungen des Hauptstudiums dürfen höchstens drei offen sein.`,
      ruleId: "DR-7",
    });
  for (const term of terms) {
    if (compare(term.term, currentTerm) <= 0 || term.ects <= 36) continue;
    consequences.push({
      id: `load-${term.term.season}-${term.term.year}`,
      severity: "tight",
      title: "Hohe Belastung",
      detail: `${format(term.term)}: ${term.ects} ECTS geplant, bei ${student.jobHoursPerWeek} Stunden Nebenjob pro Woche.`,
      ruleId: "DR-10",
    });
  }
  return {
    status: "projected",
    blockedModuleIds: [],
    modules: planned,
    terms,
    foundationCompletionTerm,
    internshipTerm,
    internshipShift,
    graduationTerm,
    ectsEndOfTerm,
    targetEndOfTerm,
    trafficLight: trafficLight(
      ectsEndOfTerm,
      targetEndOfTerm,
      milestoneShift,
      openFoundationAfterTerm,
    ),
    openFoundationAfterTerm,
    consequences,
  };
}

function severityOrder(consequences: Consequence[]): Consequence[] {
  const priority = { critical: 0, tight: 1, info: 2 };
  return consequences.sort(
    (left, right) => priority[left.severity] - priority[right.severity],
  );
}

/** KONZEPT §10.5: pure projection under DR-1–DR-10; current registrations are assumed passed.
 * Overrides may fail, withdraw or move unpassed modules. Invalid moves throw a RangeError.
 */
export function projectPlan(
  state: AcademicState,
  overrides: PlanOverride[] = [],
): PlanProjection {
  const passed = passedModuleRecords(state.exams);
  const blocked = state.modules.filter(
    (module) =>
      !passed.has(module.id) &&
      usedAttempts(state.exams, module.id) +
        (overrides.some(
          (item) => item.moduleId === module.id && item.action === "fail",
        )
          ? 1
          : 0) >=
        3,
  );
  if (blocked.length > 0) {
    // Validate moves even when an unrelated module already blocks the prognosis.
    calculate(state, overrides);
    const changed = new Set(overrides.map((item) => item.moduleId));
    const knownModules = state.modules.flatMap<PlannedModule>((module) => {
      const successful = passed.get(module.id);
      if (successful)
        return [
          { moduleId: module.id, term: { ...successful.term }, passed: true },
        ];
      const registered = state.exams.some(
        (exam) =>
          exam.moduleId === module.id &&
          exam.status === "registered" &&
          compare(exam.term, state.currentTerm) === 0,
      );
      return registered &&
        !changed.has(module.id) &&
        !blocked.some((item) => item.id === module.id)
        ? [
            {
              moduleId: module.id,
              term: { ...state.currentTerm },
              passed: false,
            },
          ]
        : [];
    });
    const projectedIds = new Set(knownModules.map((module) => module.moduleId));
    const ectsEndOfTerm = state.modules
      .filter((module) => projectedIds.has(module.id))
      .reduce((sum, module) => sum + module.ects, 0);
    const openFoundationAfterTerm = state.modules.filter(
      (module) => module.phase === "foundation" && !projectedIds.has(module.id),
    ).length;
    return {
      status: "blocked",
      blockedModuleIds: blocked.map((module) => module.id),
      modules: knownModules,
      terms: [],
      foundationCompletionTerm: null,
      internshipTerm: null,
      internshipShift: null,
      graduationTerm: null,
      ectsEndOfTerm,
      targetEndOfTerm: targetEcts(
        state.modules,
        semesterNumber(state.currentTerm, state.student.startTerm),
      ),
      trafficLight: "critical",
      openFoundationAfterTerm,
      consequences: blocked.map((module) => ({
        id: `attempts-exhausted-${module.id}`,
        severity: "critical",
        title: `${module.title}: Prüfungsversuche ausgeschöpft`,
        detail:
          "Drei Prüfungsversuche sind genutzt. Ein weiterer regulärer Versuch ist nicht vorgesehen. Praxis- und Abschlusstermin sind offen; kläre das weitere Vorgehen mit dem Prüfungsamt.",
        ruleId: "DR-8",
      })),
    };
  }
  const plan = calculate(state, overrides);
  if (overrides.length > 0) {
    const baseline = calculate(state, []);
    plan.consequences = plan.consequences.filter(
      (item) =>
        !baseline.consequences.some(
          (previous) =>
            previous.id === item.id &&
            previous.detail === item.detail &&
            previous.severity === item.severity,
        ),
    );
    const lostEcts = baseline.ectsEndOfTerm - plan.ectsEndOfTerm;
    if (lostEcts > 0)
      plan.consequences.push({
        id: "ects-difference",
        severity: "info",
        title: "Weniger ECTS am Semesterende",
        detail: `${plan.ectsEndOfTerm} statt ${baseline.ectsEndOfTerm} ECTS: ${lostEcts} ECTS werden später erreicht.`,
        ruleId: "DR-1",
      });
    for (const override of overrides) {
      const item = plan.modules.find(
        (entry) => entry.moduleId === override.moduleId,
      );
      const original = baseline.modules.find(
        (entry) => entry.moduleId === override.moduleId,
      );
      const module = state.modules.find(
        (entry) => entry.id === override.moduleId,
      );
      if (item && original && module && compare(item.term, original.term) !== 0)
        plan.consequences.push({
          id: `offering-${module.id}`,
          severity: "info",
          title: `${module.title}: nächster Termin`,
          detail: `${format(item.term)}; Angebot: ${module.offering === "BOTH" ? "jedes Semester" : module.offering === "WS" ? "nur Wintersemester" : "nur Sommersemester"}.`,
          ruleId: "DR-4",
        });
    }
  }
  plan.consequences = severityOrder(plan.consequences);
  return plan;
}
