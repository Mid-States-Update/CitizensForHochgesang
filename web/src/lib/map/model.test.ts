import {describe, expect, it} from 'vitest'

import {
  buildMapModel,
  project,
  ringsToPath,
  slugForCountyName,
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
