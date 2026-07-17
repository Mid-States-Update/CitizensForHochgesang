/**
 * All of District 48 observes Eastern time. Pin the formatters to it so the
 * static build renders the same wall-clock times no matter where it runs
 * (Cloudflare builds in UTC, which otherwise shifts a 6:30 PM event to
 * 10:30 PM and late-evening dates to the next day).
 */
const DISTRICT_TIME_ZONE = 'America/Indiana/Indianapolis'

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: DISTRICT_TIME_ZONE,
})

const DATETIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: DISTRICT_TIME_ZONE,
})

export function formatDate(date: string): string {
  const parsed = Date.parse(date)
  if (Number.isNaN(parsed)) {
    return date
  }

  return DATE_FORMATTER.format(parsed)
}

export function formatDateTime(date: string): string {
  const parsed = Date.parse(date)
  if (Number.isNaN(parsed)) {
    return date
  }

  return DATETIME_FORMATTER.format(parsed)
}

export function normalizeHref(url: string): string {
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/') ||
    url.startsWith('#') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:')
  ) {
    return url
  }

  return `https://${url}`
}

export function shouldOpenInNewTab(url: string): boolean {
  const href = normalizeHref(url)
  return href.startsWith('http://') || href.startsWith('https://')
}
