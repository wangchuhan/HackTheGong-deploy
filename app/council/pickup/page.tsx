"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CheckCircle, Truck } from "lucide-react";
import BinStatusGauge from "@/components/BinStatusGauge";
import { getBins, getPickupSchedule } from "@/lib/data";
import { getCleanupSchedules } from "@/lib/user";
import type { CleanupScheduleRequest, SmartBin } from "@/lib/types";

const PickupRouteMap = dynamic(() => import("@/components/PickupRouteMap"), {
  ssr: false,
});

const AUTH_KEY = "vapesafe-council-auth";

export default function CouncilPickupPage() {
  const [authed, setAuthed] = useState(false);
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [approved, setApproved] = useState(false);
  const [truckProgress, setTruckProgress] = useState(0);
  const [activeStop, setActiveStop] = useState(-1);
  const [cleanupSchedules, setCleanupSchedules] = useState<CleanupScheduleRequest[]>([]);
  const schedule = getPickupSchedule();

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) !== "1") {
      window.location.href = "/council";
      return;
    }
    setAuthed(true);
    const all = getBins();
    setBins([...all].sort((a, b) => b.fillLevel - a.fillLevel).slice(0, 3));
    setCleanupSchedules(getCleanupSchedules());
  }, []);

  useEffect(() => {
    if (!approved) return;
    const interval = setInterval(() => {
      setTruckProgress((p) => {
        const next = p >= 100 ? 0 : p + 2;
        if (bins.length > 0) {
          const stopIdx = Math.min(
            bins.length - 1,
            Math.floor((next / 100) * bins.length),
          );
          setActiveStop(stopIdx);
        }
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [approved, bins.length]);

  if (!authed) return null;

  const totalKg = schedule[0]?.estimatedKg ?? 0;
  const today = new Date().toISOString().slice(0, 10);
  const mergedSchedule = [
    ...cleanupSchedules
      .filter((s) => s.status !== "completed" && s.date >= today)
      .map((s) => ({
        id: s.id,
        date: s.date,
        crew: s.status === "requested" ? "Pending review" : "Cleanup crew",
        bins: s.bins ?? [],
        estimatedKg: (s.bins?.length ?? 1) * 8,
        status: s.status,
        suburb: s.suburb,
      })),
    ...schedule,
  ].sort((a, b) => a.date.localeCompare(b.date));

  const kmSaved = bins.length * 4.2;

  return (
    <div className="space-y-6">
      <header>
        <Link href="/council" className="text-sm text-teal-600 underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-teal-950">Optimised Pickup</h1>
        <p className="text-sm text-teal-800/70">
          AI-routed collection through the fullest smart bins first
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-red-50 p-3 text-center ring-1 ring-red-100">
          <p className="text-xs text-red-700">Random route</p>
          <p className="text-lg font-bold text-red-900">~{(kmSaved + 12).toFixed(0)} km</p>
        </div>
        <div className="rounded-xl bg-teal-50 p-3 text-center ring-1 ring-teal-200">
          <p className="text-xs text-teal-700">Optimised route</p>
          <p className="text-lg font-bold text-teal-900">~{kmSaved.toFixed(0)} km</p>
          <p className="text-xs text-teal-600">saves ~12 km</p>
        </div>
      </div>

      <PickupRouteMap bins={bins} activeStopIndex={activeStop} />

      {approved && (
        <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="absolute flex h-full items-center transition-all duration-200"
            style={{ left: `${truckProgress}%` }}
          >
            <Truck className="h-4 w-4 -translate-x-1/2 text-teal-600" />
          </div>
          <div
            className="h-full rounded-full bg-teal-500 transition-all"
            style={{ width: `${truckProgress}%` }}
          />
        </div>
      )}

      <section className="rounded-xl bg-white p-4 ring-1 ring-teal-100">
        <h2 className="font-semibold text-teal-950">Route stops (fullest first)</h2>
        <ol className="mt-3 space-y-3">
          {bins.map((b, i) => (
            <li
              key={b.id}
              className={`flex items-center gap-3 rounded-lg p-2 text-sm ${
                activeStop === i ? "bg-amber-50 ring-1 ring-amber-200" : ""
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-teal-900">{b.name}</p>
                <p className="text-xs text-teal-700">
                  ~{Math.round(b.itemsCollected * 0.012)} kg · {b.fillLevel}% full
                </p>
              </div>
              <BinStatusGauge fillLevel={b.fillLevel} size="sm" />
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-teal-700">
          Est. total: <strong>{totalKg} kg</strong> · Crew: Team Alpha · ETA: 2h 15m
        </p>
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          disabled={approved}
          onClick={() => setApproved(true)}
        >
          {approved ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Route approved · truck en route
            </>
          ) : (
            "Approve optimised route"
          )}
        </button>
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-teal-950">Pickup schedule</h2>
        <ul className="space-y-3">
          {mergedSchedule.map((job) => (
            <li key={job.id} className="rounded-xl bg-white p-4 ring-1 ring-teal-100">
              <div className="flex justify-between">
                <p className="font-medium text-teal-950">{job.id}</p>
                <span className="text-xs capitalize text-teal-600">{job.status}</span>
              </div>
              <p className="mt-1 text-sm text-teal-800">
                {job.date} · {job.crew}
                {"suburb" in job && job.suburb ? ` · ${job.suburb}` : ""}
              </p>
              <p className="text-xs text-teal-700">
                {job.bins.length ? `Bins: ${job.bins.join(", ")} · ` : ""}
                ~{job.estimatedKg} kg
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
