"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Star } from "lucide-react";
import { getUser, setNickname } from "@/lib/user";
import { BADGES } from "@/lib/types";
import type { UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setNameInput(u.nickname);
  }, []);

  if (!user) return null;

  function saveName() {
    setNickname(nameInput);
    setUser(getUser());
    setEditing(false);
  }

  return (
    <div className="space-y-6">
      <header className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-600 text-2xl font-bold text-white">
          {user.nickname.charAt(0).toUpperCase()}
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
        <p className="text-sm text-teal-700">Level {user.level}</p>
      </header>

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
                {!earned && (
                  <p className="text-xs opacity-70">Locked</p>
                )}
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
