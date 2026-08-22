"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import type { Report } from "@/lib/types";
import { WOLLONGONG_CENTER } from "@/lib/types";
import type { SuburbZone } from "@/lib/types";
import { suburbHeatColor } from "@/lib/binUtils";

interface SuburbHeatmapProps {
  reports: Report[];
  zones: SuburbZone[];
  height?: string;
}

function HeatLegend() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs shadow-sm ring-1 ring-teal-100">
      <span className="text-teal-800">Cleanest</span>
      <div
        className="h-3 flex-1 rounded-full"
        style={{
          background: "linear-gradient(to right, #22c55e, #facc15, #dc2626)",
        }}
      />
      <span className="text-teal-800">Hotspot</span>
    </div>
  );
}

export default function SuburbHeatmap({
  reports,
  zones,
  height = "420px",
}: SuburbHeatmapProps) {
  const suburbCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reports) {
      counts[r.suburb] = (counts[r.suburb] ?? 0) + 1;
    }
    return counts;
  }, [reports]);

  const maxCount = Math.max(...Object.values(suburbCounts), 1);

  const ranked = useMemo(() => {
    return zones
      .map((z) => ({
        ...z,
        count: suburbCounts[z.name] ?? 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [zones, suburbCounts]);

  return (
    <div className="space-y-2">
      <HeatLegend />
      <div style={{ height }} className="w-full overflow-hidden rounded-xl">
        <MapContainer
          center={[WOLLONGONG_CENTER.lat, WOLLONGONG_CENTER.lng]}
          zoom={11}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {ranked.map((zone) => {
            const norm = zone.count / maxCount;
            const rank = ranked.findIndex((z) => z.name === zone.name) + 1;
            const label =
              rank === 1
                ? "Hotspot"
                : rank === ranked.length
                  ? "Cleanest"
                  : `#${rank}`;
            return (
              <Circle
                key={zone.name}
                center={[zone.lat, zone.lng]}
                radius={zone.radiusKm * 1000}
                pathOptions={{
                  color: suburbHeatColor(norm),
                  fillColor: suburbHeatColor(norm),
                  fillOpacity: 0.45,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{zone.name}</p>
                    <p>{zone.count} reports · {label}</p>
                  </div>
                </Popup>
              </Circle>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
