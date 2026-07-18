import {describe, expect, it} from 'vitest'

import {
  buildMapModel,
  chaikinSmooth,
  newsHrefForPlace,
  planCityLabels,
  polygonCentroid,
  project,
  projectedRect,
  ringsToPath,
  slugForCountyName,
  viewportFor,
  zoomTransformFor,
} from './model'
import type {CityPageSummary, CountyPageSummary} from '../cms/types'

const county = (title: string, slug: string): CountyPageSummary => ({
  title,
  slug,
  townsLine: '',
  intro: '',
})

const city = (title: string, slug: string, countySlug: string): CityPageSummary => ({
  title,
  slug,
  countySlug,
  intro: '',
})

describe('slugForCountyName', () => {
  it('maps a bare county name to its route slug', () => {
    expect(slugForCountyName('Dubois')).toBe('dubois-county')
    expect(slugForCountyName('Crawford')).toBe('crawford-county')
  })
})

describe('buildMapModel', () => {
  it('always contains all six district counties in alphabetical order', () => {
    const model = buildMapModel({counties: [], cities: []})
    expect(model.regions.map((r) => r.name)).toEqual([
      'Crawford',
      'Dubois',
      'Gibson',
      'Perry',
      'Pike',
      'Spencer',
    ])
  })

  it('marks a county live with an href when its page is published', () => {
    const model = buildMapModel({
      counties: [county('Dubois County', 'dubois-county')],
      cities: [],
    })
    const dubois = model.regions.find((r) => r.name === 'Dubois')!
    expect(dubois.status).toBe('live')
    expect(dubois.href).toBe('/district/dubois-county')
    expect(dubois.ariaLabel).toBe('Dubois County: open the county page')
  })

  it('marks unpublished counties coming-soon with no href', () => {
    const model = buildMapModel({counties: [], cities: []})
    const perry = model.regions.find((r) => r.name === 'Perry')!
    expect(perry.status).toBe('coming-soon')
    expect(perry.href).toBeNull()
    expect(perry.ariaLabel).toBe('Perry County: page coming soon')
  })

  it('attaches cities only to live counties, sorted by title, with nested hrefs', () => {
    const model = buildMapModel({
      counties: [county('Pike County', 'pike-county')],
      cities: [
        city('Winslow', 'winslow', 'pike-county'),
        city('Petersburg', 'petersburg', 'pike-county'),
        city('Rockport', 'rockport', 'spencer-county'),
      ],
    })
    const pike = model.regions.find((r) => r.name === 'Pike')!
    expect(pike.cities.map((c) => c.title)).toEqual(['Petersburg', 'Winslow'])
    expect(pike.cities[0].href).toBe('/district/pike-county/petersburg')
    const spencer = model.regions.find((r) => r.name === 'Spencer')!
    expect(spencer.cities).toEqual([])
  })
})

describe('polygonCentroid', () => {
  it('returns the center of a square', () => {
    expect(
      polygonCentroid([{points: [[0, 0], [2, 0], [2, 2], [0, 2]]}])
    ).toEqual([1, 1])
  })

  it('weights multiple rings by area', () => {
    const [x, y] = polygonCentroid([
      {points: [[0, 0], [2, 0], [2, 2], [0, 2]]},
      {points: [[10, 10], [11, 10], [11, 11], [10, 11]]},
    ])
    expect(x).toBeCloseTo(2.9, 5)
    expect(y).toBeCloseTo(2.9, 5)
  })
})

describe('projectedRect', () => {
  it('projects a sub-bbox into viewport pixels with inverted latitude', () => {
    const mapBbox = {minLon: 0, minLat: 0, maxLon: 10, maxLat: 10}
    const viewport = {width: 100, height: 100}
    const rect = projectedRect(
      {minLon: 2, minLat: 2, maxLon: 6, maxLat: 4},
      mapBbox,
      viewport
    )
    expect(rect).toEqual({x: 20, y: 60, width: 40, height: 20})
  })
})

describe('zoomTransformFor', () => {
  it('scales the rect to fill the viewport and centers it', () => {
    const t = zoomTransformFor({x: 10, y: 20, width: 100, height: 50}, {width: 200, height: 100})
    expect(t.scale).toBe(2)
    expect(t.tx).toBe(-20)
    expect(t.ty).toBe(-40)
  })

  it('never scales below 1', () => {
    const t = zoomTransformFor({x: 0, y: 0, width: 400, height: 400}, {width: 200, height: 100})
    expect(t.scale).toBe(1)
  })
})

