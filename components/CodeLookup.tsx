"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import QrScanner from "@/components/QrScanner";
import { getBinByCode, getDisposalPointById } from "@/lib/data";
import { googleMapsDirectionsUrl } from "@/lib/geo";
import type { DisposalPoint } from "@/lib/types";

interface CodeLookupProps {
  onBinFound?: (code: string) => void;
  onDisposalFound?: (point: DisposalPoint) => void;
  compact?: boolean;
}

export default function CodeLookup({
  onBinFound,
  onDisposalFound,
  compact = false,
}: CodeLookupProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [disposalResult, setDisposalResult] = useState<DisposalPoint | undefined>();
  const [error, setError] = useState("");

  function lookup(inputCode?: string) {
    setError("");
    setDisposalResult(undefined);
    const trimmed = (inputCode ?? code).trim().toUpperCase();
    if (!trimmed) {
      setError("Enter a code to look up.");
      return;
    }

    const bin = getBinByCode(trimmed);
    if (bin) {
      if (onBinFound) {
        onBinFound(bin.code);
      } else {
        router.push(`/bins/${bin.code}`);
      }
      return;
    }

    const point = getDisposalPointById(trimmed);
    if (point) {
      setDisposalResult(point);
      onDisposalFound?.(point);
      return;
    }

    setError(`No match for "${trimmed}". Try BIN-001 or DISP-WLG-09.`);
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-6"}>
      <QrScanner onScan={lookup} />

      <div className="space-y-3">
        <label className="block text-sm font-medium text-teal-900">
          Manual code entry
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="BIN-001 or DISP-WLG-09"
            className="flex-1 rounded-xl border border-teal-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
            onKeyDown={(e) => e.key === "Enter" && lookup()}
          />
          <button
            type="button"
            onClick={() => lookup()}
            className="rounded-xl bg-teal-600 px-4 py-3 text-white hover:bg-teal-700"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-teal-700/60">
          Demo codes: BIN-001, BIN-003, DISP-WLG-01, DISP-WLG-09 (Ribbonwood)
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {disposalResult && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-teal-100">
          <p className="text-xs font-medium uppercase text-teal-600">Disposal Point</p>
          <p className="mt-1 text-lg font-semibold text-teal-950">{disposalResult.name}</p>
          <p className="mt-2 text-sm text-teal-800/70">
            {disposalResult.suburb} · {disposalResult.hours}
          </p>
          <p className="text-sm text-teal-700">
            Accepts: {disposalResult.accepts.join(", ")}
          </p>
          <a
            href={googleMapsDirectionsUrl(disposalResult.lat, disposalResult.lng)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Get directions
          </a>
        </div>
      )}
    </div>
  );
}
