"use client";

import { useState } from "react";
import { getLeaderboard } from "@/lib/data";

export default function LeaderboardPage() {
  const data = getLeaderboard();
  const [tab, setTab] = useState<"individual" | "schools">("individual");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">Leaderboard</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Individual rankings and school challenges
        </p>
      </header>

      <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 p-5 text-white">
        <p className="text-xs font-medium uppercase opacity-80">Monthly challenge</p>
        <p className="mt-1 text-lg font-bold">{data.monthlyChallenge.title}</p>
        <p className="mt-1 text-sm opacity-90">{data.monthlyChallenge.description}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/30">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${data.monthlyChallenge.progress}%` }}
          />
        </div>
        <p className="mt-1 text-xs opacity-80">
          {data.monthlyChallenge.progress}% complete · ends{" "}
          {data.monthlyChallenge.endsAt}
        </p>
      </div>

      <div className="flex gap-2">
        {(["individual", "schools"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium ${
              tab === t
                ? "bg-teal-600 text-white"
                : "bg-white text-teal-800 ring-1 ring-teal-100"
            }`}
          >
            {t === "individual" ? "Individual" : "Schools"}
          </button>
        ))}
      </div>

      {tab === "individual" ? (
        <ol className="space-y-2">
          {data.individuals.map((entry) => (
            <li
              key={entry.rank}
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-teal-100"
            >
              <span className="w-6 text-center font-bold text-teal-600">
                {entry.rank}
              </span>
              <div className="flex-1">
                <p className="font-medium text-teal-950">{entry.nickname}</p>
                {entry.school && (
                  <p className="text-xs text-teal-700/70">{entry.school}</p>
                )}
              </div>
              <span className="font-semibold text-teal-800">{entry.points} pts</span>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="space-y-2">
          {data.schools.map((school) => (
            <li
              key={school.rank}
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-teal-100"
            >
              <span className="w-6 text-center font-bold text-teal-600">
                {school.rank}
              </span>
              <div className="flex-1">
                <p className="font-medium text-teal-950">{school.name}</p>
                <p className="text-xs text-teal-700/70">{school.members} members</p>
              </div>
              <span className="font-semibold text-teal-800">{school.points} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
