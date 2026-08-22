# VapeSafe — HackTheGong Demo Script (~5 min)

## Setup (before judges arrive)

1. `npm run dev` — app at http://localhost:3000
2. Optional: clear browser localStorage for a fresh citizen session
3. Have `/council` ready in a second tab (password: `council-demo`)

## Act 1 — Citizen problem (90 sec)

**Landing (`/`)**

- "Vape litter is lithium battery e-waste in our parks and beaches."
- Point to live stats: reports, smart bins, kg diverted, kWh saved.

**Report litter (`/report`)**

- Take/upload a photo → GPS locks automatically.
- Submit → show **report ID** (e.g. `VS-2026-4521`) and +25 points.
- "Every report feeds council's heatmap in real time."

**Heatmap (`/heatmap`)**

- Zoom the Wollongong heat layer — your session report appears with seed data.
- "Hotspots drive bin placement and school outreach."

## Act 2 — Positive behaviour (90 sec)

**Scan bin (`/scan`)**

- Tap demo code `BIN-001` (enable GPS if prompted).
- Successful disposal log → points + collected status.

**Map (`/map`)**

- Filter by suburb / accepts type / open now.
- "Citizens find the nearest safe disposal — not the general bin."

**Profile & gamification (`/profile`, `/leaderboard`, `/rewards`)**

- Show badges unlocking, school leaderboard, redeem a reward.

## Act 3 — Council IoT (90 sec)

**Login (`/council`)**

- Password `council-demo` → operations dashboard.

**Dashboard (`/council/dashboard`)**

- Trends table, critical bins count, CSV export buttons.
- Download reports CSV — "open in Excel for ops planning."

**Smart bins (`/council/bins`)**

- Fill levels, temperature telemetry, high-fill alerts.

**Pickup (`/council/pickup`)**

- Crew routes and estimated kg.

**Energy (`/council/energy`)**

- Show Python formula from `python/energy_savings.py`.
- "We quantify kWh saved vs landfill — not just litter counts."

## Closing line

"VapeSafe connects citizen reports, IoT bins, and council analytics — turning vape waste into measurable energy recovery for Wollongong."

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Map blank | Wait for client hydration; refresh page |
| GPS denied | Demo still works with Wollongong centre fallback |
| Scan "too far" | Move slider: allow location or use `/map` first |
| Council 401 | Password `council-demo` or set `COUNCIL_PASSWORD` |
