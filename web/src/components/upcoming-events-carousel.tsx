'use client'

import {useCallback, useEffect, useRef, useState, useSyncExternalStore} from 'react'
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa'

import {CmsLink} from '@/components/cms-link'
import {filterUpcomingEvents} from '@/lib/cms/event-time'
import {formatDateTime} from '@/lib/cms/format'
import type {CampaignEvent} from '@/lib/cms/types'
import {clampSlideIndex, slideIndexFromScroll, slideStride, trackScrollState} from '@/lib/scroll-track'

// The carousel is a teaser under the hero; /events carries the full list.
const MAX_SLIDES = 8

const NO_UPDATES = () => () => {}

// Snapshot of the visitor's clock, captured once on the client and cached so
// useSyncExternalStore always sees a stable value (an uncached Date.now() would
// change every render and loop). Server renders read `null` — leaving the
// build's event list untouched so hydration matches — then the client swaps in
// the real time.
let clientNow: number | null = null
function getClientNow(): number {
  if (clientNow === null) {
    clientNow = Date.now()
  }
  return clientNow
}
function getServerNow(): null {
  return null
}

function eventHref(event: CampaignEvent): string {
  return event.slug ? `/events/details#${encodeURIComponent(event.slug)}` : '/events'
}

/**
 * Slim "Upcoming events" band under the hero: swipeable snap slides on
 * mobile (next card peeks in), one slide with chevron paging on desktop.
 */
export function UpcomingEventsCarousel({events}: {events: CampaignEvent[]}) {
  // This is a static export: the build-time `now()` in getUpcomingEvents is
  // frozen into the HTML, so an event that ends between the build and a visit
  // can still appear. Re-filter against the visitor's clock. The server snapshot
  // is `null`, so the first client render matches the SSR HTML (no hydration
  // mismatch); after hydration the real time swaps in and past events drop out.
  const now = useSyncExternalStore(NO_UPDATES, getClientNow, getServerNow)

  const visibleEvents = now === null ? events : filterUpcomingEvents(events, now)
  const slides = visibleEvents.slice(0, MAX_SLIDES)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [index, setIndex] = useState(0)
  const [{canPrev, canNext}, setScrollState] = useState({canPrev: false, canNext: slides.length > 1})

  const measure = () => {
    const el = trackRef.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) {
      return null
    }
    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0
    return {el, slideWidth: first.offsetWidth, gap}
  }

  const sync = useCallback(() => {
    const measured = measure()
    if (!measured) {
      return
    }
    const {el, slideWidth, gap} = measured
    setIndex(slideIndexFromScroll(el.scrollLeft, slideWidth, gap, slides.length))
    const next = trackScrollState(el.scrollLeft, el.clientWidth, el.scrollWidth)
    // Bail out when unchanged so the after-every-render measure can't cascade
    setScrollState((prev) => (prev.canPrev === next.canPrev && prev.canNext === next.canNext ? prev : next))
  }, [slides.length])

  // Measure post-paint after each render, and again on track resizes
  useEffect(() => {
    const frame = requestAnimationFrame(sync)
    return () => cancelAnimationFrame(frame)
  })
  useEffect(() => {
    const el = trackRef.current
    if (!el) {
      return
    }
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [sync])

  const goTo = (next: number) => {
    const measured = measure()
    if (!measured) {
      return
    }
    const {el, slideWidth, gap} = measured
    const target = clampSlideIndex(next, slides.length)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({left: target * slideStride(slideWidth, gap), behavior: reduceMotion ? 'auto' : 'smooth'})
  }

  if (slides.length === 0) {
    return null
  }

  return (
    <section className="event-carousel" aria-roledescription="carousel" aria-label="Upcoming events">
      <div className="event-carousel-head">
        <span className="event-ribbon-label">Upcoming events</span>
        {slides.length > 1 ? (
          <span className="event-carousel-count" aria-live="polite">
            {index + 1} of {slides.length}
          </span>
        ) : null}
        {slides.length > 1 ? (
          <div className="event-carousel-nav">
            <button type="button" className="chip-nav" aria-label="Previous event" disabled={!canPrev} onClick={() => goTo(index - 1)}>
              <FaChevronLeft aria-hidden />
            </button>
            <button type="button" className="chip-nav" aria-label="Next event" disabled={!canNext} onClick={() => goTo(index + 1)}>
              <FaChevronRight aria-hidden />
            </button>
          </div>
        ) : null}
        <CmsLink href="/events" className="event-carousel-all">
          All events →
        </CmsLink>
      </div>
      <div ref={trackRef} className="event-carousel-track" onScroll={sync}>
        {slides.map((event, slideIndex) => (
          <CmsLink
            key={event.id}
            href={eventHref(event)}
            className="event-carousel-card"
            aria-label={`Event ${slideIndex + 1} of ${slides.length}: ${event.title}`}
          >
            <span aria-hidden>📍</span>
            <span className="event-ribbon-title">{event.title}</span>
            <span className="event-ribbon-meta">{formatDateTime(event.startDate)}</span>
            <span className="event-ribbon-meta">{event.location}</span>
            <span className="event-ribbon-cta">View event →</span>
          </CmsLink>
        ))}
      </div>
    </section>
  )
}
