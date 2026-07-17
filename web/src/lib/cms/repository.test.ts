import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Replace the real sanityQuery (which calls the Sanity HTTP API) with a
// controllable mock so tests run offline without network calls.
vi.mock('./client', () => ({
  sanityQuery: vi.fn(),
}))

// Mock next/navigation so assertPageEnabled can call notFound() without crashing
const mockNotFound = vi.fn(() => { throw new Error('NEXT_NOT_FOUND') })
vi.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}))

import { sanityQuery } from './client'
import {
  getAllPosts,
  getRecentPosts,
  getPostBySlug,
  getUpcomingEvents,
  getAllEvents,
  getMediaLinks,
  getFundraisingLinks,
  getSiteSettings,
  getHomePageSettings,
  getAboutPriorities,
  getPageVisualSettings,
  assertPageEnabled,
} from './repository'
import {
  mockPosts,
  mockEvents,
  mockMediaLinks,
  mockFundraisingLinks,
  mockSiteSettings,
  mockHomePageSettings,
  mockAboutPriorities,
} from './mockData'
import { getDefaultPageVisual } from './page-visuals'

const mockQuery = vi.mocked(sanityQuery)

beforeEach(() => {
  // Clear call history and return-value queue so tests don't interfere with each other
  mockQuery.mockReset()
  // This suite exercises the design-mode mock fallbacks, which are opt-in.
  // Default (production) behavior is covered by repository.mock-gating.test.ts.
  vi.stubEnv('NEXT_PUBLIC_CMS_MOCKS', 'true')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

// ---------------------------------------------------------------------------
// getAllPosts
// ---------------------------------------------------------------------------
describe('getAllPosts', () => {
  it('returns sorted mock posts when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const posts = await getAllPosts()
    expect(posts.length).toBe(mockPosts.length)
    // Verify descending date order
    for (let i = 0; i < posts.length - 1; i++) {
      expect(Date.parse(posts[i].publishedAt)).toBeGreaterThanOrEqual(Date.parse(posts[i + 1].publishedAt))
    }
  })

  it('returns sorted mock posts when sanityQuery returns an empty array', async () => {
    mockQuery.mockResolvedValueOnce([])
    const posts = await getAllPosts()
    expect(posts.length).toBe(mockPosts.length)
  })

  it('returns the posts from sanityQuery when results are non-empty', async () => {
    const livePosts = [
      { title: 'Live post', slug: 'live-post', publishedAt: '2026-03-01T00:00:00Z', tags: [] },
    ]
    mockQuery.mockResolvedValueOnce(livePosts)
    const posts = await getAllPosts()
    expect(posts).toEqual(livePosts)
  })
})

// ---------------------------------------------------------------------------
// getRecentPosts
// ---------------------------------------------------------------------------
describe('getRecentPosts', () => {
  beforeEach(() => {
    // Return null so the fallback path (mockPosts) is used — gives a predictable,
    // stable list regardless of live Sanity content
    mockQuery.mockResolvedValue(null)
  })

  it('returns at most 3 posts by default', async () => {
    const posts = await getRecentPosts()
    expect(posts.length).toBeLessThanOrEqual(3)
    expect(posts.length).toBe(3)
  })

  it('returns at most `limit` posts when a custom limit is provided', async () => {
    const posts = await getRecentPosts(2)
    expect(posts.length).toBe(2)
  })

  it('returns an empty array when limit is 0', async () => {
    const posts = await getRecentPosts(0)
    expect(posts).toEqual([])
  })

  it('returns all available posts when limit exceeds available count', async () => {
    const posts = await getRecentPosts(999)
    expect(posts.length).toBe(mockPosts.length)
  })
})

// ---------------------------------------------------------------------------
// getPostBySlug
// ---------------------------------------------------------------------------
describe('getPostBySlug', () => {
  it('returns the post from sanityQuery when found', async () => {
    const livePost = { title: 'Live', slug: 'live', publishedAt: '2026-01-01T00:00:00Z', tags: [], body: [] }
    mockQuery.mockResolvedValueOnce(livePost)
    const result = await getPostBySlug('live')
    expect(result).toEqual(livePost)
  })

  it('returns the matching mock post when sanityQuery returns null and slug exists in mocks', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const result = await getPostBySlug(mockPosts[0].slug)
    expect(result?.slug).toBe(mockPosts[0].slug)
  })

  it('returns null when sanityQuery returns null and slug does not exist in mocks', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const result = await getPostBySlug('nonexistent-slug-xyz')
    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// getUpcomingEvents — also tests sortByDateAsc indirectly
// ---------------------------------------------------------------------------
// Note: the GROQ filter `coalesce(endDate, startDate) > now()` is evaluated
// server-side by Sanity and cannot be tested against a mock. The tests below
// verify the client-side normalisation and sort behaviour only.
describe('getUpcomingEvents', () => {
  it('returns sorted mock events when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const events = await getUpcomingEvents()
    expect(events.length).toBe(mockEvents.length)
    // Verify ascending date order
    for (let i = 0; i < events.length - 1; i++) {
      expect(Date.parse(events[i].startDate)).toBeLessThanOrEqual(Date.parse(events[i + 1].startDate))
    }
  })

  it('returns sorted mock events when sanityQuery returns an empty array', async () => {
    mockQuery.mockResolvedValueOnce([])
    const events = await getUpcomingEvents()
    expect(events.length).toBe(mockEvents.length)
  })

  it('maps _id to id when sanityQuery returns events', async () => {
    const rawEvents = [
      { _id: 'event-1', title: 'Event 1', slug: 'event-1', startDate: '2026-05-01T10:00:00Z', location: 'Hall A', tags: [] },
      { _id: 'event-2', title: 'Event 2', slug: 'event-2', startDate: '2026-04-01T10:00:00Z', location: 'Hall B', tags: [] },
    ]
    mockQuery.mockResolvedValueOnce(rawEvents)
    const events = await getUpcomingEvents()
    // After ascending sort, the earlier date (event-2) should be first
    expect(events[0].id).toBe('event-2') // earliest date first
    expect(events[1].id).toBe('event-1')
    // The Sanity _id field must be stripped from the normalized result
    expect('_id' in events[0]).toBe(false)
  })

  it('sorts live events by startDate ascending', async () => {
    const rawEvents = [
      { _id: 'e1', title: 'Later', slug: 'later', startDate: '2026-06-01T00:00:00Z', location: 'X', tags: [] },
      { _id: 'e2', title: 'Earlier', slug: 'earlier', startDate: '2026-03-01T00:00:00Z', location: 'Y', tags: [] },
    ]
    mockQuery.mockResolvedValueOnce(rawEvents)
    const events = await getUpcomingEvents()
    expect(events[0].title).toBe('Earlier')
    expect(events[1].title).toBe('Later')
  })
})

// ---------------------------------------------------------------------------
// getAllEvents — returns past AND upcoming events (no date filter)
// ---------------------------------------------------------------------------
describe('getAllEvents', () => {
  it('returns sorted mock events when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const events = await getAllEvents()
    expect(events.length).toBe(mockEvents.length)
    for (let i = 0; i < events.length - 1; i++) {
      expect(Date.parse(events[i].startDate)).toBeLessThanOrEqual(Date.parse(events[i + 1].startDate))
    }
  })

  it('returns sorted mock events when sanityQuery returns an empty array', async () => {
    mockQuery.mockResolvedValueOnce([])
    const events = await getAllEvents()
    expect(events.length).toBe(mockEvents.length)
  })

  it('maps _id to id and strips _id from the result', async () => {
    const rawEvents = [
      { _id: 'past-event', title: 'Past Event', slug: 'past', startDate: '2020-01-01T00:00:00Z', location: 'Town Hall', tags: [] },
    ]
    mockQuery.mockResolvedValueOnce(rawEvents)
    const events = await getAllEvents()
    expect(events[0].id).toBe('past-event')
    expect('_id' in events[0]).toBe(false)
  })

  it('includes past-dated events (no server-side date filter applied client-side)', async () => {
    const rawEvents = [
      { _id: 'e-past', title: 'Old Town Hall', slug: 'old', startDate: '2020-06-01T00:00:00Z', location: 'X', tags: [] },
      { _id: 'e-future', title: 'Upcoming Rally', slug: 'new', startDate: '2099-06-01T00:00:00Z', location: 'Y', tags: [] },
    ]
    mockQuery.mockResolvedValueOnce(rawEvents)
    const events = await getAllEvents()
    expect(events).toHaveLength(2)
    expect(events[0].id).toBe('e-past')   // earliest first
    expect(events[1].id).toBe('e-future')
  })

  it('sorts live events by startDate ascending', async () => {
    const rawEvents = [
      { _id: 'e1', title: 'Later', slug: 'later', startDate: '2026-06-01T00:00:00Z', location: 'X', tags: [] },
      { _id: 'e2', title: 'Earlier', slug: 'earlier', startDate: '2020-03-01T00:00:00Z', location: 'Y', tags: [] },
    ]
    mockQuery.mockResolvedValueOnce(rawEvents)
    const events = await getAllEvents()
    expect(events[0].title).toBe('Earlier')
    expect(events[1].title).toBe('Later')
  })
})

// ---------------------------------------------------------------------------
// getMediaLinks — also tests sortByDateDesc with live data
// ---------------------------------------------------------------------------
describe('getMediaLinks', () => {
  it('returns sorted mock media when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const media = await getMediaLinks()
    expect(media.length).toBe(mockMediaLinks.length)
  })

  it('returns sorted mock media when sanityQuery returns an empty array', async () => {
    mockQuery.mockResolvedValueOnce([])
    const media = await getMediaLinks()
    expect(media.length).toBe(mockMediaLinks.length)
  })

  it('maps _id to id when sanityQuery returns media links', async () => {
    const rawMedia = [
      { _id: 'media-1', title: 'Video 1', mediaType: 'youtube', url: 'https://youtube.com/1', publishedAt: '2026-01-01T00:00:00Z' },
    ]
    mockQuery.mockResolvedValueOnce(rawMedia)
    const media = await getMediaLinks()
    expect(media[0].id).toBe('media-1')
    expect('_id' in media[0]).toBe(false)
  })

  it('sorts live media by publishedAt descending', async () => {
    const rawMedia = [
      { _id: 'm1', title: 'Older', mediaType: 'youtube', url: 'https://y.com/1', publishedAt: '2026-01-01T00:00:00Z' },
      { _id: 'm2', title: 'Newer', mediaType: 'youtube', url: 'https://y.com/2', publishedAt: '2026-03-01T00:00:00Z' },
    ]
    mockQuery.mockResolvedValueOnce(rawMedia)
    const media = await getMediaLinks()
    expect(media[0].title).toBe('Newer')
    expect(media[1].title).toBe('Older')
  })

  it('applies limit when provided', async () => {
    mockQuery.mockResolvedValueOnce(null) // triggers fallback to mock data (2 items)
    const media = await getMediaLinks(1)
    expect(media.length).toBe(1)
  })

  it('returns all items when no limit is provided', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const media = await getMediaLinks()
    expect(media.length).toBe(mockMediaLinks.length)
  })
})

