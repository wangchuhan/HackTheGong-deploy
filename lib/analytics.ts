import type { Report, TrendPoint } from "./types";

export function computeTrendsFromReports(reports: Report[]): TrendPoint[] {
  const byDate: Record<string, { reports: number; collections: number }> = {};

  for (const r of reports) {
    const date = r.createdAt.slice(0, 10);
    if (!byDate[date]) byDate[date] = { reports: 0, collections: 0 };
    byDate[date].reports += 1;
    if (r.status === "verified" || r.status === "collected") {
      byDate[date].collections += 1;
    }
  }

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({
      date,
      reports: counts.reports,
      collections: counts.collections,
    }));
}

/** Last N days of trends, filling gaps with zeros */
export function trendsLastNDays(reports: Report[], days = 30): TrendPoint[] {
  const computed = computeTrendsFromReports(reports);
  const map = new Map(computed.map((t) => [t.date, t]));

  const result: TrendPoint[] = [];
  const end = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push(map.get(key) ?? { date: key, reports: 0, collections: 0 });
  }
  return result;
}

export interface TrendWindowResult {
  points: TrendPoint[];
  label: string;
}

/** Last N calendar days, or fallback to last N days with activity if all zero */
export function getTrendWindow(
  trends: TrendPoint[],
  days = 7,
): TrendWindowResult {
  const recent = trends.slice(-days);
  const hasActivity = recent.some((t) => t.reports > 0 || t.collections > 0);

  if (hasActivity) {
    return { points: recent, label: `Last ${days} days` };
  }

  const withData = trends.filter((t) => t.reports > 0 || t.collections > 0);
  if (withData.length === 0) {
    return { points: recent, label: "No activity in range" };
  }

  return {
    points: withData.slice(-days),
    label: "Showing recent activity window",
  };
}

export function maxTrendReports(points: TrendPoint[]): number {
  return Math.max(...points.map((t) => t.reports), 1);
}
