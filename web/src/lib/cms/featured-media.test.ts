import {describe, expect, it} from 'vitest'

import {pickFeaturedMedia} from './featured-media'
import type {MediaLink} from './types'

function link(overrides: Partial<MediaLink>): MediaLink {
  return {
    id: overrides.id ?? 'link',
    title: 'A link',
    mediaType: 'facebook',
    url: 'https://example.com',
    ...overrides,
  } as MediaLink
}

describe('pickFeaturedMedia', () => {
  it('features the highlighted link with the most views, not the newest', () => {
    const links = [
      link({id: 'recent', thumbnailUrl: 'https://cdn/a.jpg', highlight: true, highlightNote: '98 reactions · 14 shares'}),
      link({id: 'big', thumbnailUrl: 'https://cdn/b.jpg', highlight: true, highlightNote: '84K+ views'}),
      link({id: 'mid', thumbnailUrl: 'https://cdn/c.jpg', highlight: true, highlightNote: '23K views'}),
    ]

    expect(pickFeaturedMedia(links)?.id).toBe('big')
  })

  it('falls back to the first link with a thumbnail when nothing is highlighted', () => {
    const links = [
      link({id: 'no-thumb'}),
      link({id: 'thumb', thumbnailUrl: 'https://cdn/a.jpg'}),
    ]

    expect(pickFeaturedMedia(links)?.id).toBe('thumb')
  })

  it('falls back to the first link when nothing has a thumbnail', () => {
    expect(pickFeaturedMedia([link({id: 'only'})])?.id).toBe('only')
  })

  it('returns undefined for an empty list', () => {
    expect(pickFeaturedMedia([])).toBeUndefined()
  })
})
