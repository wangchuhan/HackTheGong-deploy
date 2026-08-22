"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, RefreshCw } from "lucide-react";
import type { SmartBin } from "@/lib/types";
import type { BinVisionResult } from "@/lib/types";

interface BinCameraViewProps {
  bin: SmartBin;
  onRefresh?: () => void;
  visionResult?: BinVisionResult | null;
  scanning?: boolean;
}

export default function BinCameraView({
  bin,
  onRefresh,
  visionResult,
  scanning = false,
}: BinCameraViewProps) {
  const [cycle, setCycle] = useState(0);
  const image = bin.cameraImage ?? "/bins/bin-default.svg";
  const fill = visionResult?.fillEstimate ?? bin.aiFillEstimate ?? bin.fillLevel;
  const confidence = visionResult?.confidence ?? bin.aiConfidence ?? 0.85;
  const items = visionResult?.itemsDetected ?? bin.aiItemsDetected ?? 0;
  const source = visionResult?.source ?? "mock";

  function handleRefresh() {
    setCycle((c) => c + 1);
    onRefresh?.();
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-teal-100">
      <div className="relative aspect-video bg-gray-900">
        <Image
          src={image}
          alt={`Interior view of ${bin.name}`}
          fill
          className={`object-cover ${scanning ? "opacity-60" : ""}`}
          unoptimized
        />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
          <Camera className="h-3.5 w-3.5" />
          AI Vision · {Math.round(confidence * 100)}% confidence
        </div>
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-full animate-pulse bg-teal-500/20" />
            <span className="absolute text-sm font-medium text-white">
              Scanning…
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <p className="text-sm font-medium">
            Estimated fill: {fill + (cycle % 3)}% · ~{items} items visible
          </p>
          <p className="text-xs opacity-80">
            Last scan:{" "}
            {bin.aiLastScan
              ? new Date(bin.aiLastScan).toLocaleString()
              : "Just now"}{" "}
            · {source === "api" ? "Live AI" : "Demo model"}
          </p>
        </div>
      </div>
      {onRefresh && (
        <button
          type="button"
          onClick={handleRefresh}
          className="flex w-full items-center justify-center gap-2 border-t border-teal-100 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh scan
        </button>
      )}
    </div>
  );
}
