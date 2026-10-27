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
  ChartTooltipContent,
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

/** ECTS-Verlauf (KONZEPT §8 S1 no. 5, low priority): cumulative actual vs. target up to this semester. */
export function EctsHistory() {
  const plan = useDemoStore(selectBasePlan);
  const academic = useDemoStore(selectAcademicState);
  if (!plan || !academic) return null;

  const terms = plan.terms.filter(
    (item) => compare(item.term, academic.currentTerm) <= 0,
  );
  const points: Point[] = terms.map((item, index) => {
    const current = compare(item.term, academic.currentTerm) === 0;
    const lastCompleted = index === terms.length - 2;
    return {
      term: format(item.term),
      actual: current ? null : item.cumulativeEcts,
      forecast: current || lastCompleted ? item.cumulativeEcts : null,
      target: item.targetEcts,
    };
  });

  return (
    <>
      <h2 id="ects-history" className="text-section-title">
        ECTS-Verlauf
      </h2>
      <p className="mt-1 text-meta text-muted-foreground">
        Kumuliert je Semester; das laufende Semester als Prognose, wenn du alle
        angemeldeten Prüfungen bestehst.
      </p>
      <ChartContainer
        config={CHART_CONFIG}
        className="mt-3 aspect-auto h-56 w-full"
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
          <ChartTooltip content={<ChartTooltipContent />} />
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
      <table className="mt-3 w-full text-meta tabular-nums">
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
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.term}>
              <th scope="row" className="text-left font-medium">
                {point.term}
              </th>
              <td className="text-right">
                {point.actual ?? `${point.forecast ?? "–"} (Prognose)`}
              </td>
              <td className="text-right">{point.target}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
