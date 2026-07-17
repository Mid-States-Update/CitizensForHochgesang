import {readFileSync} from 'node:fs'
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

const FRAME_DIR = 'C:/Users/Brad/AppData/Local/Temp/claude-chrome-screenshots-E4Hg0O'

/**
 * Facebook content drop (2026-07-17) — sourced from the campaign's Facebook
 * page via browser session. View counts read from the page's Reels grid.
 * Video-frame thumbnails captured from each reel.
 */
const REELS: Array<{
  id: string
  title: string
  url: string
  description: string
  views: string
  publishedAt?: string
  frameFile?: string
}> = [
  {
    id: 'media-fb-reel-council-speech-highlights',
    title: 'Watch: Making the Case to the Dubois County Council',
    url: 'https://www.facebook.com/reel/932383615929225',
    description:
      '81% of Dubois County. 74% of Indiana. 88% say redirect the money to the 400 canceled road projects. Brad makes the case to the county council — the campaign’s most-watched video.',
    views: '84K+ views',
    publishedAt: '2026-02-24T12:00:00-05:00',
    frameFile: 'screenshot-1784261752674-0.png',
  },
  {
    id: 'media-fb-reel-council-speech-full',
    title: 'Watch: The Full 30-Minute RDA Withdrawal Speech',
    url: 'https://www.facebook.com/reel/1428196152104632',
    description:
      'The complete speech to the Dubois County Council making the case to withdraw from the Mid-States Corridor Regional Development Authority.',
    views: '69K views',
    publishedAt: '2026-02-24T18:00:00-05:00',
    frameFile: 'screenshot-1784261752676-1.png',
  },
  {
    id: 'media-fb-reel-comp-plan-survey',
    title: 'Watch: Read the Comp Plan Survey Closely',
    url: 'https://www.facebook.com/reel/1587657966062205',
    description:
      'Dubois County’s second comprehensive plan survey is live. Brad walks through three things about how it was written that residents need to see — and why you should take it anyway.',
    views: '23K views',
    publishedAt: '2026-07-12T18:41:00-04:00',
    frameFile: 'screenshot-1784261810550-2.png',
  },
  {
    id: 'media-fb-reel-state-budget-committee',
    title: 'Watch: Something Happened at the State Budget Committee',
    url: 'https://www.facebook.com/reel/2096647961199092',
    description:
      'Brad breaks down the June 18 State Budget Committee hearing and what the new single-county $250 million project review law could mean for the Mid-States Corridor.',
    views: '15K views',
    publishedAt: '2026-06-19T12:00:00-04:00',
    frameFile: 'screenshot-1784261810554-3.png',
  },
  {
    id: 'media-fb-reel-65-million',
    title: 'Watch: $65,000,000 per Percentage Point',
    url: 'https://www.facebook.com/reel/889384317422333',
    description:
      'They said 554 people don’t matter. Brad’s response: what $65 million per percentage point of polling accuracy says about the case for the Mid-States Corridor.',
    views: '11K views',
    publishedAt: '2026-03-06T12:00:00-05:00',
    frameFile: 'screenshot-1784261810557-4.png',
  },
  {
    id: 'media-fb-reel-forever-home',
    title: 'Watch: Why I Started Showing Up',
    url: 'https://www.facebook.com/reel/1737948310969872',
    description:
      'A couple years ago, Brad and his wife bought what they thought was their forever home. Within a month, they learned it was in the path of a billion-dollar highway. The story of why this campaign exists.',
    views: '10K views',
  },
]

