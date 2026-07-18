import {describe, expect, it} from 'vitest'

import {canonicalGeoTag, geoTagsIn, isGeoTag} from './geo-tags'

describe('isGeoTag', () => {
  it('recognizes county tags case-insensitively', () => {
    expect(isGeoTag('Dubois County')).toBe(true)
    expect(isGeoTag('dubois county')).toBe(true)
    expect(isGeoTag('Corridor')).toBe(false)
  })

  it('recognizes district towns', () => {
    expect(isGeoTag('Jasper')).toBe(true)
    expect(isGeoTag('Tell City')).toBe(true)
    expect(isGeoTag('Indianapolis')).toBe(false)
  })

  it('recognizes every place on the district map, including small CDPs', () => {
    expect(isGeoTag('Celestine')).toBe(true)
    expect(isGeoTag('Schnellville')).toBe(true)
    expect(isGeoTag('Leopold')).toBe(true)
    expect(isGeoTag('Mariah Hill')).toBe(true)
  })

  it('distinguishes the town of Dubois from Dubois County', () => {
    expect(canonicalGeoTag('dubois')).toBe('Dubois')
    expect(canonicalGeoTag('dubois county')).toBe('Dubois County')
    const result = geoTagsIn(['Dubois'])
    expect(result.counties).toEqual([])
    expect(result.cities).toEqual(['Dubois'])
  })
})

describe('canonicalGeoTag', () => {
  it('normalizes casing to the display form', () => {
    expect(canonicalGeoTag('dubois county')).toBe('Dubois County')
    expect(canonicalGeoTag('tell city')).toBe('Tell City')
    expect(canonicalGeoTag('nonsense')).toBeNull()
  })
})

describe('geoTagsIn', () => {
  it('splits present tags into counties and cities, deduped, in canonical order', () => {
    const result = geoTagsIn([
      'corridor',
      'Jasper',
      'dubois county',
      'Perry County',
      'jasper',
      'Rockport',
    ])
    expect(result.counties).toEqual(['Dubois County', 'Perry County'])
    expect(result.cities).toEqual(['Jasper', 'Rockport'])
  })

  it('returns empty arrays when nothing geographic is tagged', () => {
    expect(geoTagsIn(['polls', 'corridor'])).toEqual({counties: [], cities: []})
  })
})
