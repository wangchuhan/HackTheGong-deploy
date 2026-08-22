"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getSeedReports, getSuburbZones } from "@/lib/data";
import { getSessionReports } from "@/lib/user";
import type { Report } from "@/lib/types";

const SuburbHeatmap = dynamic(() => import("@/components/SuburbHeatmap"), {
  ssr: false,
});
const HeatmapView = dynamic(() => import("@/components/HeatmapView"), {
  ssr: false,
});

export default function HeatmapPage() {
  const [sessionReports, setSessionReports] = useState<Report[]>([]);
  const [mode, setMode] = useState<"rings" | "points">("rings");

  useEffect(() => {
    setSessionReports(getSessionReports());
  }, []);

  const allReports = useMemo(
    () => [...sessionReports, ...getSeedReports()],
    [sessionReports],
  );
  const zones = getSuburbZones();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">Litter Heatmap</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Suburb rings show hotspots (red) and cleanest areas (green)
        </p>
      </header>

      <div className="flex gap-2">
        {(["rings", "points"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              mode === m
                ? "bg-teal-600 text-white"
                : "bg-white text-teal-800 ring-1 ring-teal-100"
            }`}
          >
            {m === "rings" ? "Suburb rings" : "Report points"}
          </button>
        ))}
      </div>

      {mode === "rings" ? (
        <SuburbHeatmap reports={allReports} zones={zones} height="460px" />
      ) : (
        <HeatmapView reports={allReports} height="460px" />
      )}

      {sessionReports.length > 0 && (
        <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Your {sessionReports.length} new report(s) are included in suburb counts.
        </div>
      )}
    </div>
  );
}
