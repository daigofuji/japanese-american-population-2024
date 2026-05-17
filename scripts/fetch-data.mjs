import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const yearIdx = process.argv.indexOf('--year')
const YEAR = yearIdx !== -1 ? process.argv[yearIdx + 1] : '2024'

const API_KEY = process.env.CENSUS_API_KEY
if (!API_KEY) {
  console.error('Missing CENSUS_API_KEY — add it to .env.local')
  process.exit(1)
}
console.log(`Year: ${YEAR}`)
console.log(`Key: ${API_KEY.slice(0, 4)}…${API_KEY.slice(-4)} (${API_KEY.length} chars)`)

const CENSUS_NULL = -666666666
const TERRITORIES = new Set(['60', '66', '69', '72', '78'])

function parsePop(raw) {
  const n = Number.parseInt(raw, 10)
  return n === CENSUS_NULL || Number.isNaN(n) ? 0 : n
}

function pct(japanese_pop, total_pop) {
  return total_pop > 0 ? Math.round((japanese_pop / total_pop) * 10000) / 100 : 0
}

async function fetchCensus(url) {
  const res = await fetch(url)
  const body = await res.text()
  if (!res.ok || body.trimStart().startsWith('<')) {
    throw new Error(`Census API error (status ${res.status}): ${body.slice(0, 200)}`)
  }
  const [, ...rows] = JSON.parse(body)
  return rows
}

// ── Counties ──────────────────────────────────────────────────────────────────

async function generateCounties() {
  const base = JSON.parse(readFileSync(`scripts/source/us_counties_${YEAR}.json`, 'utf8'))
  console.log(`\nLoaded ${base.features.length} counties`)

  const stateFips = [...new Set(base.features.map(f => f.properties.STATEFP))]
    .filter(fp => !TERRITORIES.has(fp))
    .sort()
  console.log(`Fetching ACS5 county data for ${stateFips.length} states...`)

  const lookup = new Map()
  for (const stateFp of stateFips) {
    process.stdout.write(`  ${stateFp}...`)
    const rows = await fetchCensus(
      `https://api.census.gov/data/${YEAR}/acs/acs5?get=B02018_004E,B01003_001E&for=county:*&in=state:${stateFp}&key=${API_KEY}`
    )
    for (const [jap, tot, state, county] of rows) {
      const geoid = state.padStart(2, '0') + county.padStart(3, '0')
      lookup.set(geoid, { japanese_pop: parsePop(jap), total_pop: parsePop(tot) })
    }
    process.stdout.write(` ${rows.length} counties\n`)
  }

  let matched = 0
  const features = base.features.map(feature => {
    const geoid = feature.properties.GEOID
    const data = lookup.get(geoid) ?? { japanese_pop: 0, total_pop: 0 }
    if (lookup.has(geoid)) matched++
    const { japanese_pop, total_pop } = data
    return {
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        geoid,
        name: feature.properties.NAMELSAD,
        state: feature.properties.STATE_NAME,
        japanese_pop,
        total_pop,
        japanese_pct: pct(japanese_pop, total_pop),
      },
    }
  })
  console.log(`Counties joined: ${matched}/${base.features.length} matched`)

  mkdirSync('public/data', { recursive: true })
  writeFileSync('public/data/counties.geojson', JSON.stringify({ type: 'FeatureCollection', features }))
  console.log('Written → public/data/counties.geojson')

  const csvRows = [
    'geoid,name,state,japanese_pop,total_pop,japanese_pct',
    ...features.map(({ properties: p }) =>
      `${p.geoid},"${p.name}","${p.state}",${p.japanese_pop},${p.total_pop},${p.japanese_pct}`
    ),
  ]
  writeFileSync('public/data/counties.csv', csvRows.join('\n'))
  console.log('Written → public/data/counties.csv')
}

// ── Tracts ────────────────────────────────────────────────────────────────────

async function generateTracts() {
  const base = JSON.parse(readFileSync(`scripts/source/us_tracts_${YEAR}.json`, 'utf8'))
  console.log(`\nLoaded ${base.features.length} tracts`)

  const stateFips = [...new Set(base.features.map(f => f.properties.STATEFP))]
    .filter(fp => !TERRITORIES.has(fp))
    .sort()
  console.log(`Fetching ACS5 tract data for ${stateFips.length} states...`)

  const lookup = new Map()
  for (const stateFp of stateFips) {
    process.stdout.write(`  ${stateFp}...`)
    const rows = await fetchCensus(
      `https://api.census.gov/data/${YEAR}/acs/acs5?get=B02018_004E,B01003_001E&for=tract:*&in=state:${stateFp}&in=county:*&key=${API_KEY}`
    )
    for (const [jap, tot, state, county, tract] of rows) {
      const geoid = state.padStart(2, '0') + county.padStart(3, '0') + tract.padStart(6, '0')
      lookup.set(geoid, { japanese_pop: parsePop(jap), total_pop: parsePop(tot) })
    }
    process.stdout.write(` ${rows.length} tracts\n`)
  }

  let matched = 0
  const features = base.features.map(feature => {
    const geoid = feature.properties.GEOID
    const data = lookup.get(geoid) ?? { japanese_pop: 0, total_pop: 0 }
    if (lookup.has(geoid)) matched++
    const { japanese_pop, total_pop } = data
    return {
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        geoid,
        name: `${feature.properties.NAMELSADCO} (${feature.properties.NAME})`,
        state: feature.properties.STATE_NAME,
        japanese_pop,
        total_pop,
        japanese_pct: pct(japanese_pop, total_pop),
      },
    }
  })
  console.log(`Tracts joined: ${matched}/${base.features.length} matched`)

  writeFileSync('public/data/tracts.geojson', JSON.stringify({ type: 'FeatureCollection', features }))
  console.log('Written → public/data/tracts.geojson')

  const csvRows = [
    'geoid,name,state,japanese_pop,total_pop,japanese_pct',
    ...features.map(({ properties: p }) =>
      `${p.geoid},"${p.name}","${p.state}",${p.japanese_pop},${p.total_pop},${p.japanese_pct}`
    ),
  ]
  writeFileSync('public/data/tracts.csv', csvRows.join('\n'))
  console.log('Written → public/data/tracts.csv')
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await generateCounties()
  await generateTracts()
  console.log('\nDone.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
