import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Battery,
  Download,
  MapPin,
  Recycle,
  Thermometer,
  Truck,
  Zap,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import {
  getBins,
  getEnergyStats,
  getPickupSchedule,
  getSeedReports,
  getStatsSummary,
  getTrends,
} from "@/lib/data";
import { getTrendWindow, maxTrendReports } from "@/lib/analytics";

export default async function CouncilDashboardPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("council-auth")?.value !== "1") {
    redirect("/council");
  }

  const stats = getStatsSummary();
  const energy = getEnergyStats();
  const bins = getBins();
  const pickup = getPickupSchedule();
  const trends = getTrends();
  const reports = getSeedReports();
  const criticalBins = bins.filter((b) => b.fillLevel >= 75).length;
  const trendWindow = getTrendWindow(trends, 7);
  const maxReports = maxTrendReports(trendWindow.points);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Wollongong City Council
          </p>
          <h1 className="text-2xl font-bold text-slate-900">VapeSafe operations</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/export/reports.csv"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            <Download className="h-4 w-4" />
            Export reports CSV
          </a>
          <a
            href="/api/export/bins.csv"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export bins CSV
          </a>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 text-sm">
        <Link href="/council/dashboard" className="rounded-full bg-slate-800 px-3 py-1 text-white">
          Overview
        </Link>
        <Link href="/council/bins" className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200">
          Smart bins
        </Link>
        <Link href="/council/pickup" className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200">
          Pickup schedule
        </Link>
        <Link href="/council/energy" className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200">
          Energy impact
        </Link>
      </nav>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Citizen reports (Mar)" value={stats.reportsThisMonth} icon={<MapPin className="h-4 w-4 text-teal-600" />} />
        <StatCard label="Bins monitored" value={stats.binsMonitored} icon={<Recycle className="h-4 w-4 text-teal-600" />} />
        <StatCard label="Bins ≥75% full" value={criticalBins} icon={<Thermometer className="h-4 w-4 text-orange-500" />} />
        <StatCard label="kWh saved (est.)" value={energy.kwhSaved} icon={<Zap className="h-4 w-4 text-amber-500" />} />
      </div>

      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-semibold text-slate-900">7-day report volume</h2>
        <p className="mt-1 text-xs text-slate-500">{trendWindow.label}</p>
        <div className="mt-3 flex h-32 items-end gap-1 rounded-lg bg-slate-50 p-3">
          {trendWindow.points.map((t) => (
            <div
              key={t.date}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              <div
                className="w-full rounded-t bg-teal-600"
                style={{
                  height: `${Math.max(4, (t.reports / maxReports) * 112)}px`,
                }}
              />
              <span className="text-[9px] text-slate-600">{t.date.slice(8)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-semibold text-slate-900">30-day trend</h2>
        <p className="mt-1 text-xs text-slate-500">{trendWindow.label}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Reports</th>
                <th className="py-2">Collections</th>
              </tr>
            </thead>
            <tbody>
              {trendWindow.points.map((row) => (
                <tr key={row.date} className="border-b border-slate-100">
                  <td className="py-2 pr-4 text-slate-800">{row.date}</td>
                  <td className="py-2 pr-4">{row.reports}</td>
                  <td className="py-2">{row.collections}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
          <div className="flex items-center gap-2">
            <Battery className="h-5 w-5 text-emerald-700" />
            <h2 className="font-semibold text-emerald-900">Energy impact snapshot</h2>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-emerald-900">
            <li>{energy.itemsCollected.toLocaleString()} items collected</li>
            <li>{energy.batteryKg} kg battery mass diverted</li>
            <li>{energy.kwhSaved} kWh saved vs landfill</li>
            <li>{energy.co2eKgAvoided} kg CO₂e avoided</li>
          </ul>
          <Link href="/council/energy" className="mt-3 inline-block text-sm font-medium text-emerald-800 underline">
            View Python model details →
          </Link>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-slate-600" />
            <h2 className="font-semibold text-slate-900">Next pickups</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {pickup.slice(0, 3).map((job) => (
              <li key={job.id} className="flex justify-between border-b border-slate-100 pb-2">
                <span>
                  {job.date} · {job.crew}
                </span>
                <span className="font-medium text-slate-700">{job.status}</span>
              </li>
            ))}
          </ul>
          <Link href="/council/pickup" className="mt-2 inline-block text-sm font-medium text-slate-700 underline">
            Full schedule →
          </Link>
        </div>
      </section>

      <p className="text-xs text-slate-500">
        {reports.length} seed reports loaded · energy stats computed via{" "}
        <code className="rounded bg-slate-100 px-1">python/energy_savings.py</code>
      </p>
    </div>
  );
}
