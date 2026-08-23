"use client";

import { getLeaderboard } from "./data";
import { getGamificationState, markChallengeCompleteAwarded, computeLevel } from "./gamification";
import { getUser, saveUser } from "./user";
import type { UserProfile } from "./types";

const COUNTERS_KEY = "vapesafe-challenge-counters";

export interface ChallengeCounters {
  weeklyReports: number;
  weeklyDisposalItems: number;
  monthlyReports: number;
  monthlyCleanups: number;
  monthlyDisposalItems: number;
  weekStartedAt: string;
  monthStartedAt: string;
}

export interface ChallengeGoals {
  reports: number;
  disposalItems: number;
  cleanups?: number;
}

export interface ChallengeDefinition {
  title: string;
  description: string;
  endsAt: string;
  progress: number;
  goals: ChallengeGoals;
  mode: "or" | "and";
}

const DEFAULT_COUNTERS: ChallengeCounters = {
  weeklyReports: 0,
  weeklyDisposalItems: 0,
  monthlyReports: 0,
  monthlyCleanups: 0,
  monthlyDisposalItems: 0,
  weekStartedAt: new Date().toISOString(),
  monthStartedAt: new Date().toISOString(),
};

function endOfWeekSunday(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + daysUntilSunday);
  return d.toISOString().slice(0, 10);
}

function endOfMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 0);
  return d.toISOString().slice(0, 10);
}

export function getChallengeDefinitions(): {
  weekly: ChallengeDefinition;
  monthly: ChallengeDefinition;
} {
  const seed = getLeaderboard();
  return {
    weekly: {
      title: seed.weeklyChallenge.title,
      description:
        seed.weeklyChallenge.description ||
        "Report 3 hotspots OR dispose 2+ items at a smart bin this week.",
      endsAt: endOfWeekSunday(),
      progress: seed.weeklyChallenge.progress ?? 45,
      goals: seed.weeklyChallenge.goals ?? { reports: 3, disposalItems: 2 },
      mode: seed.weeklyChallenge.mode ?? "or",
    },
    monthly: {
      title: seed.monthlyChallenge.title,
      description:
        seed.monthlyChallenge.description ||
        "Boss challenge: 8 reports, 2 cleanups scheduled, and 15 items disposed this month.",
      endsAt: endOfMonth(),
      progress: seed.monthlyChallenge.progress ?? 62,
      goals: seed.monthlyChallenge.goals ?? {
        reports: 10,
        cleanups: 3,
        disposalItems: 20,
      },
      mode: seed.monthlyChallenge.mode ?? "and",
    },
  };
}

function resetCountersIfNeeded(counters: ChallengeCounters): ChallengeCounters {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const next = { ...counters };
  if (new Date(counters.weekStartedAt) < weekAgo) {
    next.weeklyReports = 0;
    next.weeklyDisposalItems = 0;
    next.weekStartedAt = now.toISOString();
  }
  if (new Date(counters.monthStartedAt) < monthAgo) {
    next.monthlyReports = 0;
    next.monthlyCleanups = 0;
    next.monthlyDisposalItems = 0;
    next.monthStartedAt = now.toISOString();
  }
  return next;
}

export function getChallengeCounters(): ChallengeCounters {
  if (typeof window === "undefined") return DEFAULT_COUNTERS;
  try {
    const raw = localStorage.getItem(COUNTERS_KEY);
    const parsed = raw ? { ...DEFAULT_COUNTERS, ...JSON.parse(raw) } : { ...DEFAULT_COUNTERS };
    return resetCountersIfNeeded(parsed);
  } catch {
    return { ...DEFAULT_COUNTERS };
  }
}

function saveChallengeCounters(counters: ChallengeCounters) {
  localStorage.setItem(COUNTERS_KEY, JSON.stringify(counters));
}

export function incrementChallengeCounters(
  patch: Partial<Pick<ChallengeCounters, "weeklyReports" | "weeklyDisposalItems" | "monthlyReports" | "monthlyCleanups" | "monthlyDisposalItems">>,
): ChallengeCounters {
  const counters = resetCountersIfNeeded(getChallengeCounters());
  const next = { ...counters };
  if (patch.weeklyReports)
    next.weeklyReports = counters.weeklyReports + patch.weeklyReports;
  if (patch.weeklyDisposalItems)
    next.weeklyDisposalItems = counters.weeklyDisposalItems + patch.weeklyDisposalItems;
  if (patch.monthlyReports)
    next.monthlyReports = counters.monthlyReports + patch.monthlyReports;
  if (patch.monthlyCleanups)
    next.monthlyCleanups = counters.monthlyCleanups + patch.monthlyCleanups;
  if (patch.monthlyDisposalItems)
    next.monthlyDisposalItems = counters.monthlyDisposalItems + patch.monthlyDisposalItems;
  saveChallengeCounters(next);
  return next;
}

