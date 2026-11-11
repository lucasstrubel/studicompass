import { loadLimit } from "./load";
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

/** DR-6: ECTS from the main phase that the internship requires. */
const MIN_MAIN_ECTS = 30;

/** DR-15: a retake follows in the next exam period, whatever the lecture's offering. */
function retakeTerm(after: Term): Term {
  return next(after);
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
  const project = modules.find((module) => module.isMilestone === "project");
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
            : override.action === "fail"
              ? retakeTerm(currentTerm)
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
    // A retake follows in the next exam period (DR-15); a curriculum slot that has passed without an
    // attempt is caught up in the next offering (DR-4).
    const term = registered
      ? { ...currentTerm }
      : history.some((exam) => exam.status === "failed")
        ? retakeTerm(currentTerm)
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
  const afterFoundation = next(foundationCompletionTerm);
  const setTerm = (id: string, term: Term) => {
    planned = planned.map((entry) =>
      entry.moduleId === id ? { ...entry, term: { ...term } } : entry,
    );
  };

  // DR-11: the project needs the finished foundation phase and runs in its offered season only.
  const regularProject = project
    ? curriculumTerm(student.startTerm, project.plannedSemester)
    : null;
  let projectTerm: Term | null = null;
  if (project && regularProject) {
    projectTerm = passed.has(project.id)
      ? termOf(project.id)
      : offeredAtOrAfter(
          project,
          latest(
            [regularProject, afterFoundation, termOf(project.id)],
            regularProject,
          ),
        );
    setTerm(project.id, projectTerm);
  }
  const projectShift =
    projectTerm && regularProject
      ? Math.max(0, semesterNumber(projectTerm, regularProject) - 1)
      : 0;

  // DR-6: the internship needs the finished foundation phase and enough ECTS from the main phase.
  const regularInternship = curriculumTerm(
    student.startTerm,
    internship.plannedSemester,
  );
  const mainEctsBefore = (term: Term) =>
    planned.reduce((sum, entry) => {
      const module = byId.get(entry.moduleId);
      return module?.phase === "main" &&
        module.id !== internship.id &&
        compare(entry.term, term) < 0
        ? sum + module.ects
        : sum;
    }, 0);
  let internshipTerm = passed.has(internship.id)
    ? termOf(internship.id)
    : offeredAtOrAfter(
        internship,
        latest(
          [regularInternship, afterFoundation, termOf(internship.id)],
          regularInternship,
        ),
      );
  if (!passed.has(internship.id))
    for (
      let guard = 0;
      guard < modules.length && mainEctsBefore(internshipTerm) < MIN_MAIN_ECTS;
      guard++
    )
      internshipTerm = offeredAtOrAfter(internship, next(internshipTerm));
  setTerm(internship.id, internshipTerm);
  const internshipShift = Math.max(
    0,
    semesterNumber(internshipTerm, regularInternship) - 1,
  );

  // Everything planned after project and internship follows the later of the two, then reapplies DR-4.
  const lastGate = Math.max(
    internship.plannedSemester,
    project?.plannedSemester ?? 0,
  );
  const gateShift = Math.max(
    0,
    semesterNumber(
      latest([internshipTerm, projectTerm ?? internshipTerm], internshipTerm),
      curriculumTerm(student.startTerm, lastGate),
    ) - 1,
  );
  planned = planned.map((entry) => {
    const module = byId.get(entry.moduleId);
    if (!module || entry.passed || module.plannedSemester <= lastGate)
      return entry;
    const shifted = curriculumTerm(
      student.startTerm,
      module.plannedSemester + gateShift,
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
      detail: `Frühestens ${format(internshipTerm)} statt ${format(regularInternship)}: Vorher müssen die Bachelorvorprüfung abgeschlossen und ${MIN_MAIN_ECTS} ECTS aus dem Hauptstudium erreicht sein.`,
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
        detail:
          module.isMilestone === "project"
            ? `${format(actual)} statt ${format(regular)}: Es setzt die abgeschlossene Bachelorvorprüfung voraus und läuft nur im ${module.offering === "SS" ? "Sommersemester" : "Wintersemester"}.`
            : `${format(actual)} statt ${format(regular)}.`,
        ruleId: module.isMilestone === "project" ? "DR-11" : "DR-12",
      });
  }
  if (compare(graduationTerm, regularGraduation) > 0)
    consequences.push({
      id: "graduation-shift",
      severity: "critical",
      title: "Abschluss verschiebt sich",
      detail: `Voraussichtlich ${format(graduationTerm)} statt ${format(regularGraduation)}.`,
      ruleId:
        projectShift > 0 ? "DR-11" : internshipShift > 0 ? "DR-6" : "DR-4",
    });
  if (openFoundationAfterTerm >= 3)
    consequences.push({
      id: "foundation-limit",
      severity: openFoundationAfterTerm > 3 ? "critical" : "tight",
      title:
        openFoundationAfterTerm > 3
          ? "Grenze überschritten"
          : "Grenze erreicht",
      detail: `${openFoundationAfterTerm} Prüfungen der Bachelorvorprüfung sind nach diesem Semester offen. Für Prüfungen des Hauptstudiums dürfen höchstens drei fehlen.`,
      ruleId: "DR-7",
    });
  const heavyFrom = loadLimit(student.jobHoursPerWeek);
  for (const term of terms) {
    if (compare(term.term, currentTerm) <= 0 || term.ects <= heavyFrom)
      continue;
    consequences.push({
      id: `load-${term.term.season}-${term.term.year}`,
      severity: "tight",
      // Several semesters can be heavy at once; the title says which one.
      title: `Hohe Belastung im ${format(term.term)}`,
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
    projectTerm,
    projectShift: project ? projectShift : null,
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

/** Pure projection under DR-1–DR-10; current registrations are assumed passed.
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
      projectTerm: null,
      projectShift: null,
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
          "Drei Prüfungsversuche sind genutzt. Ein weiterer regulärer Versuch ist nicht vorgesehen. Praxis- und Abschlusstermin sind offen; kläre das weitere Vorgehen mit dem Zentrale Prüfungsverwaltung.",
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

/**
 * Terms a what-if may move an unpassed module to (US-10): after the current term, not before
 * its curriculum slot and only when the module is offered then (DR-4) – the same checks projectPlan applies.
 * Returns the first `count` such terms; passed modules cannot be moved.
 */
export function allowedMoveTerms(
  state: AcademicState,
  moduleId: string,
  count = 4,
): Term[] {
  const module = state.modules.find((item) => item.id === moduleId);
  if (!module || passedModuleRecords(state.exams).has(moduleId)) return [];
  const earliest = curriculumTerm(
    state.student.startTerm,
    module.plannedSemester,
  );
  const terms: Term[] = [];
  let term = next(state.currentTerm);
  while (terms.length < count) {
    if (
      compare(term, earliest) >= 0 &&
      (module.offering === "BOTH" || module.offering === term.season)
    )
      terms.push(term);
    term = next(term);
  }
  return terms;
}
