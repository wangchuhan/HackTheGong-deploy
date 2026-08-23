"use client";

import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";

interface CelebrationDetail {
  type: "weekly" | "monthly" | "badge";
  title?: string;
}

export default function CelebrationModal() {
  const [open, setOpen] = useState<CelebrationDetail | null>(null);

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<CelebrationDetail>).detail;
      setOpen(detail);
    }
    window.addEventListener("vapesafe-celebration", handler);
    return () => window.removeEventListener("vapesafe-celebration", handler);
  }, []);

  if (!open) return null;

  const titles: Record<string, string> = {
    weekly: "Weekly Sprint Complete!",
    monthly: "Boss Challenge Defeated!",
    badge: open.title ?? "Badge Unlocked!",
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm animate-in zoom-in-95 rounded-2xl bg-gradient-to-br from-amber-400 to-teal-600 p-6 text-center text-white shadow-xl duration-300">
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="absolute right-3 top-3 rounded-full bg-white/20 p-1"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-2 w-2 rounded-full bg-white/80"
              style={{
                left: `${10 + (i * 7) % 80}%`,
                top: `${5 + (i * 11) % 40}%`,
                animation: `pulse 1s ease-in-out ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </div>
        <Trophy className="mx-auto h-12 w-12" />
        <p className="mt-3 text-xl font-bold">{titles[open.type]}</p>
        <p className="mt-2 text-sm text-white/90">
          {open.type === "monthly"
            ? "Coastal Champion badge earned · +150 bonus pts"
            : open.type === "weekly"
              ? "+50 bonus pts added"
              : "Keep up the great work!"}
        </p>
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="mt-4 rounded-xl bg-white px-6 py-2 text-sm font-semibold text-teal-800"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
