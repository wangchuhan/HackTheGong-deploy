import { Trophy, Users } from "lucide-react";
import { getLeaderboard } from "@/lib/data";

export default function LeaderboardPage() {
  const { individuals, schools, monthlyChallenge } = getLeaderboard();

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h1 className="text-xl font-bold text-teal-900">Leaderboard</h1>
        </div>
        <p className="text-sm text-teal-700/70">Wollongong schools & citizens competing to clean up</p>
      </header>

      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 ring-1 ring-amber-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
          Monthly challenge
        </p>
        <p className="mt-1 font-semibold text-amber-900">{monthlyChallenge.title}</p>
        <p className="text-sm text-amber-800/80">{monthlyChallenge.description}</p>
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${monthlyChallenge.progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-amber-700">
            {monthlyChallenge.progress}% · ends {new Date(monthlyChallenge.endsAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase text-teal-800/70">
          <Trophy className="h-4 w-4" /> Top citizens
        </h2>
        <ol className="space-y-2">
          {individuals.slice(0, 10).map((entry) => (
            <li
              key={entry.rank}
              className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm ring-1 ring-teal-100"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  entry.rank <= 3 ? "bg-amber-100 text-amber-800" : "bg-teal-100 text-teal-800"
                }`}
              >
                {entry.rank}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-teal-900">{entry.nickname}</p>
                {entry.school && (
                  <p className="text-xs text-teal-700/60">{entry.school}</p>
                )}
              </div>
              <p className="font-bold text-teal-800">{entry.points}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase text-teal-800/70">
          <Users className="h-4 w-4" /> School standings
        </h2>
        <ol className="space-y-2">
          {schools.map((school) => (
            <li
              key={school.rank}
              className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm ring-1 ring-teal-100"
            >
              <div>
                <p className="font-semibold text-teal-900">
                  #{school.rank} {school.name}
                </p>
                <p className="text-xs text-teal-700/60">{school.members} members</p>
              </div>
              <p className="font-bold text-teal-800">{school.points}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
