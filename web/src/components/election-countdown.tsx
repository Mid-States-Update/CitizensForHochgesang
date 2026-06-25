'use client'

import {useEffect, useMemo, useState, useSyncExternalStore} from 'react'
import {PortableText, type PortableTextComponents} from '@portabletext/react'
import {CmsLink} from '@/components/cms-link'
import {sharedBlockTypes} from '@/components/portable-block-types'
import type {CountdownTimer, PostBodyNode} from '@/lib/cms/types'

// Hydration-safe "are we on the client yet" gate. Returns false during SSR and
// the first client render (so server/client markup match), then true after
// hydration — without calling setState inside an effect.
const emptySubscribe = () => () => {}
function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

// ---------------------------------------------------------------------------
// Pure helpers — exported for testing
// ---------------------------------------------------------------------------

export type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

const ZERO_TIME: TimeLeft = {days: 0, hours: 0, minutes: 0, seconds: 0, total: 0}

/** Compute the time remaining until a target date. Returns zeroes if past or target is invalid/null. */
export function computeTimeLeft(target: Date | null | undefined, now: Date = new Date()): TimeLeft {
  if (!target || isNaN(target.getTime())) return ZERO_TIME
  const total = Math.max(0, target.getTime() - now.getTime())
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / 1000 / 60 / 60) % 24)
  const days = Math.floor(total / 1000 / 60 / 60 / 24)
  return {days, hours, minutes, seconds, total}
}

/** Pad a number to a minimum width with leading zeroes. */
export function padValue(value: number, width: number = 2): string {
  return String(value).padStart(width, '0')
}

/** Parse a date string / Date / null safely. Returns null for invalid input. */
function safeDate(v: string | Date | null | undefined): Date | null {
  if (!v) return null
  const d = typeof v === 'string' ? new Date(v) : v
  return isNaN(d.getTime()) ? null : d
}

// ---------------------------------------------------------------------------
// Timer filtering & selection — exported for testing
// ---------------------------------------------------------------------------

export type ResolvedTimer = CountdownTimer & {
  _index: number
  _target: Date
}

/**
 * Filter, enrich, and sort countdown timers.
 *
 * Rules:
 * - Disabled timers (enabled === false) are excluded.
 * - Timers without a valid targetDate are excluded.
 * - Timers whose targetDate is in the past are excluded.
 * - Sorted by targetDate ascending.
 */
export function resolveTimers(timers: CountdownTimer[], now: Date = new Date()): ResolvedTimer[] {
  const resolved: ResolvedTimer[] = []

  for (let i = 0; i < timers.length; i++) {
    const t = timers[i]
    if (t.enabled === false) continue

    const target = safeDate(t.targetDate)
    if (!target) continue

    if (target.getTime() < now.getTime()) continue

    resolved.push({...t, _index: i, _target: target})
  }

  resolved.sort((a, b) => a._target.getTime() - b._target.getTime())
  return resolved
}

/**
 * Pick the default timer to display.
 * Returns the earliest timer (index 0) since resolveTimers sorts ascending.
 */
export function pickDefault(timers: ResolvedTimer[]): number {
  if (timers.length === 0) return -1
  return 0
}

// ---------------------------------------------------------------------------
// FlipDigit — old-school split-flap digit with 3D card flip
//
// Architecture:
//   Static upper half  — always shows the NEW digit (revealed as top flap peels away)
//   Static lower half  — shows OLD digit during flip, NEW when settled
//   Top flap           — covers upper half, shows OLD digit, rotates -90deg (peels down)
//   Bottom flap        — covers lower half, shows NEW digit, starts at 90deg, rotates to 0deg
//   Center line        — decorative hinge
//
// Timeline (600ms total):
//   0–300ms   top flap  rotateX(0 → −90deg)  ease-in   — reveals new digit on upper half
//   300–600ms bottom flap rotateX(90 → 0deg)   ease-out  — covers old digit on lower half
//   600ms     static lower updates to new digit, flaps removed
// ---------------------------------------------------------------------------

