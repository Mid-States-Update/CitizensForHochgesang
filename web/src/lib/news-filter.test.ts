import {describe, expect, it} from 'vitest'

import {categoryForTag, initialSelectedTag, isPlaceTag, postMatchesQuery} from './news-filter'

describe('categoryForTag', () => {
  const geo = {counties: ['Dubois County', 'Gibson County'], cities: ['Jasper', 'Tell City']}

  it('sorts counties, towns, and topics into their categories', () => {
    expect(categoryForTag('Dubois County', geo)).toBe('counties')
    expect(categoryForTag('Jasper', geo)).toBe('towns')
    expect(categoryForTag('mid-states-corridor', geo)).toBe('topics')
  })

  it('matches place names case-insensitively', () => {
    expect(categoryForTag('gibson county', geo)).toBe('counties')
    expect(categoryForTag('tell city', geo)).toBe('towns')
  })

  it('defaults to topics for null or unknown tags', () => {
    expect(categoryForTag(null, geo)).toBe('topics')
    expect(categoryForTag('Narnia', geo)).toBe('topics')
  })
})

describe('isPlaceTag', () => {
  it('recognizes canonical county and town tags', () => {
    expect(isPlaceTag('Dubois County')).toBe(true)
    expect(isPlaceTag('Jasper')).toBe(true)
  })

  it('recognizes lowercase and hyphenated variants still used on older posts', () => {
    expect(isPlaceTag('dubois-county')).toBe(true)
    expect(isPlaceTag('gibson county')).toBe(true)
  })

  it('leaves topical tags alone', () => {
    expect(isPlaceTag('mid-states-corridor')).toBe(false)
    expect(isPlaceTag('district 48')).toBe(false)
    expect(isPlaceTag('accountability')).toBe(false)
  })
})

describe('postMatchesQuery', () => {
  const post = {
    title: 'Three Counties, Zero Hospitals',
    excerpt: 'Rural healthcare access in District 48',
    bodyPreview: 'Crawford, Pike, and Spencer counties have no hospital.',
    tags: ['healthcare', 'rural hospitals'],
  }

  it('matches on title, case-insensitively', () => {
    expect(postMatchesQuery(post, 'zero hospitals')).toBe(true)
  })

  it('matches on excerpt and body preview', () => {
    expect(postMatchesQuery(post, 'healthcare access')).toBe(true)
    expect(postMatchesQuery(post, 'spencer counties')).toBe(true)
  })

  it('matches on tags', () => {
    expect(postMatchesQuery(post, 'rural hosp')).toBe(true)
  })

  it('rejects non-matching queries', () => {
    expect(postMatchesQuery(post, 'data centers')).toBe(false)
  })

  it('treats an empty or whitespace query as match-all', () => {
    expect(postMatchesQuery(post, '')).toBe(true)
    expect(postMatchesQuery(post, '   ')).toBe(true)
  })
})

describe('initialSelectedTag', () => {
  const allTags = ['mid-states-corridor', 'Dubois County', 'healthcare', 'Jasper']

  it('prefers the canonical place from ?place=', () => {
    expect(initialSelectedTag('dubois county', null, allTags)).toBe('Dubois County')
  })

  it('falls back to an existing tag for non-canonical ?place=', () => {
    expect(initialSelectedTag('healthcare', null, allTags)).toBe('healthcare')
  })

  it('resolves ?tag= against existing tags case-insensitively', () => {
    expect(initialSelectedTag(null, 'MID-STATES-CORRIDOR', allTags)).toBe('mid-states-corridor')
  })

  it('canonicalizes a place passed via ?tag=', () => {
    expect(initialSelectedTag(null, 'jasper', allTags)).toBe('Jasper')
  })

  it('ignores junk in both params', () => {
    expect(initialSelectedTag('narnia', 'not-a-tag', allTags)).toBeNull()
    expect(initialSelectedTag(null, null, allTags)).toBeNull()
  })
})
