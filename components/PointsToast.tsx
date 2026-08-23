"use client";

import { useEffect, useState } from "react";

interface PointsToastState {
  points: number;
  message?: string;
}

export default function PointsToast() {
  const [toast, setToast] = useState<PointsToastState | null>(null);

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<PointsToastState>).detail;
      setToast(detail);
      const t = setTimeout(() => setToast(null), 2800);
      return () => clearTimeout(t);
    }
    window.addEventListener("vapesafe-points", handler);
    return () => window.removeEventListener("vapesafe-points", handler);
  }, []);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 left-0 right-0 z-[60] flex justify-center px-4">
      <div className="toast-enter rounded-2xl bg-teal-700 px-5 py-3 text-center text-white shadow-lg">
        <p className="text-lg font-bold">+{toast.points} pts</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-teal-100">{toast.message}</p>
        )}
      </div>
    </div>
  );
}
