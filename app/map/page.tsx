"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getDisposalPoints } from "@/lib/data";
import { formatDistance, haversineKm, googleMapsDirectionsUrl } from "@/lib/geo";
import type { DisposalPoint } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const ACCEPT_FILTERS = ["all", "disposables", "pods", "batteries"] as const;

export default function MapPage() {
  const allPoints = getDisposalPoints();
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [maxKm, setMaxKm] = useState(15);
  const [openOnly, setOpenOnly] = useState(false);
  const [acceptFilter, setAcceptFilter] = useState<string>("all");

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserPos(null),
    );
  }, []);

  const filtered = useMemo(() => {
    return allPoints.filter((p: DisposalPoint) => {
      if (openOnly && !p.openNow) return false;
      if (acceptFilter !== "all" && !p.accepts.includes(acceptFilter) && !p.accepts.includes("all"))
        return false;
      if (userPos) {
        const d = haversineKm(userPos.lat, userPos.lng, p.lat, p.lng);
        if (d > maxKm) return false;
      }
      return true;
    });
  }, [allPoints, openOnly, acceptFilter, maxKm, userPos]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">Disposal Points</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          {filtered.length} locations in Wollongong / Illawarra
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <select
          value={acceptFilter}
          onChange={(e) => setAcceptFilter(e.target.value)}
          className="rounded-lg border border-teal-200 px-3 py-2 text-sm"
        >
          {ACCEPT_FILTERS.map((f) => (
            <option key={f} value={f}>
              Accepts: {f}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-teal-200 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
          />
          Open now
        </label>
        <select
          value={maxKm}
          onChange={(e) => setMaxKm(Number(e.target.value))}
          className="rounded-lg border border-teal-200 px-3 py-2 text-sm"
        >
          <option value={5}>Within 5 km</option>
          <option value={10}>Within 10 km</option>
          <option value={15}>Within 15 km</option>
          <option value={50}>Any distance</option>
        </select>
      </div>

      <MapView
        points={filtered}
        userLat={userPos?.lat}
        userLng={userPos?.lng}
      />

      <ul className="space-y-3">
        {filtered.map((p) => {
          const dist =
            userPos &&
            formatDistance(haversineKm(userPos.lat, userPos.lng, p.lat, p.lng));
          return (
            <li
              key={p.id}
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-teal-950">{p.name}</p>
                  <p className="text-sm text-teal-700/70">
                    {p.suburb} · {p.hours}
                  </p>
                  <p className="text-xs text-teal-600">
                    {p.openNow ? "Open now" : "Closed"} · Accepts:{" "}
                    {p.accepts.join(", ")}
                  </p>
                </div>
                {dist && <span className="text-xs text-teal-600">{dist}</span>}
              </div>
              <a
                href={googleMapsDirectionsUrl(p.lat, p.lng)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-medium text-teal-600 underline"
              >
                Get directions
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
