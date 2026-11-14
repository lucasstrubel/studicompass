import { Link } from "react-router";
import { AdmissionStatus } from "@/components/common/AdmissionStatus";
import { CitationList } from "@/components/common/CitationList";
import { examAdmission, summarizeCoursework } from "@/domain/coursework";
import { DEMO_DAY } from "@/lib/demo-day";
import { formatDate, formatHours as hours } from "@/lib/format";
import { selectRulesById } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";

/**
 * Prüfungsvorleistungen of the semester at a glance: per module how many are achieved, whether the
 * admission stands, what is planned for the open ones and the next due date. Hidden while nothing
 * is entered.
 */
export function CourseworkOverview() {
  const coursework = useDemoStore((state) => state.coursework);
  const modules = useDemoStore((state) => state.resources.pos.data?.modules);
  const jobHours = useDemoStore((state) => state.jobHoursPerWeek);
  const rules = useDemoStore(selectRulesById);
  const rows = (modules ?? []).flatMap((module) => {
    const items = coursework.filter((item) => item.moduleId === module.id);
    return items.length > 0
      ? [
          {
            module,
            admission: examAdmission(items),
            summary: summarizeCoursework(items, DEMO_DAY),
          },
        ]
      : [];
  });
  if (rows.length === 0) return null;
  const openHours = rows.reduce(
    (sum, row) => sum + row.summary.openEffortHours,
    0,
  );

  return (
    <section aria-labelledby="coursework-overview" className="space-y-3">
      <h2 id="coursework-overview" className="text-section-title">
        Prüfungsvorleistungen im Semester
      </h2>
      <div className="rounded-xl border bg-card px-4">
        <ul className="divide-y">
          {rows.map(({ module, admission, summary }) => (
            <li
              key={module.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3"
            >
              <span className="min-w-0">
                <Link
                  to={`/module/${module.id}`}
                  className="rounded-sm font-semibold text-accent-strong break-words"
                >
                  {module.title}
                </Link>
                <span className="block text-meta text-muted-foreground tabular-nums">
                  {summary.done} von {summary.total} erbracht
                  {summary.openEffortHours > 0 &&
                    ` · ${hours(summary.openEffortHours)} für offene geplant`}
                  {summary.nextDueAt &&
                    ` · nächste Frist ${formatDate(new Date(`${summary.nextDueAt}T12:00:00Z`))}`}
                </span>
              </span>
              <AdmissionStatus admission={admission} short />
            </li>
          ))}
        </ul>
        {openHours > 0 && (
          <p className="border-t py-3 text-body tabular-nums">
            Für offene Prüfungsvorleistungen hast du insgesamt{" "}
            {hours(openHours)} eingeplant
            {jobHours > 0 && `, neben ${hours(jobHours)} Nebenjob in der Woche`}
            .
          </p>
        )}
      </div>
      {rules["DR-13"] && (
        <CitationList
          variant="footer"
          className="mt-0"
          citations={[rules["DR-13"].citation]}
        />
      )}
    </section>
  );
}
