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

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
      scannerRef.current = null;
    };
  }, []);

  async function startScan() {
    setError("");
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      const cameras = await Html5Qrcode.getCameras();
      const cameraId = cameras[0]?.id;
      const config = { fps: 10, qrbox: { width: 200, height: 200 } };

      const onSuccess = (decoded: string) => {
        onScan(decoded);
        scanner.stop().catch(() => {});
        setActive(false);
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
      setActive(true);
    } catch {
      setError(
        "Camera unavailable. Allow webcam access or use manual code entry below.",
      );
    }
  }

  async function stopScan() {
    await scannerRef.current?.stop().catch(() => {});
    setActive(false);
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
      <p className="text-center text-xs text-teal-600">
        Works on mobile and desktop with a webcam · Try: BIN-001 or DISP-WLG-01
      </p>
    </div>
  );
}
