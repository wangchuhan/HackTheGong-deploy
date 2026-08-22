import { NextResponse } from "next/server";
import { getBins, getSeedReports } from "@/lib/data";

export function GET() {
  const reports = getSeedReports();
  const bins = getBins();

  const reportRows = [
    "id,lat,lng,suburb,status,createdAt,pointsAwarded",
    ...reports.map(
      (r) =>
        `${r.id},${r.lat},${r.lng},${r.suburb},${r.status},${r.createdAt},${r.pointsAwarded}`,
    ),
  ].join("\n");

  const binRows = [
    "id,code,name,fillLevel,temperature,itemsCollected,lastReading",
    ...bins.map(
      (b) =>
        `${b.id},${b.code},"${b.name}",${b.fillLevel},${b.temperature},${b.itemsCollected},${b.lastReading}`,
    ),
  ].join("\n");

  const csv = `# Reports\n${reportRows}\n\n# Smart Bins\n${binRows}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="vapesafe-export.csv"',
    },
  });
}