export interface ChallengeProgress {
  weeklyPct: number;
  monthlyPct: number;
  weekly: {
    reports: number;
    disposalItems: number;
    reportsGoal: number;
    disposalGoal: number;
    reportsDone: boolean;
    disposalDone: boolean;
    complete: boolean;
  };
  monthly: {
    reports: number;
    cleanups: number;
    disposalItems: number;
    reportsGoal: number;
    cleanupsGoal: number;
    disposalGoal: number;
    objectivesDone: number;
    complete: boolean;
  };
}

export function getChallengeProgress(): ChallengeProgress {
  const defs = getChallengeDefinitions();
  const counters = getChallengeCounters();
  const seed = getLeaderboard();

  const wGoals = defs.weekly.goals;
  const mGoals = defs.monthly.goals;

  const weeklyReportsPct = Math.min(100, (counters.weeklyReports / wGoals.reports) * 100);
  const weeklyDisposalPct = Math.min(
    100,
    (counters.weeklyDisposalItems / wGoals.disposalItems) * 100,
  );
  const userWeeklyPct = Math.round(Math.max(weeklyReportsPct, weeklyDisposalPct));
  const weeklyPct = Math.max(seed.weeklyChallenge.progress ?? 45, userWeeklyPct);

  const monthlyReportsPct = Math.min(
    100,
    (counters.monthlyReports / (mGoals.reports ?? 10)) * 100,
  );
  const monthlyCleanupsPct = Math.min(
    100,
    (counters.monthlyCleanups / (mGoals.cleanups ?? 3)) * 100,
  );
  const monthlyDisposalPct = Math.min(
    100,
    (counters.monthlyDisposalItems / (mGoals.disposalItems ?? 20)) * 100,
  );
  const userMonthlyPct = Math.round(
    Math.min(monthlyReportsPct, monthlyCleanupsPct, monthlyDisposalPct),
  );
  const monthlyPct = Math.max(seed.monthlyChallenge.progress ?? 62, userMonthlyPct);

  const reportsDone = counters.weeklyReports >= wGoals.reports;
  const disposalDone = counters.weeklyDisposalItems >= wGoals.disposalItems;
  const weeklyComplete = reportsDone || disposalDone;

  const mReportsDone = counters.monthlyReports >= (mGoals.reports ?? 10);
  const mCleanupsDone = counters.monthlyCleanups >= (mGoals.cleanups ?? 3);
  const mDisposalDone = counters.monthlyDisposalItems >= (mGoals.disposalItems ?? 20);
  const objectivesDone = [mReportsDone, mCleanupsDone, mDisposalDone].filter(Boolean).length;
  const monthlyComplete = mReportsDone && mCleanupsDone && mDisposalDone;

  return {
    weeklyPct,
    monthlyPct,
    weekly: {
      reports: counters.weeklyReports,
      disposalItems: counters.weeklyDisposalItems,
      reportsGoal: wGoals.reports,
      disposalGoal: wGoals.disposalItems,
      reportsDone,
      disposalDone,
      complete: weeklyComplete,
    },
    monthly: {
      reports: counters.monthlyReports,
      cleanups: counters.monthlyCleanups,
      disposalItems: counters.monthlyDisposalItems,
      reportsGoal: mGoals.reports ?? 10,
      cleanupsGoal: mGoals.cleanups ?? 3,
      disposalGoal: mGoals.disposalItems ?? 20,
      objectivesDone,
      complete: monthlyComplete,
    },
  };
}

export function checkAndAwardChallengeCompletions(user: UserProfile): UserProfile {
  const progress = getChallengeProgress();
  const gState = getGamificationState();

  if (progress.weekly.complete && !gState.weeklyCompleteAwarded) {
    user.points += 50;
    markChallengeCompleteAwarded("weekly", 50);
  }
  // Monthly boss challenge is display-only (community goal) — no local +150 payout

  user.weeklyChallengeProgress = progress.weeklyPct;
  user.monthlyChallengeProgress = progress.monthlyPct;
  user.level = computeLevel(user.points);
  saveUser(user);
  return user;
}
