"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getSeedReports } from "@/lib/data";
import { getSessionReports } from "@/lib/user";
import type { Report } from "@/lib/types";

const HeatmapView = dynamic(() => import("@/components/HeatmapView"), {
  ssr: false,
});

export default function HeatmapPage() {
  const [sessionReports, setSessionReports] = useState<Report[]>([]);

  useEffect(() => {
    setSessionReports(getSessionReports());
  }, []);

  const allReports = useMemo(
    () => [...sessionReports, ...getSeedReports()],
    [sessionReports],
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">Litter Heatmap</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          {allReports.length} reports across Wollongong — seed data + your session
          reports.
        </p>
      </header>

      <HeatmapView reports={allReports} height="460px" />

      {sessionReports.length > 0 && (
        <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Your {sessionReports.length} new report(s) appear on the map in brighter
          hotspots.
        </div>
      )}

      <p className="text-xs text-teal-700/60">
        Heatmap data is demo seed JSON. Submit a report to see live overlay updates.
      </p>
    </div>
  );
}
