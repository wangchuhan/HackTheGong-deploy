"use client";

import { useEffect, useState } from "react";
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
    setBins(getBins());

    const interval = setInterval(() => {
      setBins((prev) =>
        prev.map((b) => ({
          ...b,
          fillLevel: Math.min(99, b.fillLevel + Math.floor(Math.random() * 2)),
          temperature: Math.round((b.temperature + (Math.random() - 0.5)) * 10) / 10,
          lastReading: new Date().toISOString(),
        })),
      );
      const randomBin = `BIN-00${Math.floor(Math.random() * 8) + 1}`;
      setFlashId(randomBin);
      setTimeout(() => setFlashId(null), 1500);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!authed) return null;

  const alerts = bins.filter((b) => b.fillLevel >= 75);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/council" className="text-sm text-teal-600 underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-teal-950">Smart Bin IoT</h1>
        <p className="text-sm text-teal-800/70">
          Live fill gauges, camera feeds, and temperature (simulated)
        </p>
      </header>

      {alerts.length > 0 && (
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex items-center gap-2 font-medium text-red-800">
            <AlertTriangle className="h-5 w-5" />
            {alerts.length} bin(s) need attention
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

      <ul className="space-y-4">
        {bins.map((bin) => (
          <li
            key={bin.id}
            className={`rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-100 ${
              flashId === bin.code ? "ring-2 ring-teal-400" : ""
            }`}
          >
            <div className="flex gap-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-900">
                <Image
                  src={bin.cameraImage ?? "/bins/bin-default.svg"}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
                {flashId === bin.code && (
                  <div className="absolute inset-0 animate-pulse bg-teal-400/40" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-teal-950">{bin.name}</p>
                <p className="text-xs text-teal-600">{bin.code}</p>
                <div className="mt-2 flex gap-3 text-xs text-teal-700">
                  <span className="flex items-center gap-1">
                    <Thermometer className="h-3.5 w-3.5" />
                    {bin.temperature}°C
                  </span>
                  <span>{bin.itemsCollected} collected</span>
                  <span>AI: {bin.aiFillEstimate}%</span>
                </div>
              </div>
              <BinStatusGauge fillLevel={bin.fillLevel} size="sm" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
