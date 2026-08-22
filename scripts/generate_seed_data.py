#!/usr/bin/env python3
"""Generate junk seed data for VapeSafe hackathon demo (Wollongong / Illawarra)."""

from __future__ import annotations

import json
import random
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"

SUBURB_COORDS: dict[str, dict] = {
    "Wollongong": {"lat": -34.4278, "lng": 150.8931, "radiusKm": 1.5},
    "North Wollongong": {"lat": -34.412, "lng": 150.894, "radiusKm": 1.2},
    "Keiraville": {"lat": -34.404, "lng": 150.877, "radiusKm": 1.2},
    "Gwynneville": {"lat": -34.417, "lng": 150.878, "radiusKm": 1.2},
    "Fairy Meadow": {"lat": -34.396, "lng": 150.893, "radiusKm": 1.4},
    "Corrimal": {"lat": -34.372, "lng": 150.899, "radiusKm": 1.3},
    "Bulli": {"lat": -34.334, "lng": 150.914, "radiusKm": 1.2},
    "Thirroul": {"lat": -34.316, "lng": 150.923, "radiusKm": 1.2},
    "Figtree": {"lat": -34.435, "lng": 150.856, "radiusKm": 1.3},
    "Dapto": {"lat": -34.493, "lng": 150.792, "radiusKm": 1.5},
    "Port Kembla": {"lat": -34.4805, "lng": 150.7615, "radiusKm": 1.2},
    "Shellharbour": {"lat": -34.575, "lng": 150.87, "radiusKm": 1.3},
}

VERIFIED_VENUES_PATH = DATA_DIR / "verified-venues.json"

SUBURBS = list(SUBURB_COORDS.keys())
ACCEPTS = ["disposables", "pods", "batteries", "all"]

# ~300m spread in degrees at Illawarra latitude
JITTER_DEG = 0.003


def jitter_around(lat: float, lng: float) -> tuple[float, float]:
    return (
        lat + random.uniform(-JITTER_DEG, JITTER_DEG),
        lng + random.uniform(-JITTER_DEG, JITTER_DEG),
    )


def coords_for_suburb(suburb: str) -> tuple[float, float]:
    c = SUBURB_COORDS.get(suburb, SUBURB_COORDS["Wollongong"])
    return c["lat"], c["lng"]


def generate_reports(count: int = 220) -> list[dict]:
    reports = []
    base = datetime(2026, 1, 1)
    for i in range(count):
        suburb = random.choice(SUBURBS)
        lat, lng = coords_for_suburb(suburb)
        lat, lng = jitter_around(lat, lng)
        created = base + timedelta(hours=random.randint(0, 2000))
        reports.append(
            {
                "id": f"VS-2026-{i + 1:04d}",
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "suburb": suburb,
                "status": random.choice(["pending", "verified", "verified", "collected"]),
                "createdAt": created.isoformat(),
                "pointsAwarded": random.choice([10, 10, 25]),
            }
        )
    return reports


def load_verified_venues() -> dict[str, dict]:
    if VERIFIED_VENUES_PATH.exists():
        venues = json.loads(VERIFIED_VENUES_PATH.read_text(encoding="utf-8"))
        return {v["name"]: v for v in venues}
    return {}


