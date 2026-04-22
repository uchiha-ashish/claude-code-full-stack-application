import { SummaryRow, DeltaRow } from "@/lib/types";
import { SEE_FULL_ANALYSIS } from "@/lib/copy";
import { ExpandableMetricRow } from "./ExpandableMetricRow";

type Row = SummaryRow | DeltaRow;

function isDelta(r: Row): r is DeltaRow {
  return (r as DeltaRow).direction != null;
}

interface Props {
  title: string;
  rows: Row[];
  emphasis: "good" | "target";
  showFullAnalysisLink?: boolean;
}

export function MetricList({ title, rows, emphasis, showFullAnalysisLink }: Props) {
  if (rows.length === 0) return null;

  const titleColor = emphasis === "good" ? "text-band-healthy" : "text-band-warning";

  return (
    <section className="px-4 mt-5">
      <h3 className={`text-base font-semibold mb-2 ${titleColor}`}>{title}</h3>
      <div className="space-y-2">
        {rows.map((r) => (
          <ExpandableMetricRow
            key={r.itemKey}
            label={r.label}
            score={r.score}
            band={r.band}
            delta={isDelta(r) ? r.delta : undefined}
            direction={isDelta(r) ? r.direction : undefined}
            description={r.description}
            expectation={r.expectation}
          />
        ))}
      </div>
      {showFullAnalysisLink && (
        <button
          type="button"
          className="mt-3 w-full rounded-full bg-ink-100 py-2.5 text-sm font-medium text-ink-700"
        >
          {SEE_FULL_ANALYSIS}
        </button>
      )}
    </section>
  );
}
