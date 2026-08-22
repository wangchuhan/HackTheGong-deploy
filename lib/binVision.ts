import type { BinVisionResult } from "./types";

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

  return mockAnalyze(file);
}

function mockAnalyze(_file: File): BinVisionResult {
  const fillEstimate = 40 + Math.floor(Math.random() * 50);
  return {
    fillEstimate,
    confidence: 0.82 + Math.random() * 0.15,
    itemsDetected: Math.floor(fillEstimate * 0.6),
    source: "mock",
  };
}