// ---------------------------------------------------------------------------
// getFundraisingLinks
// ---------------------------------------------------------------------------
describe('getFundraisingLinks', () => {
  it('returns sorted mock links when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const links = await getFundraisingLinks()
    expect(links.length).toBe(mockFundraisingLinks.length)
  })

  it('returns sorted mock links when sanityQuery returns an empty array', async () => {
    mockQuery.mockResolvedValueOnce([])
    const links = await getFundraisingLinks()
    expect(links.length).toBe(mockFundraisingLinks.length)
  })

  it('maps _id to id when sanityQuery returns links', async () => {
    const rawLinks = [
      { _id: 'fund-1', title: 'Donate', url: 'https://actblue.com', priority: 100 },
    ]
    mockQuery.mockResolvedValueOnce(rawLinks)
    const links = await getFundraisingLinks()
    expect(links[0].id).toBe('fund-1')
    expect('_id' in links[0]).toBe(false)
  })

  it('sorts live links by priority descending', async () => {
    const rawLinks = [
      { _id: 'f1', title: 'Low', url: 'https://a.com', priority: 10 },
      { _id: 'f2', title: 'High', url: 'https://b.com', priority: 90 },
      { _id: 'f3', title: 'Mid', url: 'https://c.com', priority: 50 },
    ]
    mockQuery.mockResolvedValueOnce(rawLinks)
    const links = await getFundraisingLinks()
    expect(links[0].title).toBe('High')
    expect(links[1].title).toBe('Mid')
    expect(links[2].title).toBe('Low')
  })

  it('sorts mock fallback links by priority descending', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const links = await getFundraisingLinks()
    for (let i = 0; i < links.length - 1; i++) {
      expect(links[i].priority).toBeGreaterThanOrEqual(links[i + 1].priority)
    }
  })
})

