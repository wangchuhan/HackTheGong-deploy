import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Thermometer } from "lucide-react";
import { getBins } from "@/lib/data";

export default async function CouncilBinsPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("council-auth")?.value !== "1") {
    redirect("/council");
  }

  const bins = getBins().sort((a, b) => b.fillLevel - a.fillLevel);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <CouncilNav active="bins" />
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Smart bin telemetry</h1>
        <p className="text-sm text-slate-600">Live IoT readings across Wollongong LGA</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {bins.map((bin) => (
          <article
            key={bin.id}
            className={`rounded-xl bg-white p-4 shadow-sm ring-1 ${
              bin.fillLevel >= 75 ? "ring-orange-300" : "ring-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900">{bin.name}</p>
                <p className="text-xs text-slate-500">{bin.code}</p>
              </div>
              {bin.fillLevel >= 75 && (
                <AlertTriangle className="h-5 w-5 text-orange-500" aria-label="High fill level" />
              )}
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Fill level</span>
                <span className="font-semibold">{bin.fillLevel}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    bin.fillLevel >= 75 ? "bg-orange-500" : "bg-teal-500"
                  }`}
                  style={{ width: `${bin.fillLevel}%` }}
                />
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5" />
                {bin.temperature}°C
              </div>
              <div>{bin.itemsCollected} items collected</div>
              <div className="col-span-2 text-slate-500">
                Last reading: {new Date(bin.lastReading).toLocaleString()}
              </div>
            </dl>
          </article>
        ))}
      </div>
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
