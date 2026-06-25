'use client'

import {useEffect, useRef, useState, useCallback, useSyncExternalStore} from 'react'

// ---------------------------------------------------------------------------
// prefers-reduced-motion — read via useSyncExternalStore so it's hydration-safe
// and doesn't require a setState call inside an effect.
// ---------------------------------------------------------------------------
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(callback: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia(REDUCED_MOTION_QUERY)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  )
}

// ---------------------------------------------------------------------------
// Character pools — each character type scrambles within its own set
// ---------------------------------------------------------------------------
const DIGITS = '0123456789'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'

// Characters that appear in place from frame 0 (anchors)
const ANCHORS = new Set(['$', '%', '.', ',', ' '])

function poolFor(char: string): string {
  if (ANCHORS.has(char)) return char
  if (DIGITS.includes(char)) return DIGITS
  if (UPPER.includes(char)) return UPPER
  if (LOWER.includes(char)) return LOWER
  // Anything else stays fixed
  return char
}

function randomFromPool(pool: string): string {
  return pool[Math.floor(Math.random() * pool.length)]
}

// ---------------------------------------------------------------------------
// Exported configuration type — every knob in one place
// ---------------------------------------------------------------------------
export type SlotValueConfig = {
  /** Total animation duration in ms (default: 1200) */
  duration?: number
  /** How often characters cycle in ms — lower = faster spinning (default: 50) */
  tickInterval?: number
  /** Stagger delay between each character resolving, in ms (default: 80) */
  charStagger?: number
  /** Delay before animation starts after entering viewport, in ms (default: 0) */
  startDelay?: number
  /** IntersectionObserver threshold 0–1 (default: 0.3) */
  triggerThreshold?: number
  /** If true, replays each time the element scrolls into view (default: false) */
  replayOnReenter?: boolean
}

type SlotValueProps = SlotValueConfig & {
  /** The final value string to display (e.g. "81%", "$65M") */
  value: string
  className?: string
}

// ---------------------------------------------------------------------------
// Core scramble logic — pure function, extracted for testability
// ---------------------------------------------------------------------------

/** Build the display string for one animation frame. */
export function buildFrame(
  target: string,
  resolvedCount: number,
): string {
  return target
    .split('')
    .map((char, i) => {
      if (i < resolvedCount) return char
      const pool = poolFor(char)
      // Anchors ($ % . , space) show in place immediately
      if (pool.length <= 1) return char
      return randomFromPool(pool)
    })
    .join('')
}

/** Determine how many characters should be resolved at a given elapsed time. */
export function resolvedCountAt(
  elapsed: number,
  totalChars: number,
  duration: number,
  charStagger: number,
): number {
  if (elapsed >= duration) return totalChars
  // Each character resolves at: duration - (totalChars - 1 - i) * charStagger
  let count = 0
  for (let i = 0; i < totalChars; i++) {
    const resolveTime = duration - (totalChars - 1 - i) * charStagger
    if (elapsed >= resolveTime) count++
  }
  return count
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SlotValue({
  value,
  className,
  duration = 1200,
  tickInterval = 50,
  charStagger = 80,
  startDelay = 0,
  triggerThreshold = 0.3,
  replayOnReenter = false,
}: SlotValueProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)
  const hasPlayedRef = useRef(false)
  const reducedMotion = usePrefersReducedMotion()

  const animate = useCallback(() => {
    const totalChars = value.length
    let start: number | null = null
    let frameId: number

    function tick(timestamp: number) {
      if (start === null) start = timestamp
      const elapsed = timestamp - start

      const resolved = resolvedCountAt(elapsed, totalChars, duration, charStagger)
      setDisplay(buildFrame(value, resolved))

      if (resolved < totalChars) {
        frameId = requestAnimationFrame(tick)
      } else {
        // Ensure we land exactly on the target value
        setDisplay(value)
      }
    }

    // Use a slower tick rate by throttling rAF
    let lastTick = 0
    function throttledTick(timestamp: number) {
      if (start === null) start = timestamp
      if (timestamp - lastTick >= tickInterval) {
        lastTick = timestamp
        tick(timestamp)
      } else {
        // Still need to check for completion
        const elapsed = timestamp - start
        const resolved = resolvedCountAt(elapsed, value.length, duration, charStagger)
        if (resolved < value.length) {
          frameId = requestAnimationFrame(throttledTick)
        } else {
          setDisplay(value)
        }
      }
    }

    frameId = requestAnimationFrame(throttledTick)

    return () => cancelAnimationFrame(frameId)
  }, [value, duration, tickInterval, charStagger])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reduced-motion users see the final value directly (rendered below); skip
    // setting up the scramble animation entirely.
    if (reducedMotion) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!replayOnReenter && hasPlayedRef.current) return
            hasPlayedRef.current = true

            // Start with all characters scrambled
            setDisplay(buildFrame(value, 0))

            const timeoutId = setTimeout(() => {
              animate()
            }, startDelay)

            // If not replaying, disconnect after first trigger
            if (!replayOnReenter) {
              observer.disconnect()
            }

            return () => clearTimeout(timeoutId)
          }
        }
      },
      {threshold: triggerThreshold},
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [value, startDelay, triggerThreshold, replayOnReenter, animate, reducedMotion])

  return (
    <span
      ref={ref}
      className={className}
      aria-label={value}
    >
      {reducedMotion ? value : display}
    </span>
  )
}
