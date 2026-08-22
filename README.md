# VapeSafe — civic vape-litter reporting, disposal map, and council IoT demo for **HackTheGong** (Wollongong / Illawarra).

## Quick start

```bash
npm install
npm run dev
```

Optional — regenerate seed data and energy stats:

```bash
python3 scripts/generate_seed_data.py
python3 python/energy_savings.py
```

Open [http://localhost:3000](http://localhost:3000)

## Demo routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/scan` | QR / manual code lookup |
| `/bins/BIN-001` | Citizen bin view (gauge + AI camera) |
| `/map` | Disposal points map + filters |
| `/report` | Photo report + GPS |
| `/heatmap` | Suburb ring heatmap (red hotspots, green clean) |
| `/news` | News & updates (council + community) |
| `/profile` | Points, badges, suburb challenge |
| `/leaderboard` | Individual + school rankings |
| `/rewards` | Redeem partner offers (demo) |
| `/council` | Council dashboard (footer: Partner login, password: `council-demo`) |

## Repo structure

```
app/           Next.js pages (citizen + council)
components/    Map, heatmap, nav, stat cards
data/          Seed JSON (reports, bins, leaderboard, etc.)
lib/           Types, data loaders, geo, user session
python/        Energy savings estimator
scripts/       Seed data generator
public/        PWA manifest + icons
docs/          Judge demo script
```

## Tech stack

- **Next.js 16** — App Router, TypeScript, Tailwind CSS
- **react-leaflet** — interactive maps and heatmap
- **JSON seed data** — no database required for demo
- **Python** — `generate_seed_data.py`, `energy_savings.py`

## HackTheGong

- Repo: [github.com/Zac-lab-lab/HackTheGong](https://github.com/Zac-lab-lab/HackTheGong)
- Full demo walkthrough: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)
