"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendPoint } from "@/lib/types";
import { BAND_HEX, bandFor } from "@/lib/bands";
import { formatScanDate } from "@/lib/utils";

export function TrendChart({ points, height = 140 }: { points: TrendPoint[]; height?: number }) {
  const latest = points[points.length - 1]?.score ?? 0;
  const color = BAND_HEX[bandFor(latest).band];

  const data = points.map((p) => ({ ...p, label: formatScanDate(p.scanDate) }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, fontSize: 12 }}
            labelFormatter={(l) => `Scan · ${l}`}
            formatter={(v: number) => [`${v}/100`, "Score"]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 4, fill: color, stroke: "white", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
