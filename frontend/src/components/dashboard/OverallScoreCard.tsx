"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { BAND_HEX } from "@/lib/bands";
import { Band, BandLabel, TrendPoint } from "@/lib/types";
import {
  OVERALL_SCORE_TITLE,
  OVERALL_SCORE_LEAD,
  OVERALL_SCORE_SUB_CASE1,
  OVERALL_SCORE_SUB_CASE2,
  deltaPill
} from "@/lib/copy";
import { TrendChart } from "./TrendChart";

interface Props {
  score: number;
  band: Band;
  label: BandLabel;
  variant: "starting" | "tracking";
  deltaFromPrevious?: number | null;
  trendPoints?: TrendPoint[];
}

export function OverallScoreCard({ score, band, variant, deltaFromPrevious, trendPoints }: Props) {
  const [expanded, setExpanded] = useState(false);

  const size = 112;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = pct * c;
  const ringColor = BAND_HEX[band];

  const showDelta = variant === "tracking" && typeof deltaFromPrevious === "number";
  const isUp = (deltaFromPrevious ?? 0) >= 0;

  return (
    <div className="px-4 mt-4">
      <h2 className="text-base font-semibold text-ink-900 mb-2">{OVERALL_SCORE_TITLE}</h2>
      <Card>
        <CardBody className="pt-4 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke={ringColor}
                  strokeWidth={stroke}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${c - dash}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold leading-none">{score}</span>
                <span className="text-xs text-ink-500 mt-1">/100</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-ink-900 leading-snug">{OVERALL_SCORE_LEAD}</p>
              <p className="text-sm text-ink-500 mt-0.5">
                {variant === "starting" ? OVERALL_SCORE_SUB_CASE1 : OVERALL_SCORE_SUB_CASE2}
              </p>
            </div>
          </div>

          {showDelta && (
            <>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-4 mx-auto flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1.5 text-sm text-ink-700"
              >
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: isUp ? BAND_HEX.healthy : BAND_HEX.warning }}
                >
                  {isUp ? <ArrowUp size={12} strokeWidth={3} /> : <ArrowDown size={12} strokeWidth={3} />}
                </span>
                <span className="font-medium">{deltaPill(deltaFromPrevious!)}</span>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expanded && trendPoints && trendPoints.length > 1 && (
                <div className="mt-3">
                  <TrendChart points={trendPoints} height={160} />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
