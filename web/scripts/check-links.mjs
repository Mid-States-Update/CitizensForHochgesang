const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'n2oyijjv'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-02-19'

const query = `{
  "site": *[_type=="siteSettings"][0]{donateUrl, volunteerUrl, socialLinks[]{label,url}},
  "events": *[_type=="event"]{_id, title, rsvpLink},
  "media": *[_type=="mediaLink"]{_id, title, url},
  "fundraising": *[_type=="fundraisingLink"]{_id, title, url}
}`

const apiUrl = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`)
apiUrl.searchParams.set('perspective', 'published')
apiUrl.searchParams.set('query', query)

const response = await fetch(apiUrl)
if (!response.ok) {
  console.error(`Failed to fetch content (${response.status})`)
  process.exit(1)
}

const payload = await response.json()
const result = payload.result

const knownInternalPrefixes = ['/', '/news', '/events', '/faq', '/media', '/press', '/support']

const links = []

if (result.site?.donateUrl) {
  links.push({source: 'siteSettings.donateUrl', label: 'Donate URL', url: result.site.donateUrl})
}
if (result.site?.volunteerUrl) {
  links.push({source: 'siteSettings.volunteerUrl', label: 'Volunteer URL', url: result.site.volunteerUrl})
}
for (const social of result.site?.socialLinks ?? []) {
  if (social?.url) {
    links.push({source: 'siteSettings.socialLinks', label: social.label ?? 'Social', url: social.url})
  }
}
for (const event of result.events ?? []) {
  if (event?.rsvpLink) {
    links.push({source: `event:${event._id}`, label: event.title ?? 'Event', url: event.rsvpLink})
  }
}
for (const media of result.media ?? []) {
  if (media?.url) {
    links.push({source: `mediaLink:${media._id}`, label: media.title ?? 'Media', url: media.url})
  }
}
for (const donation of result.fundraising ?? []) {
  if (donation?.url) {
    links.push({source: `fundraisingLink:${donation._id}`, label: donation.title ?? 'Fundraising', url: donation.url})
  }
}

const unique = Array.from(new Map(links.map((item) => [`${item.source}:${item.url}`, item])).values())

// Browser-like headers — many sites (news outlets especially) reject UA-less
// requests with 403/429.
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

// Statuses worth retrying — transient server/rate-limit responses.
const TRANSIENT = new Set([408, 425, 429, 500, 502, 503, 504])
// Statuses that mean a genuinely broken link (we control the reference) → fail.
const HARD_FAIL = new Set([404, 410])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Probe a URL: try HEAD then GET (some servers reject HEAD), retrying transient
// failures with backoff. Returns {ok, status, error}.
async function probe(url) {
  let lastStatus = 0
  let lastError = null

  for (const method of ['HEAD', 'GET']) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(url, {
          method,
          redirect: 'follow',
          headers: BROWSER_HEADERS,
          signal: AbortSignal.timeout(20000),
        })
        lastStatus = res.status
        lastError = null
        if (res.ok || (res.status >= 300 && res.status < 400)) {
          return {ok: true, status: res.status}
        }
        if (TRANSIENT.has(res.status) && attempt < 2) {
          await sleep(1500 * attempt)
          continue
        }
        break // non-transient (or out of retries) → fall through to GET / finish
      } catch (err) {
        lastError = err
        if (attempt < 2) {
          await sleep(1500 * attempt)
        }
      }
    }
  }

  return {ok: false, status: lastStatus, error: lastError}
}

let failures = 0
let warnings = 0

console.log(`Checking ${unique.length} published links...`)

for (const item of unique) {
  const url = item.url

  if (url.startsWith('/')) {
    const isKnown = knownInternalPrefixes.some((prefix) => url === prefix || url.startsWith(`${prefix}/`))
    if (isKnown) {
      console.log(`OK internal ${item.source} -> ${url}`)
    } else {
      console.log(`FAIL unknown-internal ${item.source} -> ${url}`)
      failures += 1
    }
    continue
  }

  if (url.startsWith('#')) {
    console.log(`FAIL hash-only ${item.source} -> ${url}`)
    failures += 1
    continue
  }

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    console.log(`FAIL invalid-url ${item.source} -> ${url}`)
    failures += 1
    continue
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    console.log(`SKIP non-http ${item.source} -> ${url}`)
    continue
  }

  const {ok, status, error} = await probe(url)

  if (ok) {
    console.log(`OK ${status} ${item.source} -> ${url}`)
  } else if (error) {
    // A domain that does not resolve is a genuinely broken link; other network
    // errors (timeouts, resets) are usually transient or anti-bot — warn only.
    const code = error?.cause?.code ?? error?.code ?? ''
    if (code === 'ENOTFOUND') {
      console.log(`FAIL dns ${item.source} -> ${url}`)
      failures += 1
    } else {
      console.log(`WARN network (${code || error?.name || 'error'}) ${item.source} -> ${url}`)
      warnings += 1
    }
  } else if (HARD_FAIL.has(status)) {
    console.log(`FAIL ${status} ${item.source} -> ${url}`)
    failures += 1
  } else {
    // 401/403/405/429/5xx etc. — the remote server blocked or errored on the
    // automated request. Not something we can fix in our content; warn only.
    console.log(`WARN ${status} (blocked/unavailable to bots) ${item.source} -> ${url}`)
    warnings += 1
  }
}

if (warnings > 0) {
  console.warn(`\n${warnings} link(s) could not be verified (external block / transient error) — not failing on these.`)
}

if (failures > 0) {
  console.error(`Link check finished with ${failures} broken link(s).`)
  process.exit(1)
}

console.log('Link check passed.')
