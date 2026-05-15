# Japanese American Population 2024

Mapping people of Japanese descent across the US using ACS 2024 5-year estimates.
SOURCE:

2021-2024 American Community Survey 5-Year Estimates Detailed Tables
[Table B02018 Asian Alone or in Any Combination by Selected Groups](https://data.census.gov/table/ACSDT5Y2024.B02018?q=B02018:+Asian+Alone+or+in+Any+Combination+by+Selected+Groups)

Universe: Total Asian alone or in any combination who reported one or more responses

To be donated to JACL and Pacific Citizen.

**Questions this map answers:**
- How many people of Japanese descent ("alone or in combination")are there in the US?
There are total of 1,680,520 total Japanese "alone" or "in any combination" who reported one or more responses in 2024 ACS 5-year estimates.
Total population in the US is 338,156,808 according to the same dataset, so Japanese alone or in combination make up about 0.50% of the total population.
- How many in each county?
- How many in each census tract? *(Phase 2)*
- How many per JACL chapter district by state? *(Phase 2)*

---

## Stack

- **Vite 6** + **React 19** + **TypeScript** (SWC)
- **Mapbox GL JS** via `react-map-gl` *(Phase 2)*
- **Tailwind CSS v4**
- **Biome** — lint + format
- **GitHub Pages** — auto-deploy via GitHub Actions

---

## Data

### Census variables
| Variable | Description |
|---|---|
| `B02018_004E` | Japanese alone or in combination — "Estimate!!Total Groups Tallied:!!East Asian:!!Japanese" |
| `B01003_001E` | Total population |

Endpoint: `https://api.census.gov/data/2024/acs/acs5`

### County geometry
Base map: Census TIGER 2024 cartographic boundary, **5m resolution** (`cb_2024_us_county_5m.zip`), simplified further with [mapshaper](https://mapshaper.org/) to ~3.8MB. Stored at `scripts/source/us_counties_2024.json` (build input — not served publicly).

Join key: `GEOID` (5-digit FIPS, e.g. `"06037"` for LA County).

### Output
`public/data/counties.geojson` — baked at build time, never fetched at runtime.

Each feature carries:
```json
{
  "fips": "06037",
  "name": "Los Angeles County",
  "state": "California",
  "japanese_pop": 123456,
  "total_pop": 9876543,
  "japanese_pct": 1.25
}
```

---

## Scripts

| Command | What it does |
|---|---|
| `npm run fetch-data` | Pull ACS data, join to geometry, write `counties.geojson` |
| `npm start` / `npm run dev` | Start dev server |
| `npm run build` | TypeScript check + Vite build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Biome check — fails if anything's wrong (used in CI) |
| `npm run lint:fix` | Apply safe lint + format fixes |
| `npm run format` | Format only, no lint rules |

### Running `fetch-data`

Requires a Census API key (free — [register here](https://api.census.gov/data/key_signup.html)):

```sh
# .env.local
CENSUS_API_KEY=your_key_here
```

Then:

```sh
node scripts/fetch-data.mjs
# or
npm run fetch-data
```

The script reads `scripts/source/us_counties_2024.json`, fetches ACS5 data, joins on FIPS, and writes `public/data/counties.geojson`. Run it once whenever you want to refresh the data.

---

## Phase 1 — Data pipeline ✅

- [x] Census TIGER 5m county shapefile → GeoJSON via mapshaper
- [x] `scripts/fetch-data.mjs` — joins ACS data to geometry, outputs `counties.geojson`

## Phase 2 — Map app

- [ ] Full-screen Mapbox dark basemap
- [ ] Choropleth fill layer on counties by `japanese_pct`
- [ ] Hover tooltip: county name, `japanese_pop` (formatted), `japanese_pct` as `X.XX%`
- [ ] Color scale: sequential single warm hue (cream → deep red), 5–7 stops
- [ ] NYT precinct map feel — minimal UI, no legend clutter

---

## Deploy

Push to `main` — CI runs `biome check`, then deploys to GitHub Pages.

**First deploy:** go to **Settings → Pages**, set source to `GitHub Actions`.

### Google Analytics

GA only loads if `VITE_GA_ID` is set. No env var = no network requests.

In CI: **Settings → Secrets and variables → Variables → New repository variable**, name it `VITE_GA_ID`.

---

## Maintenance notes

**Biome schema version** — `biome.json` pins the schema URL to a specific Biome version. When upgrading `@biomejs/biome`, update the `$schema` URL in `biome.json` to match.
