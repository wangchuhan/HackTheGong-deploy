#!/usr/bin/env python3
"""Check news.json article URLs — run manually before demos."""

from __future__ import annotations

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NEWS = ROOT / "data" / "news.json"


def check_url(url: str) -> int | None:
    try:
        req = urllib.request.Request(
            url,
            method="HEAD",
            headers={"User-Agent": "VapeSafe-LinkChecker/1.0"},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status
    except Exception as exc:
        print(f"  error: {exc}")
        return None


def main() -> None:
    items = json.loads(NEWS.read_text(encoding="utf-8"))
    issues = 0
    for item in items:
        url = item.get("url")
        if not url:
            continue
        status = check_url(url)
        label = f"{item['id']}: {url}"
        if status and status < 400:
            print(f"OK {status} — {label}")
        else:
            print(f"FAIL {status} — {label}")
            homepage = item.get("homepageUrl")
            if homepage:
                print(f"  fallback homepage: {homepage}")
            issues += 1
    if issues:
        print(f"\n{issues} article URL(s) need updating in news.json")
    else:
        print("\nAll article URLs OK (or none defined)")


if __name__ == "__main__":
    main()
