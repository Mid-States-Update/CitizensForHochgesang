import {getCliClient} from 'sanity/cli'

const DATASET = process.env.SANITY_STUDIO_DATASET ?? 'production'
const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv'
const API_VERSION = '2025-02-19'

const client = getCliClient({apiVersion: API_VERSION}).withConfig({
  projectId: PROJECT_ID,
  dataset: DATASET,
  useCdn: false,
})

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

type Enrichment = {
  id: string
  description: string
  highlight?: boolean
  highlightNote?: string
  /** Override page to scrape og:image from (defaults to the doc's own url). */
  imageSourceUrl?: string
  /** Skip image scraping entirely (e.g. Facebook links block bots). */
  skipImage?: boolean
  /** Re-scrape even when a thumbnail exists (e.g. replacing a generic logo). */
  forceImage?: boolean
  /** Use an existing Sanity image asset instead of scraping. */
  assetRef?: string
  /** Direct image URL to upload (bypasses og:image scraping). */
  imageUrl?: string
}

/** Wide DCFP logo bar — used when an article has no photo of its own. */
const DCFP_LOGO_BAR =
  'https://duboiscountyfreepress.com/wp-content/uploads/2015/04/DC-Free-Press-logo-bar-widenew.png'

/**
 * Descriptions summarize each linked story; highlights mark milestone
 * coverage. Thumbnails are pulled from each page's og:image tag.
 */
const ENRICHMENTS: Enrichment[] = [
  {
    id: 'media-dcfp-big-tent-town-hall-july-2026',
    imageUrl: DCFP_LOGO_BAR,
    description:
      'The first Big Tent community town hall comes to St. Anthony on July 22 — a moderated, cross-partisan panel on property rights, data centers, solar, battery storage, property taxes, zoning, and local growth.',
    forceImage: true,
  },
  {
    id: 'media-dcfp-council-approves-withdrawal-april-2026',
    imageUrl: DCFP_LOGO_BAR,
    description:
      'The county council passes Ordinance 2026-05 on second reading, formally authorizing Dubois County’s withdrawal from the Mid-States Corridor RDA with one dissenting vote.',
    highlight: true,
    highlightNote: 'Campaign milestone',
    forceImage: true,
  },
  {
    id: 'media-dcfp-fhwa-comment-period-june-2026',
    imageUrl: DCFP_LOGO_BAR,
    description:
      'The Federal Highway Administration opens a 30-day public comment window for Tier 2, Section 2 of the proposed corridor through Dubois County, ending July 1.',
    forceImage: true,
  },
  {
    id: 'media-ipr-mishler-budget-law-may-2026',
    description:
      'Senate Appropriations Chair Ryan Mishler says a new law requiring State Budget Committee review for any single-county project over $250 million should put the brakes on the Mid-States Corridor.',
  },
  {
    id: 'media-dcfp-council-intent-withdraw-march-2026',
    description:
      'The county council votes 6–1 on first reading to begin withdrawing from the Mid-States Corridor RDA, starting the 30-day window before final passage.',
  },
  {
    id: 'media-dcfp-county-council-rda-feb-2026',
    description:
      'Corridor opponents pack the council meeting as Brad presents a withdrawal resolution and the polling showing 81% of Dubois County opposes the project.',
  },
  {
    id: 'media-dcfp-poll-opposition-dec-2025',
    description:
      'Jasper council members announce their opposition to the Mid-States Corridor in light of the independent poll showing overwhelming county-wide opposition.',
  },
  {
    id: 'media-dcfp-pra-urges-withdrawal-dec-2025',
    imageUrl: DCFP_LOGO_BAR,
    description:
      'The Property Rights Alliance formally urges Dubois County to withdraw from the Mid-States Corridor Regional Development Authority.',
    forceImage: true,
  },
  {
    id: 'media-dch-rda-defends-role-jan-2026',
    description:
      'Mid-States Corridor RDA representatives defend the authority’s role and transparency before the county council as withdrawal pressure builds.',
  },
  {
    id: 'media-wfie-msc-update-feb-2026',
    description:
      'WFIE 14 News covers the Monday-night Mid-States Corridor update as the county council weighs withdrawal from the RDA.',
  },
  {
    id: 'media-wfie-poll-results-dec-2025',
    description:
      'TV coverage of the courthouse-steps press conference where Jasper leaders shared the independent poll: 81% of Dubois County voters oppose the corridor.',
    highlight: true,
    highlightNote: 'Top story — the 81% poll',
  },
  {
    id: 'media-wfie-town-hall-oct-2025',
    description:
      'WFIE 14 News previews the series of eight community town halls organized across Dubois County to inform residents about the Mid-States Corridor.',
  },
  {
    id: 'media-wjts-poll-results-dec-2025',
    description:
      '18 WJTS reports the results of the independent public-interest poll: 81% opposition, and 77% of voters less likely to re-elect officials who support the corridor.',
    // wjts.tv is mid-rebuild (issue #16) — scrape the archived copy for the image.
    imageSourceUrl:
      'https://web.archive.org/web/20260507063859/https://wjts.tv/2025/12/mid-states-corridor-public-interest-poll-results-announced/',
  },
  {
    id: 'media-facebook-campaign',
    description:
      'Day-to-day campaign updates, event photos, and live coverage — follow Brad Hochgesang for Indiana State Senate on Facebook.',
    skipImage: true,
    // Facebook blocks scraping — reuse the campaign logo already in the dataset.
    assetRef: 'image-2aae84e66409e17853edaa10b7f8ce6f4f2246e6-1536x1024-png',
  },
  {
    id: 'media-youtube-channel',
    description:
      'Full town hall recordings, council testimony, and campaign videos on the Citizens for Hochgesang YouTube channel.',
  },
]

