import { NextResponse } from "next/server";
import { getSeedReports } from "@/lib/data";

function toCsv(rows: Record<string, string | number>[], headers: string[]) {
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h] ?? "")).join(","));
  }
  return lines.join("\n");
}

export async function GET() {
  const reports = getSeedReports();
  const csv = toCsv(
    reports.map((r) => ({
      id: r.id,
      lat: r.lat,
      lng: r.lng,
      suburb: r.suburb,
      status: r.status,
      createdAt: r.createdAt,
      pointsAwarded: r.pointsAwarded,
    })),
    ["id", "lat", "lng", "suburb", "status", "createdAt", "pointsAwarded"],
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vapesafe-reports.csv"',
    },
  });
}
