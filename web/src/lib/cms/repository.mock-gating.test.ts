import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Replace the real sanityQuery (which calls the Sanity HTTP API) with a
// controllable mock so tests run offline without network calls.
vi.mock('./client', () => ({
  sanityQuery: vi.fn(),
}))

import { sanityQuery } from './client'
import {
  getAllPosts,
  getPostBySlug,
  getUpcomingEvents,
  getAllEvents,
  getMediaLinks,
  getFundraisingLinks,
  getSiteSettings,
  getHomePageSettings,
  getAboutPriorities,
  getFaqs,
} from './repository'
import { mockEvents, mockFaqs, mockPosts, mockSiteSettings } from './mockData'

const mockQuery = vi.mocked(sanityQuery)

beforeEach(() => {
  mockQuery.mockReset()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

// ---------------------------------------------------------------------------
// Design-time mock content must NEVER reach a production build. Mocks are
// opt-in only via NEXT_PUBLIC_CMS_MOCKS=true (local design work). By default:
//  - collection getters return an empty list when Sanity has no documents
//  - singleton getters throw so the static build fails loudly instead of
//    silently publishing placeholder content
// ---------------------------------------------------------------------------

describe('collection getters with mocks disabled (default)', () => {
  it('getUpcomingEvents returns an empty list when Sanity has no upcoming events', async () => {
    mockQuery.mockResolvedValueOnce([])
    const events = await getUpcomingEvents()
    expect(events).toEqual([])
  })

  it('getUpcomingEvents returns an empty list when sanityQuery returns null', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const events = await getUpcomingEvents()
    expect(events).toEqual([])
  })

  it('getAllEvents returns an empty list when Sanity has no events', async () => {
    mockQuery.mockResolvedValueOnce([])
    const events = await getAllEvents()
    expect(events).toEqual([])
  })

  it('getAllPosts returns an empty list when Sanity has no posts', async () => {
    mockQuery.mockResolvedValueOnce([])
    const posts = await getAllPosts()
    expect(posts).toEqual([])
  })

  it('getPostBySlug returns null when the post is not in Sanity', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const post = await getPostBySlug(mockPosts[0].slug)
    expect(post).toBeNull()
  })

  it('getMediaLinks returns an empty list when Sanity has no media links', async () => {
    mockQuery.mockResolvedValueOnce([])
    const media = await getMediaLinks()
    expect(media).toEqual([])
  })

  it('getFundraisingLinks returns an empty list when Sanity has no links', async () => {
    mockQuery.mockResolvedValueOnce([])
    const links = await getFundraisingLinks()
    expect(links).toEqual([])
  })

  it('getFaqs returns an empty list when Sanity has no faq documents', async () => {
    mockQuery.mockResolvedValueOnce([])
    const faqs = await getFaqs()
    expect(faqs).toEqual([])
  })
})

describe('getFaqs with live data', () => {
  it('returns question, answer body, and plain-text answer from Sanity', async () => {
    const liveFaqs = [
      {
        question: 'What will it cost?',
        answerBody: [{_type: 'block', children: [{_type: 'span', text: 'About $1.08 billion.'}]}],
        answerText: 'About $1.08 billion.',
      },
    ]
    mockQuery.mockResolvedValueOnce(liveFaqs)
    const faqs = await getFaqs()
    expect(faqs).toEqual(liveFaqs)
  })
})

describe('singleton getters with mocks disabled (default)', () => {
  it('getSiteSettings throws when the siteSettings document is missing', async () => {
    mockQuery.mockResolvedValueOnce(null)
    await expect(getSiteSettings()).rejects.toThrow(/siteSettings/)
  })

  it('getHomePageSettings throws when the homePageSettings document is missing', async () => {
    mockQuery.mockResolvedValueOnce(null)
    await expect(getHomePageSettings()).rejects.toThrow(/homePageSettings/)
  })

  it('getAboutPriorities throws when the aboutPriorities document is missing', async () => {
    mockQuery.mockResolvedValueOnce(null)
    await expect(getAboutPriorities()).rejects.toThrow(/aboutPriorities/)
  })

  it('getSiteSettings does not inject mock social links when live settings have none', async () => {
    const liveSettings = { ...mockSiteSettings, siteTitle: 'Live', socialLinks: [], headerNavItems: [] }
    mockQuery.mockResolvedValueOnce(liveSettings)
    const settings = await getSiteSettings()
    expect(settings.socialLinks).toEqual([])
    expect(settings.headerNavItems).toEqual([])
  })
})

describe('with NEXT_PUBLIC_CMS_MOCKS=true (local design mode)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_CMS_MOCKS', 'true')
  })

  it('getUpcomingEvents falls back to mock events when Sanity is empty', async () => {
    mockQuery.mockResolvedValueOnce([])
    const events = await getUpcomingEvents()
    expect(events.length).toBe(mockEvents.length)
  })

  it('getSiteSettings falls back to mock settings when the document is missing', async () => {
    mockQuery.mockResolvedValueOnce(null)
    const settings = await getSiteSettings()
    expect(settings).toEqual(mockSiteSettings)
  })

  it('getFaqs falls back to mock FAQs when Sanity is empty', async () => {
    mockQuery.mockResolvedValueOnce([])
    const faqs = await getFaqs()
    expect(faqs).toEqual(mockFaqs)
  })
})
