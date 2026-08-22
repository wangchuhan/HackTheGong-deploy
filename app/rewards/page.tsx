"use client";

import { useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { getRewards } from "@/lib/data";
import { getUser, redeemReward } from "@/lib/user";

export default function RewardsPage() {
  const rewards = getRewards();
  const [points, setPoints] = useState(() =>
    typeof window === "undefined" ? 0 : getUser().points,
  );
  const [message, setMessage] = useState<string>();

  function handleRedeem(cost: number, title: string) {
    const ok = redeemReward(cost);
    if (ok) {
      setPoints(getUser().points);
      setMessage(`Redeemed: ${title}! Show this screen at the partner.`);
    } else {
      setMessage(`Need ${cost - points} more points for this reward.`);
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-teal-600" />
            <h1 className="text-xl font-bold text-teal-900">Rewards</h1>
          </div>
          <p className="text-sm text-teal-700/70">Local partners across the Gong</p>
        </div>
        <div className="rounded-xl bg-teal-600 px-4 py-2 text-center text-white">
          <p className="text-2xl font-bold">{points}</p>
          <p className="text-xs text-teal-100">pts</p>
        </div>
      </header>

      {message && (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800 ring-1 ring-teal-200">
          {message}
        </p>
      )}

      <ul className="space-y-3">
        {rewards.map((reward) => {
          const canAfford = points >= reward.cost;
          return (
            <li
              key={reward.id}
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-teal-900">{reward.title}</p>
                  <p className="text-xs text-teal-700/60">
                    {reward.partner} · {reward.category}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-teal-100 px-2 py-1 text-xs font-bold text-teal-800">
                  {reward.cost} pts
                </span>
              </div>
              <button
                type="button"
                disabled={!canAfford}
                onClick={() => handleRedeem(reward.cost, reward.title)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 bg-teal-600 text-white hover:bg-teal-700 disabled:hover:bg-gray-100"
              >
                <Sparkles className="h-4 w-4" />
                {canAfford ? "Redeem" : "Not enough points"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
