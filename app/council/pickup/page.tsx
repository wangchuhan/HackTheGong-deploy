"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBins, getPickupSchedule } from "@/lib/data";
import type { SmartBin } from "@/lib/types";

const AUTH_KEY = "vapesafe-council-auth";

export default function CouncilPickupPage() {
  const [authed, setAuthed] = useState(false);
  const [bins, setBins] = useState<SmartBin[]>([]);
  const schedule = getPickupSchedule();

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) !== "1") {
      window.location.href = "/council";
      return;
    }
    setAuthed(true);
    setBins(getBins());
  }, []);

  if (!authed) return null;

  const nearFull = [...bins].sort((a, b) => b.fillLevel - a.fillLevel).slice(0, 3);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/council" className="text-sm text-teal-600 underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-teal-950">Optimised Pickup</h1>
        <p className="text-sm text-teal-800/70">
          Scheduled collection through hotspot bins — efficient &amp; safe
        </p>
      </header>

      <section className="rounded-xl bg-white p-4 ring-1 ring-teal-100">
        <h2 className="font-semibold text-teal-950">Suggested route (near capacity)</h2>
        <ol className="mt-3 space-y-2">
          {nearFull.map((b, i) => (
            <li key={b.id} className="flex items-center gap-3 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-teal-900">{b.name}</p>
                <p className="text-xs text-teal-700">{b.fillLevel}% full</p>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700"
          onClick={() => alert("Demo: route approved for collection crew.")}
        >
          Approve route
        </button>
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-teal-950">Pickup schedule</h2>
        <ul className="space-y-3">
          {schedule.map((job) => (
            <li
              key={job.id}
              className="rounded-xl bg-white p-4 ring-1 ring-teal-100"
            >
              <div className="flex justify-between">
                <p className="font-medium text-teal-950">{job.id}</p>
                <span className="text-xs capitalize text-teal-600">{job.status}</span>
              </div>
              <p className="mt-1 text-sm text-teal-800">{job.date} · {job.crew}</p>
              <p className="text-xs text-teal-700">
                Bins: {job.bins.join(", ")} · ~{job.estimatedKg} kg
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
