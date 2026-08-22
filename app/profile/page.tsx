"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, Gift, Star } from "lucide-react";
import { BADGES, type UserProfile } from "@/lib/types";
import { getSessionReports, getUser, setNickname } from "@/lib/user";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>(() => getUser());
  const reports = getSessionReports().length;
  const [draftName, setDraftName] = useState(() => getUser().nickname);

  return (
    <div className="space-y-5">
      <header className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-white">
        <p className="text-sm text-teal-100">Your impact</p>
        <h1 className="text-2xl font-bold">{user.nickname}</h1>
        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-3xl font-bold">{user.points}</p>
            <p className="text-xs text-teal-100">Points</p>
          </div>
          <div>
            <p className="text-3xl font-bold">Lv {user.level}</p>
            <p className="text-xs text-teal-100">Level</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{user.reportsSubmitted}</p>
            <p className="text-xs text-teal-100">Reports</p>
          </div>
        </div>
      </header>

      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-100">
        <label className="text-xs font-medium text-teal-700/70">
          Nickname
          <div className="mt-1 flex gap-2">
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="flex-1 rounded-lg border border-teal-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                setNickname(draftName);
                setUser(getUser());
              }}
              className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white"
            >
              Save
            </button>
          </div>
        </label>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2">
          <Award className="h-5 w-5 text-teal-600" />
          <h2 className="font-semibold text-teal-900">Badges</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {BADGES.map((badge) => {
            const earned = user.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-lg p-3 text-sm ring-1 ${
                  earned
                    ? "bg-teal-50 ring-teal-200 text-teal-900"
                    : "bg-gray-50 ring-gray-200 text-gray-400"
                }`}
              >
                <Star className={`mb-1 h-4 w-4 ${earned ? "text-amber-500 fill-amber-400" : ""}`} />
                <p className="font-medium">{badge.name}</p>
                <p className="text-xs opacity-70">Threshold: {badge.threshold}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-100">
        <p className="text-sm text-teal-800">
          Session reports stored locally: <strong>{reports}</strong>
        </p>
        <Link
          href="/rewards"
          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white"
        >
          <Gift className="h-4 w-4" />
          Redeem rewards
        </Link>
      </section>
    </div>
  );
}
