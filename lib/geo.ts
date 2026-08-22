import suburbCoordinates from "@/data/suburb-coordinates.json";

export interface SuburbCentroid {
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

const EARTH_RADIUS_KM = 6371;
const CENTROIDS = suburbCoordinates as SuburbCentroid[];

export function getSuburbCentroids(): SuburbCentroid[] {
  return CENTROIDS;
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** ~300m default spread in degrees at Illawarra latitude */
export function jitterAround(
  lat: number,
  lng: number,
  spreadKm = 0.3,
): { lat: number; lng: number } {
  const latOffset = (spreadKm / EARTH_RADIUS_KM) * (180 / Math.PI);
  const lngOffset =
    (spreadKm / (EARTH_RADIUS_KM * Math.cos((lat * Math.PI) / 180))) *
    (180 / Math.PI);
  return {
    lat: lat + (Math.random() - 0.5) * 2 * latOffset,
    lng: lng + (Math.random() - 0.5) * 2 * lngOffset,
  };
}

export function isOnLandIllawarra(lat: number, lng: number): boolean {
  if (lat < -34.58 || lat > -34.28) return false;
  if (lng < 150.75 || lng > 150.94) return false;
  if (lng > 150.93 && lat < -34.32) return false;
  return true;
}

export function clampToIllawarra(lat: number, lng: number): { lat: number; lng: number } {
  const clampedLat = Math.min(-34.28, Math.max(-34.58, lat));
  const clampedLng = Math.min(150.93, Math.max(150.75, lng));
  if (!isOnLandIllawarra(clampedLat, clampedLng)) {
    const cbd = CENTROIDS.find((c) => c.name === "Wollongong")!;
    return { lat: cbd.lat, lng: cbd.lng };
  }
  return { lat: clampedLat, lng: clampedLng };
}

export function nearestSuburb(lat: number, lng: number): string {
  let best = CENTROIDS[0];
  let bestDist = Infinity;
  for (const c of CENTROIDS) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best.name;
}

export function getCentroidForSuburb(name: string): SuburbCentroid | undefined {
  return CENTROIDS.find((c) => c.name === name);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

const ROAD_FACTOR = 1.35;
const AVG_SPEED_KMH = 40;

export function estimateDriveMinutes(km: number): number {
  const roadKm = km * ROAD_FACTOR;
  return Math.max(1, Math.round((roadKm / AVG_SPEED_KMH) * 60));
}

export function formatTravelTime(km: number): string {
  const mins = estimateDriveMinutes(km);
  return `${formatDistance(km)} · ~${mins} min drive`;
}

export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function generateReportId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `VS-2026-${n}`;
}

/** Next weekday from today as YYYY-MM-DD */
export function nextWeekdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().slice(0, 10);
}
