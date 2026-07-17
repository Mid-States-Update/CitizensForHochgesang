import {CmsLink} from '@/components/cms-link'
import {PageEffects} from '@/components/page-effects'
import {formatDate} from '@/lib/cms/format'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
import {assertPageEnabled, getMediaLinks, getMediaSettings, getPageVisualSettings, getRecentPosts, getSiteSettings, getUpcomingEvents} from '@/lib/cms/repository'
import Image from 'next/image'

export const metadata = {
  title: 'Media & Press | Brad Hochgesang for State Senate',
  description: 'Campaign media coverage, press resources, and direct contact details.',
}

const MEDIA_TYPE_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  audio: 'Audio',
  other: 'Press / News',
}

function getTypeLabel(mediaType: string): string {
  return MEDIA_TYPE_LABELS[mediaType] ?? 'Media'
}

export default async function MediaPage() {
  await assertPageEnabled('media')
  const [mediaLinks, settings, mediaSettings, posts, events, pageVisualSettings] = await Promise.all([
    getMediaLinks(),
    getSiteSettings(),
    getMediaSettings(),
    getRecentPosts(4),
    getUpcomingEvents(),
    getPageVisualSettings('media'),
  ])

  const pageHeading = mediaSettings.pageHeading?.trim() || 'Media coverage and press resources'
  const pageIntro = mediaSettings.pageIntro?.trim() || 'Watch and share campaign coverage, access official assets, and contact the team for media requests.'
  const contactIntro = mediaSettings.contactIntro?.trim() || 'For interviews, deadlines, and publication requests.'

  return (
    <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
      <PageEffects visuals={pageVisualSettings} />
      <section className="flex flex-col gap-4">
        <p className="eyebrow">Media & Press</p>
        <h1 className="section-title">{pageHeading}</h1>
        <p className="max-w-3xl text-sm text-[color:var(--color-muted)]">{pageIntro}</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card article-card flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">Media contact</h2>
          <p className="text-sm text-[color:var(--color-muted)]">{contactIntro}</p>
          {mediaSettings.contactName ? (
            <p className="text-sm font-semibold text-[color:var(--color-ink)]">
              {mediaSettings.contactName}
              {mediaSettings.contactTitle ? (
                <span className="ml-1 font-normal text-[color:var(--color-muted)]">— {mediaSettings.contactTitle}</span>
              ) : null}
            </p>
          ) : null}
          {settings.contactEmail ? (
            <>
              <CmsLink className="link-pill link-pill-media" href={`mailto:${settings.contactEmail}`}>
                Contact us
              </CmsLink>
              <p className="text-sm font-semibold text-[color:var(--color-accent)]">{settings.contactEmail}</p>
            </>
          ) : (
            <p className="text-sm text-[color:var(--color-muted)]">Contact email pending publication in Site Settings.</p>
          )}
          {mediaSettings.contactPhone ? (
            <p className="text-sm text-[color:var(--color-muted)]">{mediaSettings.contactPhone}</p>
          ) : null}
          <p className="text-sm text-[color:var(--color-muted)]">Please include your deadline and publication details in the initial request.</p>
        </article>

        <article className="card article-card flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">Press assets</h2>
          {settings.campaignLogoUrl ? (
            <>
              <div className="card-media flex justify-center p-6">
                <Image
                  src={settings.campaignLogoUrl}
                  alt={settings.campaignLogoAlt ?? `${settings.siteTitle} logo`}
                  width={320}
                  height={320}
                  className="h-auto w-full max-w-[14rem] object-contain"
                  unoptimized
                />
              </div>
              <CmsLink className="link-pill link-pill-media" href={settings.campaignLogoUrl}>
                Download campaign logo
              </CmsLink>
            </>
          ) : (
            <p className="text-sm text-[color:var(--color-muted)]">Campaign logo not published in site settings yet.</p>
          )}
          {mediaSettings.pressAssetLinks.length > 0 ? (
            <div className="grid gap-2 text-sm">
              {mediaSettings.pressAssetLinks.map((link) => (
                <CmsLink key={link.url} className="link-soft" href={link.url}>
                  {link.label}
                </CmsLink>
              ))}
            </div>
          ) : null}
        </article>
      </section>

      {mediaLinks.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2">
          <h2 className="section-title md:col-span-2">Interviews, videos, and social updates</h2>
          {mediaLinks.map((item) => (
            <article key={item.id} className="card article-card flex flex-col gap-4">
              {item.thumbnailUrl ? (
                <div className="card-media">
                  <Image
                    src={item.thumbnailUrl}
                    alt={`${item.title} thumbnail`}
                    width={1200}
                    height={630}
                    className="h-52 w-full object-cover"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <p className="article-meta text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                  {getTypeLabel(item.mediaType)}
                </p>
                {item.highlight ? (
                  <span className="pill-badge pill-badge-active text-xs">
                    ★ {item.highlightNote?.trim() || 'Featured'}
                  </span>
                ) : null}
              </div>
              <h2 className="article-title text-xl font-semibold text-[color:var(--color-ink)]">{item.title}</h2>
              {item.publishedAt ? (
                <p className="text-sm text-[color:var(--color-muted)]">Published {formatDate(item.publishedAt)}</p>
              ) : null}
              {item.description ? (
                <p className="text-sm text-[color:var(--color-muted)]">{item.description}</p>
              ) : null}
              <div>
                <CmsLink className="article-cta link-pill link-pill-media" href={item.url}>
                  Open media
                </CmsLink>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card article-card flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">Latest campaign updates</h2>
          <ul className="grid gap-3">
            {posts.map((post) => (
              <li key={post.slug} className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">
                <p className="article-meta text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
                  {formatDate(post.publishedAt)}
                </p>
                <p className="article-title mt-2 text-sm font-semibold text-[color:var(--color-ink)]">{post.title}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="card article-card flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">Upcoming public events</h2>
          <ul className="grid gap-3">
            {events.slice(0, 4).map((event) => (
              <li key={event.id} className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">
                <p className="article-title text-sm font-semibold text-[color:var(--color-ink)]">{event.title}</p>
                <p className="mt-1 text-sm text-[color:var(--color-muted)]">{event.location}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  )
}
