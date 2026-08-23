"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Calendar, Flame, MapPin, Recycle, Star } from "lucide-react";
import LevelBadge from "@/components/LevelBadge";
import { getSuburbRank, getLeaderboard } from "@/lib/data";
import {
  getSchoolRivalryNudge,
  getRankNudge,
  hasStreakFlame,
} from "@/lib/gamification";
import { getCleanupSchedules, getSchoolNames, getUser, setNickname, setSchool, setSuburb, SUBURBS } from "@/lib/user";
import { BADGES } from "@/lib/types";
import type { UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [rankNudge, setRankNudge] = useState<string | null>(null);
  const [schoolNudge, setSchoolNudge] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setNameInput(u.nickname);
    setRankNudge(getRankNudge(u.points));
    setSchoolNudge(getSchoolRivalryNudge());
  }, []);

  if (!user) return null;

  function saveName() {
    setNickname(nameInput);
    setUser(getUser());
    setEditing(false);
  }

  function handleSuburbChange(suburb: string) {
    setSuburb(suburb);
    setUser(getUser());
  }

  function handleSchoolChange(school: string) {
    setSchool(school || null);
    setUser(getUser());
  }

  const suburbRank = user.suburb ? getSuburbRank(user.suburb) : null;
  const cleanups = getCleanupSchedules().filter((c) => c.status !== "completed");
  const onFire = hasStreakFlame();
  const schools = getLeaderboard().schools;
  const schoolOptions = getSchoolNames();
  const wasteDiverted = (user.reportsSubmitted + user.disposalsLogged) * 0.012;

  return (
    <div className="space-y-6">
      <header className="text-center">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-600 text-2xl font-bold text-white">
          {user.nickname.charAt(0).toUpperCase()}
          {onFire && (
            <Flame className="absolute -right-1 -top-1 h-6 w-6 text-orange-400" />
          )}
        </div>
        {editing ? (
          <div className="mt-3 flex justify-center gap-2">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="rounded-lg border border-teal-200 px-3 py-1 text-sm"
            />
            <button
              type="button"
              onClick={saveName}
              className="rounded-lg bg-teal-600 px-3 py-1 text-sm text-white"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-3 text-xl font-bold text-teal-950"
          >
            {user.nickname}
          </button>
        )}
        <div className="mt-2">
          <LevelBadge level={user.level} points={user.points} />
        </div>
        {rankNudge && (
          <p className="mt-2 text-xs text-amber-800">{rankNudge}</p>
        )}
        <p className="mt-2 text-xs text-teal-600">
          Most people reach Level 2 after 2–3 activities
        </p>
        {user.school && (
          <p className="mt-1 text-sm text-teal-700">{user.school}</p>
        )}
      </header>

      {schoolNudge && schools.length >= 2 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {schoolNudge}
        </p>
      )}

      <section className="rounded-xl bg-white p-4 ring-1 ring-teal-100">
        <label className="block text-sm font-medium text-teal-900">
          School (optional)
        </label>
        <p className="mt-1 text-xs text-teal-600">
          Join your school on the leaderboard — skip if you prefer
        </p>
        <select
          value={user.school ?? ""}
          onChange={(e) => handleSchoolChange(e.target.value)}
          className="mt-2 w-full rounded-lg border border-teal-200 px-3 py-2 text-sm"
        >
          <option value="">Skip / not in school</option>
          {schoolOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-xl bg-teal-50 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-teal-900">
          <MapPin className="h-4 w-4" />
          Your suburb (for suburb challenge)
        </label>
        <select
          value={user.suburb ?? ""}
          onChange={(e) => handleSuburbChange(e.target.value)}
          className="mt-2 w-full rounded-lg border border-teal-200 px-3 py-2 text-sm"
        >
          <option value="">Select suburb…</option>
          {SUBURBS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {user.suburb && suburbRank && (
          <p className="mt-2 text-sm text-teal-800">
            {user.suburb} is <strong>#{suburbRank}</strong> in the suburb challenge
          </p>
        )}
      </section>

      <section className="rounded-xl bg-white p-4 ring-1 ring-teal-100">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-teal-950">
            <Calendar className="h-4 w-4" />
            My cleanups
          </h2>
          <Link href="/schedule" className="text-sm text-teal-600 underline">
            Schedule →
          </Link>
        </div>
        {cleanups.length === 0 ? (
          <p className="mt-2 text-sm text-teal-700">
            No upcoming cleanups — schedule one to earn +15 points.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {cleanups.slice(0, 3).map((c) => (
              <li key={c.id} className="text-sm text-teal-800">
                {c.suburb} · {c.date}{" "}
                <span className="text-xs capitalize text-teal-600">({c.status})</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-teal-100">
          <Star className="mx-auto h-6 w-6 text-yellow-500" />
          <p className="mt-2 text-2xl font-bold text-teal-950">{user.points}</p>
          <p className="text-xs text-teal-700">Points</p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-teal-100">
          <Award className="mx-auto h-6 w-6 text-teal-600" />
          <p className="mt-2 text-2xl font-bold text-teal-950">
            {user.reportsSubmitted}
          </p>
          <p className="text-xs text-teal-700">Reports</p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-teal-100">
          <Recycle className="mx-auto h-6 w-6 text-green-600" />
          <p className="mt-2 text-2xl font-bold text-teal-950">
            {user.disposalsLogged}
          </p>
          <p className="text-xs text-teal-700">Items disposed</p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-teal-100">
          <p className="mt-2 text-2xl font-bold text-teal-950">
            {wasteDiverted.toFixed(1)}
          </p>
          <p className="text-xs text-teal-700">kg diverted (est.)</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-teal-950">Badges</h2>
        <div className="grid grid-cols-2 gap-2">
          {BADGES.map((b) => {
            const earned = user.badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-xl p-3 text-center text-sm ${
                  earned
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <p className="font-medium">{b.name}</p>
                {!earned && <p className="text-xs opacity-70">Locked</p>}
              </div>
            );
          })}
        </div>
      </section>

      <Link
        href="/rewards"
        className="block rounded-xl bg-white py-3 text-center font-medium text-teal-600 ring-1 ring-teal-100 hover:ring-teal-300"
      >
        Redeem rewards →
      </Link>
    </div>
  );
}
