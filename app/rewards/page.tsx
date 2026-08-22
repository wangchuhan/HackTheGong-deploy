"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Gift,
  Package,
  Sparkles,
  Store,
  Ticket,
} from "lucide-react";
import { getRewards } from "@/lib/data";
import { getUser, redeemReward } from "@/lib/user";
import type { UserProfile } from "@/lib/types";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  giftcard: <Gift className="h-4 w-4" />,
  cash: <Banknote className="h-4 w-4" />,
  local: <Store className="h-4 w-4" />,
  merch: <Package className="h-4 w-4" />,
  perk: <Sparkles className="h-4 w-4" />,
  voucher: <Ticket className="h-4 w-4" />,
  partner: <Store className="h-4 w-4" />,
};

const CATEGORIES = ["all", "giftcard", "cash", "local", "merch", "perk", "voucher"];

export default function RewardsPage() {
  const rewards = getRewards();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setUser(getUser());
  }, []);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? rewards
        : rewards.filter((r) => r.category === filter),
    [rewards, filter],
  );

  function handleRedeem(cost: number, title: string) {
    const ok = redeemReward(cost);
    if (ok) {
      setUser(getUser());
      setToast(`Demo: "${title}" redeemed — not a real voucher.`);
    } else {
      setToast("Not enough points for this reward.");
    }
    setTimeout(() => setToast(""), 4000);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-teal-950">Redeem Rewards</h1>
        <p className="mt-1 text-sm text-teal-800/70">
          Gift cards, cash credits, local discounts, merch, and perks
        </p>
        {user && (
          <p className="mt-2 text-sm font-medium text-teal-800">
            Your balance: {user.points} points
          </p>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              filter === c
                ? "bg-teal-600 text-white"
                : "bg-white text-teal-800 ring-1 ring-teal-100"
            }`}
          >
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      {toast && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {toast}
        </div>
      )}

      <ul className="space-y-3">
        {filtered.map((r) => (
          <li
            key={r.id}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-100"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <span className="mt-0.5 text-teal-600">
                  {CATEGORY_ICONS[r.category] ?? <Gift className="h-4 w-4" />}
                </span>
                <div>
                  <p className="font-semibold text-teal-950">{r.title}</p>
                  <p className="text-xs capitalize text-teal-600">{r.category}</p>
                  <p className="text-xs text-teal-700/70">{r.partner}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800">
                {r.cost} pts
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleRedeem(r.cost, r.title)}
              disabled={!user || user.points < r.cost}
              className="mt-3 w-full rounded-lg bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-40"
            >
              Redeem
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
