'use client'

import {useMemo, useState} from 'react'
import Link from 'next/link'

import district48Data from './indiana-district-map-coordinates'
import {
  buildMapModel,
  ringsToPath,
  viewportFor,
  type Bounds,
  type MapRegionModel,
  type Viewport,
} from '../lib/map/model'
import type {CityPageSummary, CountyPageSummary} from '../lib/cms/types'

const MAP_WIDTH = 760
const PAD = 0.03

/* District map v2: pure model (lib/map/model.ts) + this thin SVG renderer.
 * Differences from v1: counties are real links to their pages, selection
 * drives a fixed panel below the map instead of a floating popup (nothing
 * to clip on small screens), and every region is keyboard reachable. */
export function DistrictMapV2({
  counties,
  cities,
}: {
  counties: CountyPageSummary[]
  cities: CityPageSummary[]
}) {
  const model = useMemo(() => buildMapModel({counties, cities}), [counties, cities])
  const [selected, setSelected] = useState<MapRegionModel | null>(null)

  const bbox: Bounds = useMemo(() => {
    const b = district48Data.district.bbox
    const lonPad = (b.maxLon - b.minLon) * PAD
    const latPad = (b.maxLat - b.minLat) * PAD
    return {
      minLon: b.minLon - lonPad,
      minLat: b.minLat - latPad,
      maxLon: b.maxLon + lonPad,
      maxLat: b.maxLat + latPad,
    }
  }, [])

  const viewport = useMemo(() => viewportFor(bbox, MAP_WIDTH), [bbox])

  const shapes = useMemo(
    () =>
      model.regions.map((region) => {
        const geo = district48Data.counties.find((c) => c.name === region.name)
        if (!geo) return null
        return {
          region,
          path: ringsToPath(
            geo.rings.map((r) => ({points: r.coordinates as Array<[number, number]>})),
            bbox,
            viewport
          ),
          label: projectPoint(geo.centroid as [number, number], bbox, viewport),
        }
      }),
    [model, bbox, viewport]
  )

  return (
    <div className="map2">
      <svg
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        role="group"
        aria-label="Senate District 48 county map"
        className="map2-svg"
      >
        {shapes.map((shape) => {
          if (!shape) return null
          const {region, path, label} = shape
          const isSelected = selected?.slug === region.slug
          const cls = [
            'map2-county',
            region.status === 'live' ? 'map2-live' : 'map2-soon',
            isSelected ? 'map2-selected' : '',
          ].join(' ')
          const inner = (
            <>
              <path d={path} className="map2-shape" />
              <text x={label[0]} y={label[1]} className="map2-label">
                {region.name}
              </text>
            </>
          )
          return region.status === 'live' ? (
            <Link
              key={region.slug}
              href={region.href!}
              aria-label={region.ariaLabel}
              className={cls}
              onMouseEnter={() => setSelected(region)}
              onFocus={() => setSelected(region)}
            >
              {inner}
            </Link>
          ) : (
            <g
              key={region.slug}
              tabIndex={0}
              role="button"
              aria-label={region.ariaLabel}
              className={cls}
              onMouseEnter={() => setSelected(region)}
              onFocus={() => setSelected(region)}
            >
              {inner}
            </g>
          )
        })}
      </svg>

      <div className="map2-panel" aria-live="polite">
        {selected ? (
          <>
            <h3 className="map2-panel-title">{selected.name} County</h3>
            {selected.status === 'live' ? (
              <>
                <p>
                  <Link href={selected.href!}>
                    Read what I am hearing in {selected.name} County
                  </Link>
                </p>
                {selected.cities.length > 0 && (
                  <ul className="map2-cities">
                    {selected.cities.map((c) => (
                      <li key={c.slug}>
                        <Link href={c.href}>{c.title}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p>
                The {selected.name} County page is being written now. Every county
                in this district gets one.
              </p>
            )}
          </>
        ) : (
          <p className="map2-panel-hint">
            Select a county to see its page and towns.
          </p>
        )}
      </div>
    </div>
  )
}

function projectPoint(
  pt: [number, number],
  bbox: Bounds,
  viewport: Viewport
): [number, number] {
  const x =
    ((pt[0] - bbox.minLon) / (bbox.maxLon - bbox.minLon)) * viewport.width
  const y =
    viewport.height -
    ((pt[1] - bbox.minLat) / (bbox.maxLat - bbox.minLat)) * viewport.height
  return [x, y]
}
