import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Truck } from "lucide-react";
import { getPickupSchedule } from "@/lib/data";

export default async function CouncilPickupPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("council-auth")?.value !== "1") {
    redirect("/council");
  }

  const schedule = getPickupSchedule();

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <CouncilNav active="pickup" />
      <header>
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-slate-700" />
          <h1 className="text-2xl font-bold text-slate-900">Pickup schedule</h1>
        </div>
        <p className="text-sm text-slate-600">Crew routes for smart-bin servicing</p>
      </header>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Crew</th>
              <th className="px-4 py-3">Bins</th>
              <th className="px-4 py-3">Est. kg</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((job) => (
              <tr key={job.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{job.date}</td>
                <td className="px-4 py-3">{job.crew}</td>
                <td className="px-4 py-3 font-mono text-xs">{job.bins.join(", ")}</td>
                <td className="px-4 py-3">{job.estimatedKg}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      job.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : job.status === "in-progress"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
