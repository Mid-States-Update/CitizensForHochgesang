import type {CityPageSummary, CountyPageSummary} from '../cms/types'

/* Pure view-model + projection layer for the district map v2.
 * No DOM, no fetch: everything here is unit-testable, and the SVG
 * component stays a thin renderer over this model. */

export const DISTRICT_COUNTY_NAMES = [
  'Crawford',
  'Dubois',
  'Gibson',
  'Perry',
  'Pike',
  'Spencer',
] as const

export type DistrictCountyName = (typeof DISTRICT_COUNTY_NAMES)[number]

export type MapCity = {
  title: string
  slug: string
  href: string
}

export type MapRegionModel = {
  name: DistrictCountyName
  slug: string
  status: 'live' | 'coming-soon'
  href: string | null
  ariaLabel: string
  cities: MapCity[]
}

export type MapModel = {
  regions: MapRegionModel[]
}

export function slugForCountyName(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, '-')}-county`
}

export function buildMapModel(input: {
  counties: CountyPageSummary[]
  cities: CityPageSummary[]
}): MapModel {
  const published = new Set(input.counties.map((c) => c.slug))
  const regions = DISTRICT_COUNTY_NAMES.map((name): MapRegionModel => {
    const slug = slugForCountyName(name)
    const live = published.has(slug)
    const cities = live
      ? input.cities
          .filter((c) => c.countySlug === slug)
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((c) => ({
            title: c.title,
            slug: c.slug,
            href: `/district/${slug}/${c.slug}`,
          }))
      : []
    return {
      name,
      slug,
      status: live ? 'live' : 'coming-soon',
      href: live ? `/district/${slug}` : null,
      ariaLabel: live
        ? `${name} County: open the county page`
        : `${name} County: page coming soon`,
      cities,
    }
  })
  return {regions}
}

/* ── Projection ──────────────────────────────────────────────────── */

export type Bounds = {
  minLon: number
  minLat: number
  maxLon: number
  maxLat: number
}

export type Viewport = {width: number; height: number}

/* Equirectangular viewport: height follows the bbox's true ground aspect,
 * with the cos(latitude) correction so a map at 38°N is not stretched wide
 * (a degree of longitude covers less ground than a degree of latitude). */
export function viewportFor(bbox: Bounds, width: number): Viewport {
  const midLat = ((bbox.minLat + bbox.maxLat) / 2) * (Math.PI / 180)
  const groundLonSpan = (bbox.maxLon - bbox.minLon) * Math.cos(midLat)
  const latSpan = bbox.maxLat - bbox.minLat
  return {width, height: round2(width * (latSpan / groundLonSpan))}
}

export function project(
  [lon, lat]: [number, number],
  bbox: Bounds,
  viewport: Viewport
): [number, number] {
  const x = ((lon - bbox.minLon) / (bbox.maxLon - bbox.minLon)) * viewport.width
  const y =
    viewport.height -
    ((lat - bbox.minLat) / (bbox.maxLat - bbox.minLat)) * viewport.height
  return [round2(x), round2(y)]
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function ringsToPath(
  rings: Array<{points: Array<[number, number]>}>,
  bbox: Bounds,
  viewport: Viewport
): string {
  return rings
    .map((ring) => {
      const cmds = ring.points.map((pt, i) => {
        const [x, y] = project(pt, bbox, viewport)
        return `${i === 0 ? 'M' : 'L'}${x},${y}`
      })
      return `${cmds.join(' ')} Z`
    })
    .join(' ')
}
