import { useState } from "react";
import { Link } from "react-router";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { CitationList } from "@/components/common/CitationList";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { format, next, semesterNumber } from "@/domain/terms";
import { AdmissionStatus } from "@/components/common/AdmissionStatus";
import { examAdmission } from "@/domain/coursework";
import type { ExamAdmission, ExamRecord, Module, Term } from "@/domain/types";
import { formatGrade } from "@/lib/format";
import {
  moduleRecord,
  selectPassedModuleCount,
} from "@/store/module-selectors";
import {
  selectAcademicState,
  selectProgress,
  selectRulesById,
} from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";
import { ExamStatusLabel } from "./ExamStatusLabel";
import { OFFERING } from "./module-labels";

interface Row {
  module: Module;
  exam: ExamRecord | null;
}

interface SemesterGroup {
  semester: number;
  term: Term;
  rows: Row[];
}

function termOfSemester(start: Term, semester: number) {
  let term = start;
  for (let step = 1; step < semester; step++) term = next(term);
  return term;
}

/** "5 Module · 30 ECTS · alle bestanden" (P5-12): the gist of a closed semester. */
function summary(rows: Row[]) {
  const ects = rows.reduce((sum, row) => sum + row.module.ects, 0);
  const passed = rows.filter((row) => row.exam?.status === "passed").length;
  const status =
    passed === rows.length
      ? "alle bestanden"
      : passed === 0
        ? "noch keins bestanden"
        : `${passed} bestanden, ${rows.length - passed} offen`;
  return `${rows.length} ${rows.length === 1 ? "Modul" : "Module"} · ${ects} ECTS · ${status}`;
}

