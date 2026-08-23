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

export type TrendRangePreset = "today" | "7d" | "30d" | "90d";

export const TREND_RANGE_PRESETS: {
  id: TrendRangePreset;
  label: string;
  days: number;
}[] = [
  { id: "today", label: "Today", days: 1 },
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
];

export interface TrendWindowResult {
  points: TrendPoint[];
  label: string;
  totalReports: number;
  totalCollections: number;
  avgReportsPerDay: number;
}

function summarizeTrendWindow(points: TrendPoint[], label: string): TrendWindowResult {
  const totalReports = points.reduce((sum, p) => sum + p.reports, 0);
  const totalCollections = points.reduce((sum, p) => sum + p.collections, 0);
  const avgReportsPerDay =
    points.length > 0 ? Math.round((totalReports / points.length) * 10) / 10 : 0;
  return { points, label, totalReports, totalCollections, avgReportsPerDay };
}

/** Explicit date-range slice — no auto-fallback when user picks a preset */
export function getTrendRange(
  reports: Report[],
  preset: TrendRangePreset,
): TrendWindowResult {
  const config = TREND_RANGE_PRESETS.find((p) => p.id === preset) ?? TREND_RANGE_PRESETS[1];
  const points = trendsLastNDays(reports, config.days);
  const label = preset === "today" ? "Today" : config.label;
  return summarizeTrendWindow(points, label);
}

/** Last N calendar days, or fallback to last N days with activity if all zero */
export function getTrendWindow(
  trends: TrendPoint[],
  days = 7,
): TrendWindowResult {
  const recent = trends.slice(-days);
  const hasActivity = recent.some((t) => t.reports > 0 || t.collections > 0);
  const recentMax = Math.max(...recent.map((t) => t.reports), 0);

  if (hasActivity && recentMax >= 2) {
    return summarizeTrendWindow(recent, `Last ${days} days`);
  }

  const withData = trends.filter((t) => t.reports > 0 || t.collections > 0);
  if (withData.length === 0) {
    return summarizeTrendWindow(recent, "No activity in range");
  }

  if (hasActivity && recentMax < 2) {
    const wider = trends.slice(-Math.max(days * 2, 14));
    const widerHasData = wider.some((t) => t.reports > 0);
    if (widerHasData) {
      return summarizeTrendWindow(
        wider.filter((t) => t.reports > 0).slice(-days),
        "Showing recent activity window",
      );
    }
  }

  return summarizeTrendWindow(withData.slice(-days), "Showing recent activity window");
}

export function maxTrendReports(points: TrendPoint[]): number {
  return Math.max(...points.map((t) => t.reports), 1);
}
