import {describe, expect, it} from 'vitest'

import {
  clampSlideIndex,
  slideIndexFromScroll,
  slideStride,
  trackPageDelta,
  trackScrollState,
} from './scroll-track'

describe('trackScrollState', () => {
  it('reports neither direction when content fits', () => {
    expect(trackScrollState(0, 500, 500)).toEqual({canPrev: false, canNext: false})
  })

  it('reports only next at the far left of overflowing content', () => {
    expect(trackScrollState(0, 500, 2000)).toEqual({canPrev: false, canNext: true})
  })

  it('reports both directions mid-scroll', () => {
    expect(trackScrollState(600, 500, 2000)).toEqual({canPrev: true, canNext: true})
  })

  it('reports only prev at the far right', () => {
    expect(trackScrollState(1500, 500, 2000)).toEqual({canPrev: true, canNext: false})
  })

  it('tolerates subpixel rounding at the edges', () => {
    // Chrome can report scrollLeft ~1px short of the true end
    expect(trackScrollState(1499.4, 500, 2000)).toEqual({canPrev: true, canNext: false})
    expect(trackScrollState(0.6, 500, 2000)).toEqual({canPrev: false, canNext: true})
  })
})

describe('trackPageDelta', () => {
  it('advances most of one viewport so context chips stay visible', () => {
    expect(trackPageDelta(500, 1)).toBe(400)
  })

  it('goes backwards for the prev direction', () => {
    expect(trackPageDelta(500, -1)).toBe(-400)
  })
})

describe('slideStride', () => {
  it('is the slide width plus the track gap', () => {
    expect(slideStride(300, 16)).toBe(316)
  })
})

describe('clampSlideIndex', () => {
  it('keeps in-range indexes unchanged', () => {
    expect(clampSlideIndex(2, 5)).toBe(2)
  })

  it('clamps below zero to zero', () => {
    expect(clampSlideIndex(-1, 5)).toBe(0)
  })

  it('clamps past the end to the last slide', () => {
    expect(clampSlideIndex(7, 5)).toBe(4)
  })

  it('returns zero when there are no slides', () => {
    expect(clampSlideIndex(3, 0)).toBe(0)
  })
})

describe('slideIndexFromScroll', () => {
  it('maps scroll position to the nearest slide', () => {
    expect(slideIndexFromScroll(0, 300, 16, 4)).toBe(0)
    expect(slideIndexFromScroll(316, 300, 16, 4)).toBe(1)
    expect(slideIndexFromScroll(500, 300, 16, 4)).toBe(2)
  })

  it('rounds to nearest rather than truncating mid-swipe positions', () => {
    expect(slideIndexFromScroll(160, 300, 16, 4)).toBe(1)
    expect(slideIndexFromScroll(150, 300, 16, 4)).toBe(0)
  })

  it('never exceeds the last slide even with overscroll', () => {
    expect(slideIndexFromScroll(5000, 300, 16, 4)).toBe(3)
  })

  it('handles zero slide width without dividing by zero', () => {
    expect(slideIndexFromScroll(120, 0, 16, 4)).toBe(0)
  })
})