function SemesterTable({
  group,
  admissionOf,
}: {
  group: SemesterGroup;
  admissionOf: (moduleId: string) => ExamAdmission;
}) {
  return (
    <table className="w-full text-body">
      <caption className="sr-only">
        Module im {group.semester}. Fachsemester
      </caption>
      <thead className="text-meta text-muted-foreground">
        <tr>
          <th scope="col" className="py-1.5 pr-3 text-left font-medium">
            Modul
          </th>
          <th
            scope="col"
            className="hidden py-1.5 pr-3 text-right font-medium sm:table-cell"
          >
            ECTS
          </th>
          <th
            scope="col"
            className="hidden py-1.5 pr-3 text-left font-medium md:table-cell"
          >
            Angebot
          </th>
          <th
            scope="col"
            className="hidden py-1.5 pr-3 text-left font-medium md:table-cell"
          >
            Versuch
          </th>
          <th
            scope="col"
            className="hidden py-1.5 pr-3 text-left font-medium sm:table-cell"
          >
            Status
          </th>
          <th
            scope="col"
            className="hidden py-1.5 text-right font-medium sm:table-cell"
          >
            Note
          </th>
        </tr>
      </thead>
      <tbody>
        {group.rows.map(({ module, exam }) => (
          <tr key={module.id} className="border-t align-top">
            <th scope="row" className="py-2 pr-3 text-left font-normal">
              <Link
                to={`/module/${module.id}`}
                className="rounded-sm font-semibold underline-offset-2 hover:underline"
              >
                {module.title}
              </Link>
              {/* Narrow screens: the hidden columns as one line under the name. */}
              <span className="block text-meta text-muted-foreground tabular-nums md:hidden">
                <span className="sm:hidden">{module.ects} ECTS · </span>
                {OFFERING[module.offering]}
                {exam?.attempt ? ` · Versuch ${exam.attempt}` : ""}
              </span>
              {/* Phones: status and grade as a line of their own, so no column is cut off (P5-12 review). */}
              <span className="mt-0.5 flex flex-wrap items-center gap-x-3 sm:hidden">
                <ExamStatusLabel exam={exam} />
                <AdmissionStatus admission={admissionOf(module.id)} short />
                {exam?.grade !== undefined && (
                  <span className="text-meta font-semibold tabular-nums">
                    Note {formatGrade(exam.grade)}
                  </span>
                )}
              </span>
            </th>
            <td className="hidden py-2 pr-3 text-right tabular-nums sm:table-cell">
              {module.ects}
            </td>
            <td className="hidden py-2 pr-3 text-meta md:table-cell">
              {OFFERING[module.offering]}
            </td>
            <td className="hidden py-2 pr-3 text-meta tabular-nums md:table-cell">
              {exam?.attempt ?? "–"}
            </td>
            <td className="hidden py-2 pr-3 whitespace-nowrap sm:table-cell">
              <ExamStatusLabel exam={exam} />
              <AdmissionStatus
                admission={admissionOf(module.id)}
                short
                className="flex"
              />
            </td>
            <td className="hidden py-2 text-right font-semibold tabular-nums sm:table-cell">
              {exam?.grade !== undefined ? formatGrade(exam.grade) : "–"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Module & Noten (KONZEPT §8 S3): key figures and a compact table per Fachsemester. Semesters fold away;
 * only the current one starts open (P5-12, feedback: less scrolling).
 */
export function ModuleList() {
  const academic = useDemoStore(selectAcademicState);
  const progress = useDemoStore(selectProgress);
  const program = useDemoStore((state) => state.resources.pos.data?.program);
  const rules = useDemoStore(selectRulesById);
  const passed = useDemoStore(selectPassedModuleCount);
  const coursework = useDemoStore((state) => state.coursework);
  const admissionOf = (moduleId: string) =>
    examAdmission(coursework.filter((item) => item.moduleId === moduleId));
  const showsAdmission = coursework.length > 0;
  const groups: SemesterGroup[] = academic
    ? [...new Set(academic.modules.map((module) => module.plannedSemester))]
        .sort((a, b) => a - b)
        .map((semester) => ({
          semester,
          term: termOfSemester(academic.student.startTerm, semester),
          rows: academic.modules
            .filter((module) => module.plannedSemester === semester)
            .map((module) => ({
              module,
              exam: moduleRecord(academic.exams, module),
            })),
        }))
    : [];
  const current = academic
    ? semesterNumber(academic.currentTerm, academic.student.startTerm)
    : 0;
  // Only the current semester starts open, so it is visible without scrolling at 1440×900; the summaries
  // of the others still show what is open (P5-12).
  const initiallyOpen = groups
    .filter((group) => group.semester === current)
    .map((group) => String(group.semester));
  const [open, setOpen] = useState(initiallyOpen);
  if (!academic || !progress || !program) return null;
  const allOpen = open.length === groups.length;

  return (
    <div className="space-y-5">
      <section aria-label="Kennzahlen">
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Erreichte ECTS", progress.earnedEcts],
            [
              "Notenschnitt",
              progress.gradeAverage === null
                ? "Noch keine Noten"
                : formatGrade(progress.gradeAverage),
            ],
            ["Bestandene Module", passed],
            [
              "Offene Grundstudiums-Prüfungen",
              progress.openFoundationModules.length,
            ],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border bg-card p-3">
              <dt className="text-meta text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-section-title tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <CitationList
          variant="footer"
          className="mt-3"
          citations={[
            program.citation,
            ...["DR-1", "DR-9", ...(showsAdmission ? ["DR-13"] : [])].flatMap(
              (id) => (rules[id] ? [rules[id].citation] : []),
            ),
          ]}
        />
      </section>
      {groups.length === 0 ? (
        <EmptyState title="Noch keine Module vorhanden" />
      ) : (
        <section aria-labelledby="semesters" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="semesters" className="text-section-title">
              Nach Fachsemester
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setOpen(
                  allOpen ? [] : groups.map((group) => String(group.semester)),
                )
              }
            >
              {allOpen ? (
                <ChevronsDownUp aria-hidden="true" />
              ) : (
                <ChevronsUpDown aria-hidden="true" />
              )}
              {allOpen ? "Alle zuklappen" : "Alle aufklappen"}
            </Button>
          </div>
          <Accordion
            type="multiple"
            value={open}
            onValueChange={setOpen}
            className="bg-card"
          >
            {groups.map((group) => (
              <AccordionItem
                key={group.semester}
                value={String(group.semester)}
              >
                <AccordionTrigger className="px-4">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-left">
                    <span className="text-card-title">
                      {group.semester}. Fachsemester · {format(group.term)}
                    </span>
                    <span className="text-meta font-normal text-muted-foreground tabular-nums">
                      {summary(group.rows)}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <SemesterTable group={group} admissionOf={admissionOf} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}
    </div>
  );
}
