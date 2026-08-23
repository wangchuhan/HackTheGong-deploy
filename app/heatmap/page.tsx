"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getSeedReports, getSuburbZones } from "@/lib/data";
import { getSessionReports } from "@/lib/user";
import type { Report } from "@/lib/types";

const SuburbHeatmap = dynamic(() => import("@/components/SuburbHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[460px] animate-pulse rounded-xl bg-teal-100/60" />
  ),
});
const HeatmapView = dynamic(() => import("@/components/HeatmapView"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[460px] animate-pulse rounded-xl bg-teal-100/60" />
  ),
});

type HeatmapMode = "combined" | "rings" | "heat";

export default function HeatmapPage() {
  const [sessionReports, setSessionReports] = useState<Report[]>([]);
  const [mode, setMode] = useState<HeatmapMode>("combined");

  useEffect(() => {
    setSessionReports(getSessionReports());
  }, []);

  const allReports = useMemo(
    () => [...sessionReports, ...getSeedReports()],
    [sessionReports],
  );
  const sessionIds = useMemo(
    () => new Set(sessionReports.map((r) => r.id)),
    [sessionReports],
  );
  const zones = getSuburbZones();

  const modes: { key: HeatmapMode; label: string }[] = [
    { key: "combined", label: "Combined" },
    { key: "rings", label: "Rings only" },
    { key: "heat", label: "Heat layer" },
  ];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">Litter Heatmap</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Suburb rings show hotspots (red) and cleanest areas (green). Combined
          view adds individual report pins.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              mode === m.key
                ? "bg-teal-600 text-white"
                : "bg-white text-teal-800 ring-1 ring-teal-100"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="min-h-[460px] w-full">
        {mode === "heat" ? (
          <HeatmapView reports={allReports} height="460px" />
        ) : (
          <SuburbHeatmap
            reports={allReports}
            zones={zones}
            height="460px"
            showReportPins={mode === "combined"}
            sessionReportIds={sessionIds}
          />
        )}
      </div>

      {sessionReports.length > 0 && (
        <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Your {sessionReports.length} new report(s) are included as brighter
          pins on the map.
        </div>
      )}
    </div>
  );
}
