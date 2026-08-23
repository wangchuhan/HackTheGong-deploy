"use client";

import type { CleanupScheduleRequest, Report, UserProfile } from "./types";
import { BADGES } from "./types";
import {
  checkAndAwardChallengeCompletions,
  incrementChallengeCounters,
} from "./challenges";
import {
  applyGamificationBonuses,
  computeLevel,
  emitPointsToast,
} from "./gamification";
import { getSuburbNames, nearestSuburb } from "./geo";
import { getLeaderboard } from "./data";

const USER_KEY = "vapesafe-user";
const REPORTS_KEY = "vapesafe-session-reports";
const CLEANUP_KEY = "vapesafe-cleanup-schedule";
const DISPOSALS_KEY = "vapesafe-disposals";
const REPORT_LIMITS_KEY = "vapesafe-report-limits";
const DAILY_POINTS_KEY = "vapesafe-daily-points";

const MAX_PHOTO_REPORTS_PER_DAY = 5;
const MAX_BIN_LINKED_REPORTS_PER_DAY = 1;
const DAILY_POINTS_CAP = 120;
const DISPOSAL_COOLDOWN_MS = 30_000;
const BONUS_HEADROOM = 35;

interface DailyPointsState {
  date: string;
  earned: number;
  lastDisposalAt: Record<string, string>;
}

interface ReportLimits {
  date: string;
  photoReports: number;
  binLinkedReports: number;
  reportedBins: string[];
}

