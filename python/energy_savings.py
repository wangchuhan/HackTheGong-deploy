#!/usr/bin/env python3
"""
Guestimate energy and emissions impact from vape waste collections.

Formula (demo estimates — documented for judges):
  battery_kg = items_collected * 0.007  (avg 7g Li-ion per unit)
  kwh_saved = battery_kg * (landfill_kwh_per_kg - recycling_kwh_per_kg)
  co2e_kg = kwh_saved * 0.82  (AU grid factor proxy)
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

BATTERY_KG_PER_ITEM = 0.007
LANDFILL_KWH_PER_KG = 2.5
RECYCLING_KWH_PER_KG = 0.8
GRID_CO2E_PER_KWH = 0.82
ML_EWASTE_PER_ITEM = 12.0


def compute_energy_stats(bins: list[dict], reports: list[dict] | None = None) -> dict:
    items_from_bins = sum(b.get("itemsCollected", 0) for b in bins)
    verified_reports = len([r for r in (reports or []) if r.get("status") in ("verified", "collected")])
    items_collected = items_from_bins + verified_reports

    battery_kg = items_collected * BATTERY_KG_PER_ITEM
    kwh_saved = battery_kg * (LANDFILL_KWH_PER_KG - RECYCLING_KWH_PER_KG)
    co2e_kg = kwh_saved * GRID_CO2E_PER_KWH
    ewaste_ml = items_collected * ML_EWASTE_PER_ITEM

    return {
        "itemsCollected": items_collected,
        "batteryKg": round(battery_kg, 2),
        "kwhSaved": round(kwh_saved, 1),
        "co2eKgAvoided": round(co2e_kg, 1),
        "ewasteLitresDiverted": round(ewaste_ml / 1000, 2),
        "label": "Estimated impact (demo model)",
        "formula": {
            "batteryKgPerItem": BATTERY_KG_PER_ITEM,
            "landfillKwhPerKg": LANDFILL_KWH_PER_KG,
            "recyclingKwhPerKg": RECYCLING_KWH_PER_KG,
            "gridCo2ePerKwh": GRID_CO2E_PER_KWH,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Compute VapeSafe energy savings stats")
    parser.add_argument("--bins", default="data/bins.json")
    parser.add_argument("--reports", default="data/reports.json")
    parser.add_argument("--output", default="data/energy-stats.json")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    bins_path = root / args.bins
    reports_path = root / args.reports
    output_path = root / args.output

    bins = json.loads(bins_path.read_text(encoding="utf-8"))
    reports = json.loads(reports_path.read_text(encoding="utf-8")) if reports_path.exists() else []

    stats = compute_energy_stats(bins, reports)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(stats, indent=2), encoding="utf-8")
    print(f"Wrote {output_path}")
    print(f"  kWh saved: {stats['kwhSaved']}")
    print(f"  CO2e avoided: {stats['co2eKgAvoided']} kg")


if __name__ == "__main__":
    main()