describe('planCityLabels', () => {
  const mk = (name: string, county: string, pop: number) => ({name, county, pop})
  const cities = [
    mk('Jasper', 'Dubois', 17000),
    mk('Huntingburg', 'Dubois', 6500),
    mk('Ferdinand', 'Dubois', 2300),
    mk('Holland', 'Dubois', 650),
    mk('Birdseye', 'Dubois', 400),
    mk('Ireland', 'Dubois', 500),
    mk('Duff', 'Dubois', 0),
  ]

  it('labels the top-5 by population per county, unclickable without news', () => {
    const plan = planCityLabels(cities, [])
    expect(plan.get('Jasper|Dubois')).toEqual({labeled: true, clickable: false})
    expect(plan.get('Ireland|Dubois')).toEqual({labeled: true, clickable: false})
    expect(plan.get('Birdseye|Dubois')).toEqual({labeled: false, clickable: false})
    expect(plan.get('Duff|Dubois')).toEqual({labeled: false, clickable: false})
  })

  it('a place with news is always labeled and clickable, even when small', () => {
    const plan = planCityLabels(cities, ['Birdseye'])
    expect(plan.get('Birdseye|Dubois')).toEqual({labeled: true, clickable: true})
  })

  it('matches news places across Saint/St. spelling', () => {
    const plan = planCityLabels([mk('Saint Anthony', 'Dubois', 100)], ['St. Anthony'])
    expect(plan.get('Saint Anthony|Dubois')).toEqual({labeled: true, clickable: true})
  })
})

describe('chaikinSmooth', () => {
  const square: Array<[number, number]> = [[0, 0], [4, 0], [4, 4], [0, 4]]

  it('doubles the point count per iteration on a closed ring', () => {
    expect(chaikinSmooth(square, 1)).toHaveLength(8)
    expect(chaikinSmooth(square, 2)).toHaveLength(16)
  })

  it('cuts each corner with points at 1/4 and 3/4 along every edge', () => {
    const smoothed = chaikinSmooth(square, 1)
    expect(smoothed).toContainEqual([1, 0])
    expect(smoothed).toContainEqual([3, 0])
    expect(smoothed).toContainEqual([4, 1])
    expect(smoothed).not.toContainEqual([4, 0])
  })

  it('leaves degenerate rings untouched', () => {
    const line: Array<[number, number]> = [[0, 0], [1, 1]]
    expect(chaikinSmooth(line, 1)).toEqual(line)
  })
})

describe('newsHrefForPlace', () => {
  it('builds a filtered news URL', () => {
    expect(newsHrefForPlace('Dubois County')).toBe('/news?place=Dubois%20County')
    expect(newsHrefForPlace('Tell City')).toBe('/news?place=Tell%20City')
  })
})

describe('viewportFor', () => {
  it('derives height from the ground aspect ratio at the equator', () => {
    const bbox = {minLon: 0, minLat: -0.5, maxLon: 2, maxLat: 0.5}
    expect(viewportFor(bbox, 800)).toEqual({width: 800, height: 400})
  })

  it('applies the cosine correction so northern maps are not stretched wide', () => {
    const bbox = {minLon: 0, minLat: 59.5, maxLon: 2, maxLat: 60.5}
    const viewport = viewportFor(bbox, 800)
    expect(viewport.width).toBe(800)
    expect(viewport.height).toBeCloseTo(800, 0)
  })
})

describe('project', () => {
  const bbox = {minLon: -88, minLat: 37, maxLon: -86, maxLat: 39}
  const viewport = {width: 200, height: 100}

  it('maps the bounding box corners onto the viewport with latitude inverted', () => {
    expect(project([-88, 37], bbox, viewport)).toEqual([0, 100])
    expect(project([-86, 39], bbox, viewport)).toEqual([200, 0])
    expect(project([-87, 38], bbox, viewport)).toEqual([100, 50])
  })
})

describe('ringsToPath', () => {
  it('renders rings as closed SVG subpaths', () => {
    const bbox = {minLon: -88, minLat: 37, maxLon: -86, maxLat: 39}
    const viewport = {width: 200, height: 100}
    const path = ringsToPath(
      [{points: [[-88, 37], [-86, 37], [-86, 39]]}],
      bbox,
      viewport
    )
    expect(path).toBe('M0,100 L200,100 L200,0 Z')
  })
})
