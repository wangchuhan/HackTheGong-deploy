import { NextResponse } from "next/server";
import { getBins } from "@/lib/data";

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
  const bins = getBins();
  const csv = toCsv(
    bins.map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      lat: b.lat,
      lng: b.lng,
      fillLevel: b.fillLevel,
      temperature: b.temperature,
      itemsCollected: b.itemsCollected,
      lastReading: b.lastReading,
    })),
    ["id", "code", "name", "lat", "lng", "fillLevel", "temperature", "itemsCollected", "lastReading"],
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vapesafe-bins.csv"',
    },
  });
}