def generate_disposal_points() -> list[dict]:
    verified = load_verified_venues()
    names = [
        ("Wollongong City Library", "Wollongong", ["disposables", "pods", "batteries"]),
        ("Crown Street Collection Hub", "Wollongong", ["all"]),
        ("Keira High School", "Keiraville", ["disposables", "pods"]),
        ("University of Wollongong", "Gwynneville", ["all"]),
        ("Corrimal Community Centre", "Corrimal", ["disposables", "batteries"]),
        ("Bulli Beach Kiosk Partner", "Bulli", ["disposables"]),
        ("Thirroul Neighbourhood Store", "Thirroul", ["pods", "batteries"]),
        ("Figtree Grove Shopping", "Figtree", ["all"]),
        ("Dapto Ribbonwood Centre", "Dapto", ["disposables", "pods"]),
        ("North Beach Surf Club", "North Wollongong", ["disposables"]),
        ("Fairy Meadow Community Hall", "Fairy Meadow", ["all"]),
        ("Green Bean Café Partner", "Wollongong", ["disposables", "pods"]),
        ("Harbourfront Council Depot", "Wollongong", ["batteries", "all"]),
        ("Port Kembla Youth Hub", "Port Kembla", ["disposables"]),
        ("Shellharbour City Hub", "Shellharbour", ["all"]),
    ]
    points = []
    for idx, (name, suburb, accepts) in enumerate(names, start=1):
        if name in verified:
            v = verified[name]
            lat, lng = v["lat"], v["lng"]
            suburb = v.get("suburb", suburb)
        else:
            lat, lng = coords_for_suburb(suburb)
            lat, lng = jitter_around(lat, lng)
        points.append(
            {
                "id": f"DISP-WLG-{idx:02d}",
                "name": name,
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "suburb": suburb,
                "accepts": accepts,
                "hours": "Mon–Fri 9am–5pm" if idx % 3 else "24/7",
                "openNow": idx % 4 != 0,
            }
        )
    return points


def generate_bins() -> list[dict]:
    bins = []
    suburb_list = SUBURBS.copy()
    random.shuffle(suburb_list)
    for i in range(1, 9):
        suburb = suburb_list[(i - 1) % len(suburb_list)]
        lat, lng = coords_for_suburb(suburb)
        lat, lng = jitter_around(lat, lng)
        items = random.randint(80, 450)
        fill = random.randint(35, 95)
        bins.append(
            {
                "id": f"BIN-{i:03d}",
                "code": f"BIN-{i:03d}",
                "name": f"Smart Bin {i} — {suburb}",
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "fillLevel": fill,
                "temperature": round(random.uniform(18.0, 32.0), 1),
                "itemsCollected": items,
                "lastReading": (datetime.now() - timedelta(minutes=random.randint(1, 45))).isoformat(),
                "cameraImage": f"/bins/bin-{i:03d}.svg",
                "aiFillEstimate": fill,
                "aiConfidence": round(random.uniform(0.82, 0.97), 2),
                "aiLastScan": datetime.now().isoformat(),
                "aiItemsDetected": random.randint(15, 80),
            }
        )
    return bins


def generate_suburb_zones() -> list[dict]:
    return [
        {
            "name": name,
            "lat": coords["lat"],
            "lng": coords["lng"],
            "radiusKm": coords["radiusKm"],
        }
        for name, coords in SUBURB_COORDS.items()
    ]


def generate_trends_from_reports(reports: list[dict]) -> list[dict]:
    by_date: dict[str, dict] = defaultdict(lambda: {"reports": 0, "collections": 0})
    for r in reports:
        date = r["createdAt"][:10]
        by_date[date]["reports"] += 1
        if r["status"] in ("verified", "collected"):
            by_date[date]["collections"] += 1
    return [
        {"date": date, **counts}
        for date, counts in sorted(by_date.items())
    ]


