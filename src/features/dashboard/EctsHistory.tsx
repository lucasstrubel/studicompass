import { useEffect, useRef } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { compare, format, semesterNumber } from "@/domain/terms";
import { selectAcademicState, selectBasePlan } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";
import { cn } from "@/lib/utils";

// The course line, the signature of the app: solid with a soft area = earned, dotted = forecast, dashed = target.
const CHART_CONFIG = {
  actual: { label: "Ist", color: "var(--accent)" },
  forecast: { label: "Prognose", color: "var(--accent)" },
  target: { label: "Soll", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

type WaypointKind = "start" | "done" | "position" | "planned" | "finish";

interface Point {
  term: string;
  actual: number | null;
  forecast: number | null;
  target: number;
  kind: WaypointKind;
  semester: number | null;
  /** Milestone named on the line. */
  label?: string;
}

/** Difference to the target in words, e.g. "12 ECTS unter Soll" (P5-12). */
function targetGap(value: number, target: number) {
  const gap = value - target;
  if (gap === 0) return "genau im Soll";
  return `${Math.abs(gap)} ECTS ${gap < 0 ? "unter" : "über"} Soll`;
}

/** Signed difference for the value table, with a typographic minus. */
function signedGap(value: number, target: number) {
  const gap = value - target;
  return gap === 0 ? "±0" : `${gap < 0 ? "−" : "+"}${Math.abs(gap)}`;
}

/** Hover box: actual or forecast, target and the gap (feedback P5-F12). */
function EctsTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: Point }[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  const forecast = point.actual === null;
  const value = point.actual ?? point.forecast ?? 0;
  return (
    <div className="grid min-w-40 gap-1 rounded-lg border bg-card px-3 py-2 text-meta shadow-xl">
      <p className="font-semibold text-foreground">{point.term}</p>
      <p className="text-foreground tabular-nums">
        {forecast ? "Prognose" : "Ist"}: {value} ECTS
      </p>
      <p className="text-muted-foreground tabular-nums">
        Soll: {point.target} ECTS
      </p>
      <p className="font-semibold text-foreground tabular-nums">
        {targetGap(value, point.target)}
      </p>
    </div>
  );
}

/** Line label with a halo in the surface colour, so it stays readable where it crosses a line. */
function LineLabel({
  x,
  y,
  className,
  children,
}: {
  x: number;
  y: number;
  className?: string;
  children: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      className={cn(
        "fill-foreground stroke-card text-[0.8125rem] font-medium [paint-order:stroke] [stroke-width:4px]",
        className,
      )}
    >
      {children}
    </text>
  );
}

/** One control of the course, as on an orienteering map: triangle at the start, double circle at the end. */
function Waypoint({
  cx,
  cy,
  payload,
}: {
  cx: number;
  cy: number;
  payload: Point;
}) {
  const { kind, semester, label } = payload;
  const number = semester !== null && (
    <text
      x={cx}
      y={cy}
      dy="0.35em"
      textAnchor="middle"
      className={cn(
        "text-[0.6875rem] font-semibold",
        kind === "planned" || kind === "finish"
          ? "fill-foreground"
          : "fill-accent-foreground",
      )}
    >
      {semester}
    </text>
  );
  return (
    <g>
      {kind === "start" && (
        <path
          d={`M${cx} ${cy - 9}L${cx + 8} ${cy + 5}L${cx - 8} ${cy + 5}Z`}
          strokeWidth={2}
          strokeLinejoin="round"
          className="fill-card stroke-accent"
        />
      )}
      {kind === "done" && (
        <circle cx={cx} cy={cy} r={10} className="fill-accent" />
      )}
      {kind === "position" && (
        <circle cx={cx} cy={cy} r={12} className="fill-accent" />
      )}
      {kind === "planned" && (
        <circle
          cx={cx}
          cy={cy}
          r={10}
          strokeWidth={1.5}
          className="fill-card stroke-accent"
        />
      )}
      {kind === "finish" && (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={14}
            strokeWidth={1.5}
            className="fill-card stroke-accent"
          />
          <circle
            cx={cx}
            cy={cy}
            r={10}
            strokeWidth={1.5}
            className="fill-card stroke-accent"
          />
        </>
      )}
      {number}
      {kind === "position" && (
        <>
          {/* The needle marks the student's position on the course. */}
          <svg
            x={cx - 44}
            y={cy + 17}
            width={14}
            height={14}
            viewBox="0 0 24 24"
          >
            <path d="M20 4 14.5 14.5 9.5 9.5Z" className="fill-accent" />
            <path d="M4 20 9.5 9.5 14.5 14.5Z" className="fill-foreground" />
          </svg>
          <LineLabel x={cx + 8} y={cy + 28}>
            Du bist hier
          </LineLabel>
        </>
      )}
      {kind === "finish" && (
        <LineLabel x={cx - 8} y={cy - 22}>
          Abschluss
        </LineLabel>
      )}
      {/* Narrow screens have no room beside the neighbouring controls; the milestone section names it. */}
      {label && (
        <LineLabel x={cx} y={cy + 28} className="max-md:hidden">
          {label}
        </LineLabel>
      )}
    </g>
  );
}

function waypoint(kinds: WaypointKind[]) {
  // Each line draws only its own controls; the join between earned and forecast appears once.
  return function WaypointDot(props: {
    cx?: number;
    cy?: number;
    index?: number;
    payload?: Point;
  }) {
    const { cx, cy, index, payload } = props;
    if (
      cx === undefined ||
      cy === undefined ||
      !payload ||
      !kinds.includes(payload.kind)
    )
      return <g key={index} />;
    return <Waypoint key={index} cx={cx} cy={cy} payload={payload} />;
  };
}

/** The course last drawn in this session; coming back to the page does not draw it again. */
let drawnCourse: string | null = null;

/**
 * The one authored moment of the app: the course draws itself on first view and again when a decision changes it,
 * which shows the consequence. The chart stands complete without this, and reduced motion leaves it that way.
 */
function useCourseDraw(course: string) {
  const chart = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (drawnCourse === course) return;
    drawnCourse = course;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    chart.current?.animate?.(
      [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
      { duration: 600, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
  }, [course]);
  return chart;
}

const EARNED_DOT = waypoint(["start", "done", "position"]);
const FORECAST_DOT = waypoint(["planned", "finish"]);

/**
 * Course line and value table of the ECTS-Verlauf: cumulative actual and forecast against the target up to
 * the expected graduation, so a simulated decision visibly lengthens the course. The section heading lives on
 * the page, so it shows while this lazy chunk loads. The chart is decorative for screen readers: the table
 * holds the same values and stays folded away until someone asks for the numbers.
 */
export function EctsHistory() {
  const plan = useDemoStore(selectBasePlan);
  const academic = useDemoStore(selectAcademicState);
  const chart = useCourseDraw(
    plan?.terms.map((item) => item.cumulativeEcts).join() ?? "",
  );
  if (!plan || !academic) return null;

  const position = plan.terms.findLastIndex(
    (item) => compare(item.term, academic.currentTerm) < 0,
  );
  const semesters: Point[] = plan.terms.map((item, index) => {
    const earned = index <= position;
    const finish =
      plan.graduationTerm !== null &&
      compare(item.term, plan.graduationTerm) === 0;
    return {
      term: format(item.term),
      actual: earned ? item.cumulativeEcts : null,
      forecast: index >= position ? item.cumulativeEcts : null,
      target: item.targetEcts,
      semester: semesterNumber(item.term, academic.student.startTerm),
      kind:
        index === position
          ? "position"
          : earned
            ? "done"
            : finish
              ? "finish"
              : "planned",
      label:
        plan.internshipTerm && compare(item.term, plan.internshipTerm) === 0
          ? "Praxissemester"
          : plan.projectTerm && compare(item.term, plan.projectTerm) === 0
            ? "Projekt"
            : undefined,
    };
  });
  // The curve rises from zero (P5-12); without an earned semester the forecast starts there as well.
  const points: Point[] = [
    {
      term: "Studienbeginn",
      actual: 0,
      forecast: position < 0 ? 0 : null,
      target: 0,
      kind: "start",
      semester: null,
    },
    ...semesters,
  ];

  return (
    <div className="mt-3">
      <div ref={chart} className="min-w-0">
        <ChartContainer
          config={CHART_CONFIG}
          className="aspect-auto h-56 w-full md:h-64"
          aria-hidden="true"
        >
          <ComposedChart
            accessibilityLayer={false}
            data={points}
            margin={{ left: -8, right: 20, top: 32, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="term"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: "var(--muted-foreground)" }}
              interval="preserveStartEnd"
              minTickGap={4}
              padding={{ left: 28, right: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tick={{ fill: "var(--muted-foreground)" }}
              domain={[0, "dataMax"]}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)" }}
              content={<EctsTooltip />}
            />
            <Line
              dataKey="target"
              type="linear"
              stroke="var(--color-target)"
              strokeWidth={1.5}
              strokeDasharray="6 5"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="forecast"
              type="linear"
              stroke="var(--color-forecast)"
              strokeWidth={2}
              strokeDasharray="1 6"
              strokeLinecap="round"
              dot={FORECAST_DOT}
              activeDot={false}
              isAnimationActive={false}
            />
            <Area
              dataKey="actual"
              type="linear"
              stroke="var(--color-actual)"
              strokeWidth={3}
              fill="var(--accent-soft)"
              fillOpacity={1}
              dot={EARNED_DOT}
              activeDot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
      <details className="mt-2">
        <summary className="w-fit cursor-pointer rounded-sm text-body font-medium text-muted-foreground hover:text-foreground">
          Werte als Tabelle
        </summary>
        <p className="mt-2 text-meta text-muted-foreground">
          Kumuliert je Semester. Prognosen gelten, wenn du alle angemeldeten
          Prüfungen bestehst.
        </p>
        <table className="mt-2 w-full max-w-xl text-meta tabular-nums">
          <caption className="sr-only">ECTS je Semester</caption>
          <thead className="text-muted-foreground">
            <tr>
              <th scope="col" className="py-0.5 text-left font-medium">
                Semester
              </th>
              <th scope="col" className="py-0.5 text-right font-medium">
                Ist / Prognose
              </th>
              <th scope="col" className="py-0.5 text-right font-medium">
                Soll
              </th>
              <th scope="col" className="py-0.5 text-right font-medium">
                Differenz
              </th>
            </tr>
          </thead>
          <tbody>
            {semesters.map((point) => (
              <tr key={point.term}>
                <th scope="row" className="py-0.5 text-left font-medium">
                  {point.term}
                </th>
                <td className="py-0.5 text-right">
                  {point.actual ?? `${point.forecast ?? "–"} (Prognose)`}
                </td>
                <td className="py-0.5 text-right">{point.target}</td>
                <td className="py-0.5 text-right">
                  {signedGap(point.actual ?? point.forecast ?? 0, point.target)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
