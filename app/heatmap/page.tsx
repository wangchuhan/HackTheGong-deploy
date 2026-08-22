"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Flame } from "lucide-react";
import { getSeedReports } from "@/lib/data";
import { getSessionReports } from "@/lib/user";
import type { Report } from "@/lib/types";

const HeatmapView = dynamic(() => import("@/components/HeatmapView"), { ssr: false });

export default function HeatmapPage() {
  const seedReports = useMemo(() => getSeedReports(), []);
  const [sessionReports, setSessionReports] = useState<Report[]>(() =>
    typeof window === "undefined" ? [] : getSessionReports(),
  );

  useEffect(() => {
    const refresh = () => setSessionReports(getSessionReports());
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const allReports = useMemo(
    () => [...sessionReports, ...seedReports],
    [sessionReports, seedReports],
  );

  const pending = allReports.filter((r) => r.status === "pending").length;
  const verified = allReports.filter((r) => r.status === "verified" || r.status === "collected").length;

  return (
    <div className="space-y-4">
      <header>
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" />
          <h1 className="text-xl font-bold text-teal-900">Litter heatmap</h1>
        </div>
        <p className="text-sm text-teal-700/70">
          {allReports.length} reports across Wollongong · {sessionReports.length} from your session
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-amber-50 p-3 ring-1 ring-amber-100">
          <p className="text-2xl font-bold text-amber-800">{pending}</p>
          <p className="text-xs text-amber-700/80">Pending pickup</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3 ring-1 ring-green-100">
          <p className="text-2xl font-bold text-green-800">{verified}</p>
          <p className="text-xs text-green-700/80">Verified / collected</p>
        </div>
      </div>

      <HeatmapView reports={allReports} height="460px" />

      <p className="text-xs text-teal-700/60">
        Hotter zones show repeat litter hotspots. Council uses this to schedule smart-bin
        deployments and school outreach.
      </p>
    </div>
  );
}
