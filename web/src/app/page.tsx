import Link from 'next/link'
import Image from 'next/image'
import {FaBullhorn, FaCalendarAlt, FaHandsHelping, FaNewspaper, FaVideo, FaVoteYea} from 'react-icons/fa'

import {ElectionCountdown} from '@/components/election-countdown'
import {CmsLink} from '@/components/cms-link'
import {MidPageCta} from '@/components/mid-page-cta'
import {PageEffects} from '@/components/page-effects'
import {ProofSection} from '@/components/proof-section'
import {WhyRunningSection} from '@/components/why-running-section'
import {formatDate, formatDateTime} from '@/lib/cms/format'
import {resolveCmsIcon} from '@/lib/cms/icon-map'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
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
    getMediaLinks(3),
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
            {campaignFocusItems.length > 0 ? (
              <ul className="campaign-focus-list campaign-hero-focus">
                {campaignFocusItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
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

      {/* ── 2. "Why I'm Running" Section ── */}
      <WhyRunningSection
        heading={home.whyRunningHeading}
        body={home.whyRunningBody}
        imageUrl={home.whyRunningImageUrl}
      />

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

      {/* ── 4. "Proof / Credibility" Section ── */}
      <ProofSection
        heading={home.proofHeading}
        stats={home.proofStats}
        body={home.proofBody}
      />

      {/* ── 5. Mid-Page CTA ── */}
      <MidPageCta
        heading={home.midCtaHeading}
        copy={home.midCtaCopy}
        donateUrl={settings.donateUrl}
        volunteerUrl={settings.volunteerUrl}
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

      {/* ── 8. Media ── */}
      {showMedia ? (
        <section className="homepage-feed-section">
          <div className="card flex flex-col gap-4">
            <p className="eyebrow">{home.mediaSectionEyebrow}</p>
            <h2 className="section-title">{home.mediaSectionHeading}</h2>
            <div className="grid gap-3">
              {mediaLinks.map((item) => (
                <CmsLink
                  key={item.id}
                  href={item.url}
                  className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3 text-sm font-semibold text-[color:var(--color-accent)] transition hover:bg-[color:var(--color-highlight)]"
                >
                  {item.title}
                </CmsLink>
              ))}
            </div>
            <Link className="btn btn-outline" href="/media">
              <FaVideo aria-hidden />
              {home.mediaSectionCtaLabel}
            </Link>
          </div>
        </section>
      ) : null}
      {/* ── 9. Election Countdown ── */}
      <ElectionCountdown timers={home.countdownTimers} />
    </main>
  )
}
