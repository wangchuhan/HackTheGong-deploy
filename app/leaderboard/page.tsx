"use client";

import { useState } from "react";
import { getLeaderboard } from "@/lib/data";

type Tab = "individual" | "schools" | "suburbs" | "challenges";

export default function LeaderboardPage() {
  const data = getLeaderboard();
  const [tab, setTab] = useState<Tab>("individual");

  const tabs: { id: Tab; label: string }[] = [
    { id: "individual", label: "Everyone" },
    { id: "schools", label: "Schools" },
    { id: "suburbs", label: "Suburbs" },
    { id: "challenges", label: "Challenges" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">Leaderboard</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Open to everyone — schools and suburbs compete too
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              tab === t.id
                ? "bg-teal-600 text-white"
                : "bg-white text-teal-800 ring-1 ring-teal-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "individual" && (
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
      )}

      {tab === "schools" && (
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

      {tab === "suburbs" && (
        <ol className="space-y-2">
          {data.suburbs.map((suburb) => (
            <li
              key={suburb.rank}
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-teal-100"
            >
              <span className="w-6 text-center font-bold text-teal-600">
                {suburb.rank}
              </span>
              <div className="flex-1">
                <p className="font-medium text-teal-950">{suburb.name}</p>
                <p className="text-xs text-teal-700/70">{suburb.members} contributors</p>
              </div>
              <span className="font-semibold text-teal-800">{suburb.points} pts</span>
            </li>
          ))}
        </ol>
      )}

      {tab === "challenges" && (
        <div className="space-y-4">
          <ChallengeCard
            label="Weekly challenge"
            title={data.weeklyChallenge.title}
            description={data.weeklyChallenge.description}
            endsAt={data.weeklyChallenge.endsAt}
            progress={data.weeklyChallenge.progress}
          />
          <ChallengeCard
            label="Monthly challenge"
            title={data.monthlyChallenge.title}
            description={data.monthlyChallenge.description}
            endsAt={data.monthlyChallenge.endsAt}
            progress={data.monthlyChallenge.progress}
          />
        </div>
      )}
    </div>
  );
}

function ChallengeCard({
  label,
  title,
  description,
  endsAt,
  progress,
}: {
  label: string;
  title: string;
  description: string;
  endsAt: string;
  progress: number;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 p-5 text-white">
      <p className="text-xs font-medium uppercase opacity-80">{label}</p>
      <p className="mt-1 text-lg font-bold">{title}</p>
      <p className="mt-1 text-sm opacity-90">{description}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/30">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-xs opacity-80">
        {progress}% complete · ends {endsAt}
      </p>
    </div>
  );
}
