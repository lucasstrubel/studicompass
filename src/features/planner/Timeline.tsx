import {
  ArrowRight,
  CircleCheck,
  Clock,
  Flag,
  GripVertical,
  Lock,
  MoveRight,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { Fragment, useRef, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Citation, Offering, Term } from "@/domain/types";
import { CitationList } from "@/components/common/CitationList";
import type { MilestoneKind } from "@/domain/milestones";
import { format } from "@/domain/terms";
import { compoundParts } from "@/lib/compound-breaks";
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

const MILESTONES: Record<MilestoneKind, string> = {
  foundationEnd: "Ende Grundstudium",
  internship: "Praxissemester",
  project: "Projektsemester",
  thesis: "Bachelorarbeit",
};

/** Label of a module marked by the milestone toggle (P5-10). */
const MARKS: Record<MilestoneKind, string> = {
  foundationEnd: "gehört zum Grundstudium",
  internship: "für Praxissemester",
  project: "für Projektsemester",
  thesis: "für Bachelorarbeit",
};

/** Modules the active milestone toggle marks (KONZEPT §8 S2, P5-10). */
export interface MilestoneMarking {
  kind: MilestoneKind;
  moduleIds: ReadonlySet<string>;
}

/** Why a milestone module stays put in the what-if, with the rule's source. */
export interface FixedMilestoneNote {
  text: string;
  citation?: Citation;
}

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
  mark,
  fixedNote,
}: {
  item: TimelineModule;
  simulation: boolean;
  canMove: boolean;
  moveTargets: () => Term[];
  onMove: (term: Term) => void;
  /** Set while a milestone toggle marks this module. */
  mark: MilestoneKind | null;
  /** Set for milestone modules, which the what-if never moves. */
  fixedNote?: FixedMilestoneNote;
}) {
  const { module, status } = item;
  const { label, Icon, className } = STATUS[status];
  // Set when a target was chosen: the menu then must not return focus to this (moving) trigger.
  const moved = useRef(false);
  // Milestones follow from the rules (DR-6) and are not moved by hand.
  const movable =
    simulation && status !== "passed" && !module.isMilestone && canMove;
  // Drag & drop is an extra way for mouse and touch (P5-11); the keyboard keeps the menu, so the
  // keyboard attributes of dnd-kit are left out.
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: module.id,
    disabled: !movable,
    data: { title: module.title, offering: module.offering },
  });
  return (
    <li
      ref={setNodeRef}
      {...(movable ? listeners : {})}
      data-moved={item.movedFrom ? "true" : undefined}
      data-marked={mark ? "true" : undefined}
      data-draggable={movable ? "true" : undefined}
      className={cn(
        "rounded-lg border bg-card p-2.5 text-meta",
        item.movedFrom && "border-2 border-dashed border-status-info",
        mark && "border-l-4 border-l-tone-violet",
        movable && "cursor-grab touch-manipulation",
        isDragging && "opacity-40",
      )}
    >
      <p
        className="flex items-start gap-1 font-semibold break-words hyphens-auto text-foreground"
        lang="de"
      >
        {movable && (
          <GripVertical
            className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <Link
          to={`/module/${module.id}`}
          // A native link drag would swallow the pointer moves of the module drag.
          draggable={movable ? false : undefined}
          className="rounded-sm underline-offset-2 hover:underline"
        >
          {/* Break long compounds at their joints, not before the last letter (P5-10). */}
          {compoundParts(module.title).map((part, index) => (
            <Fragment key={index}>
              {index > 0 && <wbr />}
              {part}
            </Fragment>
          ))}
        </Link>
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
      {mark && (
        <p className="mt-1 flex items-start gap-1 font-semibold text-foreground">
          <Flag
            className="mt-0.5 size-3.5 shrink-0 text-tone-violet"
            aria-hidden="true"
          />
          <span>
            {MARKS[mark]}
            {status !== "passed" && " · noch offen"}
          </span>
        </p>
      )}
      {fixedNote && (
        <div className="mt-1">
          <p className="flex items-center gap-1 font-semibold text-foreground">
            <Lock className="size-3.5 shrink-0" aria-hidden="true" />
            Fester Meilenstein
          </p>
          <p className="text-muted-foreground">{fixedNote.text}</p>
          {fixedNote.citation && (
            <CitationList
              variant="footer"
              className="mt-2 pt-2"
              citations={[fixedNote.citation]}
            />
          )}
        </div>
      )}
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
                  data-move-trigger={module.id}
                  className="max-w-full"
                >
                  <MoveRight aria-hidden="true" />
                  Verschieben
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                // After a move the trigger sits in another column; the result dialog returns the focus.
                onCloseAutoFocus={(event) => {
                  if (!moved.current) return;
                  moved.current = false;
                  event.preventDefault();
                }}
              >
                <DropdownMenuLabel>
                  Verschieben nach … (zulässig laut Angebot, DR-4)
                </DropdownMenuLabel>
                <MoveTargets
                  targets={moveTargets}
                  onMove={(term) => {
                    moved.current = true;
                    onMove(term);
                  }}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </li>
  );
}

type DropState = "allowed" | "blocked" | "origin" | null;

/** One semester; a drop target while a module is dragged (P5-11). */
function SemesterColumn({
  item,
  current,
  dropState,
  blockedReason,
  children,
}: {
  item: TimelineTerm;
  current: boolean;
  dropState: DropState;
  blockedReason: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: format(item.term),
    data: { term: item.term },
  });
  return (
    <li
      ref={setNodeRef}
      aria-label={`${format(item.term)}, ${item.semester}. Fachsemester`}
      aria-current={current ? "step" : undefined}
      data-drop={dropState ?? undefined}
      className={cn(
        "flex min-w-0 flex-col gap-2 rounded-xl border p-3",
        current ? "border-foreground bg-card" : "bg-muted",
        dropState === "allowed" &&
          "border-status-info bg-status-info-soft ring-2 ring-status-info",
        dropState === "allowed" && isOver && "ring-4",
        dropState === "blocked" && "opacity-50",
      )}
    >
      {dropState === "allowed" && (
        <p className="text-meta font-semibold text-status-info-foreground">
          Hier ablegen
        </p>
      )}
      {dropState === "blocked" && (
        <p className="text-meta text-muted-foreground">{blockedReason}</p>
      )}
      {children}
    </li>
  );
}

