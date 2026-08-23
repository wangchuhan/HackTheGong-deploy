#!/usr/bin/env python3
"""Verify demo QR PNGs decode to expected codes."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QR_DIR = ROOT / "public" / "qr"

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


def decode_png(path: Path) -> str:
    try:
        from pyzbar.pyzbar import decode as zbar_decode
        from PIL import Image
    except ImportError:
        import subprocess

        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "pyzbar", "pillow", "-q"],
        )
        from pyzbar.pyzbar import decode as zbar_decode
        from PIL import Image

    img = Image.open(path)
    results = zbar_decode(img)
    if not results:
        raise ValueError(f"No QR found in {path}")
    return results[0].data.decode("utf-8")


def main() -> int:
    failed = 0
    for code in CODES:
        path = QR_DIR / f"{code}.png"
        if not path.exists():
            print(f"MISSING {path}")
            failed += 1
            continue
        try:
            decoded = decode_png(path)
            if decoded != code:
                print(f"FAIL {path}: got {decoded!r}, expected {code!r}")
                failed += 1
            else:
                print(f"OK   {code}")
        except Exception as exc:
            print(f"FAIL {path}: {exc}")
            failed += 1
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
