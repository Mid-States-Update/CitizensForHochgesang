import {vi, describe, it, expect, beforeEach} from 'vitest'

// Replace the real sanityQuery (which calls the Sanity HTTP API) with a
// controllable mock so tests run offline without network calls.
vi.mock('./client', () => ({
  sanityQuery: vi.fn(),
}))

import {sanityQuery} from './client'
import {getCountyPages, getCountyPageBySlug, getCityPages, getCityPageBySlug} from './repository'

const mockQuery = vi.mocked(sanityQuery)

beforeEach(() => {
  mockQuery.mockReset()
})

const pikeSummary = {
  title: 'Pike County',
  slug: 'pike-county',
  townsLine: 'Petersburg · Winslow · Otwell',
  intro: 'Pike County kept the lights on for Indianapolis for a hundred years.',
}

const pikeDetail = {
  ...pikeSummary,
  heroImageUrl: null,
  heroImageAlt: null,
  ledeTitle: 'The data center question',
  ledeBody: [{_type: 'block', _key: 'b1', children: [{_type: 'span', _key: 's1', text: 'Lede.'}]}],
  issueCards: [
    {
      title: 'Data centers with no zoning',
      tag: 'listening',
      body: [{_type: 'block', _key: 'b2', children: [{_type: 'span', _key: 's2', text: 'Card.'}]}],
      platformSlug: null,
      sources: [{label: 'Press-Dispatch', url: 'https://example.com'}],
    },
  ],
  listeningPrompt: 'What am I missing?',
  localOutlets: [{name: 'The Press-Dispatch', url: 'https://example.com'}],
  lastUpdated: '2026-07-17',
}

describe('getCountyPages', () => {
  it('returns an empty list when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    expect(await getCountyPages()).toEqual([])
  })

  it('returns county summaries when sanityQuery returns rows', async () => {
    mockQuery.mockResolvedValueOnce([pikeSummary])
    const counties = await getCountyPages()
    expect(counties).toHaveLength(1)
    expect(counties[0].slug).toBe('pike-county')
    expect(counties[0].townsLine).toContain('Petersburg')
  })
})

describe('getCountyPageBySlug', () => {
  it('returns null when the county is not found', async () => {
    mockQuery.mockResolvedValueOnce(null)
    expect(await getCountyPageBySlug('nowhere-county')).toBeNull()
  })

  it('returns the full county page and normalizes missing arrays', async () => {
    mockQuery.mockResolvedValueOnce({...pikeDetail, localOutlets: null})
    const county = await getCountyPageBySlug('pike-county')
    expect(county).not.toBeNull()
    expect(county?.ledeTitle).toBe('The data center question')
    expect(county?.issueCards).toHaveLength(1)
    expect(county?.issueCards[0].tag).toBe('listening')
    expect(county?.issueCards[0].sources).toHaveLength(1)
    // Missing optional arrays come back as empty arrays, never null
    expect(county?.localOutlets).toEqual([])
  })

  it('normalizes missing card sources to an empty array', async () => {
    mockQuery.mockResolvedValueOnce({
      ...pikeDetail,
      issueCards: [{...pikeDetail.issueCards[0], sources: null}],
    })
    const county = await getCountyPageBySlug('pike-county')
    expect(county?.issueCards[0].sources).toEqual([])
  })
})

const jasperSummary = {
  title: 'Jasper',
  slug: 'jasper',
  countySlug: 'dubois-county',
  intro: 'The county seat and the campaign home base.',
}

describe('getCityPages', () => {
  it('returns an empty list when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    expect(await getCityPages()).toEqual([])
  })

  it('passes the county filter through and returns summaries', async () => {
    mockQuery.mockResolvedValueOnce([jasperSummary])
    const cities = await getCityPages('dubois-county')
    expect(cities).toHaveLength(1)
    expect(cities[0].countySlug).toBe('dubois-county')
    // The GROQ params must carry the county filter
    expect(mockQuery.mock.calls[0][1]).toMatchObject({county: 'dubois-county'})
  })
})

describe('getCityPageBySlug', () => {
  it('returns null when not found', async () => {
    mockQuery.mockResolvedValueOnce(null)
    expect(await getCityPageBySlug('dubois-county', 'nowhere')).toBeNull()
  })

  it('returns the full city page and normalizes missing arrays', async () => {
    mockQuery.mockResolvedValueOnce({
      ...jasperSummary,
      heroImageUrl: null,
      heroImageAlt: null,
      ledeTitle: 'Lede',
      ledeBody: [{_type: 'block', _key: 'b1', children: [{_type: 'span', _key: 's1', text: 'Lede.'}]}],
      issueCards: [
        {
          title: 'An issue',
          tag: 'radar',
          body: [{_type: 'block', _key: 'b2', children: [{_type: 'span', _key: 's2', text: 'Card.'}]}],
          platformSlug: null,
          sources: null,
        },
      ],
      listeningPrompt: 'What am I missing?',
      lastUpdated: '2026-07-17',
    })
    const city = await getCityPageBySlug('dubois-county', 'jasper')
    expect(city).not.toBeNull()
    expect(city?.issueCards[0].sources).toEqual([])
    expect(city?.countySlug).toBe('dubois-county')
  })
})
