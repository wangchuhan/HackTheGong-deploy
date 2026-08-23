"use client";

import { getLevelTitle, xpToNextLevel } from "@/lib/gamification";

interface LevelBadgeProps {
  level: number;
  points: number;
  showBar?: boolean;
}

export default function LevelBadge({ level, points, showBar = true }: LevelBadgeProps) {
  const title = getLevelTitle(level);
  const xp = xpToNextLevel(points);

  return (
    <div className="text-center">
      <p className="text-sm text-teal-700">
        Level {level} · <span className="font-semibold text-teal-900">{title}</span>
      </p>
      {showBar && (
        <div className="mx-auto mt-2 h-2 max-w-xs overflow-hidden rounded-full bg-teal-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-500"
            style={{ width: `${xp.pct}%` }}
          />
        </div>
      )}
      {showBar && (
        <p className="mt-1 text-xs text-teal-600">
          {xp.current}/{xp.needed} XP to next level
        </p>
      )}
    </div>
  );
}
