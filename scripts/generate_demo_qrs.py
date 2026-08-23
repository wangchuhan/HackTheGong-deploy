#!/usr/bin/env python3
"""Generate scannable demo QR PNGs encoding plain BIN/DISP codes."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "qr"

CODES = [
    "BIN-001",
    "BIN-002",
    "BIN-003",
    "BIN-004",
    "BIN-005",
    "DISP-WLG-01",
    "DISP-WLG-09",
    "DISP-WLG-12",
]


def main() -> int:
    try:
        import qrcode
    except ImportError:
        print("Installing qrcode…", file=sys.stderr)
        import subprocess

        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "qrcode[pil]", "-q"],
        )
        import qrcode

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for code in CODES:
        img = qrcode.make(code)
        path = OUT_DIR / f"{code}.png"
        img.save(path)
        print(f"Wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
