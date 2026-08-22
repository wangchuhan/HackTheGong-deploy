"use client";

import {
  fillStateColor,
  fillStateLabel,
  getFillState,
  type FillState,
} from "@/lib/binUtils";

interface BinStatusGaugeProps {
  fillLevel: number;
  size?: "sm" | "lg";
}

export default function BinStatusGauge({
  fillLevel,
  size = "lg",
}: BinStatusGaugeProps) {
  const state = getFillState(fillLevel);
  const color = fillStateColor(state);
  const dim = size === "lg" ? 120 : 72;
  const stroke = size === "lg" ? 10 : 6;
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (fillLevel / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={state === "nearly_full" ? "animate-pulse" : ""}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ fontSize: size === "lg" ? "1.25rem" : "0.875rem" }}
        >
          <span className="font-bold text-teal-950">{fillLevel}%</span>
        </div>
      </div>
      <StatusBadge state={state} />
      <p className="text-center text-xs text-teal-700">{fillStateLabel(state)}</p>
    </div>
  );
}

function StatusBadge({ state }: { state: FillState }) {
  const styles: Record<FillState, string> = {
    empty: "bg-green-100 text-green-800",
    ok: "bg-teal-100 text-teal-800",
    nearly_full: "bg-amber-100 text-amber-800 animate-pulse",
    full: "bg-red-100 text-red-800",
  };
  const labels: Record<FillState, string> = {
    empty: "Empty",
    ok: "OK",
    nearly_full: "Nearly full",
    full: "Full",
  };
  return (
    <span
      className={`rounded-full px-3 py-0.5 text-xs font-semibold uppercase ${styles[state]}`}
    >
      {labels[state]}
    </span>
  );
}
