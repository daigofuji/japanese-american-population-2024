# Japanese American Population 2024

Interactive county-level choropleth mapping people of Japanese descent across the US, using [ACS 2024 5-year estimates, Table B02018](https://data.census.gov/table/ACSDT5Y2024.B02018). Donated to JACL and Pacific Citizen.

---

## Stack

- **Vite 6** + **React 19** + **TypeScript** + **Tailwind CSS v4**
- **Mapbox GL JS** via `react-map-gl`
- **Biome** — lint + format
- **GitHub Pages** — auto-deploy via GitHub Actions
- colors: #efedf5 #bcbddc #756bb1  #1b021d #bd001c
---

## Data

Census variables pulled from `https://api.census.gov/data/2024/acs/acs5`:

| Variable | Description |
| --- | --- |
| `B02018_004E` | Japanese alone or in combination |
| `B01003_001E` | Total population |

County geometry: Census TIGER 2024 5m cartographic boundary, simplified with [mapshaper](https://mapshaper.org/) to ~3.8MB (`scripts/source/us_counties_2024.json`).

Tiger shape files can be found here: <https://www2.census.gov/geo/tiger/GENZ2024/shp/>

---

## Development

```sh
npm install
npm run dev
```

Requires two env vars in `.env.local` (see `.env.example`):

```sh
VITE_MAPBOX_TOKEN=   # mapbox.com/account/access-tokens
CENSUS_API_KEY=      # api.census.gov/data/key_signup.html
```

To refresh Census data:

```sh
npm run fetch-data
```

Reads `scripts/source/us_counties_2024.json`, fetches ACS5, joins on FIPS, writes `public/data/counties.geojson`.

---

## Deploy

Push to `main` — CI lints, then deploys to GitHub Pages.

**First deploy:** Settings → Pages → Source: GitHub Actions.

Optional: set `VITE_GA_ID` as a repository variable (Settings → Secrets and variables → Variables) to enable Google Analytics.
