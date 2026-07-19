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

/* Area-weighted centroid (shoelace formula) across all rings, so county
 * labels sit at the visual center of mass rather than a bbox midpoint. */
export function polygonCentroid(
  rings: Array<{points: Array<[number, number]>}>
): [number, number] {
  let totalArea = 0
  let cx = 0
  let cy = 0
  for (const ring of rings) {
    const pts = ring.points
    let area = 0
    let rx = 0
    let ry = 0
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i]
      const [x1, y1] = pts[(i + 1) % pts.length]
      const cross = x0 * y1 - x1 * y0
      area += cross
      rx += (x0 + x1) * cross
      ry += (y0 + y1) * cross
    }
    area /= 2
    if (area === 0) continue
    rx /= 6 * area
    ry /= 6 * area
    const weight = Math.abs(area)
    cx += rx * weight
    cy += ry * weight
    totalArea += weight
  }
  if (totalArea === 0) return [0, 0]
  return [cx / totalArea, cy / totalArea]
}

export type Rect = {x: number; y: number; width: number; height: number}

export function projectedRect(
  bounds: Bounds,
  mapBbox: Bounds,
  viewport: Viewport
): Rect {
  const [x0, y0] = project([bounds.minLon, bounds.maxLat], mapBbox, viewport)
  const [x1, y1] = project([bounds.maxLon, bounds.minLat], mapBbox, viewport)
  return {x: x0, y: y0, width: round2(x1 - x0), height: round2(y1 - y0)}
}

export type ZoomTransform = {scale: number; tx: number; ty: number}

/* Transform that makes `rect` fill the viewport (centered, aspect kept). */
export function zoomTransformFor(rect: Rect, viewport: Viewport): ZoomTransform {
  const scale = Math.max(
    1,
    round2(Math.min(viewport.width / rect.width, viewport.height / rect.height))
  )
  const tx = round2(viewport.width / 2 - scale * (rect.x + rect.width / 2))
  const ty = round2(viewport.height / 2 - scale * (rect.y + rect.height / 2))
  return {scale, tx, ty}
}

function normalizePlace(name: string): string {
  return name.toLowerCase().replace(/^saint /, 'st. ').trim()
}

export type CityLabelPlan = {labeled: boolean; clickable: boolean}

/* Label a city only when it has news coverage or ranks in its county's
 * top-5 by population; only news-bearing places are clickable. */
export function planCityLabels(
  cities: Array<{name: string; county: string; pop: number}>,
  newsPlaces: string[],
  topN = 5
): Map<string, CityLabelPlan> {
  const news = new Set(newsPlaces.map(normalizePlace))
  const topByCounty = new Map<string, Set<string>>()
  for (const county of new Set(cities.map((c) => c.county))) {
    const top = cities
      .filter((c) => c.county === county && c.pop > 0)
      .sort((a, b) => b.pop - a.pop || a.name.localeCompare(b.name))
      .slice(0, topN)
    topByCounty.set(county, new Set(top.map((c) => c.name)))
  }
  const plan = new Map<string, CityLabelPlan>()
  for (const city of cities) {
    const clickable = news.has(normalizePlace(city.name))
    const labeled = clickable || (topByCounty.get(city.county)?.has(city.name) ?? false)
    plan.set(`${city.name}|${city.county}`, {labeled, clickable})
  }
  return plan
}

/* Chaikin corner-cutting for closed rings: each pass replaces every edge
 * with points 1/4 and 3/4 along it, doubling the point count and rounding
 * corners. Purely cosmetic; the underlying data stays the official TIGER
 * boundary. Deviation per pass is at most a quarter of an edge length,
 * sub-pixel at this map's scales. */
export function chaikinSmooth(
  points: Array<[number, number]>,
  iterations = 1
): Array<[number, number]> {
  if (points.length < 3) return points
  let ring = points
  for (let pass = 0; pass < iterations; pass++) {
    const out: Array<[number, number]> = []
    for (let i = 0; i < ring.length; i++) {
      const [x0, y0] = ring[i]
      const [x1, y1] = ring[(i + 1) % ring.length]
      out.push([x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25])
      out.push([x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75])
    }
    ring = out
  }
  return ring
}

export function newsHrefForPlace(place: string): string {
  return `/news?place=${encodeURIComponent(place)}`
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

/**
 * SVG font size (in viewBox units) that renders city labels at a constant
 * on-screen pixel size, mirroring the non-scaling strokes. Falls back to a
 * 760px container before the client has measured the real one.
 */
export function cityLabelFontUnits(
  viewBoxWidth: number,
  containerWidth: number,
  targetPx: number
): number {
  const width = containerWidth > 0 ? containerWidth : 760
  return (targetPx * viewBoxWidth) / width
}
