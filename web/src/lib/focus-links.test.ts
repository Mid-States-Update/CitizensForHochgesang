import {describe, expect, it} from 'vitest'

import {priorityHrefForFocusItem} from './focus-links'

// Mirrors the live Sanity data: homePageSettings.focusItems strings vs
// aboutPriorities priority titles/slugs.
const PRIORITIES = [
  {slug: 'property-taxes', title: 'Property Taxes & Rural Services'},
  {slug: 'data-centers', title: 'Data Centers & Your Electric Bill'},
  {slug: 'infrastructure', title: 'Infrastructure Done Right'},
  {slug: 'housing', title: 'Housing Families Can Afford'},
  {slug: 'jobs', title: 'Jobs & Small Business'},
  {slug: 'accountability', title: 'Government Accountability & Transparency'},
  {slug: 'workers', title: 'Standing with Workers'},
]

describe('priorityHrefForFocusItem', () => {
  it('matches exact-title focus items', () => {
    expect(priorityHrefForFocusItem('Property taxes & rural services', PRIORITIES)).toBe('/platform/property-taxes')
    expect(priorityHrefForFocusItem('Data centers & your electric bill', PRIORITIES)).toBe('/platform/data-centers')
    expect(priorityHrefForFocusItem('Housing families can afford', PRIORITIES)).toBe('/platform/housing')
  })

  it('matches focus items that extend the title with a tagline', () => {
    expect(priorityHrefForFocusItem('Infrastructure done right: roads, bridges, broadband', PRIORITIES)).toBe(
      '/platform/infrastructure'
    )
    expect(priorityHrefForFocusItem('Jobs & small business: keeping young people here', PRIORITIES)).toBe(
      '/platform/jobs'
    )
    expect(priorityHrefForFocusItem('Accountability: every vote published and explained', PRIORITIES)).toBe(
      '/platform/accountability'
    )
  })

  it('falls back to the platform index when nothing matches', () => {
    expect(priorityHrefForFocusItem('Public school funding', PRIORITIES)).toBe('/platform')
  })

  it('falls back when the priorities list is empty', () => {
    expect(priorityHrefForFocusItem('Property taxes & rural services', [])).toBe('/platform')
  })

  it('ignores stopword-only overlap', () => {
    // Shares only "your"/"can"-class words with real priorities
    expect(priorityHrefForFocusItem('Your voice can count', PRIORITIES)).toBe('/platform')
  })
})
