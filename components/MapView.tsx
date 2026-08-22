"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { DisposalPoint } from "@/lib/types";
import { WOLLONGONG_CENTER } from "@/lib/types";
import { googleMapsDirectionsUrl } from "@/lib/geo";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [map, lat, lng]);
  return null;
}

interface MapViewProps {
  points: DisposalPoint[];
  userLat?: number;
  userLng?: number;
}

export default function MapView({ points, userLat, userLng }: MapViewProps) {
  const centerLat = userLat ?? WOLLONGONG_CENTER.lat;
  const centerLng = userLng ?? WOLLONGONG_CENTER.lng;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={13}
      className="h-[420px] w-full rounded-xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLat && userLng && <Recenter lat={userLat} lng={userLng} />}
      {userLat && userLng && (
        <Marker position={[userLat, userLng]} icon={defaultIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={defaultIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{p.name}</p>
              <p className="text-gray-600">{p.hours}</p>
              <p className="text-gray-600">Accepts: {p.accepts.join(", ")}</p>
              <a
                href={googleMapsDirectionsUrl(p.lat, p.lng)}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-teal-600 underline"
              >
                Directions
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
