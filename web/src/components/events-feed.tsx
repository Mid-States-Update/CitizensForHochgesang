'use client'

import Image from 'next/image'
import {useEffect, useMemo, useRef, useState} from 'react'

import {CmsLink} from '@/components/cms-link'
import {formatDateTime} from '@/lib/cms/format'
import {getSanityImageUrl} from '@/lib/cms/image-url'
import type {CampaignEvent} from '@/lib/cms/types'

const RATIO_DIMENSIONS: Record<string, {width: number; height: number; className: string}> = {
  '16:9': {width: 1600, height: 900, className: 'aspect-[16/9]'},
  '4:3': {width: 1200, height: 900, className: 'aspect-[4/3]'},
  '3:2': {width: 1500, height: 1000, className: 'aspect-[3/2]'},
  '1:1': {width: 1200, height: 1200, className: 'aspect-square'},
  '4:5': {width: 1200, height: 1500, className: 'aspect-[4/5]'},
  '3:4': {width: 1200, height: 1600, className: 'aspect-[3/4]'},
  '2:3': {width: 1000, height: 1500, className: 'aspect-[2/3]'},
  '9:16': {width: 900, height: 1600, className: 'aspect-[9/16]'},
}

const LAYOUT_CLASSNAMES: Record<string, string> = {
  stacked: 'news-card-layout-stacked',
  'image-left': 'news-card-layout-image-left',
  'image-right': 'news-card-layout-image-right',
  'feature-split': 'news-card-layout-feature-split',
  'no-photo': 'news-card-layout-no-photo',
}

const ANIMATION_CLASSNAMES: Record<string, string> = {
  'fade-up': 'news-card-anim-fade-up',
  'slide-up': 'news-card-anim-slide-up',
  'slide-left': 'news-card-anim-slide-left',
  'slide-right': 'news-card-anim-slide-right',
  none: 'news-card-anim-none',
}

type SortMode = 'soonest' | 'latest' | 'title'

type EventsFeedProps = {
  events: CampaignEvent[]
}

type PreparedEvent = CampaignEvent & {
  ratio: {width: number; height: number; className: string}
  layout: string
  animation: string
  scheduleImageUrl?: string
  isWidescreen: boolean
  isTallPortrait: boolean
  previewText: string | null
  isPassed: boolean
}

function toEasternComparableMs(input: string): number {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return Number.NaN
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const year = Number(byType.year)
  const month = Number(byType.month)
  const day = Number(byType.day)
  const hour = Number(byType.hour)
  const minute = Number(byType.minute)
  const second = Number(byType.second)

  return Date.UTC(year, month - 1, day, hour, minute, second)
}

function getDescriptionPreview(event: CampaignEvent): string | null {
  const text = event.description?.trim() || ''
  if (!text) {
    return null
  }

  const defaultLimit = 2000
  const configuredLimit =
    event.eventDescriptionPreviewChars && event.eventDescriptionPreviewChars > 0
      ? event.eventDescriptionPreviewChars
      : defaultLimit
  const effectiveLimit =
    event.eventCardLayout === 'no-photo'
      ? Math.min(Math.max(configuredLimit, 1200), 2600)
      : Math.min(Math.max(configuredLimit, 240), 1200)

  return text.slice(0, effectiveLimit)
}

