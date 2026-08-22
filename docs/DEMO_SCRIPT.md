# VapeSafe — 3-minute judge demo script

## 1. Landing (`/`)
- Explain the problem: vape litter hotspots across Wollongong
- Point to stats: reports, bins monitored, kg diverted, kWh saved (estimated)

## 2. Scan QR (`/scan`)
- Enter `BIN-001` → shows smart bin status
- Or `DISP-WLG-01` → disposal point details

## 3. Disposal map (`/map`)
- Filter by "open now" and accepted item type
- Tap a location → Get directions link
- Show distance filtering

## 4. Report litter (`/report`)
- Take/upload a photo
- GPS auto-captures (or manual pin adjust)
- Submit → receive report ID `VS-2026-XXXX` and +10 points

## 5. Heatmap (`/heatmap`)
- Show seeded hotspots across Illawarra suburbs
- New report appears as additional heat on the map

## 6. Profile & leaderboard (`/profile`, `/leaderboard`)
- Points, level, badges unlocked
- School vs individual challenge rankings

## 7. Council dashboard (`/council`)
- Password: `council-demo`
- Energy impact cards (kWh, CO₂e — from `python/energy_savings.py`)
- Hotspot heatmap, suburb breakdown, trends chart
- Export CSV

## 8. Smart Bin IoT (`/council/bins`)
- Live fill % and temperature (simulated tick every 30s)
- Near-capacity alerts

## 9. Optimised pickup (`/council/pickup`)
- Suggested route through top 3 near-full bins
- Approve route + scheduled pickup table

## Demo codes
- Bins: `BIN-001`, `BIN-003`
- Disposal: `DISP-WLG-01`, `DISP-WLG-05`
- Council password: `council-demo`
