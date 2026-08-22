"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import type { Report } from "@/lib/types";
import { WOLLONGONG_CENTER } from "@/lib/types";

declare module "leaflet" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function heatLayer(latlngs: [number, number, number?][], options?: any): L.Layer;
}

function HeatLayer({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number, number][] = reports.map((r) => [
      r.lat,
      r.lng,
      0.6,
    ]);
    const layer = L.heatLayer(points, {
      radius: 22,
      blur: 18,
      maxZoom: 17,
      gradient: {
        0.2: "#86efac",
        0.5: "#facc15",
        0.8: "#f97316",
        1.0: "#dc2626",
      },
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, reports]);

  return null;
}

interface HeatmapViewProps {
  reports: Report[];
  height?: string;
}

export default function HeatmapView({ reports, height = "420px" }: HeatmapViewProps) {
  return (
    <div style={{ height }} className="w-full overflow-hidden rounded-xl">
      <MapContainer
        center={[WOLLONGONG_CENTER.lat, WOLLONGONG_CENTER.lng]}
        zoom={12}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer reports={reports} />
      </MapContainer>
    </div>
  );
}
