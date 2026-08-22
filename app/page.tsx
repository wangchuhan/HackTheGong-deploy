import Link from "next/link";
import { Camera, Flame, MapPin, QrCode, Shield } from "lucide-react";
import StatCard from "@/components/StatCard";
import { getStatsSummary } from "@/lib/data";

export default function HomePage() {
  const stats = getStatsSummary();

  return (
    <div className="space-y-8">
      <header className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800">
          <Shield className="h-3.5 w-3.5" />
          HackTheGong · Wollongong
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-teal-950">
          VapeSafe
        </h1>
        <p className="text-sm leading-relaxed text-teal-800/80">
          Report vape litter, find safe disposal points, and help councils clean
          up hotspots across the Illawarra.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Reports this month" value={stats.reportsThisMonth} />
        <StatCard label="Bins monitored" value={stats.binsMonitored} />
        <StatCard label="kg diverted" value={stats.kgDiverted} />
        <StatCard label="kWh saved (est.)" value={stats.kwhSaved} />
      </div>

      <div className="grid gap-3">
        <Link
          href="/scan"
          className="flex items-center gap-4 rounded-2xl bg-teal-600 px-5 py-4 text-white shadow-md transition hover:bg-teal-700"
        >
          <QrCode className="h-8 w-8 shrink-0" />
          <div>
            <p className="font-semibold">Scan QR Code</p>
            <p className="text-sm text-teal-100">Check a smart bin or disposal point</p>
          </div>
        </Link>
        <Link
          href="/map"
          className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-teal-100 transition hover:ring-teal-300"
        >
          <MapPin className="h-8 w-8 shrink-0 text-teal-600" />
          <div>
            <p className="font-semibold text-teal-900">Find Disposal Points</p>
            <p className="text-sm text-teal-700/70">Map, filters, directions</p>
          </div>
        </Link>
        <Link
          href="/report"
          className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-teal-100 transition hover:ring-teal-300"
        >
          <Camera className="h-8 w-8 shrink-0 text-teal-600" />
          <div>
            <p className="font-semibold text-teal-900">Report Litter</p>
            <p className="text-sm text-teal-700/70">Photo + GPS location</p>
          </div>
        </Link>
        <Link
          href="/heatmap"
          className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-teal-100 transition hover:ring-teal-300"
        >
          <Flame className="h-8 w-8 shrink-0 text-orange-500" />
          <div>
            <p className="font-semibold text-teal-900">View Heatmap</p>
            <p className="text-sm text-teal-700/70">Hotspots guide cleanup</p>
          </div>
        </Link>
      </div>

      <p className="text-center text-xs text-teal-700/60">
        Council dashboard:{" "}
        <Link href="/council" className="underline">
          /council
        </Link>
      </p>
    </div>
  );
}
