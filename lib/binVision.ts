import type { BinVisionResult, SmartBin } from "./types";

export interface MockAnalyzeOptions {
  previewItems?: number;
  itemsLoggedToday?: number;
  lastLoggedItemCount?: number;
}

export function mockAnalyzeBin(
  bin: SmartBin,
  options: MockAnalyzeOptions = {},
): BinVisionResult {
  const itemsLoggedToday = options.itemsLoggedToday ?? 0;
  const previewItems = options.previewItems;
  const itemsDetected =
    previewItems ??
    options.lastLoggedItemCount ??
    bin.aiItemsDetected ??
    Math.max(1, Math.round(bin.fillLevel / 25));

  const baseFill = bin.aiFillEstimate ?? bin.fillLevel;
  const fillEstimate = Math.min(
    95,
    Math.round(baseFill + itemsLoggedToday * 3 + (previewItems ? 0 : 0)),
  );

  return {
    fillEstimate,
    confidence: bin.aiConfidence ?? 0.88,
    itemsDetected,
    source: "mock",
  };
}

export async function analyzeBinImage(
  file: File,
): Promise<BinVisionResult> {
  const form = new FormData();
  form.append("image", file);

  try {
    const res = await fetch("/api/bin-vision", { method: "POST", body: form });
    if (res.ok) {
      return (await res.json()) as BinVisionResult;
    }
  } catch {
    // fall through to mock
  }

  const fillEstimate = 40 + Math.floor(Math.random() * 50);
  return {
    fillEstimate,
    confidence: 0.82 + Math.random() * 0.15,
    itemsDetected: Math.floor(fillEstimate * 0.6),
    source: "mock",
  };
}
