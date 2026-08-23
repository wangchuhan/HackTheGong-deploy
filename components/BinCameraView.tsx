"use client";

import Image from "next/image";
import { Radio } from "lucide-react";
import type { SmartBin } from "@/lib/types";
import type { BinVisionResult } from "@/lib/types";

interface BinCameraViewProps {
  bin: SmartBin;
  visionResult?: BinVisionResult | null;
  scanning?: boolean;
  scanLabel?: string;
}

export default function BinCameraView({
  bin,
  visionResult,
  scanning = false,
  scanLabel = "Syncing sensor…",
}: BinCameraViewProps) {
  const image = bin.cameraImage ?? "/bins/bin-default.svg";
  const fill = visionResult?.fillEstimate ?? bin.aiFillEstimate ?? bin.fillLevel;
  const confidence = visionResult?.confidence ?? bin.aiConfidence ?? 0.85;
  const items = visionResult?.itemsDetected ?? bin.aiItemsDetected ?? 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-teal-100">
      <div className="relative aspect-video bg-gray-900">
        <Image
          src={image}
          alt={`Interior view of ${bin.name}`}
          fill
          className={`object-cover transition-opacity duration-300 ${scanning ? "opacity-50" : ""}`}
          unoptimized
        />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <Radio className="h-3.5 w-3.5" />
          Demo IoT feed
        </div>
        {scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-teal-900/30">
            <div className="h-full w-full animate-pulse bg-teal-500/20" />
            <span className="absolute text-sm font-medium text-white">{scanLabel}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <p className="text-sm font-medium">
            Estimated fill: {fill}% · ~{items} items visible
          </p>
          <p className="text-xs opacity-80">
            Confidence {Math.round(confidence * 100)}% · Simulated telemetry
          </p>
        </div>
      </div>
    </div>
  );
}
