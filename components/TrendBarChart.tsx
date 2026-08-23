"use client";

import type { TrendPoint } from "@/lib/types";
import { maxTrendReports } from "@/lib/analytics";

interface TrendBarChartProps {
  points: TrendPoint[];
  label?: string;
  heightPx?: number;
  emptyMessage?: string;
  scrollable?: boolean;
}

export default function TrendBarChart({
  points,
  label,
  heightPx = 128,
  emptyMessage = "No trend data yet — submit a report to see activity.",
  scrollable = false,
}: TrendBarChartProps) {
  const max = maxTrendReports(points);
  const barMaxHeight = heightPx - 28;
  const minBarWidth = points.length > 14 ? 28 : undefined;

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
        className={`rounded-xl bg-white p-4 ring-1 ring-teal-100 ${
          scrollable ? "overflow-x-auto" : ""
        }`}
      >
        <div
          className="flex items-end gap-1"
          style={{
            height: heightPx,
            minWidth: scrollable ? points.length * (minBarWidth ?? 24) : undefined,
          }}
        >
          {points.map((t) => {
            const barHeight =
              t.reports === 0
                ? 6
                : Math.max(6, Math.round((t.reports / max) * barMaxHeight));
            return (
              <div
                key={t.date}
                className="flex flex-col items-center justify-end gap-0.5"
                style={{
                  height: heightPx - 32,
                  minWidth: minBarWidth,
                  flex: scrollable ? "0 0 auto" : 1,
                }}
              >
                <span className="text-[10px] font-medium text-teal-800">
                  {t.reports}
                </span>
                <div
                  className="w-full min-w-[18px] rounded-t bg-teal-500 transition-all duration-300"
                  style={{ height: barHeight }}
                  title={`${t.date}: ${t.reports} reports, ${t.collections} collections`}
                />
                <span className="text-[9px] text-teal-700">
                  {points.length <= 14
                    ? t.date.slice(8)
                    : `${t.date.slice(5, 7)}/${t.date.slice(8)}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