function FlipDigit({digit}: {digit: string}) {
  const [display, setDisplay] = useState(digit)
  const [prev, setPrev] = useState(digit)
  const [flipping, setFlipping] = useState(false)

  // When a new digit arrives, capture the outgoing one and start the flip.
  // Adjusted during render (React's recommended alternative to a setState
  // effect); the condition converges immediately since display becomes digit.
  if (digit !== display) {
    setPrev(display)
    setDisplay(digit)
    setFlipping(true)
  }

  // End the flip 600ms after it begins. The setState runs in the timeout
  // callback, not synchronously in the effect body.
  useEffect(() => {
    if (!flipping) return
    const timer = setTimeout(() => setFlipping(false), 600)
    return () => clearTimeout(timer)
  }, [flipping, display])

  return (
    <span className="flip-digit" aria-hidden="true">
      <span className="flip-upper">
        <span className="flip-char">{display}</span>
      </span>
      <span className="flip-lower">
        <span className="flip-char">{flipping ? prev : display}</span>
      </span>
      <span className="flip-hinge" />
      {flipping && (
        <span key={`t${prev}-${display}`} className="flip-flap-top">
          <span className="flip-char">{prev}</span>
        </span>
      )}
      {flipping && (
        <span key={`b${prev}-${display}`} className="flip-flap-bot">
          <span className="flip-char">{display}</span>
        </span>
      )}
    </span>
  )
}

// ---------------------------------------------------------------------------
// FlipGroup — a labelled set of digits (e.g. "03" for hours)
// ---------------------------------------------------------------------------

function FlipGroup({value, label}: {value: string; label: string}) {
  return (
    <div className="flip-group">
      <div className="flip-digits" role="img" aria-label={`${parseInt(value, 10)} ${label}`}>
        {value.split('').map((char, i) => (
          <FlipDigit key={`${label}-${i}`} digit={char} />
        ))}
      </div>
      <span className="flip-label">{label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PortableText renderer shared by body + expiredBody
// ---------------------------------------------------------------------------

const countdownPTComponents: PortableTextComponents = {
  marks: {
    link: ({children, value}) => (
      <CmsLink href={value?.href} className="countdown-link">
        {children}
      </CmsLink>
    ),
  },
  types: {
    ...sharedBlockTypes,
    htmlEmbed: ({value}: {value: {html?: string}}) => {
      if (!value?.html) return null
      return <div className="countdown-html" dangerouslySetInnerHTML={{__html: value.html}} />
    },
  },
}

function RichBody({value, className}: {value: unknown[]; className?: string}) {
  return (
    <div className={className ?? 'election-countdown-body'}>
      <PortableText value={value as never} components={countdownPTComponents} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// SingleClock — renders one flip clock + body for a given timer
// ---------------------------------------------------------------------------

function SingleClock({timer}: {timer: ResolvedTimer}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(timer._target))
  const mounted = useIsClient()

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(computeTimeLeft(timer._target))
    }, 1000)
    return () => clearInterval(id)
  }, [timer._target])

  const display = mounted ? timeLeft : ZERO_TIME
  const isPast = mounted && timeLeft.total <= 0
  const hasBody = timer.body && timer.body.length > 0

  // Target passed → this timer hides; the next timer takes over.
  // When ALL timers are gone, ElectionCountdown shows the all-done message.
  if (isPast) return null

  const daysStr = padValue(display.days, display.days >= 100 ? 3 : 2)

  return (
    <>
      {timer.heading && (
        <h2 className="election-countdown-heading">{timer.heading}</h2>
      )}
      <div className="flip-clock" role="timer">
        <FlipGroup value={daysStr} label="Days" />
        <span className="flip-separator" aria-hidden="true">:</span>
        <FlipGroup value={padValue(display.hours)} label="Hours" />
        <span className="flip-separator" aria-hidden="true">:</span>
        <FlipGroup value={padValue(display.minutes)} label="Minutes" />
        <span className="flip-separator" aria-hidden="true">:</span>
        <FlipGroup value={padValue(display.seconds)} label="Seconds" />
      </div>
      {hasBody && <RichBody value={timer.body!} />}
    </>
  )
}

