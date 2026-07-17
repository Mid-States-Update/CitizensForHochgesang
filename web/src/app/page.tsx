import Link from 'next/link'
import Image from 'next/image'
import {PortableText} from '@portabletext/react'
import {FaBullhorn, FaCalendarAlt, FaHandsHelping, FaNewspaper, FaVideo, FaVoteYea} from 'react-icons/fa'

import {ElectionCountdown} from '@/components/election-countdown'
import {mapEmbedBlockType} from '@/components/map-embed-block-type'
import {CmsLink} from '@/components/cms-link'
import {MidPageCta} from '@/components/mid-page-cta'
import {PageEffects} from '@/components/page-effects'
import {ProofSection} from '@/components/proof-section'
import {WhyRunningSection} from '@/components/why-running-section'
import {pickFeaturedMedia} from '@/lib/cms/featured-media'
import {formatDate, formatDateTime} from '@/lib/cms/format'
import {resolveCmsIcon} from '@/lib/cms/icon-map'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
import {extractBlocksOfType} from '@/lib/cms/portable-split'
import {isPageEnabled} from '@/lib/cms/types'
import {
  getFundraisingLinks,
  getHomePageSettings,
  getMediaLinks,
  getPageVisualSettings,
  getRecentPosts,
  getSiteSettings,
  getUpcomingEvents,
} from '@/lib/cms/repository'

function normalizeHomeHeroLayout(value: string | undefined): 'clean-split' | 'portrait-left' | 'immersive-overlay' {
  if (!value) {
    return 'clean-split'
  }

  const normalized = value.trim().toLowerCase()

  if (normalized === 'portrait-left' || normalized === 'portraitleft' || normalized === 'portrait_left') {
    return 'portrait-left'
  }

  if (
    normalized === 'immersive-overlay' ||
    normalized === 'immersiveoverlay' ||
    normalized === 'immersive_overlay'
  ) {
    return 'immersive-overlay'
  }

  return 'clean-split'
}

function resolveActionClass(style: 'primary' | 'outline' | 'accent' | undefined): string {
  if (style === 'accent') {
    return 'btn btn-accent'
  }

  if (style === 'outline') {
    return 'btn btn-outline'
  }

  return 'btn btn-primary'
}

