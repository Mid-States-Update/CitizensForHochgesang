'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa'

import {CmsLink} from '@/components/cms-link'
import {formatDateTime} from '@/lib/cms/format'
import type {CampaignEvent} from '@/lib/cms/types'
import {clampSlideIndex, slideIndexFromScroll, slideStride, trackScrollState} from '@/lib/scroll-track'

// The carousel is a teaser under the hero; /events carries the full list.
const MAX_SLIDES = 8

function eventHref(event: CampaignEvent): string {
  return event.slug ? `/events/details#${encodeURIComponent(event.slug)}` : '/events'
}

/**
 * Slim "Upcoming events" band under the hero: swipeable snap slides on
 * mobile (next card peeks in), one slide with chevron paging on desktop.
 */
export function UpcomingEventsCarousel({events}: {events: CampaignEvent[]}) {
  const slides = events.slice(0, MAX_SLIDES)
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
    setScrollState(trackScrollState(el.scrollLeft, el.clientWidth, el.scrollWidth))
  }, [slides.length])

  useEffect(sync)
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
