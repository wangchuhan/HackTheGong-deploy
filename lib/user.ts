"use client";

import type { Report, UserProfile } from "./types";
import { BADGES } from "./types";

const USER_KEY = "vapesafe-user";
const REPORTS_KEY = "vapesafe-session-reports";

const DEFAULT_USER: UserProfile = {
  nickname: "EcoCitizen",
  points: 0,
  level: 1,
  badges: [],
  reportsSubmitted: 0,
};

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

export function addSessionReport(report: Report): UserProfile {
  const reports = getSessionReports();
  reports.unshift(report);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

  const user = getUser();
  user.points += report.pointsAwarded;
  user.reportsSubmitted += 1;
  user.level = Math.floor(user.points / 100) + 1;

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
    }
  }

  saveUser(user);
  return user;
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