def generate_news() -> list[dict]:
    return [
        {
            "id": "n1",
            "title": "Wollongong Council expands e-waste collection",
            "summary": "New smart bins rolling out across the CBD and beach strip.",
            "type": "news",
            "date": "2026-03-18",
            "sourceOrg": "Wollongong City Council",
            "homepageUrl": "https://www.wollongong.nsw.gov.au/",
        },
        {
            "id": "n2",
            "title": "EPA NSW: Safe disposal of vape batteries",
            "summary": "Never put lithium batteries in household bins — use designated points.",
            "type": "news",
            "date": "2026-03-15",
            "sourceOrg": "EPA NSW",
            "homepageUrl": "https://www.epa.nsw.gov.au/",
        },
        {
            "id": "n3",
            "title": "Fairy Meadow leads suburb challenge",
            "summary": "Your suburb is #1 this week with 420 points. Keep it up!",
            "type": "app",
            "date": "2026-03-20",
        },
        {
            "id": "n4",
            "title": "Bin BIN-003 emptied in Corrimal",
            "summary": "Collection crew completed pickup — 18 kg diverted from landfill.",
            "type": "app",
            "date": "2026-03-19",
        },
        {
            "id": "n5",
            "title": "Weekly challenge ends Sunday",
            "summary": "Schedule a cleanup or report 3 items near the beach to earn the Coastal Champion badge.",
            "type": "app",
            "date": "2026-03-17",
        },
        {
            "id": "n6",
            "title": "NSW Government environment initiatives",
            "summary": "State-wide programs supporting community litter reduction.",
            "type": "news",
            "date": "2026-03-10",
            "sourceOrg": "NSW Government",
            "homepageUrl": "https://www.nsw.gov.au/",
        },
        {
            "id": "n7",
            "title": "Bulli rises to #2 in suburb rankings",
            "summary": "Close behind Fairy Meadow — 38 points to take the lead.",
            "type": "app",
            "date": "2026-03-21",
        },
        {
            "id": "n8",
            "title": "How to report vape litter with VapeSafe",
            "summary": "Snap a photo, enable GPS, and earn points for verified reports.",
            "type": "tip",
            "date": "2026-03-12",
        },
        {
            "id": "n9",
            "title": "Schedule a community cleanup",
            "summary": "Pick a date and suburb — earn points and the Cleanup Champion badge.",
            "type": "app",
            "date": "2026-03-22",
        },
    ]


def generate_leaderboard() -> dict:
    individuals = [
        {"rank": i, "nickname": name, "points": pts, "school": school}
        for i, (name, pts, school) in enumerate(
            [
                ("EcoElla", 1240, "Keira High"),
                ("VapeHunter", 1180, "Wollongong HS"),
                ("GreenGong", 1050, "Corrimal High"),
                ("LitterLegend", 980, None),
                ("CoastalClean", 920, "Bulli High"),
                ("PodPatrol", 870, "Keira High"),
                ("BinBoss", 810, "Figtree High"),
                ("RecycleRex", 760, None),
                ("SurfSaver", 720, "Thirroul High"),
                ("CleanCrew22", 680, "Wollongong HS"),
            ],
            start=1,
        )
    ]
    schools = [
        {"rank": 1, "name": "Keira High", "points": 3420, "members": 48},
        {"rank": 2, "name": "Wollongong HS", "points": 3180, "members": 52},
        {"rank": 3, "name": "Corrimal High", "points": 2890, "members": 41},
        {"rank": 4, "name": "Bulli High", "points": 2540, "members": 36},
        {"rank": 5, "name": "Figtree High", "points": 2210, "members": 33},
    ]
    suburbs_lb = [
        {"rank": 1, "name": "Fairy Meadow", "points": 4200, "members": 186},
        {"rank": 2, "name": "Bulli", "points": 3890, "members": 142},
        {"rank": 3, "name": "Wollongong", "points": 3650, "members": 210},
        {"rank": 4, "name": "Corrimal", "points": 2980, "members": 98},
        {"rank": 5, "name": "Thirroul", "points": 2540, "members": 76},
        {"rank": 6, "name": "Figtree", "points": 2210, "members": 64},
        {"rank": 7, "name": "Dapto", "points": 1980, "members": 55},
        {"rank": 8, "name": "Keiraville", "points": 1760, "members": 48},
    ]
    return {
        "individuals": individuals,
        "schools": schools,
        "suburbs": suburbs_lb,
        "monthlyChallenge": {
            "title": "March Clean Coast",
            "description": "Report 5 hotspots near the beach strip to unlock the Coastal Champion badge.",
            "endsAt": "2026-03-31",
            "progress": 62,
        },
        "weeklyChallenge": {
            "title": "Beach Strip Blitz",
            "description": "Report 3 items within 500m of the coast this week.",
            "endsAt": "2026-03-23",
            "progress": 45,
        },
    }