// ---------------------------------------------------------------------------
// getSiteSettings
// ---------------------------------------------------------------------------
describe('getSiteSettings', () => {
  it('returns mockSiteSettings when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const settings = await getSiteSettings()
    expect(settings).toEqual(mockSiteSettings)
  })

  it('merges live settings over mock defaults', async () => {
    const liveSettings = {
      ...mockSiteSettings,
      siteTitle: 'Custom Title',
      tagline: 'Custom tagline',
    }
    mockQuery.mockResolvedValueOnce(liveSettings)
    const settings = await getSiteSettings()
    expect(settings.siteTitle).toBe('Custom Title')
    expect(settings.tagline).toBe('Custom tagline')
  })

  it('falls back to mock socialLinks when live settings return empty array', async () => {
    const liveSettings = { ...mockSiteSettings, socialLinks: [] }
    mockQuery.mockResolvedValueOnce(liveSettings)
    const settings = await getSiteSettings()
    expect(settings.socialLinks).toEqual(mockSiteSettings.socialLinks)
  })

  it('uses live socialLinks when they are non-empty', async () => {
    const liveLinks = [{ label: 'Twitter', url: 'https://twitter.com' }]
    const liveSettings = { ...mockSiteSettings, socialLinks: liveLinks }
    mockQuery.mockResolvedValueOnce(liveSettings)
    const settings = await getSiteSettings()
    expect(settings.socialLinks).toEqual(liveLinks)
  })

  it('falls back to mock headerNavItems when live settings return empty array', async () => {
    const liveSettings = { ...mockSiteSettings, headerNavItems: [] }
    mockQuery.mockResolvedValueOnce(liveSettings)
    const settings = await getSiteSettings()
    expect(settings.headerNavItems).toEqual(mockSiteSettings.headerNavItems)
  })

  it('includes pageVisibility in returned settings when present in live data', async () => {
    const liveSettings = { ...mockSiteSettings, pageVisibility: {news: false, events: true} }
    mockQuery.mockResolvedValueOnce(liveSettings)
    const settings = await getSiteSettings()
    expect(settings.pageVisibility).toEqual({news: false, events: true})
  })

  it('returns mockSiteSettings pageVisibility when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const settings = await getSiteSettings()
    expect(settings.pageVisibility).toEqual(mockSiteSettings.pageVisibility)
  })
})

