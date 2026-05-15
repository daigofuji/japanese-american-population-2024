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

async function main() {
  const base = JSON.parse(readFileSync('scripts/source/us_counties_2024.json', 'utf8'))
  console.log(`Loaded ${base.features.length} counties from base GeoJSON`)

  const url = `https://api.census.gov/data/2024/acs/acs5?get=B02018_004E,B01003_001E&for=county:*&in=state:*&key=${API_KEY}`
  console.log('Fetching Census ACS5 data...')
  const res = await fetch(url)
  const body = await res.text()
  if (!res.ok || body.trimStart().startsWith('<')) {
    console.error('Census API response:', body.slice(0, 300))
    throw new Error(`Census API error (status ${res.status})`)
  }

  const [, ...rows] = JSON.parse(body)

  const lookup = new Map()
  for (const [japRaw, totalRaw, state, county] of rows) {
    const fips = state.padStart(2, '0') + county.padStart(3, '0')
    const japanese_pop = Number.parseInt(japRaw, 10)
    const total_pop = Number.parseInt(totalRaw, 10)
    lookup.set(fips, {
      japanese_pop: japanese_pop === CENSUS_NULL || Number.isNaN(japanese_pop) ? 0 : japanese_pop,
      total_pop: total_pop === CENSUS_NULL || Number.isNaN(total_pop) ? 0 : total_pop,
    })
  }
  console.log(`Loaded ${lookup.size} counties from Census API`)

  let matched = 0
  const features = base.features.map(feature => {
    const fips = feature.properties.GEOID
    const data = lookup.get(fips) ?? { japanese_pop: 0, total_pop: 0 }
    if (lookup.has(fips)) matched++

    const { japanese_pop, total_pop } = data
    const japanese_pct = total_pop > 0
      ? Math.round((japanese_pop / total_pop) * 10000) / 100
      : 0

    return {
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        fips,
        name: feature.properties.NAMELSAD,
        state: feature.properties.STATE_NAME,
        japanese_pop,
        total_pop,
        japanese_pct,
      },
    }
  })

  console.log(`Joined: ${matched}/${base.features.length} matched`)

  mkdirSync('public/data', { recursive: true })

  writeFileSync('public/data/counties.geojson', JSON.stringify({ type: 'FeatureCollection', features }))
  console.log('Written → public/data/counties.geojson')

  const csvRows = [
    'fips,name,state,japanese_pop,total_pop,japanese_pct',
    ...features.map(f => {
      const { fips, name, state, japanese_pop, total_pop, japanese_pct } = f.properties
      return `${fips},"${name}","${state}",${japanese_pop},${total_pop},${japanese_pct}`
    }),
  ]
  writeFileSync('public/data/counties.csv', csvRows.join('\n'))
  console.log('Written → public/data/counties.csv')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