export function EventsFeed({events}: EventsFeedProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [tagQuery, setTagQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('soonest')
  const [visibleCount, setVisibleCount] = useState(6)
  const [showPast, setShowPast] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const applyTagFilter = (tag: string | null) => {
    setSelectedTag(tag)
    setVisibleCount(6)
  }

  const applySortMode = (mode: SortMode) => {
    setSortMode(mode)
    setVisibleCount(6)
  }

  const preparedEvents = useMemo(
    (): PreparedEvent[] => {
      const nowEasternMs = toEasternComparableMs(new Date().toISOString())
      const nowMs = Date.parse(new Date().toISOString())

      return events.map((event) => {
        const ratio = RATIO_DIMENSIONS[event.eventImageAspectRatio ?? '3:2'] ?? RATIO_DIMENSIONS['3:2']
        const layout = event.eventCardLayout ?? 'stacked'
        const animation = event.eventCardAnimation ?? 'fade-up'
        const scheduleImageUrl =
          getSanityImageUrl(event.scheduleImage, {width: ratio.width, height: ratio.height}) ?? event.scheduleImageUrl

        const eventEndSource = event.endDate ?? event.startDate
        const eventEndEasternMs = toEasternComparableMs(eventEndSource)

        return {
          ...event,
          ratio,
          layout,
          animation,
          scheduleImageUrl,
          isWidescreen: (event.eventImageAspectRatio ?? '3:2') === '16:9',
          isTallPortrait: (event.eventImageAspectRatio ?? '3:2') === '9:16',
          previewText: getDescriptionPreview(event),
          tags: event.tags ?? [],
          isPassed: Number.isFinite(eventEndEasternMs)
            ? eventEndEasternMs < nowEasternMs
            : Date.parse(eventEndSource) < nowMs,
        }
      })
    },
    [events]
  )

  // Tag counts reflect only upcoming events so the badges match what's visible
  // by default (past events are hidden until the user expands them).
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const event of preparedEvents) {
      if (event.isPassed) {
        continue
      }

      for (const tag of event.tags ?? []) {
        const normalized = tag.trim()
        if (!normalized) {
          continue
        }

        counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1]
        }

        return a[0].localeCompare(b[0])
      })
      .map(([tag, count]) => ({tag, count}))
  }, [preparedEvents])

  const filteredTagCounts = useMemo(() => {
    const query = tagQuery.trim().toLowerCase()
    if (!query) {
      return tagCounts
    }

    return tagCounts.filter(({tag}) => tag.toLowerCase().includes(query))
  }, [tagCounts, tagQuery])

  // Upcoming events — sorted by selected sort mode (default: soonest first)
  const filteredUpcoming = useMemo(() => {
    const filtered = preparedEvents.filter(
      (event) =>
        !event.isPassed &&
        (!selectedTag || event.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())),
    )

    const sorted = [...filtered]
    if (sortMode === 'soonest') {
      sorted.sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate))
    } else if (sortMode === 'latest') {
      sorted.sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    }
    return sorted
  }, [preparedEvents, selectedTag, sortMode])

  // Past events — always most-recent-first
  const filteredPast = useMemo(() => {
    const filtered = preparedEvents.filter(
      (event) =>
        event.isPassed &&
        (!selectedTag || event.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())),
    )
    return [...filtered].sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))
  }, [preparedEvents, selectedTag])

  // Collapse the past-events section automatically when the tag filter changes
  // and the current tag has no past events (avoids an empty open section).
  // Adjusted during render (React's recommended alternative to a setState
  // effect) by tracking the previous emptiness of the past list.
  const pastIsEmpty = filteredPast.length === 0
  const [prevPastIsEmpty, setPrevPastIsEmpty] = useState(pastIsEmpty)
  if (pastIsEmpty !== prevPastIsEmpty) {
    setPrevPastIsEmpty(pastIsEmpty)
    if (pastIsEmpty && showPast) {
      setShowPast(false)
    }
  }

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }

    if (visibleCount >= filteredUpcoming.length) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + 4, filteredUpcoming.length))
        }
      },
      {rootMargin: '240px 0px'}
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [filteredUpcoming.length, visibleCount])

  const visibleUpcoming = filteredUpcoming.slice(0, visibleCount)

  return (
    <section className="grid gap-6">
      {/* Filter / sort bar */}
      <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/70 p-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">Filter tags</span>
          <label className="tag-search-shell" aria-label="Search event tags">
            <input
              type="search"
              value={tagQuery}
              onChange={(event) => setTagQuery(event.target.value)}
              placeholder="Search tags"
              className="tag-search-input"
            />
          </label>
          <div className="tag-rail-scroll" role="group" aria-label="Event tags sorted by number of events">
            <div className="tag-rail-grid">
              <button
                type="button"
                onClick={() => applyTagFilter(null)}
                className={`pill-badge ${selectedTag === null ? 'pill-badge-active' : ''}`}
              >
                <span>All</span>
                {filteredUpcoming.length >= 2 ? <span className="pill-badge-count">{filteredUpcoming.length}</span> : null}
              </button>
              {filteredTagCounts.map(({tag, count}) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => applyTagFilter(tag)}
                  className={`pill-badge ${selectedTag === tag ? 'pill-badge-active' : ''}`}
                >
                  <span>{tag}</span>
                  {count >= 2 ? <span className="pill-badge-count">{count}</span> : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="flex shrink-0 items-center gap-2 text-sm text-[color:var(--color-muted)]">
          <span>Sort</span>
          <select
            className="w-28 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-sm text-[color:var(--color-ink)] sm:w-36"
            value={sortMode}
            onChange={(event) => applySortMode(event.target.value as SortMode)}
          >
            <option value="soonest">Soonest</option>
            <option value="latest">Latest</option>
            <option value="title">Title A-Z</option>
          </select>
        </label>
      </div>

      {/* Upcoming events */}
      {filteredUpcoming.length === 0 ? (
        <p className="text-sm text-[color:var(--color-muted)]">No upcoming events{selectedTag ? ` tagged "${selectedTag}"` : ''}.</p>
      ) : (
        visibleUpcoming.map((event) => <EventCard key={event.id} event={event} selectedTag={selectedTag} onTagClick={applyTagFilter} />)
      )}

      {/* Infinite scroll sentinel for upcoming events */}
      {visibleCount < filteredUpcoming.length ? (
        <div ref={sentinelRef} className="h-10 w-full" aria-hidden="true" />
      ) : null}

      {/* Past events toggle */}
      {filteredPast.length > 0 ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[color:var(--color-border)]" />
            <button
              type="button"
              onClick={() => setShowPast((v) => !v)}
              className="pill-badge shrink-0"
            >
              {showPast
                ? 'Hide past events'
                : `Show ${filteredPast.length} past event${filteredPast.length === 1 ? '' : 's'}`}
            </button>
            <div className="h-px flex-1 bg-[color:var(--color-border)]" />
          </div>

          {showPast
            ? filteredPast.map((event) => (
                <EventCard key={event.id} event={event} selectedTag={selectedTag} onTagClick={applyTagFilter} />
              ))
            : null}
        </div>
      ) : null}
    </section>
  )
}

