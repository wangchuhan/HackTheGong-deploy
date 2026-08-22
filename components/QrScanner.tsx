"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (code: string) => void;
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMobile =
    typeof window !== "undefined" &&
    /iPhone|iPad|Android/i.test(navigator.userAgent);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  async function startScan() {
    setError("");
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        (decoded) => {
          onScan(decoded);
          scanner.stop().catch(() => {});
          setActive(false);
        },
        () => {},
      );
      setActive(true);
    } catch {
      setError("Camera unavailable. Use manual code entry below.");
    }
  }

  async function stopScan() {
    await scannerRef.current?.stop().catch(() => {});
    setActive(false);
  }

  if (!isMobile) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/50 p-6 text-center">
        <p className="text-sm text-teal-800">
          QR scanning works best on mobile. On desktop, use <strong>manual code entry</strong> below.
        </p>
        <p className="mt-2 text-xs text-teal-600">Try: BIN-001 or DISP-WLG-01</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        id="qr-reader"
        className={`overflow-hidden rounded-2xl ${active ? "" : "hidden"}`}
      />
      {!active ? (
        <button
          type="button"
          onClick={startScan}
          className="w-full rounded-xl bg-teal-600 py-3 text-sm font-medium text-white hover:bg-teal-700"
        >
          Open camera to scan QR
        </button>
      ) : (
        <button
          type="button"
          onClick={stopScan}
          className="w-full rounded-xl bg-gray-200 py-3 text-sm font-medium text-gray-800"
        >
          Stop camera
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
