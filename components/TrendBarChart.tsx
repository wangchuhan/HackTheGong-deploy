"use client";

import type { TrendPoint } from "@/lib/types";
import { maxTrendReports } from "@/lib/analytics";

interface TrendBarChartProps {
  points: TrendPoint[];
  label?: string;
  heightPx?: number;
  emptyMessage?: string;
}

export default function TrendBarChart({
  points,
  label,
  heightPx = 128,
  emptyMessage = "No trend data yet — submit a report to see activity.",
}: TrendBarChartProps) {
  const max = maxTrendReports(points);
  const barMaxHeight = heightPx - 28;

  if (points.length === 0) {
    return (
      <div>
        {label && <p className="mb-2 text-xs text-teal-700">{label}</p>}
        <div
          className="flex items-center justify-center rounded-xl bg-white p-4 ring-1 ring-teal-100"
          style={{ height: heightPx }}
        >
          <p className="text-sm text-teal-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && <p className="mb-2 text-xs text-teal-700">{label}</p>}
      <div
        className="flex items-end gap-1 rounded-xl bg-white p-4 ring-1 ring-teal-100"
        style={{ height: heightPx }}
      >
        {points.map((t) => {
          const barHeight =
            t.reports === 0
              ? 6
              : Math.max(6, Math.round((t.reports / max) * barMaxHeight));
          return (
            <div
              key={t.date}
              className="flex flex-1 flex-col items-center justify-end gap-0.5"
              style={{ height: heightPx - 32 }}
            >
              <span className="text-[10px] font-medium text-teal-800">
                {t.reports}
              </span>
              <div
                className="w-full rounded-t bg-teal-500"
                style={{ height: barHeight }}
                title={`${t.date}: ${t.reports} reports`}
              />
              <span className="text-[9px] text-teal-700">{t.date.slice(8)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
