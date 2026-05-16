import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const API_KEY = process.env.CENSUS_API_KEY
if (!API_KEY) {
  console.error('Missing CENSUS_API_KEY — add it to .env.local')
  process.exit(1)
}
console.log(`Key: ${API_KEY.slice(0, 4)}…${API_KEY.slice(-4)} (${API_KEY.length} chars)`)

const CENSUS_NULL = -666666666

async function fetchState(stateFp) {
  const url = `https://api.census.gov/data/2024/acs/acs5?get=B02018_004E,B01003_001E&for=tract:*&in=state:${stateFp}&in=county:*&key=${API_KEY}`
  const res = await fetch(url)
  const body = await res.text()
  if (!res.ok || body.trimStart().startsWith('<')) {
    throw new Error(`Census API error for state ${stateFp} (status ${res.status}): ${body.slice(0, 200)}`)
  }
  const [, ...rows] = JSON.parse(body)
  return rows
}

async function main() {
  const base = JSON.parse(readFileSync('scripts/source/us_2024_tract.json', 'utf8'))
  console.log(`Loaded ${base.features.length} tracts from base GeoJSON`)

  const TERRITORIES = new Set(['60', '66', '69', '72', '78'])
  const stateFips = [...new Set(base.features.map(f => f.properties.STATEFP))]
    .filter(fp => !TERRITORIES.has(fp))
    .sort()
  console.log(`Fetching Census ACS5 data for ${stateFips.length} states...`)

  const lookup = new Map()
  for (const stateFp of stateFips) {
    process.stdout.write(`  ${stateFp}...`)
    const rows = await fetchState(stateFp)
    for (const [japRaw, totalRaw, state, county, tract] of rows) {
      const geoid = state.padStart(2, '0') + county.padStart(3, '0') + tract.padStart(6, '0')
      const japanese_pop = Number.parseInt(japRaw, 10)
      const total_pop = Number.parseInt(totalRaw, 10)
      lookup.set(geoid, {
        japanese_pop: japanese_pop === CENSUS_NULL || Number.isNaN(japanese_pop) ? 0 : japanese_pop,
        total_pop: total_pop === CENSUS_NULL || Number.isNaN(total_pop) ? 0 : total_pop,
      })
    }
    process.stdout.write(` ${rows.length} tracts\n`)
  }
  console.log(`Loaded ${lookup.size} tracts from Census API`)

  let matched = 0
  const features = base.features.map(feature => {
    const geoid = feature.properties.GEOID
    const data = lookup.get(geoid) ?? { japanese_pop: 0, total_pop: 0 }
    if (lookup.has(geoid)) matched++

    const { japanese_pop, total_pop } = data
    const japanese_pct = total_pop > 0
      ? Math.round((japanese_pop / total_pop) * 10000) / 100
      : 0

    return {
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        geoid,
        name: feature.properties.NAMELSAD,
        county: feature.properties.NAMELSADCO,
        state: feature.properties.STATE_NAME,
        japanese_pop,
        total_pop,
        japanese_pct,
      },
    }
  })

  console.log(`Joined: ${matched}/${base.features.length} matched`)

  mkdirSync('public/data', { recursive: true })

  writeFileSync('public/data/tracts.geojson', JSON.stringify({ type: 'FeatureCollection', features }))
  console.log('Written → public/data/tracts.geojson')

  const csvRows = [
    'geoid,name,county,state,japanese_pop,total_pop,japanese_pct',
    ...features.map(f => {
      const { geoid, name, county, state, japanese_pop, total_pop, japanese_pct } = f.properties
      return `${geoid},"${name}","${county}","${state}",${japanese_pop},${total_pop},${japanese_pct}`
    }),
  ]
  writeFileSync('public/data/tracts.csv', csvRows.join('\n'))
  console.log('Written → public/data/tracts.csv')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
