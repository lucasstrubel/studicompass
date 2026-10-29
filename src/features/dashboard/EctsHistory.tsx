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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { compare, format } from "@/domain/terms";
import { selectAcademicState, selectBasePlan } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";

// KONZEPT §12.2 diagrams: ECTS are blue throughout – actual = line with soft area, forecast = dashed line,
// target = dashed muted line. Both tones reach at least 3:1 on the card.
const CHART_CONFIG = {
  actual: { label: "Ist", color: "var(--tone-blue)" },
  forecast: { label: "Prognose", color: "var(--tone-blue)" },
  target: { label: "Soll", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

interface Point {
  term: string;
  actual: number | null;
  forecast: number | null;
  target: number;
}

/** Start of the curve: both lines rise from zero (P5-12, feedback "ECTS-Verlauf startet bei 0"). */
const START: Point = {
  term: "Studienbeginn",
  actual: 0,
  forecast: null,
  target: 0,
};

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
      <p className="tabular-nums">
        {forecast ? "Prognose" : "Ist"}: {value} ECTS
      </p>
      <p className="tabular-nums text-muted-foreground">
        Soll: {point.target} ECTS
      </p>
      <p className="font-semibold tabular-nums text-foreground">
        {targetGap(value, point.target)}
      </p>
    </div>
  );
}

/**
 * Chart and value table of the ECTS-Verlauf (KONZEPT §8 S1 no. 3): cumulative actual vs. target up to this
 * semester. The section heading lives on the page, so it shows while this lazy chunk loads.
 */
export function EctsHistory() {
  const plan = useDemoStore(selectBasePlan);
  const academic = useDemoStore(selectAcademicState);
  if (!plan || !academic) return null;

  const terms = plan.terms.filter(
    (item) => compare(item.term, academic.currentTerm) <= 0,
  );
  const semesters: Point[] = terms.map((item, index) => {
    const current = compare(item.term, academic.currentTerm) === 0;
    const lastCompleted = index === terms.length - 2;
    return {
      term: format(item.term),
      actual: current ? null : item.cumulativeEcts,
      forecast: current || lastCompleted ? item.cumulativeEcts : null,
      target: item.targetEcts,
    };
  });
  const points = [START, ...semesters];

  return (
    <div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-center">
      <ChartContainer
        config={CHART_CONFIG}
        className="aspect-auto h-48 w-full"
        aria-hidden="true"
      >
        <ComposedChart
          accessibilityLayer={false}
          data={points}
          margin={{ left: -16, right: 12, top: 8 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="term"
            tickLine={false}
            axisLine={false}
            interval={0}
            padding={{ left: 40, right: 40 }}
          />
          <YAxis tickLine={false} axisLine={false} width={48} />
          <ChartTooltip content={<EctsTooltip />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            dataKey="actual"
            type="linear"
            stroke="var(--color-actual)"
            strokeWidth={2}
            fill="var(--tone-blue-soft)"
            fillOpacity={1}
            dot={{ r: 4 }}
            isAnimationActive={false}
          />
          <Line
            dataKey="forecast"
            type="linear"
            stroke="var(--color-forecast)"
            strokeWidth={2}
            strokeDasharray="2 4"
            dot={{ r: 4 }}
            isAnimationActive={false}
          />
          <Line
            dataKey="target"
            type="linear"
            stroke="var(--color-target)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartContainer>
      <table className="w-full text-meta tabular-nums">
        <caption className="sr-only">ECTS je Semester</caption>
        <thead className="text-muted-foreground">
          <tr>
            <th scope="col" className="text-left font-medium">
              Semester
            </th>
            <th scope="col" className="text-right font-medium">
              Ist / Prognose
            </th>
            <th scope="col" className="text-right font-medium">
              Soll
            </th>
            <th scope="col" className="text-right font-medium">
              Differenz
            </th>
          </tr>
        </thead>
        <tbody>
          {semesters.map((point) => (
            <tr key={point.term}>
              <th scope="row" className="text-left font-medium">
                {point.term}
              </th>
              <td className="text-right">
                {point.actual ?? `${point.forecast ?? "–"} (Prognose)`}
              </td>
              <td className="text-right">{point.target}</td>
              <td className="text-right">
                {signedGap(point.actual ?? point.forecast ?? 0, point.target)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
