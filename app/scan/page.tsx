"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CodeLookup from "@/components/CodeLookup";

export default function ScanPage() {
  const router = useRouter();
  const [linkedBin, setLinkedBin] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">Scan QR Code</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Scan on mobile or enter a code manually — works on any device.
        </p>
      </header>

      <CodeLookup
        onBinFound={(code) => router.push(`/bins/${code}`)}
        onDisposalFound={() => setLinkedBin(null)}
      />

      {linkedBin && (
        <p className="text-sm text-teal-700">Linked bin: {linkedBin}</p>
      )}
    </div>
  );
}
