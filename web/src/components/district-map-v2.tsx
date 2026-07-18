'use client'

import {useEffect, useMemo, useState} from 'react'
import Link from 'next/link'

import district48Data from './indiana-district-map-coordinates'
import {district48Cities} from './district48-cities'
import {
  buildMapModel,
  chaikinSmooth,
  newsHrefForPlace,
  planCityLabels,
  polygonCentroid,
  project,
  projectedRect,
  ringsToPath,
  viewportFor,
  zoomTransformFor,
  type Bounds,
  type MapRegionModel,
} from '../lib/map/model'
import type {CityPageSummary, CountyPageSummary} from '../lib/cms/types'

const MAP_WIDTH = 760
const PAD = 0.03
const ZOOM_PAD = 0.08

type View = {level: 'district'} | {level: 'county'; slug: string}

/* District map v2: pure model (lib/map/model.ts) + this thin SVG renderer.
 * Interactions: county SHAPE click zooms that county to fill the viewport
 * (township boundaries appear at that level); the county NAME and the city
 * names in the panel link to /news filtered to that place; the panel links
 * to the county page itself once published. */
export function DistrictMapV2({
  counties,
  cities,
  newsPlaces = [],
}: {
  counties: CountyPageSummary[]
  cities: CityPageSummary[]
  /** Canonical place names that have at least one news post; drives which
   * city labels appear and which are clickable. */
  newsPlaces?: string[]
}) {
  const model = useMemo(() => buildMapModel({counties, cities}), [counties, cities])
  const labelPlan = useMemo(
    () => planCityLabels(district48Cities, newsPlaces),
    [newsPlaces]
  )
  const [selected, setSelected] = useState<MapRegionModel | null>(null)
  const [view, setView] = useState<View>({level: 'district'})

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
      model.regions.flatMap((region) => {
        const geo = district48Data.counties.find((c) => c.name === region.name)
        if (!geo) return []
        const rings = geo.rings.map((r) => ({
          points: r.coordinates as Array<[number, number]>,
        }))
        const lonPad = (geo.bbox.maxLon - geo.bbox.minLon) * ZOOM_PAD
        const latPad = (geo.bbox.maxLat - geo.bbox.minLat) * ZOOM_PAD
        return [
          {
            region,
            geo,
            path: ringsToPath(rings, bbox, viewport),
            label: project(polygonCentroid(rings), bbox, viewport),
            zoomRect: projectedRect(
              {
                minLon: geo.bbox.minLon - lonPad,
                minLat: geo.bbox.minLat - latPad,
                maxLon: geo.bbox.maxLon + lonPad,
                maxLat: geo.bbox.maxLat + latPad,
              },
              bbox,
              viewport
            ),
          },
        ]
      }),
    [model, bbox, viewport]
  )

  const zoomedShape =
    view.level === 'county'
      ? shapes.find((s) => s.region.slug === view.slug) ?? null
      : null
  const zoom = zoomedShape
    ? zoomTransformFor(zoomedShape.zoomRect, viewport)
    : {scale: 1, tx: 0, ty: 0}

  const focused = zoomedShape?.region ?? selected

  // Unzoom is always one gesture away: Escape, the backdrop, the Back
  // button, or clicking the zoomed county again.
  useEffect(() => {
    if (view.level !== 'county') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setView({level: 'district'})
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view.level])

  return (
    <div className="map2">
      {view.level === 'county' && zoomedShape ? (
        <button
          type="button"
          className="map2-back"
          onClick={() => setView({level: 'district'})}
        >
          ← Back to the district
        </button>
      ) : null}
      <svg
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        role="group"
        aria-label="Senate District 48 county map"
        className="map2-svg"
      >
        {view.level === 'county' ? (
          <rect
            x={0}
            y={0}
            width={viewport.width}
            height={viewport.height}
            className="map2-backdrop"
            aria-label="Zoom back out to the district"
            role="button"
            onClick={() => setView({level: 'district'})}
          />
        ) : null}
        <g
          className="map2-zoom"
          style={{
            transform: `translate(${zoom.tx}px, ${zoom.ty}px) scale(${zoom.scale})`,
          }}
        >
          {shapes.map(({region, path, label}) => {
            const isZoomed = view.level === 'county' && view.slug === region.slug
            const isSelected = focused?.slug === region.slug
            const cls = [
              'map2-county',
              region.status === 'live' ? 'map2-live' : 'map2-soon',
              isSelected ? 'map2-selected' : '',
              view.level === 'county' && !isZoomed ? 'map2-dim' : '',
            ].join(' ')
            return (
              <g
                key={region.slug}
                className={cls}
                onMouseEnter={() => view.level === 'district' && setSelected(region)}
              >
                <path
                  d={path}
                  className="map2-shape"
                  vectorEffect="non-scaling-stroke"
                  role="button"
                  tabIndex={0}
                  aria-label={
                    isZoomed
                      ? `${region.name} County: zoom back out`
                      : `${region.name} County: zoom in`
                  }
                  onFocus={() => view.level === 'district' && setSelected(region)}
                  onClick={() =>
                    setView(
                      isZoomed
                        ? {level: 'district'}
                        : {level: 'county', slug: region.slug}
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setView(
                        isZoomed
                          ? {level: 'district'}
                          : {level: 'county', slug: region.slug}
                      )
                    }
                  }}
                />
                {view.level === 'district' ? (
                  /* Plain SVG <a>, not Next Link: HTML components inside the
                   * SVG namespace break hydration and kill every handler. */
                  <a
                    href={newsHrefForPlace(`${region.name} County`)}
                    aria-label={`${region.name} County news`}
                    className="map2-label-link"
                  >
                    <text x={label[0]} y={label[1]} className="map2-label">
                      {region.name}
                    </text>
                  </a>
                ) : null}
              </g>
            )
          })}
          {zoomedShape ? (
            /* Township underlay: civil townships tile the whole county, so
             * the zoomed view reads as filled even where no incorporated
             * place exists. Boundaries only; city labels stay the focus. */
            <g className="map2-township">
              {zoomedShape.geo.townships.map((township) => (
                <path
                  key={township.name}
                  vectorEffect="non-scaling-stroke"
                  d={ringsToPath(
                    township.rings.map((r) => ({
                      points: r.coordinates as Array<[number, number]>,
                    })),
                    bbox,
                    viewport
                  )}
                />
              ))}
            </g>
          ) : null}
          {zoomedShape
            ? district48Cities
                .filter((city) => city.county === zoomedShape.region.name)
                .map((city) => {
                  /* Two smoothing passes quadruple the rendered points and
                   * soften TIGER's parcel-staircase corners; townships below
                   * stay unsmoothed so survey-grid lines keep true corners. */
                  const rings = city.rings.map((points) => ({
                    points: chaikinSmooth(points, 2),
                  }))
                  const [cx, cy] = project(polygonCentroid(rings), bbox, viewport)
                  const plan = labelPlan.get(`${city.name}|${city.county}`)
                  /* Every town gets a label; unplanned ones stay hidden until
                   * the town is hovered, so any boundary can be identified. */
                  const label = (
                    <text
                      x={cx}
                      y={cy}
                      className={`map2-city-label ${plan?.labeled ? '' : 'map2-city-label-hover'}`}
                      style={{fontSize: `${13 / zoom.scale}px`}}
                    >
                      {city.name}
                    </text>
                  )
                  const outline = (
                    <path
                      d={ringsToPath(rings, bbox, viewport)}
                      vectorEffect="non-scaling-stroke"
                    />
                  )
                  const cls = [
                    'map2-city',
                    city.kind === 'cdp' ? 'map2-city-cdp' : '',
                    plan?.clickable ? 'map2-city-live' : '',
                  ].join(' ')
                  return (
                    <g key={city.name} className={cls}>
                      {plan?.clickable ? (
                        /* Whole town (shape + name) is one link when it has
                         * news; plain SVG <a>, same hydration trap as above. */
                        <a
                          href={newsHrefForPlace(city.name)}
                          aria-label={`${city.name} news`}
                          className="map2-label-link"
                        >
                          {outline}
                          {label}
                        </a>
                      ) : (
                        /* No news yet: clicking falls through to the same
                         * unzoom gesture as the rest of the county. */
                        <g onClick={() => setView({level: 'district'})}>
                          {outline}
                          {label}
                        </g>
                      )}
                    </g>
                  )
                })
            : null}
        </g>
      </svg>

      <div className="map2-panel" aria-live="polite">
        {focused ? (
          <>
            <h3 className="map2-panel-title">
              <Link href={newsHrefForPlace(`${focused.name} County`)}>
                {focused.name} County
              </Link>
            </h3>
            {focused.status === 'live' ? (
              <p>
                <Link href={focused.href!}>
                  Read what I am hearing in {focused.name} County
                </Link>
              </p>
            ) : (
              <p>
                The {focused.name} County page is being written now. Every county
                in this district gets one.
              </p>
            )}
            {focused.cities.length > 0 ? (
              <ul className="map2-cities">
                {focused.cities.map((c) => (
                  <li key={c.slug}>
                    <Link href={newsHrefForPlace(c.title)}>{c.title} news</Link>
                    {' · '}
                    <Link href={c.href}>page</Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="map2-panel-hint">
              {view.level === 'district'
                ? 'Click the county to zoom in; click its name for county news.'
                : 'County and city names link to news filtered to that place.'}
            </p>
          </>
        ) : (
          <p className="map2-panel-hint">
            Select a county to see its page and towns. Click a county to zoom in.
          </p>
        )}
      </div>
    </div>
  )
}
