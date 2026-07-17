import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'

import {ArticleContent} from '@/components/article-content'
import {CmsLink} from '@/components/cms-link'
import {PageEffects} from '@/components/page-effects'
import {formatDateTime} from '@/lib/cms/format'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
import {assertPageEnabled, getPageVisualSettings, getUpcomingEvents} from '@/lib/cms/repository'

export const metadata: Metadata = {
  title: 'Event Details',
  description: 'Detailed campaign event information, updates, and related links.',
}

export default async function EventDetailsPage() {
  await assertPageEnabled('events')
  const [events, pageVisualSettings] = await Promise.all([
    getUpcomingEvents(),
    getPageVisualSettings('events-detail'),
  ])

  return (
    <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
      <PageEffects visuals={pageVisualSettings} />
      <section className="flex flex-col gap-4">
        <Link className="text-sm font-semibold text-[color:var(--color-accent)] hover:underline" href="/events">
          ← Back to Events
        </Link>
        <p className="eyebrow">Event Details</p>
        <h1 className="section-title">Detailed event information</h1>
        <p className="max-w-3xl text-sm text-[color:var(--color-muted)]">
          Review full event context, details, and related links for each campaign stop.
        </p>
      </section>

      <section className="grid gap-6">
        {events.map((event) => (
          // Keep id aligned with event slug so /events/details#slug links from the list land correctly.
          <article id={event.slug} key={event.id} className="card mx-auto w-full max-w-4xl scroll-mt-28">
            <div className="flex flex-col gap-5">
              <h2 className="hero-title text-4xl">{event.title}</h2>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
                {formatDateTime(event.startDate)}
              </p>
              <p className="text-sm font-semibold text-[color:var(--color-ink)]">{event.location}</p>

              {event.scheduleImageUrl ? (
                <div className="card-media">
                  <Image
                    src={event.scheduleImageUrl}
                    alt={`${event.title} event image`}
                    width={1600}
                    height={900}
                    className="h-auto w-full object-cover"
                    unoptimized
                  />
                </div>
              ) : null}

              {event.description ? <p className="text-base text-[color:var(--color-muted)]">{event.description}</p> : null}

              <ArticleContent body={event.detailBody ?? []} />

              {event.detailLinks && event.detailLinks.length > 0 ? (
                <section className="grid gap-3">
                  <p className="eyebrow">Related links</p>
                  <ul className="grid gap-2">
                    {event.detailLinks.map((item) => (
                      <li key={`${event.id}-${item.label}-${item.url}`}>
                        <CmsLink className="link-soft text-sm font-semibold" href={item.url}>
                          {item.label}
                        </CmsLink>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {event.rsvpLink ? (
                <p className="text-sm font-semibold">
                  <CmsLink className="article-inline-link" href={event.rsvpLink}>
                    RSVP →
                  </CmsLink>
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
