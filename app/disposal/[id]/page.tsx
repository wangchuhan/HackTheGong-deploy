"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CheckCircle, MapPin, Minus, Plus, Recycle } from "lucide-react";
import { getDisposalPointById } from "@/lib/data";
import { googleMapsDirectionsUrl } from "@/lib/geo";
import { getDisposalPointLog, logDisposalAtPoint } from "@/lib/user";

const DisposalMapPreview = dynamic(
  () => import("@/components/DisposalMapPreview"),
  { ssr: false },
);

export default function DisposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const point = getDisposalPointById(id);
  const [itemCount, setItemCount] = useState(1);
  const [visitsToday, setVisitsToday] = useState<number | null>(null);
  const [depositResult, setDepositResult] = useState<{
    points: number;
    items: number;
  } | null>(null);
  const [depositError, setDepositError] = useState("");

  useEffect(() => {
    if (!point) return;
    setVisitsToday(getDisposalPointLog(point.id)?.visits.length ?? 0);
  }, [point]);

  if (!point) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-lg font-semibold text-teal-950">Disposal point not found</p>
        <Link href="/scan" className="text-teal-600 underline">
          ← Back to scan
        </Link>
      </div>
    );
  }

  const atDailyLimit = visitsToday !== null && visitsToday >= 2;
  const canDeposit = visitsToday !== null && visitsToday < 2 && !depositResult;

  function handleDeposit() {
    if (!point) return;
    setDepositError("");
    const result = logDisposalAtPoint(point.id, itemCount);
    if (!result.success) {
      setDepositError(result.error ?? "Could not log deposit.");
      return;
    }
    setDepositResult({ points: result.totalPoints, items: itemCount });
    setVisitsToday((v) => (v ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <header>
        <Link href="/scan" className="text-sm text-teal-600 underline">
          ← Back to scan
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-teal-950">{point.name}</h1>
        <p className="text-sm text-teal-700">{point.id}</p>
      </header>

      <div className="rounded-xl bg-white p-4 ring-1 ring-teal-100">
        <p className="text-sm text-teal-800">
          {point.suburb} · {point.hours}
        </p>
        <p className="mt-1 text-sm text-teal-700">
          Accepts: {point.accepts.join(", ")}
        </p>
        <p className="mt-2 text-xs text-teal-600">
          {point.openNow ? "Open now" : "Check hours before visiting"}
        </p>
      </div>

      <DisposalMapPreview lat={point.lat} lng={point.lng} name={point.name} />

      {!depositResult ? (
        <div className="rounded-xl bg-white p-4 ring-1 ring-teal-100">
          <p className="text-sm font-medium text-teal-900">
            How many items did you deposit?
          </p>
          <p className="mt-1 text-xs text-teal-600">
            +10 pts each · max 5 per visit ·{" "}
            {visitsToday === null ? "…" : `${visitsToday}/2`} visits today
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setItemCount((c) => Math.max(1, c - 1))}
              className="rounded-full bg-teal-100 p-2 text-teal-800"
              aria-label="Decrease"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-3xl font-bold text-teal-950">{itemCount}</span>
            <button
              type="button"
              onClick={() => setItemCount((c) => Math.min(5, c + 1))}
              className="rounded-full bg-teal-100 p-2 text-teal-800"
              aria-label="Increase"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      {atDailyLimit && !depositResult && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Daily limit reached (2 visits). Try again tomorrow or use another disposal point.
        </p>
      )}

      {depositError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {depositError}
        </p>
      )}

      <div className="grid gap-3">
        <button
          type="button"
          onClick={handleDeposit}
          disabled={!canDeposit}
          className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {depositResult ? (
            <>
              <CheckCircle className="h-5 w-5" />
              {depositResult.items} vapes logged · +{depositResult.points} pts
            </>
          ) : (
            <>
              <Recycle className="h-5 w-5" />
              Log {itemCount} item{itemCount > 1 ? "s" : ""} (+{itemCount * 10} pts)
            </>
          )}
        </button>
        <a
          href={googleMapsDirectionsUrl(point.lat, point.lng)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-white py-3 font-medium text-teal-800 ring-1 ring-teal-100 hover:ring-teal-300"
        >
          <MapPin className="h-5 w-5" />
          Get directions
        </a>
        <Link
          href="/report"
          className="block rounded-xl bg-white py-3 text-center font-medium text-teal-600 ring-1 ring-teal-100 hover:ring-teal-300"
        >
          Report litter nearby
        </Link>
      </div>
    </div>
  );
}
