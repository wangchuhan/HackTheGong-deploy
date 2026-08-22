"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

const pinIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface ReportLocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  height?: string;
}

export default function ReportLocationPicker({
  lat,
  lng,
  onChange,
  height = "200px",
}: ReportLocationPickerProps) {
  const eventHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        const { lat: newLat, lng: newLng } = e.target.getLatLng();
        onChange(newLat, newLng);
      },
    }),
    [onChange],
  );

  return (
    <div style={{ height }} className="w-full overflow-hidden rounded-xl">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[lat, lng]}
          icon={pinIcon}
          draggable
          eventHandlers={eventHandlers}
        />
      </MapContainer>
    </div>
  );
}
