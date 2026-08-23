"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Award, Calendar, CheckCircle, Sparkles } from "lucide-react";
import {
  SUBURBS,
  archiveCleanupSchedule,
  getArchivedCleanupSchedules,
  getCleanupSchedules,
  getUser,
  scheduleCleanup,
} from "@/lib/user";
import CleanupScheduleList, {
  ArchivedCleanupSection,
  CleanupBackupButton,
} from "@/components/CleanupScheduleList";
import { nextWeekdayDate } from "@/lib/geo";
import type { CleanupScheduleRequest } from "@/lib/types";

function ScheduleForm() {
  const searchParams = useSearchParams();
  const prefillSuburb = searchParams.get("suburb") ?? "";
  const prefillReportId = searchParams.get("reportId") ?? "";

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(nextWeekdayDate());
  const [suburb, setSuburb] = useState(prefillSuburb || SUBURBS[0]);
  const [timeSlot, setTimeSlot] = useState<"morning" | "afternoon">("morning");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [lastAppointment, setLastAppointment] = useState<CleanupScheduleRequest | null>(null);
  const [animating, setAnimating] = useState(false);
  const [schedules, setSchedules] = useState<CleanupScheduleRequest[]>([]);
  const [archived, setArchived] = useState(
    [] as ReturnType<typeof getArchivedCleanupSchedules>,
  );
  const [user, setUser] = useState(getUser());

  function refreshSchedules() {
    setSchedules(getCleanupSchedules());
    setArchived(getArchivedCleanupSchedules());
    setUser(getUser());
  }

  useEffect(() => {
    refreshSchedules();
  }, []);

  useEffect(() => {
    if (prefillSuburb) setSuburb(prefillSuburb);
  }, [prefillSuburb]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAnimating(true);
    const result = scheduleCleanup({
      date,
      suburb,
      timeSlot,
      reportIds: prefillReportId ? [prefillReportId] : undefined,
      notes: notes || undefined,
      status: "requested",
    });
    setUser(result.user);
    refreshSchedules();
    if (!result.success) {
      setError(result.error ?? "Could not schedule.");
      setSaved(false);
      setAnimating(false);
      return;
    }
    setLastAppointment(result.appointment ?? null);
    setSaved(true);
    setNotes("");
    setTimeout(() => setAnimating(false), 1200);
  }

  const upcoming = schedules
    .filter((s) => s.date >= today && s.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = schedules
    .filter((s) => s.date < today || s.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date));

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
            onChange={(e) => {
              setDate(e.target.value);
              setSaved(false);
            }}
            required
            className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-teal-900">Time slot</label>
          <select
            value={timeSlot}
            onChange={(e) => {
              setTimeSlot(e.target.value as "morning" | "afternoon");
              setSaved(false);
            }}
            className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2 text-sm"
          >
            <option value="morning">Morning (8am – 12pm)</option>
            <option value="afternoon">Afternoon (12pm – 5pm)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-teal-900">Suburb</label>
          <select
            value={suburb}
            onChange={(e) => {
              setSuburb(e.target.value);
              setSaved(false);
            }}
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

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        {saved && lastAppointment && (
          <div className="space-y-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="flex items-center justify-center gap-2 font-medium">
              <CheckCircle className="h-5 w-5 text-amber-600" />
              Scheduled! +15 points
            </div>
            <p className="text-center text-xs">
              {lastAppointment.id} · {lastAppointment.date} ·{" "}
              {lastAppointment.timeSlot === "afternoon" ? "Afternoon" : "Morning"} ·{" "}
              {lastAppointment.suburb}
            </p>
          </div>
        )}
      </form>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-teal-950">
            <Award className="h-4 w-4" />
            Upcoming cleanups
          </h2>
          <CleanupBackupButton />
        </div>
        <CleanupScheduleList
          items={upcoming}
          onChange={refreshSchedules}
        />
      </section>

      <ArchivedCleanupSection archived={archived} onChange={refreshSchedules} />

      {past.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold text-teal-950">Past</h2>
          <ul className="space-y-2">
            {past.slice(0, 5).map((job) => (
              <li
                key={job.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm text-teal-800"
              >
                <span>
                  {job.suburb} · {job.date}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    archiveCleanupSchedule(job.id, "completed");
                    refreshSchedules();
                  }}
                  className="text-xs text-teal-600 underline"
                >
                  Archive
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

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
