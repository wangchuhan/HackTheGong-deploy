"use client";

import type { CleanupScheduleRequest, Report, UserProfile } from "./types";
import { BADGES } from "./types";
import {
  checkAndAwardChallengeCompletions,
  incrementChallengeCounters,
} from "./challenges";
import {
  applyGamificationBonuses,
  emitPointsToast,
} from "./gamification";
import { getSuburbNames } from "./geo";

const USER_KEY = "vapesafe-user";
const REPORTS_KEY = "vapesafe-session-reports";
const CLEANUP_KEY = "vapesafe-cleanup-schedule";
const DISPOSALS_KEY = "vapesafe-disposals";

const DEFAULT_USER: UserProfile = {
  nickname: "EcoCitizen",
  points: 0,
  level: 1,
  badges: [],
  reportsSubmitted: 0,
  suburb: undefined,
  disposalsLogged: 0,
  cleanupsScheduled: 0,
  weeklyChallengeProgress: 0,
  monthlyChallengeProgress: 0,
};

export interface DisposalVisit {
  items: number;
  points: number;
  at: string;
}

export interface BinDisposalLog {
  date: string;
  visits: DisposalVisit[];
}

export interface LogDisposalResult {
  success: boolean;
  error?: string;
  basePoints: number;
  totalPoints: number;
  user: UserProfile;
}

export function getUser(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? { ...DEFAULT_USER, ...JSON.parse(raw) } : { ...DEFAULT_USER };
  } catch {
    return { ...DEFAULT_USER };
  }
}

export function saveUser(user: UserProfile) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSessionReports(): Report[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getDisposalLogs(): Record<string, BinDisposalLog> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DISPOSALS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDisposalLogs(logs: Record<string, BinDisposalLog>) {
  localStorage.setItem(DISPOSALS_KEY, JSON.stringify(logs));
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getBinDisposalLog(binCode: string): BinDisposalLog | null {
  const logs = getDisposalLogs();
  const entry = logs[binCode.toUpperCase()];
  if (!entry || entry.date !== todayStr()) return null;
  return entry;
}

export function getItemsLoggedToday(binCode: string): number {
  const log = getBinDisposalLog(binCode);
  if (!log) return 0;
  return log.visits.reduce((s, v) => s + v.items, 0);
}

function awardBadges(user: UserProfile): UserProfile {
  const cleanups = user.cleanupsScheduled ?? 0;
  for (const badge of BADGES) {
    if (!user.badges.includes(badge.id)) {
      if (badge.id === "first-report" && user.reportsSubmitted >= 1) {
        user.badges.push(badge.id);
      }
      if (badge.id === "five-reports" && user.reportsSubmitted >= 5) {
        user.badges.push(badge.id);
      }
      if (badge.id === "verified" && user.points >= 75) {
        user.badges.push(badge.id);
      }
      if (badge.id === "school-champ" && user.points >= 100) {
        user.badges.push(badge.id);
      }
      if (badge.id === "cleanup-champion" && cleanups >= 1) {
        user.badges.push(badge.id);
      }
      if (badge.id === "coastal-champion" && cleanups >= 3) {
        user.badges.push(badge.id);
      }
    }
  }
  return user;
}

export function addSessionReport(report: Report): UserProfile {
  const reports = getSessionReports();
  reports.unshift(report);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

  let user = getUser();
  user.points += report.pointsAwarded;
  user.reportsSubmitted += 1;
  user.level = Math.floor(user.points / 100) + 1;

  const bonus = applyGamificationBonuses(user, "report", report.pointsAwarded);
  emitPointsToast(report.pointsAwarded + bonus.totalBonus, bonus.messages.join(" · "));

  incrementChallengeCounters({ weeklyReports: 1, monthlyReports: 1 });
  user = awardBadges(user);
  saveUser(user);
  return checkAndAwardChallengeCompletions(getUser());
}

export function logDisposal(binCode: string, itemCount: number): LogDisposalResult {
  const code = binCode.toUpperCase();
  const items = Math.max(1, Math.min(5, Math.floor(itemCount)));
  const today = todayStr();
  const logs = getDisposalLogs();
  const existing = logs[code];
  const log: BinDisposalLog =
    existing?.date === today ? existing : { date: today, visits: [] };

  if (log.visits.length >= 2) {
    return {
      success: false,
      error: "Max 2 visits per bin per day. Try again tomorrow or use another bin.",
      basePoints: 0,
      totalPoints: 0,
      user: getUser(),
    };
  }

  const basePoints = items * 10;
  log.visits.push({ items, points: basePoints, at: new Date().toISOString() });
  logs[code] = log;
  saveDisposalLogs(logs);

  let user = getUser();
  user.points += basePoints;
  user.disposalsLogged += items;
  user.level = Math.floor(user.points / 100) + 1;

  const bonus = applyGamificationBonuses(user, "dispose", basePoints);
  emitPointsToast(basePoints + bonus.totalBonus, `${items} vapes · ${bonus.messages.join(" · ")}`);

  incrementChallengeCounters({
    weeklyDisposalItems: items,
    monthlyDisposalItems: items,
  });

  user = awardBadges(user);
  saveUser(user);
  const finalUser = checkAndAwardChallengeCompletions(getUser());

  return {
    success: true,
    basePoints,
    totalPoints: basePoints + bonus.totalBonus,
    user: finalUser,
  };
}

export function redeemReward(cost: number): boolean {
  const user = getUser();
  if (user.points < cost) return false;
  user.points -= cost;
  saveUser(user);
  return true;
}

export function setNickname(nickname: string) {
  const user = getUser();
  user.nickname = nickname.trim() || "EcoCitizen";
  saveUser(user);
}

export function setSuburb(suburb: string) {
  const user = getUser();
  user.suburb = suburb;
  saveUser(user);
}

export const SUBURBS = getSuburbNames();

export function getCleanupSchedules(): CleanupScheduleRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CLEANUP_KEY);
    const schedules: CleanupScheduleRequest[] = raw ? JSON.parse(raw) : [];
    return schedules.map((s) => ({
      ...s,
      timeSlot: s.timeSlot ?? "morning",
      createdAt: s.createdAt ?? s.date,
      status: s.status ?? "requested",
    }));
  } catch {
    return [];
  }
}

