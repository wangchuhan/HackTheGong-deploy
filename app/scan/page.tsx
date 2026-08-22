"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, Search } from "lucide-react";
import { getBinByCode, getDisposalPointById } from "@/lib/data";

export default function ScanPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{
    type: "bin" | "disposal";
    title: string;
    detail: string;
    href: string;
  } | null>(null);
  const [error, setError] = useState("");

  function lookup() {
    setError("");
    setResult(null);
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Enter a code to look up.");
      return;
    }

    const bin = getBinByCode(trimmed);
    if (bin) {
      setResult({
        type: "bin",
        title: bin.name,
        detail: `Fill: ${bin.fillLevel}% · Temp: ${bin.temperature}°C · ${bin.itemsCollected} items collected`,
        href: "/council/bins",
      });
      return;
    }

    const point = getDisposalPointById(trimmed);
    if (point) {
      setResult({
        type: "disposal",
        title: point.name,
        detail: `${point.suburb} · ${point.hours} · Accepts: ${point.accepts.join(", ")}`,
        href: "/map",
      });
      return;
    }

    setError(`No match for "${trimmed}". Try BIN-001 or DISP-WLG-01.`);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">Scan QR Code</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Use your camera or enter a demo code manually.
        </p>
      </header>

      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-200 bg-white p-8">
        <QrCode className="h-16 w-16 text-teal-400" />
        <p className="mt-3 text-center text-sm text-teal-700/70">
          Camera QR scanning works on supported browsers. For the demo, use manual
          entry below.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-teal-900">
          Manual code entry
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="BIN-001 or DISP-WLG-01"
            className="flex-1 rounded-xl border border-teal-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
            onKeyDown={(e) => e.key === "Enter" && lookup()}
          />
          <button
            type="button"
            onClick={lookup}
            className="rounded-xl bg-teal-600 px-4 py-3 text-white hover:bg-teal-700"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-teal-700/60">
          Demo codes: BIN-001, BIN-003, DISP-WLG-01, DISP-WLG-05
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {result && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-teal-100">
          <p className="text-xs font-medium uppercase text-teal-600">
            {result.type === "bin" ? "Smart Bin" : "Disposal Point"}
          </p>
          <p className="mt-1 text-lg font-semibold text-teal-950">{result.title}</p>
          <p className="mt-2 text-sm text-teal-800/70">{result.detail}</p>
          <Link
            href={result.href}
            className="mt-4 inline-block rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            View details
          </Link>
        </div>
      )}
    </div>
  );
}
