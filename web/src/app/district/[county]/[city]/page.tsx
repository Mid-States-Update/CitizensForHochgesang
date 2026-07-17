import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'

import {ArticleContent} from '@/components/article-content'
import {PageEffects} from '@/components/page-effects'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
import {getCityPageBySlug, getCityPages, getPageVisualSettings, getSiteSettings} from '@/lib/cms/repository'
import type {CountyIssueTag} from '@/lib/cms/types'

type CityPageProps = {
  params: Promise<{county: string; city: string}>
}

const TAG_LABELS: Record<CountyIssueTag, string> = {
  stand: 'Where I stand',
  listening: "I'm listening",
  radar: 'On my radar',
}

export async function generateStaticParams() {
  const cities = await getCityPages()
  if (cities.length === 0) {
    // output:export rejects dynamic routes with zero params. Until the first
    // city page is published in Sanity, emit one unlinked placeholder path.
    return [{county: 'coming-soon', city: 'coming-soon'}]
  }
  return cities.map((city) => ({county: city.countySlug, city: city.slug}))
}

export async function generateMetadata({params}: CityPageProps): Promise<Metadata> {
  const {county: countySlug, city: citySlug} = await params
  const city = await getCityPageBySlug(countySlug, citySlug)

  if (!city) {
    return {title: 'City pages coming soon', robots: {index: false}}
  }

  return {
    title: city.title,
    description: city.intro,
  }
}

export default async function CityPage({params}: CityPageProps) {
  const {county: countySlug, city: citySlug} = await params
  const [city, pageVisualSettings, siteSettings] = await Promise.all([
    getCityPageBySlug(countySlug, citySlug),
    getPageVisualSettings('platform'),
    getSiteSettings(),
  ])

  if (!city) {
    // Only reachable via the coming-soon placeholder param (real slugs are
    // enumerated from published documents at build time).
    return (
      <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
        <PageEffects visuals={pageVisualSettings} />
        <section className="card grid gap-4">
          <p className="eyebrow">Your town</p>
          <h1 className="section-title">City pages are on the way</h1>
          <p className="max-w-3xl text-base text-[color:var(--color-muted)]">
            Pages for District 48 towns are being prepared. In the meantime, the platform page covers where Brad
            stands.
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

  const formattedUpdated = new Date(`${city.lastUpdated}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
      <PageEffects visuals={pageVisualSettings} />

      <section className="card grid gap-4">
        <Link
          className="text-sm font-semibold text-[color:var(--color-accent)] hover:underline"
          href={`/district/${city.countySlug}`}
        >
          ← Back to the county page
        </Link>
        <p className="eyebrow">Your town</p>
        <h1 className="section-title">{city.title}</h1>
        <p className="max-w-3xl text-base text-[color:var(--color-muted)]">{city.intro}</p>
        {city.heroImageUrl ? (
          <Image
            src={city.heroImageUrl}
            alt={city.heroImageAlt ?? `Brad Hochgesang in ${city.title}`}
            width={1200}
            height={800}
            className="w-full rounded-2xl object-cover"
          />
        ) : null}
      </section>

      <section className="card grid gap-4">
        <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">{city.ledeTitle}</h2>
        <ArticleContent body={city.ledeBody} layout="flow" />
      </section>

      <section className="grid gap-4">
        <h2 className="section-title">What I&apos;m hearing in {city.title}</h2>
        <div className="grid gap-4">
          {city.issueCards.map((card) => (
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
          <p className="text-base text-[color:var(--color-ink)]">{city.listeningPrompt}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {siteSettings.contactEmail ? (
            <a
              className="btn btn-primary"
              href={`mailto:${siteSettings.contactEmail}?subject=${encodeURIComponent(`From ${city.title}`)}`}
            >
              Tell me what I&apos;m missing
            </a>
          ) : null}
          <Link className="btn btn-outline" href="/events">
            Meet me in person
          </Link>
        </div>
        <p className="text-xs text-[color:var(--color-muted)]">Page last updated {formattedUpdated}.</p>
      </section>
    </main>
  )
}