interface ActiveDrag {
  moduleId: string;
  title: string;
  offering: Offering;
  /** Terms the menu would offer too: allowed by DR-4 and actually reached (selectMoveTargets). */
  targets: Term[];
}

function blockedReason(drag: ActiveDrag, term: Term) {
  if (drag.offering !== "BOTH" && drag.offering !== term.season)
    return `Nicht zulässig: ${OFFERING[drag.offering]}`;
  return "Ändert den Plan hier nicht";
}

/** Screen reader texts for pointer and touch drags; the keyboard uses the menu instead. */
function announcements(title: (id: string | number) => string): Announcements {
  return {
    onDragStart: ({ active }) =>
      `${title(active.id)} aufgenommen. Zulässige Semester sind hervorgehoben.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${title(active.id)} über ${String(over.id)}.`
        : `${title(active.id)} über keinem Semester.`,
    onDragEnd: ({ active, over }) =>
      over
        ? `${title(active.id)} über ${String(over.id)} losgelassen.`
        : `${title(active.id)} nicht abgelegt.`,
    onDragCancel: ({ active }) =>
      `Verschieben von ${title(active.id)} abgebrochen.`,
  };
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
  marking,
  onToggleMilestone,
  fixedNotes,
}: {
  terms: TimelineTerm[];
  currentTerm: Term;
  simulation: boolean;
  canMove: (moduleId: string) => boolean;
  moveTargets: (moduleId: string) => Term[];
  onMove: (moduleId: string, term: Term) => void;
  /** DR-10 context: job hours and the rule's source. */
  load: { jobHours: number; citation?: Citation };
  marking: MilestoneMarking | null;
  onToggleMilestone: (kind: MilestoneKind) => void;
  fixedNotes: Partial<Record<MilestoneKind, FixedMilestoneNote>>;
}) {
  const [drag, setDrag] = useState<ActiveDrag | null>(null);
  // Mouse after 8 px, touch after a short press, so clicks, links and scrolling keep working.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
  );
  const titleOf = (id: string | number) =>
    terms
      .flatMap((item) => item.modules)
      .find((entry) => entry.module.id === id)?.module.title ?? String(id);
  const onDragStart = ({ active }: DragStartEvent) => {
    const entry = terms
      .flatMap((item) => item.modules)
      .find((candidate) => candidate.module.id === active.id);
    if (!entry) return;
    setDrag({
      moduleId: entry.module.id,
      title: entry.module.title,
      offering: entry.module.offering,
      targets: moveTargets(entry.module.id),
    });
  };
  // Only the terms the menu offers accept a drop; anything else leaves the plan as it is.
  const onDragEnd = ({ over }: DragEndEvent) => {
    const target = drag?.targets.find(
      (term) => over && format(term) === String(over.id),
    );
    if (drag && target) onMove(drag.moduleId, target);
    setDrag(null);
  };
  const dropState = (item: TimelineTerm): DropState => {
    if (!drag) return null;
    if (item.modules.some((entry) => entry.module.id === drag.moduleId))
      return "origin";
    return drag.targets.some((term) => format(term) === format(item.term))
      ? "allowed"
      : "blocked";
  };

  // From xl the semesters are columns of at least 11rem; extra columns (e.g. after a move) scroll inside
  // the timeline instead of squeezing the boxes (P5-10, feedback: "Wenn Boxen verschoben werden, bricht alles").
  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDrag(null)}
      accessibility={{
        announcements: announcements(titleOf),
        screenReaderInstructions: {
          draggable:
            "Ziehe das Modul mit Maus oder Finger in ein anderes Semester. Per Tastatur nutzt du „Verschieben“.",
        },
      }}
    >
      <div
        role="region"
        aria-label="Zeitleiste, horizontal scrollbar"
        tabIndex={0}
        className="focus-visible:-outline-offset-2 xl:overflow-x-auto xl:pb-2"
      >
        <ol className="grid gap-3 xl:auto-cols-[minmax(11rem,1fr)] xl:grid-flow-col xl:gap-2">
          {terms.map((item) => {
            const current =
              item.term.season === currentTerm.season &&
              item.term.year === currentTerm.year;
            const heavy = item.ects > LOAD_LIMIT;
            return (
              <SemesterColumn
                key={format(item.term)}
                item={item}
                current={current}
                dropState={dropState(item)}
                blockedReason={drag ? blockedReason(drag, item.term) : ""}
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
                      <li key={kind}>
                        {/* Toggle: marks the modules that belong to the milestone (P5-10, US-26). */}
                        <button
                          type="button"
                          aria-pressed={marking?.kind === kind}
                          title="Zugehörige Module markieren"
                          className="inline-flex items-center gap-1 rounded-full border border-transparent bg-tone-violet-soft px-2 py-0.5 text-meta text-foreground hover:border-tone-violet aria-pressed:border-tone-violet aria-pressed:font-semibold"
                          onClick={() => onToggleMilestone(kind)}
                        >
                          <Flag
                            className="size-3 text-tone-violet"
                            aria-hidden="true"
                          />
                          {MILESTONES[kind]}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {heavy && (
                  <p className="flex items-start gap-1 text-meta text-status-tight-foreground">
                    <TriangleAlert
                      className="mt-0.5 size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    Hohe Belastung: {item.ects} ECTS bei {load.jobHours} Std.
                    Nebenjob pro Woche
                  </p>
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
                      mark={
                        marking?.moduleIds.has(entry.module.id)
                          ? marking.kind
                          : null
                      }
                      fixedNote={
                        entry.module.isMilestone
                          ? fixedNotes[entry.module.isMilestone]
                          : undefined
                      }
                    />
                  ))}
                </ul>
                {heavy && load.citation && (
                  <CitationList
                    variant="footer"
                    className="mt-auto"
                    citations={[load.citation]}
                  />
                )}
              </SemesterColumn>
            );
          })}
        </ol>
      </div>
      {/* Preview under the pointer; no drop animation, so reduced motion needs no extra case. */}
      <DragOverlay dropAnimation={null}>
        {drag && (
          <div className="panel-shadow rounded-lg border bg-card p-2.5 text-meta font-semibold text-foreground">
            {drag.title}
            <span className="block font-normal text-muted-foreground">
              In ein hervorgehobenes Semester ziehen
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
