"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Download, Lock } from "lucide-react";
import StatCard from "@/components/StatCard";
import NewsFeed from "@/components/NewsFeed";
import {
  getAllReportsWithSession,
  getBinByCode,
  getBins,
  getDisposalPoints,
  getEnergyStats,
  getNews,
  getPickupSchedule,
  getSuburbZones,
} from "@/lib/data";
import PerformanceTrendsPanel from "@/components/PerformanceTrendsPanel";
import CleanupScheduleList, {
  ArchivedCleanupSection,
} from "@/components/CleanupScheduleList";
import { nearestSuburb } from "@/lib/geo";
import {
  archiveCleanupSchedule,
  getArchivedCleanupSchedules,
  getCleanupSchedules,
  getHiddenSeedPickups,
  getSessionReports,
  updateCleanupSchedule,
} from "@/lib/user";
import type { CleanupScheduleRequest, Report } from "@/lib/types";

const SuburbHeatmap = dynamic(() => import("@/components/SuburbHeatmap"), {
  ssr: false,
});

const COUNCIL_PASSWORD =
  process.env.NEXT_PUBLIC_COUNCIL_PASSWORD ?? "council-demo";
const AUTH_KEY = "vapesafe-council-auth";

export default function CouncilPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "news">("overview");
  const [sessionReports, setSessionReports] = useState<Report[]>([]);
  const [cleanupSchedules, setCleanupSchedules] = useState<CleanupScheduleRequest[]>([]);
  const [archivedSchedules, setArchivedSchedules] = useState(
    [] as ReturnType<typeof getArchivedCleanupSchedules>,
  );
  const [hiddenSeedIds, setHiddenSeedIds] = useState<string[]>([]);

  function refreshSchedules() {
    setCleanupSchedules(getCleanupSchedules());
    setArchivedSchedules(getArchivedCleanupSchedules());
    setHiddenSeedIds(getHiddenSeedPickups());
  }

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
    setSessionReports(getSessionReports());
    refreshSchedules();
  }, []);

  const energy = getEnergyStats();
  const reports = getAllReportsWithSession(sessionReports);
  const sessionIds = useMemo(
    () => new Set(sessionReports.map((r) => r.id)),
    [sessionReports],
  );
  const bins = getBins();
  const points = getDisposalPoints();
  const zones = getSuburbZones();
  const news = getNews();
  const seedPickup = getPickupSchedule();

  function approveCleanup(id: string) {
    updateCleanupSchedule(id, { status: "scheduled" });
    refreshSchedules();
  }

  function dismissCleanup(id: string) {
    archiveCleanupSchedule(id, "removed");
    refreshSchedules();
  }

  const today = new Date().toISOString().slice(0, 10);
  const citizenRequests = cleanupSchedules.filter(
    (s) => s.status === "requested" && s.date >= today,
  );
  const councilScheduled = cleanupSchedules.filter(
    (s) => s.status === "scheduled" && s.date >= today,
  );

  const upcomingCleanups = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const local = cleanupSchedules.filter(
      (s) => s.status !== "completed" && s.date >= today,
    );
    const hidden = new Set(hiddenSeedIds);
    const seed = seedPickup
      .filter((p) => !hidden.has(p.id))
      .map((p) => {
      const firstBin = p.bins[0] ? getBinByCode(p.bins[0]) : undefined;
      const suburb = firstBin
        ? nearestSuburb(firstBin.lat, firstBin.lng)
        : "Multi-bin route";
      return {
        id: p.id,
        date: p.date,
        suburb,
        status: "scheduled" as const,
        notes: `${p.crew} · ~${p.estimatedKg} kg`,
        bins: p.bins,
      };
    });
    return [...local, ...seed].sort((a, b) => a.date.localeCompare(b.date));
  }, [cleanupSchedules, seedPickup, hiddenSeedIds]);

  const seedIdSet = useMemo(() => new Set(seedPickup.map((p) => p.id)), [seedPickup]);

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
          Partner Login
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
          Export
        </a>
      </header>

      <div className="flex gap-2">
        {(["overview", "news"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? "bg-teal-600 text-white"
                : "bg-white text-teal-800 ring-1 ring-teal-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="kWh saved (est.)" value={energy.kwhSaved} />
            <StatCard label="CO₂e avoided (kg)" value={energy.co2eKgAvoided} />
            <StatCard label="Items collected" value={energy.itemsCollected} />
            <StatCard label="E-waste diverted (L)" value={energy.ewasteLitresDiverted} />
          </div>

          <section>
            <h2 className="mb-2 font-semibold text-teal-950">Suburb hotspot rings</h2>
            <SuburbHeatmap
              reports={reports}
              zones={zones}
              height="280px"
              showReportPins
              sessionReportIds={sessionIds}
            />
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

          <PerformanceTrendsPanel reports={reports} />

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold text-teal-950">Upcoming cleanups</h2>
              <Link
                href="/council/schedule"
                className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
              >
                Schedule cleanup
              </Link>
            </div>

            {citizenRequests.length > 0 && (
              <div className="mb-3">
                <h3 className="mb-2 text-sm font-medium text-amber-800">
                  Citizen requests ({citizenRequests.length})
                </h3>
                <ul className="space-y-2">
                  {citizenRequests.map((job) => (
                    <li
                      key={job.id}
                      className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2 text-sm ring-1 ring-amber-100"
                    >
                      <div>
                        <span className="font-medium text-teal-950">{job.suburb}</span>
                        <p className="text-xs text-teal-700">{job.date}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => approveCleanup(job.id)}
                          className="rounded-lg bg-teal-600 px-3 py-1 text-xs font-medium text-white hover:bg-teal-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => dismissCleanup(job.id)}
                          title="Archive request"
                          className="rounded-lg px-2 py-1 text-xs text-teal-600 hover:bg-teal-100"
                        >
                          Archive
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {councilScheduled.length > 0 && (
              <div className="mb-3">
                <h3 className="mb-2 text-sm font-medium text-teal-800">
                  Council scheduled ({councilScheduled.length})
                </h3>
                <CleanupScheduleList
                  items={councilScheduled}
                  onChange={refreshSchedules}
                  compact
                />
              </div>
            )}

            <h3 className="mb-2 text-sm font-medium text-teal-800">All upcoming</h3>
            <CleanupScheduleList
              items={upcomingCleanups.slice(0, 8)}
              onChange={refreshSchedules}
              compact
              seedIds={seedIdSet}
            />
            {upcomingCleanups.length > 8 && (
              <p className="mt-2 text-xs text-teal-600">
                +{upcomingCleanups.length - 8} more —{" "}
                <Link href="/council/schedule" className="underline">
                  view all
                </Link>
              </p>
            )}
            <ArchivedCleanupSection
              archived={archivedSchedules}
              onChange={refreshSchedules}
            />
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-teal-950">Collection point usage</h2>
            <ul className="space-y-1 text-sm">
              {points.slice(0, 5).map((p, i) => (
                <li key={p.id} className="flex justify-between rounded-lg bg-teal-50 px-3 py-2">
                  <span className="truncate">{p.name}</span>
                  <span className="font-medium text-teal-700">{120 - i * 15} scans</span>
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
            <p className="font-medium">
              Alert: {bins.filter((b) => b.fillLevel >= 75).length} bins need pickup
              ({bins.filter((b) => b.fillLevel > 85).length} near capacity)
            </p>
            <div className="mt-2 flex gap-2">
              <Link
                href="/council/bins"
                className="text-xs font-medium text-amber-900 underline"
              >
                View IoT dashboard
              </Link>
              <Link
                href="/council/pickup"
                className="text-xs font-medium text-amber-900 underline"
              >
                Optimised pickup
              </Link>
            </div>
          </div>
        </>
      ) : (
        <NewsFeed items={news} showLink={false} />
      )}
    </div>
  );
}