// ---------------------------------------------------------------------------
// EventCard — extracted to avoid repetition in both sections
// ---------------------------------------------------------------------------

type EventCardProps = {
  event: PreparedEvent
  selectedTag: string | null
  onTagClick: (tag: string) => void
}

function EventCard({event, selectedTag, onTagClick}: EventCardProps) {
  const layoutClass = LAYOUT_CLASSNAMES[event.layout] ?? LAYOUT_CLASSNAMES.stacked
  const animationClass = ANIMATION_CLASSNAMES[event.animation] ?? ANIMATION_CLASSNAMES['fade-up']
  const showMedia = event.layout !== 'no-photo' && !!event.scheduleImageUrl
  const detailHref = event.slug ? `/events/details#${encodeURIComponent(event.slug)}` : null
  const primaryHref = detailHref ?? event.rsvpLink ?? null

  return (
    <article className={`card article-card news-card ${layoutClass} ${animationClass}`}>
      <div className="news-card-content-wrap">
        {showMedia ? (
          primaryHref ? (
            <CmsLink
              href={primaryHref}
              className={`card-media news-card-media ${event.ratio.className} ${event.isWidescreen ? 'news-card-media-widescreen' : ''} ${event.isTallPortrait ? 'news-card-media-tall-portrait' : ''}`}
              aria-label={`View ${event.title}`}
            >
              <Image
                src={event.scheduleImageUrl!}
                alt={`${event.title} event image`}
                width={event.ratio.width}
                height={event.ratio.height}
                className="h-full w-full object-cover"
                unoptimized
              />
            </CmsLink>
          ) : (
            <div
              className={`card-media news-card-media ${event.ratio.className} ${event.isWidescreen ? 'news-card-media-widescreen' : ''} ${event.isTallPortrait ? 'news-card-media-tall-portrait' : ''}`}
            >
              <Image
                src={event.scheduleImageUrl!}
                alt={`${event.title} event image`}
                width={event.ratio.width}
                height={event.ratio.height}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
          )
        ) : null}

        <div className="news-card-copy">
          <p className="article-meta text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            {formatDateTime(event.startDate)}
          </p>
          {event.isPassed ? (
            <p className="event-status-badge" aria-label="This event has passed">
              Passed
            </p>
          ) : null}
          <h2 className="article-title text-2xl font-semibold text-[color:var(--color-ink)]">
            {primaryHref ? (
              <CmsLink className="article-title-link" href={primaryHref}>
                {event.title}
              </CmsLink>
            ) : (
              event.title
            )}
          </h2>
          <p className="text-sm font-semibold text-[color:var(--color-ink)]">{event.location}</p>
          {event.previewText ? <p className="news-excerpt text-sm text-[color:var(--color-muted)]">{event.previewText}</p> : null}

          {event.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <li key={`${event.id}-${tag}`}>
                  <button
                    type="button"
                    onClick={() => onTagClick(tag)}
                    className={`pill-badge ${selectedTag === tag ? 'pill-badge-active' : ''}`}
                  >
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {event.rsvpLink ? (
            <p className="article-inline-cta text-sm font-semibold">
              <CmsLink className="article-inline-link" href={event.rsvpLink}>
                RSVP →
              </CmsLink>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
