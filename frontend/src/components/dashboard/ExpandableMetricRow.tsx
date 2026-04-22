"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, CalendarDays } from "lucide-react";
import { Band } from "@/lib/types";
import { BAND_HEX } from "@/lib/bands";
import { deltaPill } from "@/lib/copy";

interface Props {
  label: string;
  score: number;
  band: Band;
  delta?: number;
  direction?: "up" | "down";
  description: string;
  expectation: string;
  defaultExpanded?: boolean;
}

export function ExpandableMetricRow({
  label,
  score,
  band,
  delta,
  direction,
  description,
  expectation,
  defaultExpanded = false
}: Props) {
  const [open, setOpen] = useState(defaultExpanded);
  const hasDelta = typeof delta === "number" && !!direction;
  const isUp = direction === "up";
  const expandable = Boolean(description || expectation);
  // When there's a delta, the score color signals the direction of change (green up, red down)
  // — matches `Card Item.png`. Without a delta (Case 1), fall back to the band color.
  const scoreColor = hasDelta ? (isUp ? BAND_HEX.healthy : BAND_HEX.warning) : BAND_HEX[band];

  return (
    <div className="rounded-2xl border border-ink-100 bg-white">
      <button
        type="button"
        disabled={!expandable}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-base font-medium text-ink-900">{label}</p>
          {hasDelta && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
              <span
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: isUp ? BAND_HEX.healthy : BAND_HEX.warning }}
              >
                {isUp ? <ArrowUp size={10} strokeWidth={3} /> : <ArrowDown size={10} strokeWidth={3} />}
              </span>
              <span>{deltaPill(delta!)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold" style={{ color: scoreColor }}>
            {score}
            <span className="text-sm text-ink-500 font-medium">/100</span>
          </span>
          {expandable && (open ? <ChevronUp size={18} className="text-ink-500" /> : <ChevronDown size={18} className="text-ink-500" />)}
        </div>
      </button>

      {expandable && open && (
        <div className="border-t border-ink-100 px-4 py-3 space-y-2">
          {description && <p className="text-sm text-ink-700 leading-relaxed">{description}</p>}
          {expectation && (
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <CalendarDays size={14} />
              <span>{expectation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
