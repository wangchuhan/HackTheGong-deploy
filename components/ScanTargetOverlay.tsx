"use client";

interface ScanTargetOverlayProps {
  scanning?: boolean;
}

export default function ScanTargetOverlay({ scanning }: ScanTargetOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className={`relative h-52 w-52 rounded-2xl border-2 border-white/80 ${
          scanning ? "animate-pulse border-teal-400" : ""
        }`}
      >
        <span className="absolute -left-1 -top-1 h-6 w-6 border-l-4 border-t-4 border-teal-400" />
        <span className="absolute -right-1 -top-1 h-6 w-6 border-r-4 border-t-4 border-teal-400" />
        <span className="absolute -bottom-1 -left-1 h-6 w-6 border-b-4 border-l-4 border-teal-400" />
        <span className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-teal-400" />
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-teal-400/40" />
      </div>
    </div>
  );
}
