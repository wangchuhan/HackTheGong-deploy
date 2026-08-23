"use client";

import { useMemo, useState } from "react";
import type { Report } from "@/lib/types";
import {
  TREND_RANGE_PRESETS,
  getTrendRange,
  type TrendRangePreset,
} from "@/lib/analytics";
import TrendBarChart from "@/components/TrendBarChart";

interface PerformanceTrendsPanelProps {
  reports: Report[];
  showTable?: boolean;
  title?: string;
  defaultPreset?: TrendRangePreset;
}

export default function PerformanceTrendsPanel({
  reports,
  showTable = false,
  title = "Performance trends",
  defaultPreset = "7d",
}: PerformanceTrendsPanelProps) {
  const [preset, setPreset] = useState<TrendRangePreset>(defaultPreset);

  const window = useMemo(
    () => getTrendRange(reports, preset),
    [reports, preset],
  );

  const chartHeight = preset === "today" ? 100 : preset === "7d" ? 128 : 140;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-teal-950">{title}</h2>
        <div className="flex flex-wrap gap-1.5">
          {TREND_RANGE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                preset === p.id
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-teal-800 ring-1 ring-teal-100 hover:ring-teal-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-white px-3 py-2 text-center ring-1 ring-teal-100">
          <p className="text-lg font-bold text-teal-900">{window.totalReports}</p>
          <p className="text-[10px] text-teal-700">Reports</p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2 text-center ring-1 ring-teal-100">
          <p className="text-lg font-bold text-teal-900">{window.totalCollections}</p>
          <p className="text-[10px] text-teal-700">Collections</p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2 text-center ring-1 ring-teal-100">
          <p className="text-lg font-bold text-teal-900">{window.avgReportsPerDay}</p>
          <p className="text-[10px] text-teal-700">Avg / day</p>
        </div>
      </div>

      <TrendBarChart
        points={window.points}
        label={`${window.label} · seed data + live session reports`}
        heightPx={chartHeight}
        scrollable={window.points.length > 14}
        emptyMessage={`No reports in ${window.label.toLowerCase()} — try a wider range.`}
      />

      {showTable && (
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-teal-100">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-teal-100 text-teal-700">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Reports</th>
                <th className="px-4 py-2">Collections</th>
              </tr>
            </thead>
            <tbody>
              {window.points.map((row) => (
                <tr
                  key={row.date}
                  className={`border-b border-teal-50 ${
                    row.reports > 0 ? "bg-white" : "bg-teal-50/30 text-teal-600"
                  }`}
                >
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2 font-medium">{row.reports}</td>
                  <td className="px-4 py-2">{row.collections}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
