import { Fragment, useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { CitationList } from "@/components/common/CitationList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
}

function rows(module: Module, currentTerm: Term, target: number): Row[] {
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
      cell: (outcome) => `${outcome.attemptsUsed} von 3 genutzt`,
    },
  ];
}

/** The rule behind a row in plain language with its sources ("Warum?", KONZEPT §8 S4). */
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
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className="inline-flex items-center gap-1 rounded-sm text-meta font-normal text-accent-strong hover:underline"
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

/**
 * Comparison of the three options (KONZEPT §8 S4): a table from md upwards, a switcher with the same rows
 * below. Values come from compareDecision; every row explains its rule on demand.
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
  const [selected, setSelected] = useState<DecisionOption>("withdraw");
  const target = outcomes[0]?.targetEndOfTerm ?? 0;
  const tableRows = rows(module, currentTerm, target);
  const toggle = (id: string) =>
    setOpenRows((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  const selectedOutcome =
    outcomes.find((outcome) => outcome.option === selected) ?? outcomes[0];

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
        <table className="w-full text-left text-body">
          <caption className="sr-only">
            Vergleich der Optionen für {module.title}
          </caption>
          <thead className="border-b bg-muted text-meta">
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
              return (
                <Fragment key={row.id}>
                  <tr className="border-b last:border-b-0">
                    <th scope="row" className="p-3 align-top font-medium">
                      <span className="block">{row.label}</span>
                      <WhyButton
                        open={open}
                        controls={whyId}
                        label={row.label}
                        onToggle={() => toggle(row.id)}
                      />
                    </th>
                    {outcomes.map((outcome) => (
                      <td
                        key={outcome.option}
                        className="p-3 align-top tabular-nums"
                      >
                        {row.cell(outcome)}
                      </td>
                    ))}
                  </tr>
                  <tr id={whyId} hidden={!open} className="border-b bg-muted">
                    <td colSpan={outcomes.length + 1} className="p-3">
                      <Why row={row} rules={rules} />
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        <ToggleGroup
          type="single"
          variant="outline"
          value={selected}
          onValueChange={(value) => {
            if (value) setSelected(value as DecisionOption);
          }}
          aria-label="Option anzeigen"
          className="flex w-full flex-wrap"
        >
          {outcomes.map((outcome) => (
            <ToggleGroupItem
              key={outcome.option}
              value={outcome.option}
              className="h-auto min-h-9 flex-1 py-1.5 whitespace-normal"
            >
              {OPTION_LABELS[outcome.option]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <dl
          aria-label={`${OPTION_LABELS[selectedOutcome.option]}: Folgen für ${module.title}`}
          className="divide-y rounded-xl border bg-card"
        >
          {tableRows.map((row) => {
            const open = openRows.includes(row.id);
            const whyId = `${baseId}-why-mobile-${row.id}`;
            return (
              <div key={row.id} className="space-y-1 p-3">
                <dt className="text-meta text-muted-foreground">{row.label}</dt>
                <dd className="text-body font-semibold tabular-nums">
                  {row.cell(selectedOutcome)}
                </dd>
                <dd>
                  <WhyButton
                    open={open}
                    controls={whyId}
                    label={row.label}
                    onToggle={() => toggle(row.id)}
                  />
                  <div id={whyId} hidden={!open} className="mt-2">
                    <Why row={row} rules={rules} />
                  </div>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
      <p className="mt-2 text-meta text-muted-foreground">
        Annahme: Du bestehst alle anderen angemeldeten Prüfungen.
      </p>
    </>
  );
}
