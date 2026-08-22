import type {
  DisposalPoint,
  EnergyStats,
  LeaderboardEntry,
  PickupSchedule,
  Report,
  Reward,
  SchoolEntry,
  SmartBin,
  TrendPoint,
} from "./types";

import binsData from "@/data/bins.json";
import disposalPointsData from "@/data/disposal-points.json";
import energyStatsData from "@/data/energy-stats.json";
import leaderboardData from "@/data/leaderboard.json";
import pickupScheduleData from "@/data/pickup-schedule.json";
import reportsData from "@/data/reports.json";
import rewardsData from "@/data/rewards.json";
import trendsData from "@/data/trends.json";

export function getSeedReports(): Report[] {
  return reportsData as Report[];
}

export function getDisposalPoints(): DisposalPoint[] {
  return disposalPointsData as DisposalPoint[];
}

export function getBins(): SmartBin[] {
  return binsData as SmartBin[];
}

export function getLeaderboard(): {
  individuals: LeaderboardEntry[];
  schools: SchoolEntry[];
  monthlyChallenge: { title: string; description: string; endsAt: string; progress: number };
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
  return trendsData as TrendPoint[];
}

export function getPickupSchedule(): PickupSchedule[] {
  return pickupScheduleData as PickupSchedule[];
}

export function getDisposalPointById(id: string): DisposalPoint | undefined {
  return getDisposalPoints().find((p) => p.id === id);
}

export function getBinByCode(code: string): SmartBin | undefined {
  return getBins().find((b) => b.code === code || b.id === code);
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