export function addCleanupSchedule(entry: CleanupScheduleRequest) {
  const schedules = getCleanupSchedules();
  schedules.unshift(entry);
  localStorage.setItem(CLEANUP_KEY, JSON.stringify(schedules));
}

export interface ScheduleCleanupResult {
  success: boolean;
  error?: string;
  user: UserProfile;
  appointment?: CleanupScheduleRequest;
}

export function scheduleCleanup(
  entry: Omit<CleanupScheduleRequest, "id" | "status"> & {
    id?: string;
    status?: CleanupScheduleRequest["status"];
  },
): ScheduleCleanupResult {
  const timeSlot = entry.timeSlot ?? "morning";
  const schedules = getCleanupSchedules();
  const duplicate = schedules.find(
    (s) =>
      s.suburb === entry.suburb &&
      s.date === entry.date &&
      (s.timeSlot ?? "morning") === timeSlot &&
      s.status !== "cancelled",
  );

  if (duplicate) {
    return {
      success: false,
      error: "You already have a cleanup scheduled for this suburb, date, and time slot.",
      user: getUser(),
      appointment: duplicate,
    };
  }

  const full: CleanupScheduleRequest = {
    id: entry.id ?? `APT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    status: entry.status ?? "requested",
    date: entry.date,
    timeSlot,
    suburb: entry.suburb,
    reportIds: entry.reportIds,
    bins: entry.bins,
    notes: entry.notes,
    createdAt: new Date().toISOString(),
    pointsAwarded: 15,
  };
  addCleanupSchedule(full);

  let user = getUser();
  user.points += 15;
  user.cleanupsScheduled = (user.cleanupsScheduled ?? 0) + 1;
  user.level = Math.floor(user.points / 100) + 1;

  const bonus = applyGamificationBonuses(user, "schedule", 15);
  emitPointsToast(15 + bonus.totalBonus, bonus.messages.join(" · "));

  incrementChallengeCounters({ monthlyCleanups: 1 });
  user = awardBadges(user);
  saveUser(user);

  return {
    success: true,
    user: checkAndAwardChallengeCompletions(getUser()),
    appointment: full,
  };
}

export function updateCleanupSchedule(
  id: string,
  patch: Partial<CleanupScheduleRequest>,
) {
  const schedules = getCleanupSchedules().map((s) =>
    s.id === id ? { ...s, ...patch } : s,
  );
  localStorage.setItem(CLEANUP_KEY, JSON.stringify(schedules));
}
