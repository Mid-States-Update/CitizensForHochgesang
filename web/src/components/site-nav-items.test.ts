import {describe, expect, it} from 'vitest'

import {normalizeNavItems} from './site-nav-items'

describe('normalizeNavItems', () => {
  it('inserts Our District right after News when missing', () => {
    const items = normalizeNavItems([
      {href: '/news', label: 'News'},
      {href: '/events', label: 'Events'},
      {href: '/platform', label: 'About & Priorities'},
    ])
    expect(items.map((i) => i.href)).toEqual(['/news', '/district', '/events', '/platform'])
    const district = items.find((i) => i.href === '/district')!
    expect(district.label).toBe('Our District')
  })

  it('puts Our District first when there is no News item', () => {
    const items = normalizeNavItems([{href: '/support', label: 'Support'}])
    expect(items[0].href).toBe('/district')
  })

  it('does not duplicate an existing district item', () => {
    const items = normalizeNavItems([
      {href: '/news', label: 'News'},
      {href: '/district', label: 'District', icon: 'map-marked-alt'},
    ])
    expect(items.filter((i) => i.href === '/district')).toHaveLength(1)
    expect(items.find((i) => i.href === '/district')!.label).toBe('District')
  })

  it('merges /press into /media without duplicates', () => {
    const items = normalizeNavItems([
      {href: '/press', label: 'Press'},
      {href: '/media', label: 'Media'},
    ])
    expect(items.filter((i) => i.href === '/media')).toHaveLength(1)
  })

  it('ensures About & Priorities after Events when missing', () => {
    const items = normalizeNavItems([
      {href: '/news', label: 'News'},
      {href: '/events', label: 'Events'},
    ])
    const hrefs = items.map((i) => i.href)
    expect(hrefs.indexOf('/platform')).toBe(hrefs.indexOf('/events') + 1)
  })
})
