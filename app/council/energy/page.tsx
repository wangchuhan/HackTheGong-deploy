import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Battery, Zap } from "lucide-react";
import { getEnergyStats } from "@/lib/data";

export default async function CouncilEnergyPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("council-auth")?.value !== "1") {
    redirect("/council");
  }

  const energy = getEnergyStats();
  const formula = energy.formula as
    | {
        batteryKgPerItem: number;
        landfillKwhPerKg: number;
        recyclingKwhPerKg: number;
        gridCo2ePerKwh: number;
      }
    | undefined;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <CouncilNav active="energy" />
      <header>
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-slate-900">Energy & emissions impact</h1>
        </div>
        <p className="text-sm text-slate-600">{energy.label}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Items collected" value={energy.itemsCollected.toLocaleString()} />
        <MetricCard label="Battery mass diverted" value={`${energy.batteryKg} kg`} icon={<Battery className="h-5 w-5" />} />
        <MetricCard label="Energy saved vs landfill" value={`${energy.kwhSaved} kWh`} icon={<Zap className="h-5 w-5 text-amber-500" />} />
        <MetricCard label="CO₂e avoided" value={`${energy.co2eKgAvoided} kg`} />
        <MetricCard label="E-waste diverted" value={`${energy.ewasteLitresDiverted} L`} />
      </div>

      <section className="rounded-xl bg-slate-900 p-6 text-slate-100">
        <h2 className="font-semibold">Python model — python/energy_savings.py</h2>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed">
{`battery_kg = items_collected × ${formula?.batteryKgPerItem ?? 0.007}
kwh_saved  = battery_kg × (${formula?.landfillKwhPerKg ?? 2.5} − ${formula?.recyclingKwhPerKg ?? 0.8})
co2e_kg    = kwh_saved × ${formula?.gridCo2ePerKwh ?? 0.82}  # AU grid proxy`}
        </pre>
        <p className="mt-4 text-sm text-slate-400">
          Regenerate stats:{" "}
          <code className="rounded bg-slate-800 px-1">
            python python/energy_savings.py --bins data/bins.json --reports data/reports.json
          </code>
        </p>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function CouncilNav({ active }: { active: "overview" | "bins" | "pickup" | "energy" }) {
  const links = [
    { href: "/council/dashboard", key: "overview", label: "Overview" },
    { href: "/council/bins", key: "bins", label: "Smart bins" },
    { href: "/council/pickup", key: "pickup", label: "Pickup schedule" },
    { href: "/council/energy", key: "energy", label: "Energy impact" },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-2 text-sm">
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          className={`rounded-full px-3 py-1 ${
            active === link.key
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
