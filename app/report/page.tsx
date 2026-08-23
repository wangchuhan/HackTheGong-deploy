"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Calendar, CheckCircle, ChevronDown, ChevronUp, Loader2, MapPin } from "lucide-react";
import {
  clampToIllawarra,
  generateReportId,
  nearestSuburb,
} from "@/lib/geo";
import { addSessionReport } from "@/lib/user";
import type { DisposalPoint, Report } from "@/lib/types";
import { WOLLONGONG_CENTER } from "@/lib/types";

const ReportLocationPicker = dynamic(
  () => import("@/components/ReportLocationPicker"),
  { ssr: false },
);
const PhoneHandoffQr = dynamic(() => import("@/components/PhoneHandoffQr"), {
  ssr: false,
});
const CodeLookup = dynamic(() => import("@/components/CodeLookup"), {
  ssr: false,
});

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-teal-700">Loading report form…</div>
      }
    >
      <ReportForm />
    </Suspense>
  );
}

function ReportForm() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? undefined;
  const [photo, setPhoto] = useState<string | null>(null);
  const [lat, setLat] = useState(WOLLONGONG_CENTER.lat);
  const [lng, setLng] = useState(WOLLONGONG_CENTER.lng);
  const [suburb, setSuburb] = useState("Wollongong");
  const [gpsStatus, setGpsStatus] = useState("Locating…");
  const [submitted, setSubmitted] = useState<Report | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCodeLookup, setShowCodeLookup] = useState(Boolean(initialCode));
  const [linkedBinCode, setLinkedBinCode] = useState<string | undefined>();
  const [linkedDisposalId, setLinkedDisposalId] = useState<string | undefined>();
  const [locationPinned, setLocationPinned] = useState(false);
  const [validationError, setValidationError] = useState("");
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("GPS unavailable — drag pin on map to adjust");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const clamped = clampToIllawarra(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        setLat(clamped.lat);
        setLng(clamped.lng);
        setLocationPinned(true);
        setGpsStatus("GPS location captured — drag pin to fine-tune");
      },
      () => setGpsStatus("GPS denied — drag pin on map to set location"),
    );
  }, []);

  useEffect(() => {
    setSuburb(nearestSuburb(lat, lng));
  }, [lat, lng]);

  const handleLocationChange = useCallback((newLat: number, newLng: number) => {
    const clamped = clampToIllawarra(newLat, newLng);
    setLat(clamped.lat);
    setLng(clamped.lng);
    setLocationPinned(true);
  }, []);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    const atDefaultCbd =
      !locationPinned &&
      Math.abs(lat - WOLLONGONG_CENTER.lat) < 0.001 &&
      Math.abs(lng - WOLLONGONG_CENTER.lng) < 0.001;

    if (!photo && !linkedBinCode && !linkedDisposalId) {
      setValidationError("Add a photo or link a bin / disposal code before submitting.");
      return;
    }
    if (atDefaultCbd && !linkedBinCode && !linkedDisposalId) {
      setValidationError("Move the map pin to your report location, or link a nearby bin.");
      return;
    }

    setValidationError("");
    isSubmittingRef.current = true;
    setSubmitting(true);

    const report: Report = {
      id: generateReportId(),
      lat,
      lng,
      suburb,
      status: "pending",
      createdAt: new Date().toISOString(),
      pointsAwarded: 0,
      photoUrl: photo ?? undefined,
      linkedBinCode,
      linkedDisposalId,
    };
    const result = addSessionReport(report);
    if (!result.success) {
      setValidationError(result.error ?? "Could not submit report.");
      isSubmittingRef.current = false;
      setSubmitting(false);
      return;
    }
    setSubmitted(result.report ?? report);
  }

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-teal-600" />
        <h1 className="text-2xl font-bold text-teal-950">Report Submitted</h1>
        <p className="text-sm text-teal-800/70">
          Your report in <strong>{submitted.suburb}</strong> has been recorded.
          The heatmap will update to guide cleanup.
        </p>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-teal-100">
          <p className="text-xs uppercase text-teal-600">Report ID</p>
          <p className="mt-1 text-2xl font-mono font-bold text-teal-950">
            {submitted.id}
          </p>
          <p className="mt-2 text-sm text-teal-700">
            +{submitted.pointsAwarded} points earned
            {!submitted.photoUrl && submitted.linkedBinCode
              ? " (bin location verified)"
              : !submitted.photoUrl && submitted.linkedDisposalId
                ? " (disposal location verified)"
                : ""}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href={`/schedule?suburb=${encodeURIComponent(submitted.suburb)}&reportId=${submitted.id}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-medium text-white hover:bg-amber-600"
          >
            <Calendar className="h-4 w-4" />
            Schedule cleanup for this area (+15 pts)
          </Link>
          <Link
            href="/heatmap"
            className="rounded-xl bg-teal-600 py-3 font-medium text-white hover:bg-teal-700"
          >
            View heatmap
          </Link>
          <Link href="/profile" className="text-sm text-teal-600 underline">
            Check your profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">Report Litter</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Take a photo, set your location, or manually link a bin / disposal code.
          To log items deposited, use the{" "}
          <Link href="/scan" className="underline">
            Scan page
          </Link>
          .
        </p>
      </header>

      <PhoneHandoffQr path="/report" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-teal-900">Photo</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            className="mt-2 w-full text-sm"
          />
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt="Report preview"
              className="mt-3 max-h-48 w-full rounded-xl object-cover"
            />
          )}
        </div>

        <div className="rounded-xl border border-teal-100 bg-white">
          <button
            type="button"
            onClick={() => setShowCodeLookup((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-teal-900"
          >
            Link nearby bin or disposal point (QR / manual)
            {showCodeLookup ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {showCodeLookup && (
            <div className="border-t border-teal-100 px-4 pb-4">
              <p className="pt-3 text-xs text-teal-700">
                Manual entry links a location for this litter report (+5). Camera scan
                opens the bin/disposal page to log deposited items.
              </p>
              <CodeLookup
                compact
                initialCode={initialCode}
                onBinFound={(code) => {
                  setLinkedBinCode(code);
                  setLinkedDisposalId(undefined);
                }}
                onDisposalFound={(point: DisposalPoint) => {
                  setLinkedDisposalId(point.id);
                  setLinkedBinCode(undefined);
                  handleLocationChange(point.lat, point.lng);
                }}
              />
              {(linkedBinCode || linkedDisposalId) && (
                <p className="mt-2 text-xs text-teal-700">
                  Linked: {linkedBinCode ?? linkedDisposalId}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-teal-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-teal-800">
            <MapPin className="h-4 w-4" />
            {gpsStatus}
          </div>
          <p className="mt-1 text-sm font-medium text-teal-900">
            Suburb: {suburb}
          </p>
          <p className="mt-1 font-mono text-xs text-teal-700">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-teal-900">
            Adjust location on map
          </label>
          <div className="mt-2">
            <ReportLocationPicker
              lat={lat}
              lng={lng}
              onChange={handleLocationChange}
            />
          </div>
        </div>

        {validationError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {validationError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            "Submit report"
          )}
        </button>
      </form>
    </div>
  );
}
