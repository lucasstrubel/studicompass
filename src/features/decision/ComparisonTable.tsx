import { Fragment, useId, useState, type ReactNode } from "react";
import { ChevronDown, Equal } from "lucide-react";
import { CitationList } from "@/components/common/CitationList";
import { StatusBadge } from "@/components/common/StatusBadge";
import type {
  DecisionOption,
  DecisionOutcome,
  Module,
  Rule,
  Term,
} from "@/domain/types";
import { format } from "@/domain/terms";
import { cn } from "@/lib/utils";

const OPTION_LABELS: Record<DecisionOption, string> = {
  attendPass: "Antreten & bestehen",
  attendFail: "Antreten & nicht bestehen",
  withdraw: "Abmelden",
};

interface Row {
  id: string;
  label: string;
  ruleIds: string[];
  cell: (outcome: DecisionOutcome) => ReactNode;
  /** What two options are compared by, where the cell is not plain text. */
  key?: (outcome: DecisionOutcome) => string;
}

/** True when every option leads to the same value: such a row cannot tip the decision. */
function sameForAll(row: Row, outcomes: DecisionOutcome[]) {
  const value = (outcome: DecisionOutcome) => {
    if (row.key) return row.key(outcome);
    const cell = row.cell(outcome);
    return typeof cell === "string" || typeof cell === "number"
      ? String(cell)
      : "";
  };
  return outcomes.every((outcome) => value(outcome) === value(outcomes[0]));
}

function rows(
  module: Module,
  currentTerm: Term,
  target: number,
  maxAttempts: number,
): Row[] {
  return [
    {
      id: "next-term",
      label: `Nächster Termin ${module.title}`,
      ruleIds: ["DR-4"],
      cell: (outcome) =>
        outcome.nextAttemptTerm
          ? `${format(outcome.nextAttemptTerm)} (Versuch ${outcome.attemptsUsed + 1})`
          : "–",
    },
    {
      id: "ects",
      label: `ECTS Ende ${format(currentTerm)} (Soll ${target})`,
      ruleIds: ["DR-1", "DR-2"],
      cell: (outcome) => outcome.ectsEndOfTerm,
    },
    {
      id: "status",
      label: "Status",
      ruleIds: ["DR-3"],
      cell: (outcome) => <StatusBadge status={outcome.trafficLight} />,
      key: (outcome) => outcome.trafficLight,
    },
    {
      id: "project",
      label: "Unternehmensinformatikprojekt",
      ruleIds: ["DR-11"],
      cell: (outcome) =>
        !outcome.projectTerm
          ? "nicht planbar"
          : outcome.projectShift
            ? `${format(outcome.projectTerm)} (+${outcome.projectShift} Semester)`
            : `${format(outcome.projectTerm)} – erreichbar`,
    },
    {
      id: "internship",
      label: "Praxissemester",
      ruleIds: ["DR-6"],
      cell: (outcome) =>
        !outcome.internshipTerm
          ? "nicht planbar"
          : outcome.internshipShift
            ? `${format(outcome.internshipTerm)} (+${outcome.internshipShift} Semester)`
            : `${format(outcome.internshipTerm)} – erreichbar`,
    },
    {
      id: "graduation",
      label: "Voraussichtlicher Abschluss",
      ruleIds: ["DR-6"],
      cell: (outcome) =>
        outcome.graduationTerm
          ? format(outcome.graduationTerm)
          : "nicht planbar",
    },
    {
      id: "open-foundation",
      label: "Offene Grundstudiums-Prüfungen",
      ruleIds: ["DR-7"],
      cell: (outcome) =>
        outcome.openFoundationAfterTerm === 3
          ? "3 – Grenze erreicht"
          : outcome.openFoundationAfterTerm > 3
            ? `${outcome.openFoundationAfterTerm} – über der Grenze`
            : outcome.openFoundationAfterTerm,
    },
    {
      id: "attempts",
      label: `Prüfungsversuche ${module.title}`,
      ruleIds: ["DR-8", "DR-5"],
      cell: (outcome) => `${outcome.attemptsUsed} von ${maxAttempts} genutzt`,
    },
  ];
}

/** The rule behind a row in plain language with its sources ("Warum?"). */
function Why({ row, rules }: { row: Row; rules: Record<string, Rule> }) {
  const used = row.ruleIds.flatMap((id) => (rules[id] ? [rules[id]] : []));
  return (
    <div className="space-y-2">
      <ul className="space-y-1 text-body">
        {used.map((rule) => (
          <li key={rule.id}>{rule.citation.summary}</li>
        ))}
      </ul>
      <CitationList citations={used.map((rule) => rule.citation)} />
    </div>
  );
}

