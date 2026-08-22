"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, CheckCircle } from "lucide-react";
import { getBins } from "@/lib/data";
import {
  SUBURBS,
  addCleanupSchedule,
  getCleanupSchedules,
} from "@/lib/user";

const AUTH_KEY = "vapesafe-council-auth";

export default function CouncilSchedulePage() {
  const [authed, setAuthed] = useState(false);
  const [date, setDate] = useState("");
  const [suburb, setSuburb] = useState(SUBURBS[0]);
  const [selectedBins, setSelectedBins] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [schedules, setSchedules] = useState(getCleanupSchedules());

  const bins = getBins();
  const nearFullBins = useMemo(
    () => bins.filter((b) => b.fillLevel >= 75),
    [bins],
  );

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) !== "1") {
      window.location.href = "/council";
      return;
    }
    setAuthed(true);
    setDate(today);
    setSelectedBins(nearFullBins.map((b) => b.code));
  }, [today, nearFullBins]);

  if (!authed) return null;

  function toggleBin(code: string) {
    setSelectedBins((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry = {
      id: `CLN-${Date.now()}`,
      date,
      suburb,
      bins: selectedBins.length ? selectedBins : undefined,
      status: "scheduled" as const,
      notes: notes || undefined,
    };
    addCleanupSchedule(entry);
    setSchedules(getCleanupSchedules());
    setSaved(true);
    setNotes("");
    setTimeout(() => setSaved(false), 3000);
  }

  const upcoming = schedules
    .filter((s) => s.status !== "completed" && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <header>
        <Link href="/council" className="text-sm text-teal-600 underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-teal-950">
          <Calendar className="h-7 w-7 text-teal-600" />
          Schedule Cleanup
        </h1>
        <p className="text-sm text-teal-800/70">
          Plan litter collection for a suburb and optional smart bins
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-4 ring-1 ring-teal-100">
        <div>
          <label className="block text-sm font-medium text-teal-900">Date</label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-teal-900">Suburb</label>
          <select
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2 text-sm"
          >
            {SUBURBS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-teal-900">
            Bins to include (optional)
          </label>
          <p className="text-xs text-teal-700">
            Near-full bins are pre-selected
          </p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
            {bins.map((b) => (
              <li key={b.id}>
                <label className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedBins.includes(b.code)}
                    onChange={() => toggleBin(b.code)}
                  />
                  <span className="flex-1">{b.name}</span>
                  <span className="text-xs text-teal-700">{b.fillLevel}%</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium text-teal-900">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Crew instructions, access notes…"
            className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-teal-600 py-3 font-medium text-white hover:bg-teal-700"
        >
          Schedule cleanup
        </button>

        {saved && (
          <p className="flex items-center justify-center gap-2 text-sm text-teal-700">
            <CheckCircle className="h-4 w-4" />
            Cleanup scheduled for {suburb} on {date}
          </p>
        )}
      </form>

      <section>
        <h2 className="mb-2 font-semibold text-teal-950">Scheduled & requested</h2>
        <ul className="space-y-2">
          {upcoming.length === 0 ? (
            <li className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-800">
              No upcoming cleanups in local storage.
            </li>
          ) : (
            upcoming.map((job) => (
              <li
                key={job.id}
                className="rounded-lg bg-white px-4 py-3 text-sm ring-1 ring-teal-100"
              >
                <div className="flex justify-between">
                  <span className="font-medium text-teal-950">{job.suburb}</span>
                  <span className="text-xs capitalize text-teal-600">
                    {job.status}
                  </span>
                </div>
                <p className="text-teal-800">{job.date}</p>
                {job.bins?.length ? (
                  <p className="text-xs text-teal-700">Bins: {job.bins.join(", ")}</p>
                ) : null}
                {job.notes && (
                  <p className="text-xs text-teal-600">{job.notes}</p>
                )}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
