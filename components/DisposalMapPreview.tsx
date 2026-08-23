"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface DisposalMapPreviewProps {
  lat: number;
  lng: number;
  name: string;
}

export default function DisposalMapPreview({
  lat,
  lng,
  name,
}: DisposalMapPreviewProps) {
  return (
    <div className="h-40 overflow-hidden rounded-xl ring-1 ring-teal-100">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={icon}>
        </Marker>
      </MapContainer>
      <p className="sr-only">Map pin for {name}</p>
    </div>
  );
}