function decodeEntities(value: string): string {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&#038;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
}

/** Site-wide fallback og:images that are worse than an in-article photo. */
const GENERIC_OG_IMAGES = [/duboiscountyfreepress\.com\/wp-content\/uploads\/2018\/02\//i]

async function fetchOgImage(pageUrl: string): Promise<string | null> {
  const res = await fetch(pageUrl, {headers: {'user-agent': UA, accept: 'text/html'}})
  if (!res.ok) {
    console.warn(`  ! ${pageUrl} -> HTTP ${res.status}, no og:image`)
    return null
  }
  const html = await res.text()
  const match =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
  const ogImage = match ? decodeEntities(match[1]) : null

  // Prefer a real in-article photo over a site-wide logo fallback
  if (!ogImage || GENERIC_OG_IMAGES.some((pattern) => pattern.test(ogImage))) {
    const article = html.match(/<img[^>]+src=["']([^"']+wp-content\/uploads\/20(2[4-9])[^"']+)["']/i)
    if (article) {
      return decodeEntities(article[1])
    }
  }
  return ogImage
}

async function uploadImage(imageUrl: string, filename: string) {
  const res = await fetch(imageUrl, {headers: {'user-agent': UA}})
  if (!res.ok) {
    console.warn(`  ! image ${imageUrl} -> HTTP ${res.status}`)
    return null
  }
  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  if (!contentType.startsWith('image/')) {
    console.warn(`  ! image ${imageUrl} -> unexpected content-type ${contentType}`)
    return null
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  return client.assets.upload('image', buffer, {filename, contentType})
}

async function main() {
  const existing = await client.fetch<Array<{_id: string; url: string; thumbnail?: unknown}>>(
    `*[_type=="mediaLink"]{_id, url, thumbnail}`,
  )
  const byId = new Map(existing.map((doc) => [doc._id, doc]))

  for (const item of ENRICHMENTS) {
    const doc = byId.get(item.id)
    if (!doc) {
      console.warn(`- ${item.id}: not found in dataset, skipping`)
      continue
    }

    console.log(`- ${item.id}`)
    const patch: Record<string, unknown> = {
      description: item.description,
      highlight: item.highlight ?? false,
    }
    if (item.highlightNote) {
      patch.highlightNote = item.highlightNote
    }

    if (item.assetRef && !doc.thumbnail) {
      patch.thumbnail = {_type: 'image', asset: {_type: 'reference', _ref: item.assetRef}}
      console.log(`  + thumbnail from existing asset ${item.assetRef}`)
    } else if (!item.skipImage && (item.forceImage || !doc.thumbnail)) {
      try {
        const ogImage = item.imageUrl ?? (await fetchOgImage(item.imageSourceUrl ?? doc.url))
        if (ogImage) {
          const asset = await uploadImage(ogImage, `${item.id}.jpg`)
          if (asset) {
            patch.thumbnail = {
              _type: 'image',
              asset: {_type: 'reference', _ref: asset._id},
            }
            console.log(`  + thumbnail from ${ogImage}`)
          }
        } else {
          console.log('  (no og:image found)')
        }
      } catch (error) {
        console.warn(`  ! image scrape failed: ${(error as Error).message}`)
      }
    }

    await client.patch(item.id).set(patch).commit()
    console.log('  ✓ patched')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
