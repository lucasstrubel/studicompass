import { ArrowRight, Flag } from "lucide-react";
import { Link } from "react-router";
import { CitationList } from "@/components/common/CitationList";
import { compare, format } from "@/domain/terms";
import { selectMilestone, selectRulesById } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";

function joinNames(names: string[]): string {
  return names.length < 2
    ? names.join("")
    : `${names.slice(0, -1).join(", ")} und ${names.at(-1)}`;
}

/** "Nächster Meilenstein" (KONZEPT §8 S1 no. 4, US-04): internship term, condition (DR-6) and what is open. */
export function MilestoneCard() {
  const milestone = useDemoStore(selectMilestone);
  const rules = useDemoStore(selectRulesById);
  if (!milestone) return null;
  const { internshipTerm, internshipShift, openFoundation, registeredNow } =
    milestone;
  const later = [...milestone.later].sort((left, right) =>
    compare(left.term, right.term),
  );
  const laterTerms = new Set(later.map((item) => format(item.term)));
  const condition = rules["DR-6"];

  return (
    <>
      <p className="flex items-center gap-2 text-meta text-muted-foreground">
        <Flag className="size-4" aria-hidden="true" />
        Dein nächster Meilenstein
      </p>
      <h2 id="milestone" className="mt-2 text-section-title">
        Praxissemester
        {internshipTerm ? ` · ${format(internshipTerm)}` : ""}
        {internshipShift !== null && internshipShift > 0 && (
          <span className="text-status-critical-foreground">
            {" "}
            (+{internshipShift} Semester)
          </span>
        )}
      </h2>
      {condition && (
        <p className="mt-2 text-body">
          Bedingung: {condition.citation.summary}
        </p>
      )}
      <p className="mt-2 text-body">
        Noch offen: {openFoundation.length} Module des Grundstudiums (
        {registeredNow.length} davon in diesem Semester angemeldet)
      </p>
      {later.length > 0 && (
        <p className="mt-2 text-body text-muted-foreground">
          {laterTerms.size === 1 && internshipShift === 0
            ? `Erreichbar, wenn du ${joinNames(later.map((item) => item.module.title))} im ${format(later[0].term)} bestehst.`
            : `Noch nachzuholen: ${later
                .map((item) => `${item.module.title} (${format(item.term)})`)
                .join(", ")}.`}
        </p>
      )}
      {condition && (
        <CitationList className="mt-3" citations={[condition.citation]} />
      )}
      <Link
        to="/verlauf"
        className="mt-4 inline-flex items-center gap-2 rounded-sm text-meta font-semibold text-accent-strong"
      >
        Meilenstein im Studienverlauf
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </>
  );
}
