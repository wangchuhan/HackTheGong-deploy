# VapeSafe Wollongong

Citizen PWA for reporting vape litter, finding disposal points, and gamified cleanup across the Illawarra — plus a council IoT dashboard with Python-computed energy savings.

## Quick start

```bash
npm install
python3 scripts/generate_seed_data.py   # optional — seed JSON already in data/
python3 python/energy_savings.py      # optional — refreshes data/energy-stats.json
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Council demo:** [http://localhost:3000/council](http://localhost:3000/council) — password `council-demo` (override with `COUNCIL_PASSWORD`)

## Demo URLs

| Route | Purpose |
|-------|---------|
| `/` | Landing & quick stats |
| `/scan` | QR smart-bin disposal flow |
| `/map` | Disposal points with filters + GPS |
| `/report` | Photo litter report with GPS + report ID |
| `/heatmap` | Community litter heatmap |
| `/profile` | Points, badges, nickname |
| `/leaderboard` | Citizens & schools |
| `/rewards` | Redeem local partner rewards |
| `/council` | Council ops login |
| `/council/dashboard` | Overview, trends, CSV export |
| `/council/bins` | IoT bin telemetry |
| `/council/pickup` | Crew pickup schedule |
| `/council/energy` | Python energy/emissions model |

## Repo structure

```
app/              Next.js App Router pages & API routes
components/       Nav, maps, stat cards
data/             Static JSON seed data (Wollongong geography)
lib/              Types, data loaders, geo helpers, localStorage user
python/           energy_savings.py — kWh / CO₂e impact model
scripts/          generate_seed_data.py
public/           PWA manifest & icons
docs/             Demo script for judges
```

## Tech stack

Next.js 16 · React 19 · Tailwind CSS 4 · Leaflet / react-leaflet / leaflet.heat · Python 3 · Static JSON (no database)
