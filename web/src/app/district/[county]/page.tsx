import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'

import {ArticleContent} from '@/components/article-content'
import {PageEffects} from '@/components/page-effects'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
import {getCountyPageBySlug, getCountyPages, getPageVisualSettings, getSiteSettings} from '@/lib/cms/repository'
import type {CountyIssueTag} from '@/lib/cms/types'

type CountyPageProps = {
  params: Promise<{county: string}>
}

const TAG_LABELS: Record<CountyIssueTag, string> = {
  stand: 'Where I stand',
  listening: "I'm listening",
  radar: 'On my radar',
}

export async function generateStaticParams() {
  const counties = await getCountyPages()
  if (counties.length === 0) {
    // output:export rejects dynamic routes with zero params. Until the first
    // county page is published in Sanity, emit one unlinked placeholder path.
    return [{county: 'coming-soon'}]
  }
  return counties.map((county) => ({county: county.slug}))
}

export async function generateMetadata({params}: CountyPageProps): Promise<Metadata> {
  const {county: slug} = await params
  const county = await getCountyPageBySlug(slug)

  if (!county) {
    return {title: 'County pages coming soon', robots: {index: false}}
  }

  return {
    title: county.title,
    description: county.intro,
  }
}

export default async function CountyPage({params}: CountyPageProps) {
  const {county: slug} = await params
  const [county, pageVisualSettings, siteSettings] = await Promise.all([
    getCountyPageBySlug(slug),
    getPageVisualSettings('platform'),
    getSiteSettings(),
  ])

  if (!county) {
    // Only reachable via the coming-soon placeholder param (real slugs are
    // enumerated from published documents at build time).
    return (
      <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
        <PageEffects visuals={pageVisualSettings} />
        <section className="card grid gap-4">
          <p className="eyebrow">Your county</p>
          <h1 className="section-title">County pages are on the way</h1>
          <p className="max-w-3xl text-base text-[color:var(--color-muted)]">
            Pages for every District 48 county are being prepared. In the meantime, the platform page covers where
            Brad stands.
          </p>
          <div>
            <Link className="btn btn-primary" href="/platform">
              About &amp; Priorities
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const formattedUpdated = new Date(`${county.lastUpdated}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
      <PageEffects visuals={pageVisualSettings} />

      <section className="card grid gap-4">
        <p className="eyebrow">Your county</p>
        <h1 className="section-title">{county.title}</h1>
        <p className="text-sm text-[color:var(--color-muted)]">{county.townsLine}</p>
        <p className="max-w-3xl text-base text-[color:var(--color-muted)]">{county.intro}</p>
        {county.heroImageUrl ? (
          <Image
            src={county.heroImageUrl}
            alt={county.heroImageAlt ?? `Brad Hochgesang in ${county.title}`}
            width={1200}
            height={800}
            className="w-full rounded-2xl object-cover"
          />
        ) : null}
      </section>

      <section className="card grid gap-4">
        <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">{county.ledeTitle}</h2>
        <ArticleContent body={county.ledeBody} layout="flow" />
      </section>

      <section className="grid gap-4">
        <h2 className="section-title">What I&apos;m hearing in {county.title}</h2>
        <div className="grid gap-4">
          {county.issueCards.map((card) => (
            <article key={card.title} className="card grid gap-3">
              <span className={`county-tag county-tag-${card.tag}`}>{TAG_LABELS[card.tag]}</span>
              <h3 className="text-lg font-semibold text-[color:var(--color-ink)]">{card.title}</h3>
              <ArticleContent body={card.body} layout="flow" />
              {card.platformSlug ? (
                <Link
                  className="text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
                  href={`/platform/${card.platformSlug}`}
                >
                  Read where I stand →
                </Link>
              ) : null}
              {card.sources.length > 0 ? (
                <div className="county-sources">
                  <span className="font-semibold">Sources:</span>
                  {card.sources.map((source) => (
                    <a
                      key={source.url}
                      className="hover:underline"
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="card grid gap-4">
        <div className="county-listening grid gap-2">
          <p className="eyebrow">What am I missing?</p>
          <p className="text-base text-[color:var(--color-ink)]">{county.listeningPrompt}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {siteSettings.contactEmail ? (
            <a className="btn btn-primary" href={`mailto:${siteSettings.contactEmail}?subject=${encodeURIComponent(`From ${county.title}`)}`}>
              Tell me what I&apos;m missing
            </a>
          ) : null}
          <Link className="btn btn-outline" href="/events">
            Meet me in person
          </Link>
        </div>
      </section>

      <section className="card grid gap-3">
        {county.localOutlets.length > 0 ? (
          <>
            <p className="eyebrow">Local news in {county.title}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {county.localOutlets.map((outlet) => (
                <li key={outlet.url}>
                  <a
                    className="link-soft font-semibold"
                    href={outlet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {outlet.name}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="text-xs text-[color:var(--color-muted)]">Page last updated {formattedUpdated}.</p>
      </section>
    </main>
  )
}
