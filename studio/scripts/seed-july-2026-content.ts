import {getCliClient} from 'sanity/cli'

const DATASET = process.env.SANITY_STUDIO_DATASET ?? 'production'
const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv'
const API_VERSION = '2025-02-19'

const client = getCliClient({apiVersion: API_VERSION}).withConfig({
  projectId: PROJECT_ID,
  dataset: DATASET,
  useCdn: false,
})

function block(key: string, text: string, style = 'normal') {
  return {
    _key: key,
    _type: 'block',
    style,
    children: [{_key: `${key}-span`, _type: 'span', text, marks: []}],
    markDefs: [],
  }
}

/**
 * July 2026 content drop — sourced from Dubois County Free Press coverage:
 * https://duboiscountyfreepress.com/dubois-county-democratic-party-hosting-your-community-your-say-event/
 */
const docs = [
  // ── Event: Big Tent town hall, July 22, 2026 (Dubois County = Eastern time) ──
  {
    _id: 'event-big-tent-town-hall-st-anthony-july-2026',
    _type: 'event',
    title: 'Big Tent Town Hall — "Your Community, Your Say" (St. Anthony)',
    slug: {_type: 'slug', current: 'big-tent-town-hall-st-anthony-july-2026'},
    startDate: '2026-07-22T18:30:00-04:00',
    endDate: '2026-07-22T20:30:00-04:00',
    location: 'St. Anthony Community Center, 4665 S. Cross St., St. Anthony, IN',
    description:
      'Join Brad and neighbors from across Dubois County for the first Big Tent community town hall, hosted by the Dubois County Democratic Party. A moderated panel of farmers, landowners, business owners, and experts — with intentionally varied political perspectives — takes on property rights, water and land rights, solar development, battery energy storage, data centers, property taxes, zoning, and local growth. Free to attend ($5 suggested donation for food and venue). Republicans, Independents, Democrats, and everyone in between are welcome.',
    detailBody: [
      block(
        'block-1',
        'This is the first in a series of Big Tent town halls focused on local issues affecting southern Indiana. The format emphasizes two-way conversation: bring your questions and firsthand experiences, and the panel brings research and answers.',
      ),
      block(
        'block-2',
        'The underlying question for the series: is your government working with you, or against you? The evening centers on accountability, integrity in office, and genuine representation.',
      ),
      block(
        'block-3',
        'Brad Hochgesang, candidate for Indiana State Senate District 48, will be there. Come say hello and bring a neighbor.',
      ),
      block(
        'block-4',
        'Questions? Call 812-296-7096 or email DuboisCountyDemocraticParty@gmail.com.',
      ),
    ],
    eventCardLayout: 'stacked',
    eventImageOrientation: 'landscape',
    eventImageAspectRatio: '3:2',
    eventCardAnimation: 'fade-up',
    eventDescriptionPreviewChars: 2000,
    tags: ['town hall', 'property rights', 'dubois county'],
  },

  // ── News post announcing the event ──
  {
    _id: 'post-big-tent-town-hall-july-2026',
    _type: 'post',
    title: 'Your Community, Your Say: Join Me in St. Anthony on July 22',
    slug: {_type: 'slug', current: 'big-tent-town-hall-your-community-your-say'},
    excerpt:
      'The first Big Tent town hall comes to the St. Anthony Community Center on Tuesday, July 22, 6:30–8:30 PM — a moderated, cross-partisan panel on property rights, data centers, solar, property taxes, zoning, and local growth. I hope to see you there.',
    publishedAt: '2026-07-16T12:00:00-04:00',
    body: [
      block(
        'block-1',
        "If you've followed this campaign, you know what I believe: decisions about our communities should be made with the people who live in them. On Tuesday, July 22, you'll have a chance to put that into practice.",
      ),
      block(
        'block-2',
        'The Dubois County Democratic Party is hosting "Your Community, Your Say" — the first in a series of Big Tent town halls — from 6:30 to 8:30 PM at the St. Anthony Community Center. A moderated panel of farmers, landowners, business owners, and experts, with intentionally varied political perspectives, will dig into the issues our county is wrestling with right now: property rights, water and land rights, solar development, battery energy storage, data centers, property taxes, zoning, and local growth.',
      ),
      block(
        'block-3',
        "This isn't a rally and it isn't a lecture. It's a two-way conversation — bring your questions and your firsthand experience. Republicans, Independents, Democrats, and folks who don't do politics at all: everyone is welcome under the big tent.",
      ),
      block(
        'block-4',
        "The question on the table is the same one that started this campaign: is your government working with you, or against you? Come help answer it.",
      ),
      block(
        'block-5',
        'Admission is free, with a $5 suggested donation for food and venue. Questions? Call 812-296-7096 or email DuboisCountyDemocraticParty@gmail.com. I hope to see you there.',
      ),
    ],
    newsCardLayout: 'stacked',
    newsImageOrientation: 'landscape',
    newsImageAspectRatio: '3:2',
    newsCardAnimation: 'fade-up',
    newsBodyPreviewChars: 2000,
    tags: ['town hall', 'events', 'dubois county'],
  },

  // ── Press coverage links ──
  {
    _id: 'media-dcfp-big-tent-town-hall-july-2026',
    _type: 'mediaLink',
    title: 'Dubois County Free Press: Democratic Party Hosting "Your Community, Your Say" Event',
    mediaType: 'other',
    url: 'https://duboiscountyfreepress.com/dubois-county-democratic-party-hosting-your-community-your-say-event/',
    publishedAt: '2026-07-16T12:00:00-04:00',
  },
  {
    _id: 'media-dcfp-council-intent-withdraw-march-2026',
    _type: 'mediaLink',
    title: 'Dubois County Free Press: County Council Shows Intent to Withdraw from Mid-States Corridor RDA',
    mediaType: 'other',
    url: 'https://duboiscountyfreepress.com/county-council-shows-intent-to-withdraw-from-mid-states-corridor-regional-development-authority/',
    publishedAt: '2026-03-31T12:00:00-04:00',
  },
  {
    _id: 'media-ipr-mishler-budget-law-may-2026',
    _type: 'mediaLink',
    title: 'Indiana Public Radio: State Senator Says New Law Should Put Brakes on Mid-States Corridor',
    mediaType: 'other',
    url: 'https://indianapublicradio.org/news/2026/05/state-senator-says-new-law-should-put-brakes-on-mid-state-corridor/',
    publishedAt: '2026-05-08T12:00:00-04:00',
  },
]

async function main() {
  const transaction = client.transaction()
  for (const doc of docs) {
    transaction.createOrReplace(doc)
  }
  await transaction.commit()
  console.log(`Created/updated ${docs.length} document(s):`)
  for (const doc of docs) {
    console.log(`  - ${doc._id} (${doc._type})`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