export default async function Home() {
  const [settings, home, posts, events, mediaLinks, fundraisingLinks, pageVisualSettings] = await Promise.all([
    getSiteSettings(),
    getHomePageSettings(),
    getRecentPosts(3),
    getUpcomingEvents(),
    getMediaLinks(),
    getFundraisingLinks(),
    getPageVisualSettings('home'),
  ])

  // Prefer visuals embedded in homePageSettings, fall back to standalone query
  const visuals = home.visuals ?? pageVisualSettings

  const topFundraisingLink = fundraisingLinks[0] ?? null
  const heroPortraitUrl = home.candidatePortraitUrl ?? settings.campaignLogoUrl
  const heroPortraitAlt =
    home.candidatePortraitAlt ??
    settings.campaignLogoAlt ??
    `${settings.siteTitle} candidate portrait`
  const heroPortraitCaption = home.candidatePortraitCaption?.trim()
  const homeHeroLayout = normalizeHomeHeroLayout(home.heroLayout)
  const districtLabel = home.districtLabel?.trim() || 'Indiana State Senate District 48'
  const heroSummary = home.heroSummary?.trim() || settings.tagline
  const campaignFocusItems = home.focusItems
  const homeSectionCards = home.sectionCards
  const textBadges = home.heroBadges.filter((item) => item.placement === 'text')
  const mediaBadges = home.heroBadges.filter((item) => item.placement === 'media')
  const proofBadges = home.heroBadges.filter((item) => item.placement === 'proof')
  const heroActions = home.heroActions

  const showNews = isPageEnabled(settings.pageVisibility, 'news') && posts.length > 0
  const showEvents = isPageEnabled(settings.pageVisibility, 'events') && events.length > 0
  const showMedia = isPageEnabled(settings.pageVisibility, 'media') && mediaLinks.length > 0

  // The district map lives inside the Why I'm Running body in Sanity; pull it
  // out so the story stays tight and the map gets its own section near events.
  const {extracted: districtMapBlocks, rest: whyRunningStory} = extractBlocksOfType(
    home.whyRunningBody ?? [],
    'mapEmbed',
  )
  const nextEvent = showEvents ? events[0] : undefined
  const featuredMedia = pickFeaturedMedia(mediaLinks)

  return (
    <main className={getPageShellClasses(visuals)} {...getPageShellDataAttributes(visuals)}>
      <PageEffects visuals={visuals} />
      {/* ── 1. Hero Section ── */}
      <section className={`campaign-hero campaign-hero-${homeHeroLayout}`}>
        {homeHeroLayout === 'immersive-overlay' ? (
          <>
            <div className="campaign-hero-immersive-frame">
              {heroPortraitUrl ? (
                <Image
                  src={heroPortraitUrl}
                  alt={heroPortraitAlt}
                  width={1600}
                  height={1040}
                  className="campaign-hero-image"
                  unoptimized
                  priority
                />
              ) : null}
              <div className="campaign-hero-immersive-overlay">
                <p className="eyebrow">{districtLabel}</p>
                <h1 className="hero-title">{settings.siteTitle}</h1>
                <p className="max-w-2xl text-lg text-[color:var(--color-muted)]">{heroSummary}</p>
                <div className="flex flex-wrap gap-4">
                  {heroActions.map((action) => {
                    const ActionIcon = resolveCmsIcon(action.icon, FaHandsHelping)

                    return (
                      <CmsLink key={`${action.label}-${action.url}`} className={resolveActionClass(action.style)} href={action.url}>
                        <ActionIcon aria-hidden />
                        {action.label}
                      </CmsLink>
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-[color:var(--color-muted)]">
                  {textBadges.map((badge) => {
                    const BadgeIcon = resolveCmsIcon(badge.icon, FaBullhorn)
                    const key = `${badge.label}-${badge.url ?? 'no-link'}`

                    if (badge.url) {
                      return (
                        <CmsLink key={key} href={badge.url} className="pill-badge">
                          <BadgeIcon aria-hidden />
                          {badge.label}
                        </CmsLink>
                      )
                    }

                    return (
                      <span key={key} className="pill-badge">
                        <BadgeIcon aria-hidden />
                        {badge.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="campaign-hero-text">
              <p className="eyebrow">{districtLabel}</p>
              <div className="flex flex-col gap-4">
                <h1 className="hero-title">{settings.siteTitle}</h1>
                <p className="max-w-2xl text-lg text-[color:var(--color-muted)]">{heroSummary}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {heroActions.map((action) => {
                  const ActionIcon = resolveCmsIcon(action.icon, FaHandsHelping)

                  return (
                    <CmsLink key={`${action.label}-${action.url}`} className={resolveActionClass(action.style)} href={action.url}>
                      <ActionIcon aria-hidden />
                      {action.label}
                    </CmsLink>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-[color:var(--color-muted)]">
                {textBadges.map((badge) => {
                  const BadgeIcon = resolveCmsIcon(badge.icon, FaBullhorn)
                  const key = `${badge.label}-${badge.url ?? 'no-link'}`

                  if (badge.url) {
                    return (
                      <CmsLink key={key} href={badge.url} className="pill-badge">
                        <BadgeIcon aria-hidden />
                        {badge.label}
                      </CmsLink>
                    )
                  }

                  return (
                    <span key={key} className="pill-badge">
                      <BadgeIcon aria-hidden />
                      {badge.label}
                    </span>
                  )
                })}
              </div>
              {campaignFocusItems.length > 0 ? (
                <ul className="campaign-focus-list campaign-hero-focus">
                  {campaignFocusItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="campaign-hero-media">
              {heroPortraitUrl ? (
                <Image
                  src={heroPortraitUrl}
                  alt={heroPortraitAlt}
                  width={960}
                  height={1200}
                  className="campaign-hero-image"
                  unoptimized
                  priority
                />
              ) : null}
              {heroPortraitCaption ? <p className="text-sm text-[color:var(--color-muted)]">{heroPortraitCaption}</p> : null}
              {mediaBadges.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {mediaBadges.map((badge) => {
                    const BadgeIcon = resolveCmsIcon(badge.icon, FaBullhorn)
                    const key = `${badge.label}-${badge.url ?? 'no-link'}`

                    if (badge.url) {
                      return (
                        <CmsLink key={key} href={badge.url} className="pill-badge">
                          <BadgeIcon aria-hidden />
                          {badge.label}
                        </CmsLink>
                      )
                    }

                    return (
                      <span key={key} className="pill-badge">
                        <BadgeIcon aria-hidden />
                        {badge.label}
                      </span>
                    )
                  })}
                </div>
              ) : null}
              {topFundraisingLink ? (
                <CmsLink className="btn btn-accent campaign-hero-donate" href={topFundraisingLink.url}>
                  <FaVoteYea aria-hidden />
                  Donate now
                </CmsLink>
              ) : null}
            </div>
          </>
        )}

        <div className="campaign-proof-strip">
          {proofBadges.map((badge) => {
            const BadgeIcon = resolveCmsIcon(badge.icon, FaBullhorn)
            const key = `${badge.label}-${badge.url ?? 'no-link'}`

            if (badge.url) {
              return (
                <CmsLink key={key} href={badge.url} className="pill-badge">
                  <BadgeIcon aria-hidden />
                  {badge.label}
                </CmsLink>
              )
            }

            return (
              <span key={key} className="pill-badge">
                <BadgeIcon aria-hidden />
                {badge.label}
              </span>
            )
          })}
        </div>

      </section>

      {/* ── 2. Next-event ribbon ── */}
      {nextEvent ? (
        <CmsLink href="/events" className="event-ribbon">
          <span aria-hidden>📍</span>
          <span className="event-ribbon-label">Next event</span>
          <span className="event-ribbon-title">{nextEvent.title}</span>
          <span className="event-ribbon-meta">{formatDateTime(nextEvent.startDate)}</span>
          <span className="event-ribbon-cta">View event →</span>
        </CmsLink>
      ) : null}

      {/* ── 3. Priority Cards ── */}
      {homeSectionCards.length > 0 ? (
        <section className="priority-cards-section">
          <div className="priority-cards-grid">
            {homeSectionCards.map((item) => {
              const SectionIcon = resolveCmsIcon(item.icon, FaNewspaper)

              return (
                <div key={item.title} className="card priority-card">
                  <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">
                    <SectionIcon aria-hidden className="mr-2 inline-block text-[color:var(--color-accent)]" />
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                    {item.copy}
                  </p>
                  <div className="mt-4">
                    <Link className="btn btn-outline" href={item.href}>
                      {item.ctaLabel || `View ${item.title}`}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* ── 4. "Why I'm Running" (story only; the district map renders below) ── */}
      <WhyRunningSection
        heading={home.whyRunningHeading}
        body={whyRunningStory}
        imageUrl={home.whyRunningImageUrl}
      />

      {/* ── 5. "Proof / Credibility" Section ── */}
      <ProofSection
        heading={home.proofHeading}
        stats={home.proofStats}
        body={home.proofBody}
      />

      {/* ── 6. News / Updates ── */}
      {showNews ? (
        <section className="homepage-feed-section">
          <div className="card flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="eyebrow">{home.newsSectionEyebrow}</p>
              <h2 className="section-title">{home.newsSectionHeading}</h2>
              {home.newsSectionIntro ? (
                <p className="text-sm text-[color:var(--color-muted)]">{home.newsSectionIntro}</p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.slug} className="article-card rounded-2xl border border-[color:var(--color-border)] px-4 py-4">
                  {post.coverImageUrl ? (
                    <Link href={`/news/${post.slug}`} className="card-media mb-3 block">
                      <Image
                        src={post.coverImageUrl}
                        alt=""
                        width={640}
                        height={360}
                        className="h-36 w-full rounded-xl object-cover"
                        unoptimized
                      />
                    </Link>
                  ) : null}
                  <p className="article-meta text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                    {formatDate(post.publishedAt)}
                  </p>
                  <p className="article-title mt-2 text-base font-semibold text-[color:var(--color-ink)]">{post.title}</p>
                  {post.excerpt ? (
                    <p className="mt-2 text-sm text-[color:var(--color-muted)]">{post.excerpt}</p>
                  ) : null}
                  <div className="mt-3">
                    <Link className="article-cta btn btn-outline" href={`/news/${post.slug}`}>
                      Read post
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 7. Events ── */}
      {showEvents ? (
        <section className="homepage-feed-section">
          <div className="card flex flex-col gap-6">
            <p className="eyebrow">{home.eventsSectionEyebrow}</p>
            <h2 className="section-title">{home.eventsSectionHeading}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {events.slice(0, 2).map((event) => (
                <article key={event.id} className="article-card rounded-2xl border border-[color:var(--color-border)] px-4 py-4">
                  <p className="article-meta text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                    {formatDateTime(event.startDate)}
                  </p>
                  <p className="article-title mt-2 text-base font-semibold text-[color:var(--color-ink)]">{event.title}</p>
                  <p className="mt-2 text-sm text-[color:var(--color-muted)]">{event.location}</p>
                </article>
              ))}
            </div>
            <Link className="btn btn-outline" href="/events">
              <FaCalendarAlt aria-hidden />
              {home.eventsSectionCtaLabel}
            </Link>
          </div>
        </section>
      ) : null}

      {/* ── 8. Our District map ── */}
      {districtMapBlocks.length > 0 ? (
        <section className="homepage-feed-section">
          <div className="card flex flex-col gap-4">
            <p className="eyebrow">Our district</p>
            <h2 className="section-title">Six counties, one district</h2>
            <PortableText value={districtMapBlocks as never} components={{types: {...mapEmbedBlockType}}} />
          </div>
        </section>
      ) : null}

      {/* ── 9. Mid-Page CTA ── */}
      <MidPageCta
        heading={home.midCtaHeading}
        copy={home.midCtaCopy}
        donateUrl={settings.donateUrl}
        volunteerUrl={settings.volunteerUrl}
      />

      {/* ── 10. Media feature ── */}
      {showMedia && featuredMedia ? (
        <section className="homepage-feed-section">
          <div className="card flex flex-col gap-6">
            <p className="eyebrow">{home.mediaSectionEyebrow}</p>
            <h2 className="section-title">{home.mediaSectionHeading}</h2>
            <div className="media-feature">
              {featuredMedia.thumbnailUrl ? (
                <CmsLink href={featuredMedia.url} className="media-feature-media">
                  <Image
                    src={featuredMedia.thumbnailUrl}
                    alt={`${featuredMedia.title} thumbnail`}
                    width={640}
                    height={360}
                    className="h-full w-full rounded-2xl object-cover"
                    unoptimized
                  />
                </CmsLink>
              ) : null}
              <div className="flex flex-col items-start gap-3">
                {featuredMedia.highlight && featuredMedia.highlightNote ? (
                  <span className="pill-badge pill-badge-active text-xs">★ {featuredMedia.highlightNote}</span>
                ) : null}
                <h3 className="text-xl font-semibold text-[color:var(--color-ink)]">{featuredMedia.title}</h3>
                {featuredMedia.description ? (
                  <p className="text-sm text-[color:var(--color-muted)]">{featuredMedia.description}</p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <CmsLink className="btn btn-primary" href={featuredMedia.url}>
                    <FaVideo aria-hidden />
                    Watch
                  </CmsLink>
                  <Link className="btn btn-outline" href="/media">
                    {home.mediaSectionCtaLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
      {/* ── 11. Election Countdown ── */}
      <ElectionCountdown timers={home.countdownTimers} />
    </main>
  )
}
