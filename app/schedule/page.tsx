"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Award, Calendar, CheckCircle, Sparkles } from "lucide-react";
import {
  SUBURBS,
  getCleanupSchedules,
  getUser,
  scheduleCleanup,
} from "@/lib/user";
import { nextWeekdayDate } from "@/lib/geo";

function ScheduleForm() {
  const searchParams = useSearchParams();
  const prefillSuburb = searchParams.get("suburb") ?? "";
  const prefillReportId = searchParams.get("reportId") ?? "";

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(nextWeekdayDate());
  const [suburb, setSuburb] = useState(prefillSuburb || SUBURBS[0]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [schedules, setSchedules] = useState(getCleanupSchedules());
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    if (prefillSuburb) setSuburb(prefillSuburb);
  }, [prefillSuburb]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAnimating(true);
    const updated = scheduleCleanup({
      date,
      suburb,
      reportIds: prefillReportId ? [prefillReportId] : undefined,
      notes: notes || undefined,
      status: "requested",
    });
    setUser(updated);
    setSchedules(getCleanupSchedules());
    setSaved(true);
    setNotes("");
    setTimeout(() => setAnimating(false), 1200);
  }

  const upcoming = schedules
    .filter((s) => s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 p-5 text-white shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <p className="font-semibold">Earn +15 points per cleanup scheduled</p>
        </div>
        <p className="mt-1 text-sm text-teal-100">
          Unlock the Cleanup Champion badge on your first schedule, and Coastal
          Champion after three.
        </p>
        <div className="mt-3 flex gap-4 text-sm">
          <span>{user.points} pts</span>
          <span>{user.cleanupsScheduled ?? 0} scheduled</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`space-y-4 rounded-xl bg-white p-4 ring-1 ring-teal-100 transition ${
          animating ? "animate-pulse ring-2 ring-amber-400" : ""
        }`}
      >
        <div>
          <label className="block text-sm font-medium text-teal-900">
            Cleanup date
          </label>
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
          <label className="block text-sm font-medium text-teal-900">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Where to meet, access details…"
            className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700"
        >
          Schedule cleanup
        </button>

        {saved && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-50 py-3 text-sm font-medium text-amber-900">
            <CheckCircle className="h-5 w-5 text-amber-600" />
            Scheduled! +15 points · Council will review your request
          </div>
        )}
      </form>

      <section>
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-teal-950">
          <Award className="h-4 w-4" />
          Your cleanups
        </h2>
        <ul className="space-y-2">
          {upcoming.length === 0 ? (
            <li className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-800">
              No cleanups yet — schedule one above to earn points and badges.
            </li>
          ) : (
            upcoming.map((job) => (
              <li
                key={job.id}
                className="rounded-lg bg-white px-4 py-3 text-sm ring-1 ring-teal-100"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{job.suburb}</span>
                  <span className="text-xs capitalize text-teal-600">
                    {job.status}
                  </span>
                </div>
                <p className="text-teal-800">{job.date}</p>
              </li>
            ))
          )}
        </ul>
      </section>

      <Link href="/leaderboard" className="block text-center text-sm text-teal-600 underline">
        View challenges & badges →
      </Link>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-teal-950">
          <Calendar className="h-7 w-7 text-teal-600" />
          Schedule a Cleanup
        </h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Pick a date and suburb — help your community and earn rewards
        </p>
      </header>
      <Suspense fallback={<p className="text-sm text-teal-700">Loading…</p>}>
        <ScheduleForm />
      </Suspense>
    </div>
  );
}
