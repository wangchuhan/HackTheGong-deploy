"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, Thermometer } from "lucide-react";
import BinStatusGauge from "@/components/BinStatusGauge";
import { getBins } from "@/lib/data";
import type { SmartBin } from "@/lib/types";

const AUTH_KEY = "vapesafe-council-auth";

export default function CouncilBinsPage() {
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [authed, setAuthed] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) !== "1") {
      window.location.href = "/council";
      return;
    }
    setAuthed(true);
    const sorted = [...getBins()].sort((a, b) => b.fillLevel - a.fillLevel);
    setBins(sorted);

    const interval = setInterval(() => {
      setBins((prev) =>
        [...prev]
          .map((b) => ({
            ...b,
            fillLevel: Math.min(99, b.fillLevel + Math.floor(Math.random() * 2)),
            temperature:
              Math.round((b.temperature + (Math.random() - 0.5)) * 10) / 10,
            lastReading: new Date().toISOString(),
          }))
          .sort((a, b) => b.fillLevel - a.fillLevel),
      );
      const randomBin = `BIN-00${Math.floor(Math.random() * 8) + 1}`;
      setFlashId(randomBin);
      setTimeout(() => setFlashId(null), 1500);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const { alerts, healthy } = useMemo(() => {
    const a = bins.filter((b) => b.fillLevel >= 75);
    const h = bins.filter((b) => b.fillLevel < 75);
    return { alerts: a, healthy: h };
  }, [bins]);

  if (!authed) return null;

  return (
    <div className="space-y-6">
      <header>
        <Link href="/council" className="text-sm text-teal-600 underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-teal-950">Smart Bin IoT</h1>
        <p className="text-sm text-teal-800/70">
          Live fill gauges sorted by urgency — near-full bins need pickup
        </p>
      </header>

      {alerts.length > 0 && (
        <div className="animate-pulse rounded-xl bg-red-50 p-4 ring-2 ring-red-200">
          <div className="flex items-center gap-2 font-medium text-red-800">
            <AlertTriangle className="h-5 w-5" />
            {alerts.length} bin(s) need pickup now
          </div>
          <ul className="mt-3 space-y-2">
            {alerts.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <BinStatusGauge fillLevel={b.fillLevel} size="sm" />
                  <span>
                    {b.code} — {b.fillLevel}% full
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Link
              href="/council/schedule"
              className="rounded-lg bg-red-700 px-3 py-2 text-xs font-medium text-white hover:bg-red-800"
            >
              Schedule cleanup →
            </Link>
            <Link
              href="/council/pickup"
              className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-red-800 ring-1 ring-red-200 hover:bg-red-50"
            >
              Optimised pickup →
            </Link>
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold text-red-800">Needs pickup (≥75%)</h2>
          <BinList bins={alerts} flashId={flashId} highlight />
        </section>
      )}

      <section>
        <h2 className="mb-2 font-semibold text-teal-950">
          {alerts.length ? "Other bins" : "All bins"}
        </h2>
        <BinList bins={healthy.length ? healthy : bins} flashId={flashId} />
      </section>
    </div>
  );
}

function BinList({
  bins,
  flashId,
  highlight = false,
}: {
  bins: SmartBin[];
  flashId: string | null;
  highlight?: boolean;
}) {
  return (
    <ul className="space-y-4">
      {bins.map((bin) => (
        <li
          key={bin.id}
          className={`rounded-xl bg-white p-4 shadow-sm ring-1 ${
            highlight ? "ring-red-200" : "ring-teal-100"
          } ${flashId === bin.code ? "ring-2 ring-teal-400" : ""}`}
        >
          <Link href={`/bins/${bin.code}`} className="flex gap-4">
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-900">
              <Image
                src={bin.cameraImage ?? "/bins/bin-default.svg"}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-teal-950">{bin.name}</p>
              <p className="text-xs text-teal-600">{bin.code}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${
                    bin.fillLevel >= 75 ? "bg-red-500" : "bg-teal-500"
                  }`}
                  style={{ width: `${bin.fillLevel}%` }}
                />
              </div>
              <div className="mt-2 flex gap-3 text-xs text-teal-700">
                <span className="flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5" />
                  {bin.temperature}°C
                </span>
                <span>{bin.itemsCollected} collected</span>
              </div>
            </div>
            <BinStatusGauge fillLevel={bin.fillLevel} size="sm" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
