"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeaderboard } from "@/lib/data";
import { getChallengeDefinitions, getChallengeProgress } from "@/lib/challenges";
import { getRankNudge } from "@/lib/gamification";
import { getUser } from "@/lib/user";

type Tab = "individual" | "schools" | "suburbs" | "challenges";

export default function LeaderboardPage() {
  const data = getLeaderboard();
  const [tab, setTab] = useState<Tab>("individual");
  const [progress, setProgress] = useState(getChallengeProgress());
  const [userPoints, setUserPoints] = useState(0);
  const [rankNudge, setRankNudge] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser();
    setUserPoints(u.points);
    setProgress(getChallengeProgress());
    setRankNudge(getRankNudge(u.points));
  }, [tab]);

  const defs = getChallengeDefinitions();

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
        {rankNudge && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {rankNudge}
          </p>
        )}
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
              className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm ring-1 ring-teal-100 ${
                userPoints >= entry.points && entry.rank <= 10
                  ? "bg-teal-50"
                  : "bg-white"
              }`}
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
          {userPoints > 0 && (
            <li className="flex items-center gap-3 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/50 px-4 py-3">
              <span className="w-6 text-center font-bold text-teal-600">—</span>
              <div className="flex-1">
                <p className="font-medium text-teal-950">You</p>
              </div>
              <span className="font-semibold text-teal-800">{userPoints} pts</span>
            </li>
          )}
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
          <WeeklyChallengeCard
            title={defs.weekly.title}
            description={defs.weekly.description}
            endsAt={defs.weekly.endsAt}
            progress={progress.weeklyPct}
            weekly={progress.weekly}
          />
          <MonthlyChallengeCard
            title={defs.monthly.title}
            description={defs.monthly.description}
            endsAt={defs.monthly.endsAt}
            progress={progress.monthlyPct}
            monthly={progress.monthly}
          />
          <Link
            href="/schedule"
            className="block rounded-xl bg-white py-3 text-center text-sm font-medium text-teal-700 ring-1 ring-teal-100 hover:ring-teal-300"
          >
            Schedule a cleanup to progress challenges →
          </Link>
        </div>
      )}
    </div>
  );
}

function WeeklyChallengeCard({
  title,
  description,
  endsAt,
  progress,
  weekly,
}: {
  title: string;
  description: string;
  endsAt: string;
  progress: number;
  weekly: ReturnType<typeof getChallengeProgress>["weekly"];
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 p-5 text-white">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase opacity-80">Weekly sprint</p>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">OR</span>
      </div>
      <p className="mt-1 text-lg font-bold">{title}</p>
      <p className="mt-1 text-sm opacity-90">{description}</p>
      <div className="mt-4 space-y-2">
        <QuestLane
          label={`Reports (${weekly.reports}/${weekly.reportsGoal})`}
          done={weekly.reportsDone}
          active={weekly.reportsDone && !weekly.disposalDone}
        />
        <QuestLane
          label={`Bin disposal (${weekly.disposalItems}/${weekly.disposalGoal} items)`}
          done={weekly.disposalDone}
          active={weekly.disposalDone && !weekly.reportsDone}
        />
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/30">
        <div
          className="h-full rounded-full bg-white transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-xs opacity-80">
        {progress}% complete · ends {endsAt} · +50 pts on complete
      </p>
    </div>
  );
}

function MonthlyChallengeCard({
  title,
  description,
  endsAt,
  progress,
  monthly,
}: {
  title: string;
  description: string;
  endsAt: string;
  progress: number;
  monthly: ReturnType<typeof getChallengeProgress>["monthly"];
}) {
  const bars = [
    { label: "Reports", current: monthly.reports, goal: monthly.reportsGoal },
    { label: "Cleanups", current: monthly.cleanups, goal: monthly.cleanupsGoal },
    {
      label: "Items disposed",
      current: monthly.disposalItems,
      goal: monthly.disposalGoal,
    },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-teal-900 p-5 text-white">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase opacity-80">Monthly boss</p>
        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">
          BOSS
        </span>
      </div>
      <p className="mt-1 text-lg font-bold">{title}</p>
      <p className="mt-1 text-sm opacity-90">{description}</p>
      <p className="mt-2 text-xs text-amber-200">
        {monthly.objectivesDone}/3 objectives · complete ALL three
      </p>
      <div className="mt-3 space-y-2">
        {bars.map((b) => {
          const pct = Math.min(100, Math.round((b.current / b.goal) * 100));
          const done = b.current >= b.goal;
          return (
            <div key={b.label}>
              <div className="flex justify-between text-xs">
                <span className={done ? "" : "animate-pulse"}>{b.label}</span>
                <span>
                  {b.current}/{b.goal}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className={`h-full rounded-full ${done ? "bg-amber-400" : "bg-teal-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-xs opacity-80">
        {progress}% complete · ends {endsAt} · +150 pts + Coastal Champion badge
      </p>
    </div>
  );
}

function QuestLane({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-3 py-2 text-sm ${
        done
          ? "bg-amber-300/30 ring-1 ring-amber-300"
          : active
            ? "bg-white/10"
            : "bg-white/5"
      }`}
    >
      {done ? "✓ " : "○ "}
      {label}
    </div>
  );
}
