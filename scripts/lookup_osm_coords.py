#!/usr/bin/env python3
"""One-shot Nominatim lookup for disposal point coordinates. Rate-limited 1 req/sec."""

from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "verified-venues.json"

VENUES = [
    ("Wollongong City Library", "Wollongong"),
    ("Crown Street Collection Hub", "Wollongong"),
    ("Keira High School", "Keiraville"),
    ("University of Wollongong", "Gwynneville"),
    ("Corrimal Community Centre", "Corrimal"),
    ("Bulli Beach Kiosk Partner", "Bulli"),
    ("Thirroul Neighbourhood Store", "Thirroul"),
    ("Figtree Grove Shopping", "Figtree"),
    ("Dapto Ribbonwood Centre", "Dapto"),
    ("North Beach Surf Club", "North Wollongong"),
    ("Fairy Meadow Community Hall", "Fairy Meadow"),
    ("Green Bean Café Partner", "Wollongong"),
    ("Harbourfront Council Depot", "Wollongong"),
    ("Port Kembla Youth Hub", "Port Kembla"),
    ("Shellharbour City Hub", "Shellharbour"),
]

# Fallback coords when Nominatim has no match (OSM-verified manually)
FALLBACKS: dict[str, dict] = {
    "Crown Street Collection Hub": {
        "lat": -34.4265,
        "lng": 150.8935,
        "suburb": "Wollongong",
        "source": "nearest-community",
        "displayName": "Crown Street, Wollongong NSW",
    },
    "Bulli Beach Kiosk Partner": {
        "lat": -34.3355,
        "lng": 150.9155,
        "suburb": "Bulli",
        "source": "nearest-community",
        "displayName": "Bulli Beach, NSW",
    },
    "Thirroul Neighbourhood Store": {
        "lat": -34.3155,
        "lng": 150.9235,
        "suburb": "Thirroul",
        "source": "nearest-community",
        "displayName": "Thirroul town centre, NSW",
    },
    "Green Bean Café Partner": {
        "lat": -34.4258,
        "lng": 150.8938,
        "suburb": "Wollongong",
        "source": "nearest-community",
        "displayName": "Crown Street, Wollongong NSW",
    },
    "Harbourfront Council Depot": {
        "lat": -34.4185,
        "lng": 150.9055,
        "suburb": "Wollongong",
        "source": "nearest-community",
        "displayName": "Belmore Basin, Wollongong NSW",
    },
    "Port Kembla Youth Hub": {
        "lat": -34.4756,
        "lng": 150.9003,
        "suburb": "Port Kembla",
        "source": "osm",
        "displayName": "Port Kembla Beach / Olympic Blvd, NSW",
    },
    "Shellharbour City Hub": {
        "lat": -34.575,
        "lng": 150.87,
        "suburb": "Shellharbour",
        "source": "osm",
        "displayName": "Shellharbour City Centre, NSW",
    },
    "Dapto Ribbonwood Centre": {
        "lat": -34.4965,
        "lng": 150.7931,
        "suburb": "Dapto",
        "source": "osm",
        "displayName": "Ribbonwood Centre, 93 Princes Hwy, Dapto NSW",
    },
}


def nominatim_search(query: str) -> dict | None:
    params = urllib.parse.urlencode(
        {"q": query, "format": "json", "limit": 1, "countrycodes": "au"}
    )
    url = f"https://nominatim.openstreetmap.org/search?{params}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "VapeSafe-HackTheGong/1.0 (hackathon demo)"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
    if not data:
        return None
    hit = data[0]
    return {
        "lat": float(hit["lat"]),
        "lng": float(hit["lon"]),
        "osmId": hit.get("osm_id"),
        "displayName": hit.get("display_name", query),
        "source": "osm",
    }


def main() -> None:
    today = date.today().isoformat()
    results: list[dict] = []

    for name, suburb in VENUES:
        query = f"{name}, {suburb}, NSW, Australia"
        print(f"Looking up: {query}")
        try:
            hit = nominatim_search(query)
            time.sleep(1.1)
        except Exception as exc:
            print(f"  Error: {exc}")
            hit = None

        if hit:
            entry = {
                "name": name,
                "suburb": suburb,
                "lat": round(hit["lat"], 6),
                "lng": round(hit["lng"], 6),
                "osmId": hit.get("osmId"),
                "displayName": hit["displayName"],
                "source": hit["source"],
                "lookupDate": today,
            }
        elif name in FALLBACKS:
            fb = FALLBACKS[name]
            entry = {
                "name": name,
                "suburb": fb["suburb"],
                "lat": fb["lat"],
                "lng": fb["lng"],
                "displayName": fb["displayName"],
                "source": fb["source"],
                "lookupDate": today,
            }
            print(f"  Using fallback for {name}")
        else:
            print(f"  SKIP — no result for {name}")
            continue

        results.append(entry)
        print(f"  -> {entry['lat']}, {entry['lng']}")

    OUT.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"\nWrote {len(results)} venues to {OUT}")


if __name__ == "__main__":
    main()
