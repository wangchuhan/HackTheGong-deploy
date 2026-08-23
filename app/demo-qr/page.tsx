"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBins, getDisposalPoints } from "@/lib/data";

const DEMO_CODES = [
  ...getBins().slice(0, 5).map((b) => b.code),
  ...getDisposalPoints().slice(0, 3).map((p) => p.id),
];

export default function DemoQrPage() {
  const [enlarged, setEnlarged] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/scan" className="text-sm text-teal-600 underline">
          ← Back to scan
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-teal-950">Demo QR Codes</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Hold your phone 15–20cm from the screen, or print at full page width.
          Tap a code to enlarge for scanning.
        </p>
      </header>

      <div className="space-y-6">
        {DEMO_CODES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setEnlarged(code)}
            className="flex w-full flex-col items-center rounded-xl bg-white p-6 ring-1 ring-teal-100"
          >
            <div className="relative h-72 w-72 max-w-full bg-white p-4">
              <Image
                src={`/qr/${code}.png`}
                alt={`QR code for ${code}`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="mt-3 font-mono text-lg font-semibold text-teal-950">
              {code}
            </p>
          </button>
        ))}
      </div>

      {enlarged && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setEnlarged(null)}
          onKeyDown={(e) => e.key === "Escape" && setEnlarged(null)}
          role="button"
          tabIndex={0}
        >
          <div className="max-w-sm rounded-2xl bg-white p-6 text-center">
            <div className="relative mx-auto h-80 w-80 max-w-full">
              <Image
                src={`/qr/${enlarged}.png`}
                alt={`QR code for ${enlarged}`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="mt-4 font-mono text-xl font-bold">{enlarged}</p>
            <p className="mt-2 text-sm text-teal-600">Tap outside to close</p>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-teal-600">
        Regenerate with: python scripts/generate_demo_qrs.py
      </p>
    </div>
  );
}
