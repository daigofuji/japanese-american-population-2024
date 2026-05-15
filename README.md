# vite-react-ts-starter

Personal starter template for quick React projects. Clone, configure, ship.

## Includes

- **Vite 6** + **React 19** + **TypeScript** (SWC)
- **Tailwind CSS v4** — configured in CSS, no config file
- **Biome** — lint + format in one tool (replaces ESLint + Prettier)
- **Libre Franklin** — via Google Fonts, set as the default font
- **Google Analytics** (`gtag`) — opt-in via env var, no requests if unset
- **GitHub Pages** — auto-deploy via GitHub Actions (official Pages action)
- **CI workflow** — `biome check` must pass before deploy runs

## Usage

1. Click **Use this template** on GitHub to create your new repo
2. Clone and `npm install`
3. Copy `.env.example` to `.env.local` and set `VITE_GA_ID` (optional)
4. `npm run dev`
5. Push to `main` — CI lints, then deploys to GitHub Pages

> The `base` URL for GitHub Pages is auto-detected from `GITHUB_REPOSITORY` in CI. No manual config needed.

## First deploy — one-time setup

Before the first push, go to **Settings → Pages** and set:

- Source: `GitHub Actions`

That's it — no `gh-pages` branch needed. The deploy job uses OIDC via the official `actions/deploy-pages` action.

## Google Analytics

GA only loads if `VITE_GA_ID` is set. No env var = no network requests.

**Locally:** add to `.env.local`:

```sh
VITE_GA_ID=G-XXXXXXXXXX
```

**In CI:** add as a GitHub Actions variable — **Settings → Secrets and variables → Variables → New repository variable**, name it `VITE_GA_ID`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` / `npm run dev` | Start dev server |
| `npm run build` | TypeScript check + Vite build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Check only — fails if anything's wrong (used in CI) |
| `npm run lint:fix` | Apply safe lint + format fixes |
| `npm run format` | Apply format fixes only, no lint rules |

## Font

Libre Franklin is set as the default `font-sans` via Tailwind's `@theme`, so it applies to the entire app without any extra class:

```css
/* src/index.css */
@theme {
  --font-sans: "Libre Franklin", sans-serif;
}
```

## Maintenance notes

**Biome schema version** — `biome.json` pins the schema URL to a specific version (e.g. `1.9.4`). When upgrading `@biomejs/biome` in `package.json`, update the `$schema` URL in `biome.json` to match. Mismatched versions cause config keys to be silently ignored.
