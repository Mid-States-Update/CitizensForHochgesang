import type {CampaignEvent} from './types'

/**
 * When an event is considered over. Mirrors the homepage GROQ filter
 * `coalesce(endDate, startDate) > now()`: use the scheduled end when set,
 * otherwise the start. Returns NaN for unparseable dates so callers can choose
 * to keep such events rather than silently hide them.
 */
export function eventEndTime(event: CampaignEvent): number {
  return Date.parse(event.endDate ?? event.startDate)
}

/**
 * True once an event is past its scheduled end time. An event whose date can't
 * be parsed is treated as NOT past — better to show a questionable event than
 * to make a real one vanish. Matches GROQ's strict `>`: an event ending exactly
 * at `now` counts as past.
 */
export function isEventPast(event: CampaignEvent, now: number): boolean {
  const end = eventEndTime(event)
  if (Number.isNaN(end)) {
    return false
  }
  return end <= now
}

/**
 * Keep only events that have not yet ended, evaluated against `now`.
 *
 * The site is a static export, so the build-time `now()` in getUpcomingEvents
 * is frozen into the HTML — an event that ends between the build and a visit
 * would otherwise still appear. Re-running this filter on the client against
 * the visitor's clock keeps a stale build honest.
 */
export function filterUpcomingEvents(events: CampaignEvent[], now: number): CampaignEvent[] {
  return events.filter((event) => !isEventPast(event, now))
}
