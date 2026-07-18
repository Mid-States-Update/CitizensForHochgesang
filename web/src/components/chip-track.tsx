'use client'

import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react'
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa'

import {trackPageDelta, trackScrollState} from '@/lib/scroll-track'

type ChipTrackProps = {
  ariaLabel: string
  children: ReactNode
}

/**
 * One-line horizontal chip list: swipe on touch screens, chevron paging on
 * wider views. Arrows appear only when the chips actually overflow.
 */
export function ChipTrack({ariaLabel, children}: ChipTrackProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [{canPrev, canNext}, setScrollState] = useState({canPrev: false, canNext: false})

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) {
      return
    }
    const next = trackScrollState(el.scrollLeft, el.clientWidth, el.scrollWidth)
    // Bail out when unchanged so the after-every-render measure can't cascade
    setScrollState((prev) => (prev.canPrev === next.canPrev && prev.canNext === next.canNext ? prev : next))
  }, [])

  // Chip lists change with search filters without resizing the track, so
  // re-measure after every render (post-paint) and on track resizes.
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

  const page = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) {
      return
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({left: trackPageDelta(el.clientWidth, direction), behavior: reduceMotion ? 'auto' : 'smooth'})
  }

  const overflowing = canPrev || canNext

  return (
    <div className="chip-track-shell">
      {overflowing ? (
        <button type="button" className="chip-nav" aria-label="Scroll list left" disabled={!canPrev} onClick={() => page(-1)}>
          <FaChevronLeft aria-hidden />
        </button>
      ) : null}
      <div ref={trackRef} className="chip-track" role="group" aria-label={ariaLabel} onScroll={sync}>
        {children}
      </div>
      {overflowing ? (
        <button type="button" className="chip-nav" aria-label="Scroll list right" disabled={!canNext} onClick={() => page(1)}>
          <FaChevronRight aria-hidden />
        </button>
      ) : null}
    </div>
  )
}
