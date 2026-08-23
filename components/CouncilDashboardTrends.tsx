"use client";

import { useEffect, useMemo, useState } from "react";
import { getSeedReports } from "@/lib/data";
import { getSessionReports } from "@/lib/user";
import PerformanceTrendsPanel from "@/components/PerformanceTrendsPanel";

export default function CouncilDashboardTrends() {
  const [sessionReports, setSessionReports] = useState(
    [] as ReturnType<typeof getSessionReports>,
  );

  useEffect(() => {
    setSessionReports(getSessionReports());
  }, []);

  const reports = useMemo(
    () => [...sessionReports, ...getSeedReports()],
    [sessionReports],
  );

  return (
    <PerformanceTrendsPanel
      reports={reports}
      showTable
      title="Report trends"
      defaultPreset="7d"
    />
  );
}
