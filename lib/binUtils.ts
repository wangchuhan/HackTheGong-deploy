export type FillState = "empty" | "ok" | "nearly_full" | "full";

export function getFillState(fillLevel: number): FillState {
  if (fillLevel <= 25) return "empty";
  if (fillLevel <= 74) return "ok";
  if (fillLevel <= 89) return "nearly_full";
  return "full";
}

export function fillStateLabel(state: FillState): string {
  switch (state) {
    case "empty":
      return "Room for more";
    case "ok":
      return "Accepting items";
    case "nearly_full":
      return "Nearly full";
    case "full":
      return "Full — pickup scheduled";
  }
}

export function fillStateColor(state: FillState): string {
  switch (state) {
    case "empty":
      return "#22c55e";
    case "ok":
      return "#0d9488";
    case "nearly_full":
      return "#f59e0b";
    case "full":
      return "#dc2626";
  }
}

/** Interpolate green (clean) → red (dirty) by normalized count 0–1 */
export function suburbHeatColor(normalized: number): string {
  const r = Math.round(34 + normalized * (220 - 34));
  const g = Math.round(197 - normalized * (197 - 38));
  const b = Math.round(94 - normalized * (94 - 38));
  return `rgb(${r},${g},${b})`;
}
