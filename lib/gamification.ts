"use client";

import { getLeaderboard } from "./data";
import type { UserProfile } from "./types";

const GAMIFICATION_KEY = "vapesafe-gamification";

export type ActionType = "report" | "dispose" | "schedule";

/** Points required to advance one level */
export const POINTS_PER_LEVEL = 125;

export interface GamificationState {
  streakDays: number;
  lastActionDate: string | null;
  reportedToday: boolean;
  disposedToday: boolean;
  comboAwardedDate: string | null;
  morningBoostDate: string | null;
  weeklyCompleteAwarded: boolean;
  monthlyCompleteAwarded: boolean;
  lastLevel: number;
}

export interface BonusResult {
  bonuses: { label: string; points: number }[];
  totalBonus: number;
  levelUp?: { level: number; title: string };
  messages: string[];
}

const DEFAULT_GAMIFICATION: GamificationState = {
  streakDays: 0,
  lastActionDate: null,
  reportedToday: false,
  disposedToday: false,
  comboAwardedDate: null,
  morningBoostDate: null,
  weeklyCompleteAwarded: false,
  monthlyCompleteAwarded: false,
  lastLevel: 1,
};

export function computeLevel(points: number): number {
  return Math.floor(points / POINTS_PER_LEVEL) + 1;
}

export function getLevelTitle(level: number): string {
  if (level >= 10) return "Illawarra Legend";
  if (level >= 8) return "Coastal Cleaner";
  if (level >= 5) return "Hotspot Hero";
  if (level >= 3) return "Bin Boss";
  if (level >= 2) return "Litter Spotter";
  return "Pod Patrol";
}

export function xpToNextLevel(points: number): {
  current: number;
  needed: number;
  pct: number;
} {
  const level = computeLevel(points);
  const currentLevelFloor = (level - 1) * POINTS_PER_LEVEL;
  const current = points - currentLevelFloor;
  const needed = POINTS_PER_LEVEL;
  return { current, needed, pct: Math.round((current / needed) * 100) };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getGamificationState(): GamificationState {
  if (typeof window === "undefined") return DEFAULT_GAMIFICATION;
  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    return raw
      ? { ...DEFAULT_GAMIFICATION, ...JSON.parse(raw) }
      : { ...DEFAULT_GAMIFICATION };
  } catch {
    return { ...DEFAULT_GAMIFICATION };
  }
}

function saveGamificationState(state: GamificationState) {
  localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(state));
}

export function getRankNudge(userPoints: number): string | null {
  const individuals = getLeaderboard().individuals;
  const sorted = [...individuals].sort((a, b) => b.points - a.points);
  const beatable = sorted.find((e) => userPoints < e.points);
  if (!beatable) return null;
  const gap = beatable.points - userPoints;
  return `${gap} pts to pass ${beatable.nickname} (#${beatable.rank})`;
}

export function getSchoolRivalryNudge(): string | null {
  const schools = getLeaderboard().schools;
  if (schools.length < 2) return null;
  const leader = schools[0];
  const runner = schools[1];
  const gap = leader.points - runner.points;
  return `${leader.name} leads by ${gap} pts — rally ${runner.name}!`;
}

export function applyGamificationBonuses(
  user: UserProfile,
  action: ActionType,
  basePoints: number,
): BonusResult {
  const state = getGamificationState();
  const today = todayStr();
  const bonuses: { label: string; points: number }[] = [];
  const messages: string[] = [];

  if (state.lastActionDate !== today) {
    state.reportedToday = false;
    state.disposedToday = false;
  }

  if (state.morningBoostDate !== today) {
    bonuses.push({ label: "Morning boost", points: 3 });
    messages.push("Morning boost +3");
    state.morningBoostDate = today;
  }

  if (state.lastActionDate === yesterdayStr()) {
    state.streakDays += 1;
  } else if (state.lastActionDate !== today) {
    state.streakDays = 1;
  }
  state.lastActionDate = today;

  if (state.streakDays === 3) {
    bonuses.push({ label: "3-day streak", points: 10 });
    messages.push("3-day streak +10");
  } else if (state.streakDays === 7) {
    bonuses.push({ label: "7-day streak", points: 25 });
    messages.push("On fire! 7-day streak +25");
  }

  if (action === "report") state.reportedToday = true;
  if (action === "dispose") state.disposedToday = true;

  if (
    state.reportedToday &&
    state.disposedToday &&
    state.comboAwardedDate !== today
  ) {
    bonuses.push({ label: "Clean Sweep combo", points: 15 });
    messages.push("Clean Sweep combo! +15");
    state.comboAwardedDate = today;
  }

  const prevLevel = state.lastLevel;
  const totalBonus = bonuses.reduce((s, b) => s + b.points, 0);
  user.points += totalBonus;
  user.level = computeLevel(user.points);

  let levelUp: BonusResult["levelUp"];
  if (user.level > prevLevel) {
    levelUp = { level: user.level, title: getLevelTitle(user.level) };
    messages.push(`Level ${user.level} — ${levelUp.title}!`);
  }
  state.lastLevel = user.level;

  saveGamificationState(state);

  return { bonuses, totalBonus, levelUp, messages };
}

export function markChallengeCompleteAwarded(
  type: "weekly" | "monthly",
  bonusPoints: number,
): void {
  const state = getGamificationState();
  if (type === "weekly" && !state.weeklyCompleteAwarded) {
    state.weeklyCompleteAwarded = true;
    saveGamificationState(state);
    emitPointsToast(bonusPoints, "Weekly challenge complete!");
    emitCelebration("weekly");
  }
  if (type === "monthly" && !state.monthlyCompleteAwarded) {
    state.monthlyCompleteAwarded = true;
    saveGamificationState(state);
    emitPointsToast(bonusPoints, "Boss challenge complete!");
    emitCelebration("monthly");
  }
}

export function emitPointsToast(points: number, message?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("vapesafe-points", {
      detail: { points, message },
    }),
  );
}

export function emitCelebration(
  type: "weekly" | "monthly" | "badge",
  title?: string,
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("vapesafe-celebration", {
      detail: { type, title },
    }),
  );
}

export function hasStreakFlame(): boolean {
  return getGamificationState().streakDays >= 7;
}