const EVENTS = [
  {
    _id: 'event-strassenfest-ring-toss-2026',
    _type: 'event',
    title: 'Jasper Strassenfest — Dubois County Democrats Ring Toss Booth',
    slug: {_type: 'slug', current: 'jasper-strassenfest-ring-toss-2026'},
    startDate: '2026-07-27T17:00:00-04:00',
    endDate: '2026-07-31T22:00:00-04:00',
    location: 'Jasper Strassenfest, Downtown Jasper, IN',
    description:
      'Come find Brad at the Dubois County Democratic Party ring toss booth during Jasper Strassenfest, July 27–31. Stop by any evening of the festival — booth hours vary with the festival schedule.',
    detailBody: [
      block(
        'block-1',
        'Strassenfest is Jasper at its best, and the Dubois County Democratic Party will be right in the middle of it with a ring toss booth. Come play a round, say hello, and talk about what matters to you.',
      ),
    ],
    eventCardLayout: 'stacked',
    eventImageOrientation: 'landscape',
    eventImageAspectRatio: '3:2',
    eventCardAnimation: 'fade-up',
    eventDescriptionPreviewChars: 2000,
    tags: ['strassenfest', 'community', 'dubois county'],
  },
  {
    _id: 'event-jasper-town-hall-aug-2026',
    _type: 'event',
    title: 'Dubois County Democratic Party Town Hall Tour — Jasper',
    slug: {_type: 'slug', current: 'jasper-town-hall-aug-2026'},
    startDate: '2026-08-06T18:30:00-04:00',
    endDate: '2026-08-06T20:30:00-04:00',
    location: 'KlubHaus61, 2031 N. Newton St., Jasper, IN',
    description:
      'The Dubois County Democratic Party Town Hall Tour comes to Jasper. Listen to and speak with your Democratic candidates about local issues — property rights, data centers, traffic, property taxes, and more. Brad will be there.',
    detailBody: [
      block(
        'block-1',
        'Part of the county-wide town hall tour that kicked off in St. Anthony on July 22. More stops are planned for Dubois, Ferdinand, and Celestine — dates and locations to be announced.',
      ),
    ],
    eventCardLayout: 'stacked',
    eventImageOrientation: 'landscape',
    eventImageAspectRatio: '3:2',
    eventCardAnimation: 'fade-up',
    eventDescriptionPreviewChars: 2000,
    tags: ['town hall', 'jasper', 'dubois county'],
  },
]

async function main() {
  // 1. Upload reel frame thumbnails and create/replace the media links
  for (const reel of REELS) {
    let thumbnail: unknown
    if (reel.frameFile) {
      const buffer = readFileSync(`${FRAME_DIR}/${reel.frameFile}`)
      const asset = await client.assets.upload('image', buffer, {
        filename: `${reel.id}.png`,
        contentType: 'image/png',
      })
      thumbnail = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}
      console.log(`+ uploaded frame for ${reel.id}`)
    }

    await client.createOrReplace({
      _id: reel.id,
      _type: 'mediaLink',
      title: reel.title,
      mediaType: 'facebook',
      url: reel.url,
      description: reel.description,
      highlight: true,
      highlightNote: reel.views,
      ...(reel.publishedAt ? {publishedAt: reel.publishedAt} : {}),
      ...(thumbnail ? {thumbnail} : {}),
    })
    console.log(`✓ ${reel.id}`)
  }

  // 2. Upcoming events from the Town Hall Tour flyer
  for (const event of EVENTS) {
    await client.createOrReplace(event)
    console.log(`✓ ${event._id}`)
  }

  // 3. Fix weekday in the Big Tent post (July 22, 2026 is a Wednesday)
  await client
    .patch('post-big-tent-town-hall-july-2026')
    .set({
      excerpt:
        'The first Big Tent town hall comes to the St. Anthony Community Center on Wednesday, July 22, 6:30–8:30 PM — a moderated, cross-partisan panel on property rights, data centers, solar, property taxes, zoning, and local growth. I hope to see you there.',
      'body[_key=="block-1"].children[0].text':
        "If you've followed this campaign, you know what I believe: decisions about our communities should be made with the people who live in them. On Wednesday, July 22, you'll have a chance to put that into practice.",
    })
    .commit()
  console.log('✓ fixed weekday in post-big-tent-town-hall-july-2026')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
