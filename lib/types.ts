export interface CleanupScheduleRequest {
  id: string;
  date: string;
  suburb: string;
  timeSlot?: "morning" | "afternoon";
  reportIds?: string[];
  bins?: string[];
  status: "requested" | "scheduled" | "completed" | "cancelled";
  notes?: string;
  createdAt?: string;
  pointsAwarded?: number;
}

export interface ArchivedCleanupSchedule extends CleanupScheduleRequest {
  archivedAt: string;
  archiveReason: "removed" | "completed" | "cancelled";
}

/** @deprecated Use CleanupScheduleRequest */
export type CleanupAppointment = CleanupScheduleRequest;

export interface Report {
  id: string;
  lat: number;
  lng: number;
  suburb: string;
  status: string;
  createdAt: string;
  pointsAwarded: number;
  photoUrl?: string;
  linkedBinCode?: string;
  linkedDisposalId?: string;
}

export interface DisposalPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  suburb: string;
  accepts: string[];
  hours: string;
  openNow: boolean;
}

export interface SmartBin {
  id: string;
  code: string;
  name: string;
  lat: number;
  lng: number;
  fillLevel: number;
  temperature: number;
  itemsCollected: number;
  lastReading: string;
  cameraImage?: string;
  aiFillEstimate?: number;
  aiConfidence?: number;
  aiLastScan?: string;
  aiItemsDetected?: number;
}

export interface SuburbZone {
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

export interface SuburbEntry {
  rank: number;
  name: string;
  points: number;
  members: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  type: "news" | "app" | "tip";
  date: string;
  sourceOrg?: string;
  homepageUrl?: string;
  url?: string;
}

export interface BinVisionResult {
  fillEstimate: number;
  confidence: number;
  itemsDetected: number;
  source: "mock" | "api";
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  points: number;
  school: string | null;
}

export interface SchoolEntry {
  rank: number;
  name: string;
  points: number;
  members: number;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  category: string;
  partner: string;
}

export interface EnergyStats {
  itemsCollected: number;
  batteryKg: number;
  kwhSaved: number;
  co2eKgAvoided: number;
  ewasteLitresDiverted: number;
  label: string;
  formula?: {
    batteryKgPerItem: number;
    landfillKwhPerKg: number;
    recyclingKwhPerKg: number;
    gridCo2ePerKwh: number;
  };
}

export interface TrendPoint {
  date: string;
  reports: number;
  collections: number;
}

export interface PickupSchedule {
  id: string;
  date: string;
  crew: string;
  bins: string[];
  estimatedKg: number;
  status: string;
}

export interface UserProfile {
  nickname: string;
  points: number;
  level: number;
  badges: string[];
  reportsSubmitted: number;
  suburb?: string;
  school?: string | null;
  disposalsLogged: number;
  cleanupsScheduled?: number;
  weeklyChallengeProgress?: number;
  monthlyChallengeProgress?: number;
}

export interface ChallengeGoals {
  reports: number;
  disposalItems: number;
  cleanups?: number;
}

export interface ChallengeSeed {
  title: string;
  description: string;
  endsAt: string;
  progress: number;
  goals?: ChallengeGoals;
  mode?: "or" | "and";
}

export const WOLLONGONG_CENTER = { lat: -34.4278, lng: 150.8931 };

export const BADGES = [
  { id: "first-report", name: "First Report", threshold: 1 },
  { id: "five-reports", name: "Hotspot Hero", threshold: 5 },
  { id: "verified", name: "Verified Cleaner", threshold: 75 },
  { id: "school-champ", name: "School Champion", threshold: 100 },
  { id: "cleanup-champion", name: "Cleanup Champion", threshold: 1 },
  { id: "coastal-champion", name: "Coastal Champion", threshold: 3 },
] as const;
