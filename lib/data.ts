import { trendsLastNDays } from "./analytics";
import type {
  CleanupScheduleRequest,
  DisposalPoint,
  EnergyStats,
  LeaderboardEntry,
  NewsItem,
  PickupSchedule,
  Report,
  Reward,
  SchoolEntry,
  SmartBin,
  SuburbEntry,
  SuburbZone,
  TrendPoint,
} from "./types";

import binsData from "@/data/bins.json";
import disposalPointsData from "@/data/disposal-points.json";
import energyStatsData from "@/data/energy-stats.json";
import leaderboardData from "@/data/leaderboard.json";
import newsData from "@/data/news.json";
import pickupScheduleData from "@/data/pickup-schedule.json";
import reportsData from "@/data/reports.json";
import rewardsData from "@/data/rewards.json";
import suburbZonesData from "@/data/suburb-zones.json";

export function getSeedReports(): Report[] {
  return reportsData as Report[];
}

export function getDisposalPoints(): DisposalPoint[] {
  return disposalPointsData as DisposalPoint[];
}

export function getBins(): SmartBin[] {
  return binsData as SmartBin[];
}

export function getSuburbZones(): SuburbZone[] {
  return suburbZonesData as SuburbZone[];
}

export function getNews(): NewsItem[] {
  return (newsData as NewsItem[]).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getLeaderboard(): {
  individuals: LeaderboardEntry[];
  schools: SchoolEntry[];
  suburbs: SuburbEntry[];
  monthlyChallenge: { title: string; description: string; endsAt: string; progress: number };
  weeklyChallenge: { title: string; description: string; endsAt: string; progress: number };
} {
  return leaderboardData as ReturnType<typeof getLeaderboard>;
}

export function getRewards(): Reward[] {
  return rewardsData as Reward[];
}

export function getEnergyStats(): EnergyStats {
  return energyStatsData as EnergyStats;
}

export function getTrends(): TrendPoint[] {
  return trendsLastNDays(getSeedReports(), 80);
}

export function getTrendsWithSession(sessionReports: Report[]): TrendPoint[] {
  return trendsLastNDays([...sessionReports, ...getSeedReports()], 30);
}

export function getAllReportsWithSession(sessionReports: Report[]): Report[] {
  return [...sessionReports, ...getSeedReports()];
}

export function getPickupSchedule(): PickupSchedule[] {
  return pickupScheduleData as PickupSchedule[];
}

export function getDisposalPointById(id: string): DisposalPoint | undefined {
  return getDisposalPoints().find((p) => p.id === id);
}

export function getBinByCode(code: string): SmartBin | undefined {
  const normalized = code.trim().toUpperCase();
  return getBins().find((b) => b.code === normalized || b.id === normalized);
}

export function getSuburbRank(suburbName: string): number | null {
  const suburbs = getLeaderboard().suburbs;
  const entry = suburbs.find((s) => s.name === suburbName);
  return entry?.rank ?? null;
}

export function getStatsSummary() {
  const reports = getSeedReports();
  const bins = getBins();
  const energy = getEnergyStats();
  return {
    reportsThisMonth: reports.filter((r) => r.createdAt.startsWith("2026-03")).length || 47,
    binsMonitored: bins.length,
    kgDiverted: Math.round(energy.batteryKg + energy.ewasteLitresDiverted),
    kwhSaved: energy.kwhSaved,
  };
}