function WhyButton({
  open,
  controls,
  label,
  onToggle,
}: {
  open: boolean;
  controls: string;
  label: string;
  onToggle: () => void;
}) {
  return (
    // The invisible ::after enlarges the hit area to 30 px without moving the layout (P5-07).
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className="relative inline-flex items-center gap-1 rounded-sm text-meta font-normal text-muted-foreground after:absolute after:-inset-x-1 after:-inset-y-1.5 hover:text-foreground"
    >
      Warum?
      <span className="sr-only"> – {label}</span>
      <ChevronDown
        className={cn("size-3.5 transition-transform", open && "rotate-180")}
        aria-hidden="true"
      />
    </button>
  );
}

/** Marks a row in which the options do not differ, as icon and text. */
function NoDifference() {
  return (
    <span className="flex items-center gap-1 text-meta font-normal text-muted-foreground">
      <Equal className="size-3.5 shrink-0" aria-hidden="true" />
      Kein Unterschied
    </span>
  );
}

/**
 * Comparison of the three options: a table from md upwards, below that every criterion with all three
 * values under each other, so nothing has to be remembered. Rows in which the options differ carry the
 * weight; rows without a difference step back and say so. Values come from compareDecision; every row
 * explains its rule on demand.
 */
export function ComparisonTable({
  module,
  currentTerm,
  outcomes,
  rules,
}: {
  module: Module;
  currentTerm: Term;
  outcomes: DecisionOutcome[];
  rules: Record<string, Rule>;
}) {
  const baseId = useId();
  const [openRows, setOpenRows] = useState<string[]>([]);
  const target = outcomes[0]?.targetEndOfTerm ?? 0;
  const maxAttempts = Number(rules["DR-8"]?.params.maxAttempts ?? 3);
  const tableRows = rows(module, currentTerm, target, maxAttempts);
  const toggle = (id: string) =>
    setOpenRows((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );

  return (
    <>
      <div className="hidden max-w-5xl overflow-x-auto rounded-xl border bg-card md:block">
        <table className="w-full text-left text-body">
          <caption className="sr-only">
            Vergleich der Optionen für {module.title}
          </caption>
          <thead className="border-b text-meta text-muted-foreground">
            <tr>
              <th scope="col" className="p-3 font-semibold">
                Kriterium
              </th>
              {outcomes.map((outcome) => (
                <th
                  key={outcome.option}
                  scope="col"
                  className="p-3 font-semibold"
                >
                  {OPTION_LABELS[outcome.option]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => {
              const open = openRows.includes(row.id);
              const whyId = `${baseId}-why-${row.id}`;
              const same = sameForAll(row, outcomes);
              return (
                <Fragment key={row.id}>
                  <tr className="border-b last:border-b-0">
                    <th scope="row" className="p-3 align-top font-medium">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span>{row.label}</span>
                        <WhyButton
                          open={open}
                          controls={whyId}
                          label={row.label}
                          onToggle={() => toggle(row.id)}
                        />
                      </span>
                      {same && <NoDifference />}
                    </th>
                    {outcomes.map((outcome) => (
                      <td
                        key={outcome.option}
                        className={cn(
                          "p-3 align-top tabular-nums",
                          same ? "text-muted-foreground" : "font-semibold",
                        )}
                      >
                        {row.cell(outcome)}
                      </td>
                    ))}
                  </tr>
                  <tr id={whyId} hidden={!open} className="border-b bg-muted">
                    <td
                      colSpan={outcomes.length + 1}
                      className="p-3 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150"
                    >
                      <Why row={row} rules={rules} />
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul
        aria-label={`Vergleich der Optionen für ${module.title}`}
        className="divide-y rounded-xl border bg-card md:hidden"
      >
        {tableRows.map((row) => {
          const open = openRows.includes(row.id);
          const whyId = `${baseId}-why-mobile-${row.id}`;
          const same = sameForAll(row, outcomes);
          return (
            <li key={row.id} className="space-y-2 p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="text-body font-medium">{row.label}</h3>
                <WhyButton
                  open={open}
                  controls={whyId}
                  label={row.label}
                  onToggle={() => toggle(row.id)}
                />
              </div>
              {same ? (
                <div className="flex flex-wrap items-center gap-x-2 text-body text-muted-foreground tabular-nums">
                  <span>In allen Fällen: {row.cell(outcomes[0])}</span>
                  <NoDifference />
                </div>
              ) : (
                <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-3 gap-y-1">
                  {outcomes.map((outcome) => (
                    <Fragment key={outcome.option}>
                      <dt className="text-meta text-muted-foreground">
                        {OPTION_LABELS[outcome.option]}
                      </dt>
                      <dd className="text-body font-semibold tabular-nums">
                        {row.cell(outcome)}
                      </dd>
                    </Fragment>
                  ))}
                </dl>
              )}
              <div id={whyId} hidden={!open}>
                <Why row={row} rules={rules} />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-meta text-muted-foreground">
        Annahme: Du bestehst alle anderen angemeldeten Prüfungen.
      </p>
    </>
  );
}
