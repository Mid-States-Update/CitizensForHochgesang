// Shared scroll math for horizontal chip tracks and the events carousel.
// Pure functions so the swipe/arrow behavior stays testable without a DOM.

/** 2px slack absorbs subpixel scrollLeft values near the track edges. */
const EDGE_SLACK = 2

export type TrackScrollState = {
  canPrev: boolean
  canNext: boolean
}

export function trackScrollState(
  scrollLeft: number,
  clientWidth: number,
  scrollWidth: number
): TrackScrollState {
  return {
    canPrev: scrollLeft > EDGE_SLACK,
    canNext: scrollLeft + clientWidth < scrollWidth - EDGE_SLACK,
  }
}

/** Page by 80% of the visible width so a chip of context carries across. */
export function trackPageDelta(clientWidth: number, direction: 1 | -1): number {
  return Math.round(clientWidth * 0.8) * direction
}

/** Distance between the left edges of adjacent carousel slides. */
export function slideStride(slideWidth: number, gap: number): number {
  return slideWidth + gap
}

export function clampSlideIndex(index: number, count: number): number {
  if (count <= 0) {
    return 0
  }
  return Math.min(Math.max(index, 0), count - 1)
}

export function slideIndexFromScroll(
  scrollLeft: number,
  slideWidth: number,
  gap: number,
  count: number
): number {
  if (slideWidth <= 0) {
    return 0
  }
  const stride = slideStride(slideWidth, gap)
  return clampSlideIndex(Math.round(scrollLeft / stride), count)
}