// ---------------------------------------------------------------------------
// getHomePageSettings
// ---------------------------------------------------------------------------
describe('getHomePageSettings', () => {
  it('returns mockHomePageSettings when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const home = await getHomePageSettings()
    expect(home).toEqual(mockHomePageSettings)
  })

  it('merges live home settings over mock defaults', async () => {
    const liveHome = { ...mockHomePageSettings, heroLayout: 'immersive-overlay' as const }
    mockQuery.mockResolvedValueOnce(liveHome)
    const home = await getHomePageSettings()
    expect(home.heroLayout).toBe('immersive-overlay')
  })

  it('falls back to mock heroActions when live settings return empty array', async () => {
    const liveHome = { ...mockHomePageSettings, heroActions: [] }
    mockQuery.mockResolvedValueOnce(liveHome)
    const home = await getHomePageSettings()
    expect(home.heroActions).toEqual(mockHomePageSettings.heroActions)
  })

  it('falls back to mock focusItems when live settings return empty array', async () => {
    const liveHome = { ...mockHomePageSettings, focusItems: [] }
    mockQuery.mockResolvedValueOnce(liveHome)
    const home = await getHomePageSettings()
    expect(home.focusItems).toEqual(mockHomePageSettings.focusItems)
  })

  it('falls back to mock sectionCards when live settings return empty array', async () => {
    const liveHome = { ...mockHomePageSettings, sectionCards: [] }
    mockQuery.mockResolvedValueOnce(liveHome)
    const home = await getHomePageSettings()
    expect(home.sectionCards).toEqual(mockHomePageSettings.sectionCards)
  })
})

