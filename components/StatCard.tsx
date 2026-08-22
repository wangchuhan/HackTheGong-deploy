import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-100">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-teal-700/70">
          {label}
        </p>
        {icon}
      </div>
      <p className="mt-1 text-2xl font-bold text-teal-900">{value}</p>
    </div>
  );
}