// ---------------------------------------------------------------------------
// ElectionCountdown — the full multi-timer section
// ---------------------------------------------------------------------------

export type ElectionCountdownConfig = {
  /** Array of countdown timers from Sanity */
  timers?: CountdownTimer[]
  /** Extra CSS class for the wrapper */
  className?: string
}

/**
 * Find the "all-done" message from the timer array.
 * Scans all enabled timers with a valid target date and returns the
 * expiredTitle / expiredBody from the one with the latest target.
 */
export function findAllDoneMessage(
  timers: CountdownTimer[],
): {expiredTitle?: string; expiredBody?: PostBodyNode[]} | null {
  let best: {target: number; expiredTitle?: string; expiredBody?: PostBodyNode[]} | null = null

  for (const t of timers) {
    if (t.enabled === false) continue
    const td = t.targetDate ? new Date(t.targetDate) : null
    if (!td || isNaN(td.getTime())) continue
    if (!t.expiredTitle && (!t.expiredBody || t.expiredBody.length === 0)) continue

    if (!best || td.getTime() > best.target) {
      best = {target: td.getTime(), expiredTitle: t.expiredTitle, expiredBody: t.expiredBody}
    }
  }

  return best ? {expiredTitle: best.expiredTitle, expiredBody: best.expiredBody} : null
}

export function ElectionCountdown({timers = [], className}: ElectionCountdownConfig) {
  const visible = useMemo(() => resolveTimers(timers), [timers])
  const defaultIdx = useMemo(() => pickDefault(visible), [visible])
  const [active, setActive] = useState(defaultIdx)

  // Sync active to default when timers change (e.g. SSR → hydration)
  useEffect(() => {
    setActive(defaultIdx)
  }, [defaultIdx])

  // All targets passed → show all-done message with zeroed clock, or hide entirely
  if (visible.length === 0) {
    const done = findAllDoneMessage(timers)
    if (!done) return null

    return (
      <section className={`election-countdown ${className ?? ''}`} aria-label="Countdown complete">
        <div className="election-countdown-inner">
          {done.expiredTitle && (
            <h2 className="election-countdown-heading">{done.expiredTitle}</h2>
          )}
          <div className="flip-clock" role="timer">
            <FlipGroup value="00" label="Days" />
            <span className="flip-separator" aria-hidden="true">:</span>
            <FlipGroup value="00" label="Hours" />
            <span className="flip-separator" aria-hidden="true">:</span>
            <FlipGroup value="00" label="Minutes" />
            <span className="flip-separator" aria-hidden="true">:</span>
            <FlipGroup value="00" label="Seconds" />
          </div>
          {done.expiredBody && done.expiredBody.length > 0 && (
            <RichBody value={done.expiredBody} className="election-countdown-body countdown-expired-body" />
          )}
        </div>
      </section>
    )
  }

  const safeActive = active >= 0 && active < visible.length ? active : 0
  const current = visible[safeActive]
  const showSelector = visible.length > 1

  return (
    <section className={`election-countdown ${className ?? ''}`} aria-label="Countdown timers">
      <div className="election-countdown-inner">
        {/* Selector pills (only when multiple timers) */}
        {showSelector && (
          <nav className="countdown-selector" aria-label="Select countdown timer">
            {visible.map((t, i) => (
              <button
                key={t._index}
                className={`countdown-pill ${i === safeActive ? 'countdown-pill-active' : ''}`}
                onClick={() => setActive(i)}
                aria-current={i === safeActive ? 'true' : undefined}
              >
                <span className="countdown-pill-label">{t.heading || `Timer ${i + 1}`}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Active clock */}
        <SingleClock key={current._index} timer={current} />
      </div>
    </section>
  )
}