// ---------------------------------------------------------------------------
// getAboutPriorities
// ---------------------------------------------------------------------------
describe('getAboutPriorities', () => {
  it('returns mockAboutPriorities when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const about = await getAboutPriorities()
    expect(about).toEqual(mockAboutPriorities)
  })

  it('merges live about data over mock defaults', async () => {
    const liveAbout = { ...mockAboutPriorities, pageTitle: 'Live Title' }
    mockQuery.mockResolvedValueOnce(liveAbout)
    const about = await getAboutPriorities()
    expect(about.pageTitle).toBe('Live Title')
  })

  it('falls back to mock bioBody when live bioBody is empty', async () => {
    const liveAbout = { ...mockAboutPriorities, bioBody: [] }
    mockQuery.mockResolvedValueOnce(liveAbout)
    const about = await getAboutPriorities()
    expect(about.bioBody).toEqual(mockAboutPriorities.bioBody)
  })

  it('uses live bioBody when it is non-empty', async () => {
    const liveBody = [{ _type: 'block' as const, children: [{ _type: 'span' as const, text: 'Live bio', marks: [] }] }]
    const liveAbout = { ...mockAboutPriorities, bioBody: liveBody }
    mockQuery.mockResolvedValueOnce(liveAbout)
    const about = await getAboutPriorities()
    expect(about.bioBody).toEqual(liveBody)
  })

  it('falls back to mock values when live values is empty', async () => {
    const liveAbout = { ...mockAboutPriorities, values: [] }
    mockQuery.mockResolvedValueOnce(liveAbout)
    const about = await getAboutPriorities()
    expect(about.values).toEqual(mockAboutPriorities.values)
  })

  it('falls back to mock priorities when live priorities is empty', async () => {
    const liveAbout = { ...mockAboutPriorities, priorities: [] }
    mockQuery.mockResolvedValueOnce(liveAbout)
    const about = await getAboutPriorities()
    expect(about.priorities).toEqual(mockAboutPriorities.priorities)
  })

  it('generates a body block from summary when live priority has empty body', async () => {
    const liveAbout = {
      ...mockAboutPriorities,
      priorities: [
        { title: 'Jobs', slug: 'jobs', summary: 'Summary text', body: [], links: [] },
      ],
    }
    mockQuery.mockResolvedValueOnce(liveAbout)
    const about = await getAboutPriorities()
    const generatedBody = about.priorities[0].body
    // repository.ts synthesizes a single paragraph block from the summary field
    expect(generatedBody.length).toBe(1)
    expect(generatedBody[0]._type).toBe('block')
    const block = generatedBody[0] as { _type: 'block'; children: { text: string }[] }
    expect(block.children[0].text).toBe('Summary text')
  })

  it('defaults priority links to empty array when links is undefined', async () => {
    const liveAbout = {
      ...mockAboutPriorities,
      priorities: [
        { title: 'Jobs', slug: 'jobs', summary: 'S', body: [{ _type: 'block' as const, children: [{ _type: 'span' as const, text: 'T', marks: [] }] }], links: undefined as never },
      ],
    }
    mockQuery.mockResolvedValueOnce(liveAbout)
    const about = await getAboutPriorities()
    // Ensures downstream consumers always receive an array, never undefined
    expect(about.priorities[0].links).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// getPageVisualSettings
// ---------------------------------------------------------------------------
describe('getPageVisualSettings', () => {
  it('returns the settings from sanityQuery when available', async () => {
    const liveSettings = getDefaultPageVisual('news')
    mockQuery.mockResolvedValueOnce(liveSettings)
    const settings = await getPageVisualSettings('news')
    expect(settings).toEqual(liveSettings)
  })

  it('returns the default page visual when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const settings = await getPageVisualSettings('events')
    expect(settings).toEqual(getDefaultPageVisual('events'))
  })

  it('returns correct defaults for each supported page key', async () => {
    const keys = ['home', 'news', 'events', 'support', 'media', 'faq', 'platform', 'news-detail', 'events-detail', 'platform-detail', 'press'] as const
    for (const key of keys) {
      mockQuery.mockResolvedValueOnce(null)
      const settings = await getPageVisualSettings(key)
      expect(settings.pageKey).toBe(key)
    }
  })
})

// ---------------------------------------------------------------------------
// assertPageEnabled
// ---------------------------------------------------------------------------
describe('assertPageEnabled', () => {
  beforeEach(() => {
    mockNotFound.mockClear()
  })

  it('resolves without calling notFound() when the page is enabled', async () => {
    const settings = {...mockSiteSettings, pageVisibility: {news: true}}
    mockQuery.mockResolvedValueOnce(settings)
    await expect(assertPageEnabled('news')).resolves.toBeUndefined()
    expect(mockNotFound).not.toHaveBeenCalled()
  })

  it('calls notFound() when the page is explicitly disabled', async () => {
    const settings = {...mockSiteSettings, pageVisibility: {news: false}}
    mockQuery.mockResolvedValueOnce(settings)
    await expect(assertPageEnabled('news')).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledOnce()
  })

  it('calls notFound() when pageVisibility is undefined (default disabled)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {pageVisibility: _, ...settingsWithoutVisibility} = mockSiteSettings
    mockQuery.mockResolvedValueOnce(settingsWithoutVisibility)
    await expect(assertPageEnabled('events')).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledOnce()
  })
})
