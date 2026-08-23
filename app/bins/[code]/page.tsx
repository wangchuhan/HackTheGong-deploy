"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle, MapPin, Minus, Plus, Recycle } from "lucide-react";
import BinStatusGauge from "@/components/BinStatusGauge";
import BinCameraView from "@/components/BinCameraView";
import { mockAnalyzeBin } from "@/lib/binVision";
import { getBinByCode } from "@/lib/data";
import { getBinDisposalLog, getItemsLoggedToday, logDisposal } from "@/lib/user";
import type { BinVisionResult } from "@/lib/types";

export default function BinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const bin = getBinByCode(code);
  const [itemCount, setItemCount] = useState(1);
  const [vision, setVision] = useState<BinVisionResult | null>(null);
  const [scanning, setScanning] = useState(true);
  const [scanLabel, setScanLabel] = useState("Connecting to bin sensor…");
  const [disposeResult, setDisposeResult] = useState<{
    points: number;
    items: number;
  } | null>(null);
  const [disposeError, setDisposeError] = useState("");
  const [visitsToday, setVisitsToday] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!bin) return;
    setVisitsToday(getBinDisposalLog(bin.code)?.visits.length ?? 0);
  }, [bin]);

  const runScan = useCallback(
    async (opts: {
      previewItems?: number;
      durationMs?: number;
      label?: string;
    } = {}) => {
      if (!bin) return;
      const { previewItems, durationMs = 1500, label = "Syncing sensor…" } = opts;
      setScanLabel(label);
      setScanning(true);
      await new Promise((r) => setTimeout(r, durationMs));
      const itemsLoggedToday = getItemsLoggedToday(bin.code);
      const result = mockAnalyzeBin(bin, {
        previewItems,
        itemsLoggedToday,
        lastLoggedItemCount: disposeResult?.items,
      });
      setVision(result);
      setScanning(false);
    },
    [bin, disposeResult?.items],
  );

  useEffect(() => {
    if (!bin || mountedRef.current) return;
    mountedRef.current = true;
    runScan({ durationMs: 1500, label: "Connecting to bin sensor…" });
  }, [bin, runScan]);

  useEffect(() => {
    if (!bin || !mountedRef.current || disposeResult) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runScan({
        previewItems: itemCount,
        durationMs: 800,
        label: "Updating item count…",
      });
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [itemCount, bin, runScan, disposeResult]);

  if (!bin) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-lg font-semibold text-teal-950">Bin not found</p>
        <Link href="/scan" className="text-teal-600 underline">
          ← Back to scan
        </Link>
      </div>
    );
  }

  const atDailyLimit = visitsToday !== null && visitsToday >= 2;
  const canDispose = visitsToday !== null && visitsToday < 2 && !disposeResult;

  function handleDispose() {
    if (!bin) return;
    setDisposeError("");
    const result = logDisposal(bin.code, itemCount);
    if (!result.success) {
      setDisposeError(result.error ?? "Could not log disposal.");
      return;
    }
    setDisposeResult({ points: result.totalPoints, items: itemCount });
    setVisitsToday((v) => (v ?? 0) + 1);
    runScan({
      previewItems: itemCount,
      durationMs: 1500,
      label: "Confirming disposal…",
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <Link href="/scan" className="text-sm text-teal-600 underline">
          ← Back to scan
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-teal-950">{bin.name}</h1>
        <p className="text-sm text-teal-700">{bin.code}</p>
      </header>

      <div className="flex justify-center">
        <BinStatusGauge
          fillLevel={vision?.fillEstimate ?? bin.fillLevel}
          animate
        />
      </div>

      <BinCameraView
        bin={bin}
        visionResult={vision}
        scanning={scanning}
        scanLabel={scanLabel}
      />

      <div className="grid grid-cols-2 gap-3 text-center text-sm">
        <div className="rounded-xl bg-white p-3 ring-1 ring-teal-100">
          <p className="text-xs text-teal-600">Temperature</p>
          <p className="font-semibold text-teal-950">{bin.temperature}°C</p>
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-teal-100">
          <p className="text-xs text-teal-600">Collected</p>
          <p className="font-semibold text-teal-950">{bin.itemsCollected} items</p>
        </div>
      </div>

      {!disposeResult ? (
        <div className="rounded-xl bg-white p-4 ring-1 ring-teal-100">
          <p className="text-sm font-medium text-teal-900">
            How many items did you drop?
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

      {atDailyLimit && !disposeResult && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Daily limit reached (2 visits). Try again tomorrow or use another bin.
        </p>
      )}

      {disposeError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {disposeError}
        </p>
      )}

      <div className="grid gap-3">
        <button
          type="button"
          onClick={handleDispose}
          disabled={!canDispose}
          className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {disposeResult ? (
            <>
              <CheckCircle className="h-5 w-5" />
              {disposeResult.items} vapes logged · +{disposeResult.points} pts
            </>
          ) : (
            <>
              <Recycle className="h-5 w-5" />
              Log {itemCount} item{itemCount > 1 ? "s" : ""} (+{itemCount * 10} pts)
            </>
          )}
        </button>
        <Link
          href="/report"
          className="flex items-center justify-center gap-2 rounded-xl bg-white py-3 font-medium text-teal-800 ring-1 ring-teal-100 hover:ring-teal-300"
        >
          <MapPin className="h-5 w-5" />
          Report litter nearby
        </Link>
        <Link
          href="/map"
          className="block rounded-xl bg-white py-3 text-center font-medium text-teal-600 ring-1 ring-teal-100 hover:ring-teal-300"
        >
          Find nearest disposal point
        </Link>
      </div>
    </div>
  );
}
