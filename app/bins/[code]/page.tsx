"use client";

import { use, useState } from "react";
import Link from "next/link";
import { CheckCircle, MapPin, Recycle } from "lucide-react";
import BinStatusGauge from "@/components/BinStatusGauge";
import BinCameraView from "@/components/BinCameraView";
import { getBinByCode } from "@/lib/data";
import { logDisposal } from "@/lib/user";
import { analyzeBinImage } from "@/lib/binVision";
import type { BinVisionResult } from "@/lib/types";

export default function BinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const bin = getBinByCode(code);
  const [disposed, setDisposed] = useState(false);
  const [vision, setVision] = useState<BinVisionResult | null>(null);
  const [scanning, setScanning] = useState(false);

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

  function handleDispose() {
    logDisposal();
    setDisposed(true);
  }

  async function handleRefreshScan() {
    if (!bin) return;
    setScanning(true);
    try {
      const res = await fetch(bin.cameraImage ?? "/bins/bin-default.svg");
      const blob = await res.blob();
      const file = new File([blob], "bin.jpg", { type: blob.type });
      const result = await analyzeBinImage(file);
      setVision(result);
    } finally {
      setScanning(false);
    }
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
        <BinStatusGauge fillLevel={vision?.fillEstimate ?? bin.fillLevel} />
      </div>

      <BinCameraView
        bin={bin}
        visionResult={vision}
        scanning={scanning}
        onRefresh={handleRefreshScan}
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

      <div className="grid gap-3">
        <button
          type="button"
          onClick={handleDispose}
          disabled={disposed}
          className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {disposed ? (
            <>
              <CheckCircle className="h-5 w-5" />
              Disposal logged · +25 pts
            </>
          ) : (
            <>
              <Recycle className="h-5 w-5" />
              I disposed here (+25 pts)
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
