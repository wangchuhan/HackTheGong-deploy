"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CodeLookup from "@/components/CodeLookup";

function ScanContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? undefined;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">Scan QR Code</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Scan a smart bin or council disposal point to log your deposit.
        </p>
      </header>

      <CodeLookup initialCode={initialCode} />
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-teal-700">Loading scanner…</div>
      }
    >
      <ScanContent />
    </Suspense>
  );
}
