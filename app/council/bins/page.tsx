"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Thermometer } from "lucide-react";
import { getBins } from "@/lib/data";
import type { SmartBin } from "@/lib/types";

const AUTH_KEY = "vapesafe-council-auth";

function statusColor(fill: number) {
  if (fill >= 90) return "bg-red-500";
  if (fill >= 75) return "bg-amber-500";
  return "bg-green-500";
}

export default function CouncilBinsPage() {
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) !== "1") {
      window.location.href = "/council";
      return;
    }
    setAuthed(true);
    setBins(getBins());

    const interval = setInterval(() => {
      setBins((prev) =>
        prev.map((b) => ({
          ...b,
          fillLevel: Math.min(99, b.fillLevel + Math.floor(Math.random() * 3)),
          temperature: Math.round((b.temperature + (Math.random() - 0.5)) * 10) / 10,
          lastReading: new Date().toISOString(),
        })),
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!authed) return null;

  const alerts = bins.filter((b) => b.fillLevel >= 85);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/council" className="text-sm text-teal-600 underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-teal-950">Smart Bin IoT</h1>
        <p className="text-sm text-teal-800/70">
          Real-time fill levels and temperature monitoring (simulated)
        </p>
      </header>

      {alerts.length > 0 && (
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex items-center gap-2 font-medium text-red-800">
            <AlertTriangle className="h-5 w-5" />
            {alerts.length} bin(s) near capacity
          </div>
          <ul className="mt-2 space-y-1 text-sm text-red-700">
            {alerts.map((b) => (
              <li key={b.id}>
                {b.code} at {b.fillLevel}% — schedule pickup
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="space-y-3">
        {bins.map((bin) => (
          <li
            key={bin.id}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-teal-950">{bin.name}</p>
                <p className="text-xs text-teal-600">{bin.code}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${statusColor(bin.fillLevel)}`}
              >
                {bin.fillLevel}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${statusColor(bin.fillLevel)}`}
                style={{ width: `${bin.fillLevel}%` }}
              />
            </div>
            <div className="mt-3 flex gap-4 text-xs text-teal-700">
              <span className="flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5" />
                {bin.temperature}°C
              </span>
              <span>{bin.itemsCollected} items collected</span>
            </div>
            <p className="mt-1 text-[10px] text-teal-600/60">
              Last reading: {new Date(bin.lastReading).toLocaleTimeString()}
            </p>
          </li>
        ))}
      </ul>

      <p className="text-xs text-teal-700/60">
        Fill levels tick up every 30s for demo. Energy impact calculated via{" "}
        <code className="text-teal-800">python/energy_savings.py</code>.
      </p>
    </div>
  );
}
