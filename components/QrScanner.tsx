"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import ScanTargetOverlay from "@/components/ScanTargetOverlay";

interface QrScannerProps {
  onScan: (code: string) => void;
}

function pickRearCamera(
  cameras: { id: string; label: string }[],
): string | undefined {
  const rear = cameras.find((c) =>
    /back|rear|environment/i.test(c.label),
  );
  return rear?.id ?? cameras[cameras.length - 1]?.id;
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const [active, setActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
      scannerRef.current = null;
    };
  }, []);

  async function startScan() {
    setError("");
    setActive(true);
    setScanning(true);

    await new Promise((r) => setTimeout(r, 50));

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      const cameras = await Html5Qrcode.getCameras();
      const cameraId = pickRearCamera(cameras);
      const width = Math.min(280, containerRef.current?.clientWidth ?? 280);
      const config = { fps: 10, qrbox: { width, height: width } };

      const onSuccess = (decoded: string) => {
        setScanning(false);
        setFlash(true);
        setTimeout(() => {
          onScan(decoded);
          scanner.stop().catch(() => {});
          setActive(false);
          setFlash(false);
        }, 300);
      };

      if (cameraId) {
        await scanner.start(cameraId, config, onSuccess, () => {});
      } else {
        await scanner.start(
          { facingMode: "environment" },
          config,
          onSuccess,
          () => {},
        );
      }
      setScanning(false);
    } catch (err) {
      setActive(false);
      setScanning(false);
      const msg =
        err instanceof Error ? err.message : "Camera unavailable";
      if (msg.includes("NotAllowed") || msg.includes("Permission")) {
        setError("Camera permission denied. Allow access or use manual entry below.");
      } else if (typeof window !== "undefined" && !window.isSecureContext) {
        setError("Camera requires HTTPS. Use manual code entry below.");
      } else {
        setError(
          "Camera unavailable. Allow webcam access or use manual code entry below.",
        );
      }
    }
  }

  async function stopScan() {
    await scannerRef.current?.stop().catch(() => {});
    setActive(false);
    setScanning(false);
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl bg-gray-900 ${
          active ? "min-h-[280px]" : "hidden min-h-[280px]"
        } ${flash ? "ring-4 ring-green-400" : ""}`}
      >
        <div id="qr-reader" className="w-full" />
        {active && <ScanTargetOverlay scanning={scanning} />}
        {scanning && (
          <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/90">
            Starting camera…
          </p>
        )}
      </div>
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
      <p className="text-center text-xs text-teal-600">
        Works on mobile and desktop · Demo: BIN-001, DISP-WLG-09 ·{" "}
        <a href="/demo-qr" className="underline">
          Printable QRs
        </a>
      </p>
    </div>
  );
}
