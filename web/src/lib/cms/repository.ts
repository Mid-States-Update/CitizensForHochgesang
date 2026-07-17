import {sanityQuery} from './client'
import {
  mockAboutPriorities,
  mockEvents,
  mockFaqs,
  mockFundraisingLinks,
  mockHomePageSettings,
  mockMediaLinks,
  mockPosts,
  mockSiteSettings,
} from './mockData'
import type {
  AboutPriorities,
  CampaignEvent,
  FaqItem,
  FundraisingLink,
  HomePageSettings,
  InteractiveMapData,
  MediaLink,
  MediaSettings,
  PageVisibilityKey,
  PageVisualPageKey,
  PageVisualSettings,
  PostDetail,
  PostSummary,
  SiteSettings,
} from './types'
import {isPageEnabled} from './types'
import {getDefaultPageVisual} from './page-visuals'

/**
 * Design-time mock content is opt-in only (NEXT_PUBLIC_CMS_MOCKS=true for
 * local layout work). Production builds must never render mock data: empty
 * Sanity collections stay empty, and a missing singleton document fails the
 * build loudly instead of silently publishing placeholder content.
 */
function mocksEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CMS_MOCKS === 'true'
}

function missingSingleton(docType: string): Error {
  return new Error(
    `Sanity returned no "${docType}" document. Create it in the studio, or set NEXT_PUBLIC_CMS_MOCKS=true for local design work.`,
  )
}

function sortByDateDesc<T extends {publishedAt?: string}>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return bTime - aTime
  })
}

function sortByDateAsc<T extends {startDate: string}>(items: T[]): T[] {
  return [...items].sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate))
}

