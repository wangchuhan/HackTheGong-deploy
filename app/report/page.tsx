"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, MapPin } from "lucide-react";
import { generateReportId } from "@/lib/geo";
import { addSessionReport } from "@/lib/user";
import type { Report } from "@/lib/types";
import { WOLLONGONG_CENTER } from "@/lib/types";

export default function ReportPage() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [lat, setLat] = useState(WOLLONGONG_CENTER.lat);
  const [lng, setLng] = useState(WOLLONGONG_CENTER.lng);
  const [gpsStatus, setGpsStatus] = useState("Locating…");
  const [submitted, setSubmitted] = useState<Report | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("GPS unavailable — using default pin");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGpsStatus("GPS location captured");
      },
      () => setGpsStatus("GPS denied — tap coordinates to adjust or use default"),
    );
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
    const report: Report = {
      id: generateReportId(),
      lat,
      lng,
      suburb: "Wollongong",
      status: "pending",
      createdAt: new Date().toISOString(),
      pointsAwarded: 10,
      photoUrl: photo ?? undefined,
    };
    addSessionReport(report);
    setSubmitted(report);
  }

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-teal-600" />
        <h1 className="text-2xl font-bold text-teal-950">Report Submitted</h1>
        <p className="text-sm text-teal-800/70">
          Your report has been recorded. The heatmap will update to guide cleanup.
        </p>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-teal-100">
          <p className="text-xs uppercase text-teal-600">Report ID</p>
          <p className="mt-1 text-2xl font-mono font-bold text-teal-950">
            {submitted.id}
          </p>
          <p className="mt-2 text-sm text-teal-700">+10 points earned</p>
        </div>
        <div className="flex flex-col gap-2">
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
          Take a photo and we&apos;ll record your GPS location automatically.
        </p>
      </header>

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

        <div className="rounded-xl bg-teal-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-teal-800">
            <MapPin className="h-4 w-4" />
            {gpsStatus}
          </div>
          <p className="mt-1 font-mono text-xs text-teal-700">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-teal-700">Latitude</label>
            <input
              type="number"
              step="0.00001"
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-teal-700">Longitude</label>
            <input
              type="number"
              step="0.00001"
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700"
        >
          Submit report
        </button>
      </form>
    </div>
  );
}
