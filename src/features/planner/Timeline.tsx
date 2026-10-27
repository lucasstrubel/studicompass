import {
  ArrowRight,
  CircleCheck,
  Clock,
  Flag,
  MoveRight,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Citation, Term } from "@/domain/types";
import { CitationList } from "@/components/common/CitationList";
import { format } from "@/domain/terms";
import { formatGrade } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  TimelineModule,
  TimelineStatus,
  TimelineTerm,
} from "@/store/selectors";

const STATUS: Record<
  TimelineStatus,
  { label: string; Icon: typeof Clock; className: string }
> = {
  passed: {
    label: "Bestanden",
    Icon: CircleCheck,
    className: "text-status-on-track-foreground",
  },
  registered: {
    label: "Angemeldet",
    Icon: Clock,
    className: "text-status-info-foreground",
  },
  retake: {
    label: "Nachholen",
    Icon: RotateCcw,
    className: "text-status-tight-foreground",
  },
  planned: {
    label: "Geplant",
    Icon: Clock,
    className: "text-muted-foreground",
  },
};

const OFFERING = {
  WS: "nur WS",
  SS: "nur SS",
  BOTH: "jedes Semester",
} as const;

const MILESTONES: Record<TimelineTerm["milestones"][number], string> = {
  foundationEnd: "Ende Grundstudium",
  internship: "Praxissemester",
  project: "Projektsemester",
  thesis: "Bachelorarbeit",
};

/** Limit above which a semester counts as heavy (DR-10). */
const LOAD_LIMIT = 36;

/** Menu entries, computed only while the menu is open (each target is checked with a projection). */
function MoveTargets({
  targets,
  onMove,
}: {
  targets: () => Term[];
  onMove: (term: Term) => void;
}) {
  const terms = targets();
  if (terms.length === 0)
    return (
      <DropdownMenuItem disabled>
        Kein späteres Semester ändert den Plan
      </DropdownMenuItem>
    );
  return terms.map((term) => (
    <DropdownMenuItem key={format(term)} onSelect={() => onMove(term)}>
      {format(term)}
    </DropdownMenuItem>
  ));
}

function ModuleChip({
  item,
  simulation,
  canMove,
  moveTargets,
  onMove,
}: {
  item: TimelineModule;
  simulation: boolean;
  canMove: boolean;
  moveTargets: () => Term[];
  onMove: (term: Term) => void;
}) {
  const { module, status } = item;
  const { label, Icon, className } = STATUS[status];
  // Milestones follow from the rules (DR-6) and are not moved by hand.
  const movable =
    simulation && status !== "passed" && !module.isMilestone && canMove;
  return (
    <li
      data-moved={item.movedFrom ? "true" : undefined}
      className={cn(
        "rounded-lg border bg-card p-2.5 text-meta",
        item.movedFrom && "border-2 border-dashed border-status-info",
      )}
    >
      <p
        className="font-semibold break-words hyphens-auto text-foreground"
        lang="de"
      >
        {module.title}
      </p>
      <p className="text-muted-foreground tabular-nums">{module.ects} ECTS</p>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className={cn("inline-flex items-center gap-1", className)}>
          <Icon className="size-3.5" aria-hidden="true" />
          {label}
          {item.grade !== undefined && ` · ${formatGrade(item.grade)}`}
        </span>
        <span className="text-muted-foreground">
          {OFFERING[module.offering]}
        </span>
      </p>
      {item.movedFrom && (
        <p className="mt-1 text-status-info-foreground">
          Simulation: verschoben aus {format(item.movedFrom)}
        </p>
      )}
      {(item.examId || movable) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {item.examId && !simulation && (
            <Link
              to={`/entscheidung/${item.examId}`}
              className="inline-flex items-center gap-1 rounded-sm font-semibold text-accent-strong"
            >
              Folgen prüfen
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          )}
          {movable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="xs"
                  aria-label={`${module.title} verschieben`}
                  className="max-w-full"
                >
                  <MoveRight aria-hidden="true" />
                  Verschieben
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>
                  Verschieben nach … (zulässig laut Angebot, DR-4)
                </DropdownMenuLabel>
                <MoveTargets targets={moveTargets} onMove={onMove} />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * Timeline of all semesters (KONZEPT §8 S2): columns from xl upwards, a list below. Each semester shows
 * term, Fachsemester, planned/earned ECTS, milestone markers and its modules with status (icon + text).
 */
export function Timeline({
  terms,
  currentTerm,
  simulation,
  canMove,
  moveTargets,
  onMove,
  load,
}: {
  terms: TimelineTerm[];
  currentTerm: Term;
  simulation: boolean;
  canMove: (moduleId: string) => boolean;
  moveTargets: (moduleId: string) => Term[];
  onMove: (moduleId: string, term: Term) => void;
  /** DR-10 context: job hours and the rule's source. */
  load: { jobHours: number; citation?: Citation };
}) {
  return (
    <ol className="grid gap-3 xl:auto-cols-[minmax(0,1fr)] xl:grid-flow-col xl:gap-2">
      {terms.map((item) => {
        const current =
          item.term.season === currentTerm.season &&
          item.term.year === currentTerm.year;
        const heavy = item.ects > LOAD_LIMIT;
        return (
          <li
            key={format(item.term)}
            aria-label={`${format(item.term)}, ${item.semester}. Fachsemester`}
            aria-current={current ? "step" : undefined}
            className={cn(
              "flex min-w-0 flex-col gap-2 rounded-xl border p-3",
              current ? "border-foreground bg-card" : "bg-muted",
            )}
          >
            <div>
              <p className="text-card-title">{format(item.term)}</p>
              <p className="text-meta text-muted-foreground">
                {item.semester}. Fachsemester
                {current && " · aktuell"}
              </p>
              <p className="mt-1 text-meta tabular-nums">
                {item.ects} ECTS geplant
                {item.earnedEcts > 0 && ` · ${item.earnedEcts} erreicht`}
              </p>
            </div>
            {item.milestones.length > 0 && (
              <ul className="flex flex-wrap gap-1">
                {item.milestones.map((kind) => (
                  <li
                    key={kind}
                    className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-meta text-accent-soft-foreground"
                  >
                    <Flag className="size-3" aria-hidden="true" />
                    {MILESTONES[kind]}
                  </li>
                ))}
              </ul>
            )}
            {heavy && (
              <div className="space-y-1">
                <p className="flex items-start gap-1 text-meta text-status-tight-foreground">
                  <TriangleAlert
                    className="mt-0.5 size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  Hohe Belastung: {item.ects} ECTS bei {load.jobHours} Std.
                  Nebenjob pro Woche
                </p>
                {load.citation && <CitationList citations={[load.citation]} />}
              </div>
            )}
            <ul className="flex flex-col gap-2">
              {item.modules.map((entry) => (
                <ModuleChip
                  key={entry.module.id}
                  item={entry}
                  simulation={simulation}
                  canMove={canMove(entry.module.id)}
                  moveTargets={() => moveTargets(entry.module.id)}
                  onMove={(term) => onMove(entry.module.id, term)}
                />
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