export async function getAboutPriorities(): Promise<AboutPriorities> {
  const query = `*[_type=="aboutPriorities"][0]{
    "pageEyebrow": coalesce(pageEyebrow, "About & Priorities"),
    "pageTitle": coalesce(pageTitle, "Who Brad is and what this campaign stands for"),
    pageIntro,
    "bioHeading": coalesce(bioHeading, "Candidate bio"),
    "bioBody": coalesce(bioBody[]{
      ...,
      _type == "image" => {
        ...,
        "asset": {
          "url": asset->url
        }
      }
    }, []),
    "valuesHeading": coalesce(valuesHeading, "Campaign values"),
    "values": coalesce(values, []),
    "prioritiesHeading": coalesce(prioritiesHeading, "Core priorities"),
    "priorities": coalesce(priorities[]{
      title,
      "slug": slug.current,
      summary,
      "body": coalesce(body[]{
        ...,
        _type == "image" => {
          ...,
          "asset": {
            "url": asset->url
          }
        }
      }, []),
      "links": coalesce(links[]{label, url}, [])
    }, []),
    "ctaHeading": coalesce(ctaHeading, "Get involved"),
    ctaCopy,
    "primaryCtaLabel": coalesce(primaryCtaLabel, "Volunteer & donate"),
    "primaryCtaUrl": coalesce(primaryCtaUrl, "/support"),
    "secondaryCtaLabel": coalesce(secondaryCtaLabel, "Attend an event"),
    "secondaryCtaUrl": coalesce(secondaryCtaUrl, "/events")
  }`

  const about = await sanityQuery<AboutPriorities>(query, undefined, {revalidateSeconds: 0})
  if (!about) {
    if (mocksEnabled()) {
      return mockAboutPriorities
    }
    throw missingSingleton('aboutPriorities')
  }

  const normalizedPriorities = (about.priorities ?? []).map((priority) => ({
    ...priority,
    body: priority.body?.length ? priority.body : [{_type: 'block' as const, children: [{_type: 'span' as const, text: priority.summary, marks: []}]}],
    links: priority.links ?? [],
  }))

  if (!mocksEnabled()) {
    return {...about, priorities: normalizedPriorities}
  }

  return {
    ...mockAboutPriorities,
    ...about,
    bioBody: about.bioBody?.length ? about.bioBody : mockAboutPriorities.bioBody,
    values: about.values?.length ? about.values : mockAboutPriorities.values,
    priorities: normalizedPriorities.length ? normalizedPriorities : mockAboutPriorities.priorities,
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const query = `*[_type=="siteSettings"][0]{
    "siteTitle": coalesce(siteTitle, "Citizens For Hochgesang"),
    "tagline": coalesce(tagline, "Practical leadership for Indiana State Senate District 48."),
    "homeLinkMarkup": coalesce(homeLinkMarkup, "<span class='home-link-line'>Brad Hochgesang</span><span class='home-link-line'>For State Senate</span>"),
    campaignLogo,
    headerLogoSmall,
    "campaignLogoUrl": campaignLogo.asset->url,
    "headerLogoSmallUrl": headerLogoSmall.asset->url,
    "campaignLogoAlt": campaignLogoAlt,
    "headerNavItems": coalesce(headerNavItems[]{
      label,
      href,
      icon
    }, []),
    pressUpdatedAt,
    donateUrl,
    volunteerUrl,
    contactEmail,
    "socialLinks": coalesce(socialLinks[]{
      label,
      url
    }, []),
    "pageVisibility": coalesce(
      pageVisibility{
        news,
        events,
        faq,
        platform,
        media,
        support
      },
      {
        "news": false,
        "events": false,
        "faq": false,
        "platform": false,
        "media": false,
        "support": false
      }
    )
  }`

  const settings = await sanityQuery<SiteSettings>(query, undefined, {revalidateSeconds: 0})
  if (!settings) {
    if (mocksEnabled()) {
      return mockSiteSettings
    }
    throw missingSingleton('siteSettings')
  }

  if (!mocksEnabled()) {
    return settings
  }

  return {
    ...mockSiteSettings,
    ...settings,
    socialLinks: settings.socialLinks?.length ? settings.socialLinks : mockSiteSettings.socialLinks,
    headerNavItems: settings.headerNavItems?.length ? settings.headerNavItems : mockSiteSettings.headerNavItems,
  }
}

/** GROQ projection shared by the visual settings fields. */
const VISUALS_PROJECTION = `{
  "backgroundVariant": coalesce(backgroundVariant, "stately-gradient"),
  "containerVariant": coalesce(containerVariant, "standard"),
  "toneVariant": coalesce(toneVariant, "default"),
  "motionPreset": coalesce(motionPreset, "balanced"),
  "textLinkAnimation": coalesce(textLinkAnimation, "sweep"),
  "pageBackgroundAnimation": coalesce(pageBackgroundAnimation, "drift"),
  "scrollRevealAnimation": coalesce(scrollRevealAnimation, "soft"),
  "scrollProgressBar": coalesce(scrollProgressBar, false),
  "magneticButtons": coalesce(magneticButtons, false)
}`

export async function getHomePageSettings(): Promise<HomePageSettings> {
  const query = `*[_type=="homePageSettings"][0]{
    "heroLayout": coalesce(heroLayout, "clean-split"),
    "candidatePortraitUrl": candidatePortrait.asset->url,
    candidatePortraitAlt,
    candidatePortraitCaption,
    "districtLabel": coalesce(districtLabel, "Indiana State Senate District 48"),
    heroSummary,
    "heroActions": coalesce(heroActions[]{ label, url, icon, style }, []),
    "heroBadges": coalesce(heroBadges[]{ label, url, icon, placement }, []),
    "focusItems": coalesce(focusItems, []),
    whyRunningHeading,
    "whyRunningBody": coalesce(whyRunningBody[]{
      ...,
      _type == "image" => { ..., "asset": { "url": asset->url } },
      _type == "mapEmbed" => { ..., "map": map->${INTERACTIVE_MAP_PROJECTION} }
    }, []),
    "whyRunningImageUrl": whyRunningImage.asset->url,
    proofHeading,
    "proofStats": coalesce(proofStats[]{ value, label }, []),
    proofBody,
    midCtaHeading,
    midCtaCopy,
    "sectionCards": coalesce(sectionCards[]{ title, copy, href, icon, ctaLabel }, []),
    "countdownTimers": coalesce(countdownTimers[]{
      enabled,
      heading,
      targetDate,
      body[]{ ... },
      expiredTitle,
      expiredBody[]{ ... }
    }, []),
    "newsSectionEyebrow": coalesce(newsSectionEyebrow, "Recent news"),
    "newsSectionHeading": coalesce(newsSectionHeading, "Latest updates"),
    "newsSectionIntro": coalesce(newsSectionIntro, "Read the latest campaign posts and issue-focused announcements."),
    "eventsSectionEyebrow": coalesce(eventsSectionEyebrow, "Upcoming events"),
    "eventsSectionHeading": coalesce(eventsSectionHeading, "Meet us in the district"),
    "eventsSectionCtaLabel": coalesce(eventsSectionCtaLabel, "View all events"),
    "mediaSectionEyebrow": coalesce(mediaSectionEyebrow, "Recent media"),
    "mediaSectionHeading": coalesce(mediaSectionHeading, "Watch and share"),
    "mediaSectionCtaLabel": coalesce(mediaSectionCtaLabel, "Browse media"),
    "visuals": visuals${VISUALS_PROJECTION}
  }`

  const home = await sanityQuery<HomePageSettings>(query, undefined, {revalidateSeconds: 0})
  if (!home) {
    if (mocksEnabled()) {
      return mockHomePageSettings
    }
    throw missingSingleton('homePageSettings')
  }

  if (!mocksEnabled()) {
    return home
  }

  return {
    ...mockHomePageSettings,
    ...home,
    heroActions: home.heroActions?.length ? home.heroActions : mockHomePageSettings.heroActions,
    heroBadges: home.heroBadges?.length ? home.heroBadges : mockHomePageSettings.heroBadges,
    focusItems: home.focusItems?.length ? home.focusItems : mockHomePageSettings.focusItems,
    sectionCards: home.sectionCards?.length ? home.sectionCards : mockHomePageSettings.sectionCards,
  }
}

export async function getMediaSettings(): Promise<MediaSettings> {
  const query = `*[_type=="mediaSettings"][0]{
    pageHeading,
    pageIntro,
    contactIntro,
    contactName,
    contactTitle,
    contactPhone,
    "pressAssetLinks": coalesce(pressAssetLinks[]{label, url}, [])
  }`

  const result = await sanityQuery<MediaSettings>(query, undefined, {revalidateSeconds: 0})
  return {pressAssetLinks: [], ...result}
}

export async function getAllPosts(): Promise<PostSummary[]> {
  const query = `*[_type=="post"] | order(publishedAt desc){
    title,
    "slug": slug.current,
    excerpt,
    "bodyPreview": coalesce(pt::text(body), ""),
    publishedAt,
    coverImage,
    "coverImageUrl": coverImage.asset->url,
    "newsCardLayout": coalesce(newsCardLayout, "stacked"),
    "newsImageOrientation": coalesce(newsImageOrientation, "landscape"),
    "newsImageAspectRatio": coalesce(newsImageAspectRatio, "3:2"),
    "newsCardAnimation": coalesce(newsCardAnimation, "fade-up"),
    "newsBodyPreviewChars": coalesce(newsBodyPreviewChars, 2000),
    "tags": coalesce(tags, [])
  }`

  const posts = await sanityQuery<PostSummary[]>(query)
  if (!posts || posts.length === 0) {
    if (!mocksEnabled()) {
      return []
    }
    return sortByDateDesc(
      mockPosts.map(
        ({
          title,
          slug,
          excerpt,
          bodyPreview,
          coverImage,
          publishedAt,
          coverImageUrl,
          newsCardLayout,
          newsImageOrientation,
          newsImageAspectRatio,
          newsCardAnimation,
          newsBodyPreviewChars,
          tags,
        }) => ({
        title,
        slug,
        excerpt,
        bodyPreview,
        coverImage,
        publishedAt,
        coverImageUrl,
        newsCardLayout,
        newsImageOrientation,
        newsImageAspectRatio,
        newsCardAnimation,
        newsBodyPreviewChars,
        tags,
      })
      )
    )
  }

  return posts
}

export async function getRecentPosts(limit = 3): Promise<PostSummary[]> {
  const posts = await getAllPosts()
  return posts.slice(0, limit)
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const query = `*[_type=="post" && slug.current==$slug][0]{
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    "coverImageUrl": coverImage.asset->url,
    "tags": coalesce(tags, []),
    "body": coalesce(body[]{
      ...,
      _type == "image" => {
        ...,
        "asset": {
          "url": asset->url
        }
      },
      _type == "storyScene" => {
        ...,
        "mediaUrl": media.asset->url
      },
      _type == "mapEmbed" => {
        ...,
        "map": map->${INTERACTIVE_MAP_PROJECTION}
      }
    }, [])
    ,"storyTimeline": coalesce(storyTimeline[]{
      ...,
      _type == "storyScene" => {
        ...,
        "mediaUrl": media.asset->url
      }
    }, [])
  }`

  const post = await sanityQuery<PostDetail>(query, {slug})
  if (post) {
    return post
  }

  if (!mocksEnabled()) {
    return null
  }

  return mockPosts.find((item) => item.slug === slug) ?? null
}

// Shared GROQ projection for event documents — keeps getUpcomingEvents and
// getAllEvents in sync without repeating the field list.
const EVENT_PROJECTION = `{
  "_id": _id,
  title,
  "slug": slug.current,
  startDate,
  endDate,
  location,
  description,
  "detailBody": coalesce(detailBody[]{
    ...,
    _type == "image" => {
      ...,
      "asset": {
        "url": asset->url
      }
    }
  }, []),
  "detailLinks": coalesce(detailLinks[]{label, url}, []),
  scheduleImage,
  rsvpLink,
  "scheduleImageUrl": scheduleImage.asset->url,
  "eventCardLayout": coalesce(eventCardLayout, "stacked"),
  "eventImageOrientation": coalesce(eventImageOrientation, "landscape"),
  "eventImageAspectRatio": coalesce(eventImageAspectRatio, "3:2"),
  "eventCardAnimation": coalesce(eventCardAnimation, "fade-up"),
  "eventDescriptionPreviewChars": coalesce(eventDescriptionPreviewChars, 2000),
  "tags": coalesce(tags, [])
}`

type RawEvent = Omit<CampaignEvent, 'id'> & {_id: string}

function normalizeEvents(events: RawEvent[]): CampaignEvent[] {
  return sortByDateAsc(events.map(({_id, ...event}) => ({id: _id, ...event})))
}

/** Returns only events that have not yet ended — used on the homepage. */
export async function getUpcomingEvents(): Promise<CampaignEvent[]> {
  const query = `*[_type=="event" && coalesce(endDate, startDate) > now()] | order(startDate asc)${EVENT_PROJECTION}`

  const events = await sanityQuery<RawEvent[]>(query)
  if (!events || events.length === 0) {
    return mocksEnabled() ? sortByDateAsc(mockEvents) : []
  }

  return normalizeEvents(events)
}

/** Returns all events (past and upcoming) — used on the /events page. */
export async function getAllEvents(): Promise<CampaignEvent[]> {
  const query = `*[_type=="event"] | order(startDate asc)${EVENT_PROJECTION}`

  const events = await sanityQuery<RawEvent[]>(query)
  if (!events || events.length === 0) {
    return mocksEnabled() ? sortByDateAsc(mockEvents) : []
  }

  return normalizeEvents(events)
}

export async function getMediaLinks(limit?: number): Promise<MediaLink[]> {
  const query = `*[_type=="mediaLink"] | order(publishedAt desc){
    "_id": _id,
    title,
    mediaType,
    url,
    publishedAt,
    "thumbnailUrl": thumbnail.asset->url
  }`

  const media = await sanityQuery<Array<Omit<MediaLink, 'id'> & {_id: string}>>(query)
  const normalized =
    media && media.length > 0
      ? sortByDateDesc(media.map(({_id, ...item}) => ({id: _id, ...item})))
      : mocksEnabled()
        ? sortByDateDesc(mockMediaLinks)
        : []

  return typeof limit === 'number' ? normalized.slice(0, limit) : normalized
}

export async function getFundraisingLinks(): Promise<FundraisingLink[]> {
  const query = `*[_type=="fundraisingLink"] | order(priority desc){
    "_id": _id,
    title,
    url,
    description,
    "imageUrl": image.asset->url,
    "priority": coalesce(priority, 0)
  }`

  const links = await sanityQuery<Array<Omit<FundraisingLink, 'id'> & {_id: string}>>(query)
  if (!links || links.length === 0) {
    if (!mocksEnabled()) {
      return []
    }
    return [...mockFundraisingLinks].sort((a, b) => b.priority - a.priority)
  }

  return links
    .map(({_id, ...link}) => ({id: _id, ...link}))
    .sort((a, b) => b.priority - a.priority)
}

export type FaqPageSettings = {
  pageEyebrow: string
  pageTitle: string
  pageIntro: string
}

/** Returns the /faq page heading strings, with sensible defaults. */
export async function getFaqPageSettings(): Promise<FaqPageSettings> {
  const query = `*[_type=="faqPageSettings"][0]{
    "pageEyebrow": coalesce(pageEyebrow, "FAQ"),
    "pageTitle": coalesce(pageTitle, "Frequently asked questions"),
    "pageIntro": coalesce(pageIntro, "Quick answers for volunteers, supporters, constituents, and press.")
  }`

  const result = await sanityQuery<FaqPageSettings>(query, undefined, {revalidateSeconds: 0})
  return (
    result ?? {
      pageEyebrow: 'FAQ',
      pageTitle: 'Frequently asked questions',
      pageIntro: 'Quick answers for volunteers, supporters, constituents, and press.',
    }
  )
}

/** Returns all FAQ documents ordered by their studio order (orderRank). */
export async function getFaqs(): Promise<FaqItem[]> {
  const query = `*[_type=="faq"] | order(orderRank asc){
    "question": title,
    "answerBody": body[]{ ... },
    "answerText": pt::text(body)
  }`

  const faqs = await sanityQuery<FaqItem[]>(query)
  if (!faqs || faqs.length === 0) {
    return mocksEnabled() ? mockFaqs : []
  }

  return faqs
}

export interface MapRegionPopupData {
  key: string
  title: string
  body?: unknown[]
  linkLabel?: string
  linkUrl?: string
}

/** GROQ projection for dereferencing an interactiveMap reference (used by mapEmbed in portable text). */
export const INTERACTIVE_MAP_PROJECTION = `{
  "_id": _id,
  title,
  "slug": slug.current,
  description,
  projection,
  defaultViewport,
  "layers": coalesce(layers[]{
    _key,
    label,
    layerId,
    visible,
    minZoomWidth,
    defaultFillColor,
    defaultStrokeColor,
    defaultStrokeWidth,
    defaultStrokeStyle,
    "regions": coalesce(regions[]{
      _key,
      name,
      regionKey,
      coordinatesJson,
      centroid,
      fillColor,
      strokeColor,
      strokeWidth,
      strokeStyle,
      popupTitle,
      "popupBody": popupBody[]{ ... },
      popupLinkLabel,
      popupLinkUrl
    }, [])
  }, []),
  "overlays": coalesce(overlays[]{
    _key,
    label,
    coordinatesJson,
    strokeColor,
    strokeWidth,
    strokeStyle,
    opacity,
    popupTitle,
    "popupBody": popupBody[]{ ... },
    popupLinkLabel,
    popupLinkUrl
  }, []),
  "pins": coalesce(pins[]{
    _key,
    label,
    longitude,
    latitude,
    color,
    size,
    popupTitle,
    "popupBody": popupBody[]{ ... },
    popupLinkLabel,
    popupLinkUrl
  }, []),
  height,
  accentColor,
  enableZoom,
  enableAnimation,
  animationPreset
}`

export async function getInteractiveMapBySlug(slug: string): Promise<InteractiveMapData | null> {
  const query = `*[_type=="interactiveMap" && slug.current==$slug][0]${INTERACTIVE_MAP_PROJECTION}`
  return sanityQuery<InteractiveMapData>(query, {slug})
}

export async function getInteractiveMapById(id: string): Promise<InteractiveMapData | null> {
  const query = `*[_type=="interactiveMap" && _id==$id][0]${INTERACTIVE_MAP_PROJECTION}`
  return sanityQuery<InteractiveMapData>(query, {id})
}

export async function getMapRegionPopups(): Promise<MapRegionPopupData[]> {
  const query = `*[_type=="mapRegionPopup"]{
    "key": regionKey,
    title,
    "body": body[]{ ... },
    linkLabel,
    linkUrl
  }`

  const result = await sanityQuery<MapRegionPopupData[]>(query)
  return result ?? []
}

/**
 * Maps page keys to their Sanity document type and visual field paths.
 * Detail pages read `detailVisuals` first, falling back to `visuals`.
 */
const PAGE_VISUALS_MAP: Record<
  PageVisualPageKey,
  { docType: string; primary: string; fallback?: string }
> = {
  home: {docType: 'homePageSettings', primary: 'visuals'},
  news: {docType: 'newsPageSettings', primary: 'visuals'},
  'news-detail': {docType: 'newsPageSettings', primary: 'detailVisuals', fallback: 'visuals'},
  events: {docType: 'eventsPageSettings', primary: 'visuals'},
  'events-detail': {docType: 'eventsPageSettings', primary: 'detailVisuals', fallback: 'visuals'},
  platform: {docType: 'platformPageSettings', primary: 'visuals'},
  'platform-detail': {docType: 'platformPageSettings', primary: 'detailVisuals', fallback: 'visuals'},
  media: {docType: 'mediaPageSettings', primary: 'visuals'},
  press: {docType: 'mediaPageSettings', primary: 'visuals'},
  support: {docType: 'supportPageSettings', primary: 'visuals'},
  faq: {docType: 'faqPageSettings', primary: 'visuals'},
}

export async function getPageVisualSettings(pageKey: PageVisualPageKey): Promise<PageVisualSettings> {
  const mapping = PAGE_VISUALS_MAP[pageKey]
  const query = `*[_type==$docType][0]{
    "primary": ${mapping.primary}${VISUALS_PROJECTION},
    ${mapping.fallback ? `"fallback": ${mapping.fallback}${VISUALS_PROJECTION}` : ''}
  }`

  const result = await sanityQuery<{
    primary?: PageVisualSettings | null
    fallback?: PageVisualSettings | null
  }>(query, {docType: mapping.docType}, {revalidateSeconds: 0})

  // Prefer primary (e.g. detailVisuals), then fallback (visuals), then hardcoded defaults
  const visuals = result?.primary ?? result?.fallback ?? null
  if (!visuals) {
    return getDefaultPageVisual(pageKey)
  }

  return {...getDefaultPageVisual(pageKey), ...visuals, pageKey}
}

/**
 * Fetches site settings and calls Next.js `notFound()` if the given page key
 * is disabled. Call this at the top of every non-home server page component.
 */
export async function assertPageEnabled(pageKey: PageVisibilityKey): Promise<void> {
  const {notFound} = await import('next/navigation')
  const settings = await getSiteSettings()
  if (!isPageEnabled(settings.pageVisibility, pageKey)) {
    notFound()
  }
}
