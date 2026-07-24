import {describe, it, expect} from 'vitest'

import {eventEndTime, filterUpcomingEvents, isEventPast} from './event-time'
import type {CampaignEvent} from './types'

function makeEvent(overrides: Partial<CampaignEvent>): CampaignEvent {
  return {
    id: overrides.id ?? 'e1',
    title: overrides.title ?? 'Test Event',
    slug: overrides.slug ?? 'test-event',
    startDate: overrides.startDate ?? '2026-07-22T18:30:00-04:00',
    location: overrides.location ?? 'Somewhere',
    ...overrides,
  }
}

// A fixed "now" two days after the sample event's 6:30 PM start.
const NOW = Date.parse('2026-07-24T12:00:00-04:00')

describe('eventEndTime', () => {
  it('uses endDate when present', () => {
    const event = makeEvent({startDate: '2026-07-22T18:30:00-04:00', endDate: '2026-07-22T20:00:00-04:00'})
    expect(eventEndTime(event)).toBe(Date.parse('2026-07-22T20:00:00-04:00'))
  })

  it('falls back to startDate when endDate is absent', () => {
    const event = makeEvent({startDate: '2026-07-22T18:30:00-04:00', endDate: undefined})
    expect(eventEndTime(event)).toBe(Date.parse('2026-07-22T18:30:00-04:00'))
  })
})

describe('isEventPast', () => {
  it('treats an event whose start has passed and has no end as past', () => {
    const event = makeEvent({startDate: '2026-07-22T18:30:00-04:00'})
    expect(isEventPast(event, NOW)).toBe(true)
  })

  it('keeps an event whose end time is still in the future', () => {
    const event = makeEvent({startDate: '2026-07-22T18:30:00-04:00', endDate: '2026-07-25T20:00:00-04:00'})
    expect(isEventPast(event, NOW)).toBe(false)
  })

  it('treats an event still running (started, not yet ended) as not past', () => {
    const event = makeEvent({startDate: '2026-07-24T11:00:00-04:00', endDate: '2026-07-24T14:00:00-04:00'})
    expect(isEventPast(event, NOW)).toBe(false)
  })

  it('treats an event ending exactly at now as past (matches GROQ strict >)', () => {
    const event = makeEvent({startDate: '2026-07-24T12:00:00-04:00'})
    expect(isEventPast(event, NOW)).toBe(true)
  })

  it('keeps an event with an unparseable date rather than hiding it', () => {
    const event = makeEvent({startDate: 'not-a-date', endDate: undefined})
    expect(isEventPast(event, NOW)).toBe(false)
  })
})

describe('filterUpcomingEvents', () => {
  it('drops past events and keeps upcoming ones', () => {
    const past = makeEvent({id: 'past', startDate: '2026-07-22T18:30:00-04:00'})
    const upcoming = makeEvent({id: 'soon', startDate: '2026-07-30T18:30:00-04:00'})
    expect(filterUpcomingEvents([past, upcoming], NOW).map((e) => e.id)).toEqual(['soon'])
  })

  it('preserves order of the events it keeps', () => {
    const a = makeEvent({id: 'a', startDate: '2026-07-30T18:30:00-04:00'})
    const b = makeEvent({id: 'b', startDate: '2026-08-01T18:30:00-04:00'})
    expect(filterUpcomingEvents([a, b], NOW).map((e) => e.id)).toEqual(['a', 'b'])
  })
})
