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
