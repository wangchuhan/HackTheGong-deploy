"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getDisposalPoints } from "@/lib/data";
import { formatTravelTime, haversineKm, googleMapsDirectionsUrl } from "@/lib/geo";
import type { DisposalPoint } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const ACCEPT_FILTERS = ["all", "disposables", "pods", "batteries"] as const;

export default function MapPage() {
  const allPoints = getDisposalPoints();
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [maxKm, setMaxKm] = useState(25);
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
    const list = allPoints.filter((p: DisposalPoint) => {
      if (openOnly && !p.openNow) return false;
      if (
        acceptFilter !== "all" &&
        !p.accepts.includes(acceptFilter) &&
        !p.accepts.includes("all")
      )
        return false;
      if (userPos) {
        const d = haversineKm(userPos.lat, userPos.lng, p.lat, p.lng);
        if (d > maxKm) return false;
      }
      return true;
    });

    if (userPos) {
      return [...list].sort(
        (a, b) =>
          haversineKm(userPos.lat, userPos.lng, a.lat, a.lng) -
          haversineKm(userPos.lat, userPos.lng, b.lat, b.lng),
      );
    }
    return list;
  }, [allPoints, openOnly, acceptFilter, maxKm, userPos]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">Disposal Points</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          {filtered.length} locations in Wollongong / Illawarra
          {userPos ? " · sorted by distance" : ""}
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
          <option value={25}>Within 25 km</option>
          <option value={50}>Any distance</option>
        </select>
      </div>

      <MapView
        points={filtered}
        userLat={userPos?.lat}
        userLng={userPos?.lng}
      />

      <p className="text-xs text-teal-600/70">
        Drive times are estimated (road distance, ~40 km/h average).
      </p>

      <ul className="space-y-3">
        {filtered.map((p) => {
          const km = userPos
            ? haversineKm(userPos.lat, userPos.lng, p.lat, p.lng)
            : null;
          const dist = km != null ? formatTravelTime(km) : null;
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
                {dist && (
                  <span className="shrink-0 text-right text-xs text-teal-600">
                    {dist}
                  </span>
                )}
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
