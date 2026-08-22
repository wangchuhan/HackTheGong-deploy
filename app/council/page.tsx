"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Download, Lock } from "lucide-react";
import StatCard from "@/components/StatCard";
import {
  getBins,
  getDisposalPoints,
  getEnergyStats,
  getSeedReports,
  getTrends,
} from "@/lib/data";

const HeatmapView = dynamic(() => import("@/components/HeatmapView"), {
  ssr: false,
});

const COUNCIL_PASSWORD =
  process.env.NEXT_PUBLIC_COUNCIL_PASSWORD ?? "council-demo";
const AUTH_KEY = "vapesafe-council-auth";

export default function CouncilPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
  }, []);

  const energy = getEnergyStats();
  const trends = getTrends();
  const reports = getSeedReports();
  const bins = getBins();
  const points = getDisposalPoints();

  const topSuburbs = Object.entries(
    reports.reduce<Record<string, number>>((acc, r) => {
      acc[r.suburb] = (acc[r.suburb] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (password === COUNCIL_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
      setError("");
    } else {
      setError("Invalid password. Demo: council-demo");
    }
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm space-y-6 pt-12">
        <Lock className="mx-auto h-12 w-12 text-teal-600" />
        <h1 className="text-center text-xl font-bold text-teal-950">
          Council Dashboard
        </h1>
        <form onSubmit={login} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Demo password"
            className="w-full rounded-xl border border-teal-200 px-4 py-3 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-teal-600 py-3 text-white hover:bg-teal-700"
          >
            Sign in
          </button>
        </form>
        <Link href="/" className="block text-center text-sm text-teal-600 underline">
          ← Back to app
        </Link>
      </div>
    );
  }

  const recentTrend = trends.slice(-7);
  const maxReports = Math.max(...recentTrend.map((t) => t.reports), 1);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-teal-950">Council Dashboard</h1>
          <p className="text-sm text-teal-800/70">Wollongong · partner view</p>
        </div>
        <a
          href="/api/export"
          className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white hover:bg-teal-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="kWh saved (est.)" value={energy.kwhSaved} />
        <StatCard label="CO₂e avoided (kg)" value={energy.co2eKgAvoided} />
        <StatCard label="Items collected" value={energy.itemsCollected} />
        <StatCard
          label="E-waste diverted (L)"
          value={energy.ewasteLitresDiverted}
        />
      </div>

      <p className="text-xs text-teal-700/60">{energy.label}</p>

      <section>
        <h2 className="mb-2 font-semibold text-teal-950">Hotspot analysis</h2>
        <HeatmapView reports={reports} height="280px" />
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-teal-950">Top suburbs</h2>
        <ul className="space-y-2">
          {topSuburbs.map(([suburb, count]) => (
            <li
              key={suburb}
              className="flex justify-between rounded-lg bg-white px-4 py-2 text-sm ring-1 ring-teal-100"
            >
              <span>{suburb}</span>
              <span className="font-medium text-teal-700">{count} reports</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-teal-950">Performance trends</h2>
        <div className="flex h-32 items-end gap-1 rounded-xl bg-white p-4 ring-1 ring-teal-100">
          {recentTrend.map((t) => (
            <div key={t.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-teal-500"
                style={{ height: `${(t.reports / maxReports) * 100}%` }}
                title={`${t.date}: ${t.reports} reports`}
              />
              <span className="text-[9px] text-teal-700">
                {t.date.slice(8)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-teal-950">Collection point usage</h2>
        <ul className="space-y-1 text-sm">
          {points.slice(0, 5).map((p, i) => (
            <li key={p.id} className="flex justify-between rounded-lg bg-teal-50 px-3 py-2">
              <span className="truncate">{p.name}</span>
              <span className="font-medium text-teal-700">
                {120 - i * 15} scans
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/council/bins"
          className="rounded-xl bg-white p-4 text-center font-medium text-teal-800 ring-1 ring-teal-100 hover:ring-teal-300"
        >
          Smart Bin IoT →
        </Link>
        <Link
          href="/council/pickup"
          className="rounded-xl bg-white p-4 text-center font-medium text-teal-800 ring-1 ring-teal-100 hover:ring-teal-300"
        >
          Optimised Pickup →
        </Link>
      </div>

      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium">News: CBD hotspot up 12%</p>
        <p className="mt-1 text-xs opacity-80">
          {bins.filter((b) => b.fillLevel > 85).length} bins near capacity —
          review pickup schedule.
        </p>
      </div>
    </div>
  );
}
