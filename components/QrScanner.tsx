"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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
  const reactId = useId().replace(/:/g, "");
  const readerId = `qr-reader-${reactId}`;
  const [active, setActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const runningRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeStopAndClear = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner || !runningRef.current) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      await scanner.clear();
    } catch {
      // ignore stop/clear races
    } finally {
      runningRef.current = false;
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      void safeStopAndClear();
    };
  }, [safeStopAndClear]);

  async function startScan() {
    setError("");
    setActive(true);
    setScanning(true);

    await new Promise((r) => setTimeout(r, 80));

    try {
      await safeStopAndClear();
      const scanner = new Html5Qrcode(readerId);
      scannerRef.current = scanner;
      const cameras = await Html5Qrcode.getCameras();
      const cameraId = pickRearCamera(cameras);

      const config = {
        fps: 15,
        aspectRatio: 1.0,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const edge = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.75);
          return { width: edge, height: edge };
        },
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      };

      const onSuccess = async (decoded: string) => {
        setFlash(true);
        await safeStopAndClear();
        setActive(false);
        setScanning(false);
        setFlash(false);
        onScan(decoded);
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
      runningRef.current = true;
      setScanning(false);
    } catch (err) {
      await safeStopAndClear();
      setActive(false);
      setScanning(false);
      const msg = err instanceof Error ? err.message : "Camera unavailable";
      if (msg.includes("NotAllowed") || msg.includes("Permission")) {
        setError("Camera permission denied. Allow access or upload a QR image below.");
      } else if (typeof window !== "undefined" && !window.isSecureContext) {
        setError("Camera requires HTTPS. Upload a QR image or use manual entry.");
      } else {
        setError(
          "Camera unavailable. Upload a QR image or use manual code entry below.",
        );
      }
    }
  }

  async function stopScan() {
    await safeStopAndClear();
    setActive(false);
    setScanning(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      await safeStopAndClear();
      setActive(false);
      const scanner = new Html5Qrcode(readerId);
      const decoded = await scanner.scanFile(file, false);
      await scanner.clear();
      onScan(decoded);
    } catch {
      setError("Could not read QR from that image. Try a clearer photo or manual entry.");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl bg-gray-900 transition-opacity ${
          active ? "min-h-[300px] opacity-100" : "min-h-[300px] opacity-0 pointer-events-none absolute -z-10 w-full"
        } ${flash ? "ring-4 ring-green-400" : ""}`}
        aria-hidden={!active}
      >
        <div id={readerId} className="qr-reader-host w-full" />
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
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-xl border border-teal-200 bg-white py-3 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          Upload QR image
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-center text-xs text-teal-600">
        Demo: BIN-001, DISP-WLG-09 ·{" "}
        <a href="/demo-qr" className="underline">
          Printable QRs
        </a>
      </p>
    </div>
  );
}