def generate_rewards() -> list[dict]:
    return [
        {"id": "r1", "title": "Green Bean Café — 15% off", "cost": 200, "category": "local", "partner": "Green Bean Café"},
        {"id": "r2", "title": "$10 Coles/Woolworths Gift Card", "cost": 400, "category": "giftcard", "partner": "Retail Partners"},
        {"id": "r3", "title": "$25 Local Café Gift Card", "cost": 600, "category": "giftcard", "partner": "Illawarra Cafés"},
        {"id": "r4", "title": "$5 PayID Credit", "cost": 250, "category": "cash", "partner": "VapeSafe"},
        {"id": "r5", "title": "Council Rebate Voucher — $15", "cost": 500, "category": "cash", "partner": "Wollongong Council"},
        {"id": "r6", "title": "Aqua Park Entry Voucher", "cost": 500, "category": "voucher", "partner": "Wollongong Aqua Park"},
        {"id": "r7", "title": "Surf Shop Partner Offer", "cost": 350, "category": "partner", "partner": "South Coast Surf"},
        {"id": "r8", "title": "VapeSafe Merch Tote", "cost": 150, "category": "merch", "partner": "VapeSafe"},
        {"id": "r9", "title": "Sticker Pack + Badge", "cost": 80, "category": "merch", "partner": "VapeSafe"},
        {"id": "r10", "title": "Suburb Challenge Boost", "cost": 100, "category": "perk", "partner": "Council"},
        {"id": "r11", "title": "Double Points Weekend", "cost": 200, "category": "perk", "partner": "VapeSafe"},
        {"id": "r12", "title": "Free Pool Pass — Corrimal", "cost": 400, "category": "voucher", "partner": "Corrimal Pool"},
    ]


def generate_pickup_schedule(bins: list[dict]) -> list[dict]:
    near_full = sorted(bins, key=lambda b: b["fillLevel"], reverse=True)[:3]
    return [
        {
            "id": "PU-001",
            "date": "2026-03-22",
            "crew": "Team Alpha",
            "bins": [b["code"] for b in near_full],
            "estimatedKg": round(sum(b["itemsCollected"] * 0.012 for b in near_full), 1),
            "status": "scheduled",
        },
        {
            "id": "PU-002",
            "date": "2026-03-23",
            "crew": "Team Beta",
            "bins": ["BIN-002", "BIN-005"],
            "estimatedKg": 18.4,
            "status": "scheduled",
        },
    ]


def main() -> None:
    random.seed(42)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    reports = generate_reports()
    disposal_points = generate_disposal_points()
    bins = generate_bins()
    leaderboard = generate_leaderboard()
    rewards = generate_rewards()
    trends = generate_trends_from_reports(reports)
    pickup = generate_pickup_schedule(bins)
    suburb_zones = generate_suburb_zones()
    news = generate_news()

    # Write canonical suburb coordinates for app
    suburb_coords = [
        {"name": name, **coords} for name, coords in SUBURB_COORDS.items()
    ]

    files = {
        "reports.json": reports,
        "disposal-points.json": disposal_points,
        "bins.json": bins,
        "leaderboard.json": leaderboard,
        "rewards.json": rewards,
        "trends.json": trends,
        "pickup-schedule.json": pickup,
        "suburb-zones.json": suburb_zones,
        "suburb-coordinates.json": suburb_coords,
        "news.json": news,
    }

    for name, payload in files.items():
        path = DATA_DIR / name
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(f"Wrote {path} ({len(payload) if isinstance(payload, list) else 'object'})")

    print("Done. Run: python python/energy_savings.py")


if __name__ == "__main__":
    main()
