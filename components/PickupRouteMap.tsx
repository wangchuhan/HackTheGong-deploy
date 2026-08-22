"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { WOLLONGONG_CENTER } from "@/lib/types";
import type { SmartBin } from "@/lib/types";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function PickupRouteMap({
  bins,
  activeStopIndex = -1,
}: {
  bins: SmartBin[];
  activeStopIndex?: number;
}) {
  const route = useMemo(
    () => bins.map((b) => [b.lat, b.lng] as [number, number]),
    [bins],
  );

  return (
    <MapContainer
      center={[WOLLONGONG_CENTER.lat, WOLLONGONG_CENTER.lng]}
      zoom={12}
      className="h-56 w-full rounded-xl"
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline
        positions={route}
        pathOptions={{ color: "#0d9488", dashArray: "8 8", weight: 3 }}
      />
      {bins.map((b, i) => (
        <Marker key={b.id} position={[b.lat, b.lng]} icon={markerIcon}>
          <Popup>
            Stop {i + 1}: {b.code} ({b.fillLevel}%)
          </Popup>
        </Marker>
      ))}
      {activeStopIndex >= 0 && bins[activeStopIndex] && (
        <CircleMarker
          center={[bins[activeStopIndex].lat, bins[activeStopIndex].lng]}
          radius={14}
          pathOptions={{
            color: "#f59e0b",
            fillColor: "#fbbf24",
            fillOpacity: 0.5,
            weight: 3,
          }}
        />
      )}
    </MapContainer>
  );
}
