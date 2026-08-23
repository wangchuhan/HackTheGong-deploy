"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin, Search } from "lucide-react";
import QrScanner from "@/components/QrScanner";
import { parseScannedCode } from "@/lib/scanUtils";
import { getBinByCode, getDisposalPointById } from "@/lib/data";
import { googleMapsDirectionsUrl } from "@/lib/geo";
import type { DisposalPoint } from "@/lib/types";

const DisposalMapPreview = dynamic(
  () => import("@/components/DisposalMapPreview"),
  { ssr: false },
);

interface CodeLookupProps {
  onBinFound?: (code: string) => void;
  onDisposalFound?: (point: DisposalPoint) => void;
  compact?: boolean;
  /** Pre-fill and auto-lookup from ?code= query param */
  initialCode?: string;
}

export default function CodeLookup({
  onBinFound,
  onDisposalFound,
  compact = false,
  initialCode,
}: CodeLookupProps) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode ?? "");
  const [disposalResult, setDisposalResult] = useState<DisposalPoint | undefined>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialCode) {
      lookup(initialCode, "manual");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  function lookup(inputCode?: string, source: "scan" | "manual" = "manual") {
    setError("");
    setDisposalResult(undefined);
    const trimmed = parseScannedCode(inputCode ?? code);
    if (!trimmed) {
      setError("Enter a code to look up.");
      return;
    }

    const bin = getBinByCode(trimmed);
    if (bin) {
      if (source === "scan" || !onBinFound) {
        router.push(`/bins/${bin.code}`);
      } else {
        onBinFound(bin.code);
      }
      return;
    }

    const point = getDisposalPointById(trimmed);
    if (point) {
      if (source === "scan" || !onDisposalFound) {
        router.push(`/disposal/${point.id}`);
      } else {
        onDisposalFound(point);
        setDisposalResult(point);
      }
      return;
    }

    setError(`No match for "${trimmed}". Try BIN-001 or DISP-WLG-09.`);
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-6"}>
      <QrScanner onScan={(scanned) => lookup(scanned, "scan")} />

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
            onKeyDown={(e) => e.key === "Enter" && lookup(undefined, "manual")}
          />
          <button
            type="button"
            onClick={() => lookup(undefined, "manual")}
            className="rounded-xl bg-teal-600 px-4 py-3 text-white hover:bg-teal-700"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-teal-700/60">
          Demo codes: BIN-001, BIN-003, DISP-WLG-01, DISP-WLG-09 (Ribbonwood)
        </p>
        {compact && (onBinFound || onDisposalFound) && (
          <p className="text-xs text-teal-600">
            Camera scan opens the bin/disposal page to log items. Manual entry links
            location for a litter report (+5).
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {disposalResult && onDisposalFound && (
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-teal-100">
          <p className="text-xs font-medium uppercase text-teal-600">Linked disposal point</p>
          <p className="text-lg font-semibold text-teal-950">{disposalResult.name}</p>
          <p className="text-sm text-teal-800/70">
            {disposalResult.suburb} · {disposalResult.hours}
          </p>
          <p className="text-sm text-teal-700">
            Accepts: {disposalResult.accepts.join(", ")}
          </p>
          <DisposalMapPreview
            lat={disposalResult.lat}
            lng={disposalResult.lng}
            name={disposalResult.name}
          />
          <a
            href={googleMapsDirectionsUrl(disposalResult.lat, disposalResult.lng)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            <MapPin className="h-4 w-4" />
            Get directions
          </a>
        </div>
      )}
    </div>
  );
}