const DEFAULT_USER: UserProfile = {
  nickname: "EcoCitizen",
  points: 0,
  level: 1,
  badges: [],
  reportsSubmitted: 0,
  suburb: undefined,
  school: null,
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

export interface AddReportResult {
  success: boolean;
  error?: string;
  user: UserProfile;
  report?: Report;
}

function getReportLimits(): ReportLimits {
  const today = todayStr();
  if (typeof window === "undefined") {
    return { date: today, photoReports: 0, binLinkedReports: 0, reportedBins: [] };
  }
  try {
    const raw = localStorage.getItem(REPORT_LIMITS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || parsed.date !== today) {
      return { date: today, photoReports: 0, binLinkedReports: 0, reportedBins: [] };
    }
    return parsed as ReportLimits;
  } catch {
    return { date: today, photoReports: 0, binLinkedReports: 0, reportedBins: [] };
  }
}

function saveReportLimits(limits: ReportLimits) {
  localStorage.setItem(REPORT_LIMITS_KEY, JSON.stringify(limits));
}

function getDailyPoints(): DailyPointsState {
  const today = todayStr();
  if (typeof window === "undefined") {
    return { date: today, earned: 0, lastDisposalAt: {} };
  }
  try {
    const raw = localStorage.getItem(DAILY_POINTS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || parsed.date !== today) {
      return { date: today, earned: 0, lastDisposalAt: {} };
    }
    return parsed as DailyPointsState;
  } catch {
    return { date: today, earned: 0, lastDisposalAt: {} };
  }
}

function saveDailyPoints(state: DailyPointsState) {
  localStorage.setItem(DAILY_POINTS_KEY, JSON.stringify(state));
}

function dailyCapError(): string {
  return "Daily earning limit reached — great work today! Come back tomorrow.";
}

function checkDailyPointsCap(estimatedPoints: number): string | null {
  const state = getDailyPoints();
  if (state.earned + estimatedPoints > DAILY_POINTS_CAP) {
    return dailyCapError();
  }
  return null;
}

function recordDailyPoints(points: number, locationId?: string) {
  const state = getDailyPoints();
  state.earned += points;
  if (locationId) {
    state.lastDisposalAt[disposalLogKey(locationId)] = new Date().toISOString();
  }
  saveDailyPoints(state);
}

function checkDisposalCooldown(locationId: string): string | null {
  const state = getDailyPoints();
  const last = state.lastDisposalAt[disposalLogKey(locationId)];
  if (!last) return null;
  const elapsed = Date.now() - new Date(last).getTime();
  if (elapsed < DISPOSAL_COOLDOWN_MS) {
    const secs = Math.ceil((DISPOSAL_COOLDOWN_MS - elapsed) / 1000);
    return `Please wait ${secs}s before logging again at this location.`;
  }
  return null;
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

function disposalLogKey(id: string): string {
  return id.trim().toUpperCase();
}

export function getBinDisposalLog(binCode: string): BinDisposalLog | null {
  const logs = getDisposalLogs();
  const entry = logs[disposalLogKey(binCode)];
  if (!entry || entry.date !== todayStr()) return null;
  return entry;
}

export function getDisposalPointLog(disposalId: string): BinDisposalLog | null {
  return getBinDisposalLog(disposalId);
}

export function getItemsLoggedToday(locationId: string): number {
  const log = getBinDisposalLog(locationId);
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

export function addSessionReport(report: Report): AddReportResult {
  const hasPhoto = Boolean(report.photoUrl);
  const binCode = report.linkedBinCode?.toUpperCase();
  const hasLocationLink = Boolean(binCode || report.linkedDisposalId);
  const limits = getReportLimits();

  if (hasPhoto) {
    if (limits.photoReports >= MAX_PHOTO_REPORTS_PER_DAY) {
      return {
        success: false,
        error: "Daily photo report limit reached (5 per day).",
        user: getUser(),
      };
    }
  } else if (hasLocationLink) {
    if (limits.binLinkedReports >= MAX_BIN_LINKED_REPORTS_PER_DAY) {
      return {
        success: false,
        error: "Daily location-linked report limit reached (1 per day).",
        user: getUser(),
      };
    }
    if (binCode && limits.reportedBins.includes(binCode)) {
      return {
        success: false,
        error: `You already reported ${binCode} today.`,
        user: getUser(),
      };
    }
  } else {
    return {
      success: false,
      error: "Add a photo or link a bin / disposal code to submit.",
      user: getUser(),
    };
  }

  const basePoints = hasPhoto ? 10 : 5;
  const capError = checkDailyPointsCap(basePoints + BONUS_HEADROOM);
  if (capError) {
    return { success: false, error: capError, user: getUser() };
  }

  const fullReport: Report = {
    ...report,
    suburb: nearestSuburb(report.lat, report.lng),
    pointsAwarded: basePoints,
  };

  const reports = getSessionReports();
  reports.unshift(fullReport);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

  if (hasPhoto) {
    limits.photoReports += 1;
  } else if (hasLocationLink) {
    limits.binLinkedReports += 1;
    if (binCode) {
      limits.reportedBins.push(binCode);
    }
  }
  saveReportLimits(limits);

  let user = getUser();
  user.points += basePoints;
  user.reportsSubmitted += 1;
  user.level = computeLevel(user.points);

  const bonus = applyGamificationBonuses(user, "report", basePoints);
  recordDailyPoints(basePoints + bonus.totalBonus);
  emitPointsToast(
    basePoints + bonus.totalBonus,
    bonus.messages.join(" · "),
  );

  incrementChallengeCounters({ weeklyReports: 1, monthlyReports: 1 });
  user = awardBadges(user);
  saveUser(user);
  return {
    success: true,
    user: checkAndAwardChallengeCompletions(getUser()),
    report: fullReport,
  };
}

function logDisposalAtLocation(
  locationId: string,
  itemCount: number,
  locationLabel: string,
): LogDisposalResult {
  const key = disposalLogKey(locationId);
  const items = Math.max(1, Math.min(5, Math.floor(itemCount)));

  const cooldownError = checkDisposalCooldown(locationId);
  if (cooldownError) {
    return {
      success: false,
      error: cooldownError,
      basePoints: 0,
      totalPoints: 0,
      user: getUser(),
    };
  }

  const basePoints = items * 10;
  const capError = checkDailyPointsCap(basePoints + BONUS_HEADROOM);
  if (capError) {
    return {
      success: false,
      error: capError,
      basePoints: 0,
      totalPoints: 0,
      user: getUser(),
    };
  }

  const today = todayStr();
  const logs = getDisposalLogs();
  const existing = logs[key];
  const log: BinDisposalLog =
    existing?.date === today ? existing : { date: today, visits: [] };

  if (log.visits.length >= 2) {
    return {
      success: false,
      error: `Max 2 visits per ${locationLabel} per day. Try again tomorrow or use another location.`,
      basePoints: 0,
      totalPoints: 0,
      user: getUser(),
    };
  }

  log.visits.push({ items, points: basePoints, at: new Date().toISOString() });
  logs[key] = log;
  saveDisposalLogs(logs);

  let user = getUser();
  user.points += basePoints;
  user.disposalsLogged += items;
  user.level = computeLevel(user.points);

  const bonus = applyGamificationBonuses(user, "dispose", basePoints);
  recordDailyPoints(basePoints + bonus.totalBonus, locationId);
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

export function logDisposal(binCode: string, itemCount: number): LogDisposalResult {
  return logDisposalAtLocation(binCode, itemCount, "bin");
}

export function logDisposalAtPoint(
  disposalId: string,
  itemCount: number,
): LogDisposalResult {
  return logDisposalAtLocation(disposalId, itemCount, "disposal point");
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

export function setSchool(school: string | null) {
  const user = getUser();
  user.school = school || null;
  saveUser(user);
}

export function getSchoolNames(): string[] {
  return getLeaderboard().schools.map((s) => s.name);
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

  const capError = checkDailyPointsCap(15 + BONUS_HEADROOM);
  if (capError) {
    return { success: false, error: capError, user: getUser() };
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
  user.level = computeLevel(user.points);

  const bonus = applyGamificationBonuses(user, "schedule", 15);
  recordDailyPoints(15 + bonus.totalBonus);
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
