import Image from "next/image";
import Link from "next/link";
import { getBins, getDisposalPoints } from "@/lib/data";

const DEMO_CODES = [
  ...getBins().slice(0, 5).map((b) => b.code),
  ...getDisposalPoints().slice(0, 3).map((p) => p.id),
];

export default function DemoQrPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/scan" className="text-sm text-teal-600 underline">
          ← Back to scan
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-teal-950">Demo QR Codes</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Print or display these for hackathon demos. Each encodes a plain bin or
          disposal code.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {DEMO_CODES.map((code) => (
          <div
            key={code}
            className="flex flex-col items-center rounded-xl bg-white p-4 ring-1 ring-teal-100"
          >
            <div className="relative h-32 w-32">
              <Image
                src={`/qr/${code}.png`}
                alt={`QR code for ${code}`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="mt-2 font-mono text-sm font-semibold text-teal-950">
              {code}
            </p>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-teal-600">
        Regenerate with: python scripts/generate_demo_qrs.py
      </p>
    </div>
  );
}
