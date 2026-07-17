import {readFileSync} from 'node:fs'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  useCdn: false,
})

const FRAME_DIR = 'C:/Users/Brad/AppData/Local/Temp/claude-chrome-screenshots-E4Hg0O'

function block(key: string, text: string, style = 'normal') {
  return {
    _key: key,
    _type: 'block',
    style,
    children: [{_key: `${key}-span`, _type: 'span', text, marks: []}],
    markDefs: [],
  }
}

async function uploadPng(file: string, filename: string) {
  const buffer = readFileSync(`${FRAME_DIR}/${file}`)
  const asset = await client.assets.upload('image', buffer, {filename, contentType: 'image/png'})
  return asset._id
}

/**
 * July 4 parade content (2026-07-17) — photos captured from the campaign's
 * own Facebook posts (Otwell July 4 1:11 PM; Tell City July 4 7:09 PM;
 * Meet the Candidates flyer posted July 9).
 */
async function main() {
  const tellCityRef = await uploadPng('screenshot-1784263358063-9.png', 'tell-city-parade-float-july-4-2026.png')
  console.log('+ uploaded Tell City float photo')
  const otwellRef = await uploadPng('screenshot-1784263358059-8.png', 'otwell-parade-july-4-2026.png')
  console.log('+ uploaded Otwell parade photo')
  const flyerRef = await uploadPng('screenshot-1784263358065-10.png', 'meet-the-candidates-social-pour-july-2026.png')
  console.log('+ uploaded Meet the Candidates flyer')

  // ── News post: July 4 parade recap ──
  await client.createOrReplace({
    _id: 'post-two-parades-six-counties',
    _type: 'post',
    title: 'Two Parades, Six Counties',
    slug: {_type: 'slug', current: 'two-parades-six-counties'},
    excerpt:
      'On the Fourth of July we walked in Otwell up in Pike County, then rode with the Perry County Democratic Party in Tell City that evening. Two of the six counties in this district in one day — and we are just getting started.',
    publishedAt: '2026-07-05T12:00:00-04:00',
    coverImage: {
      _type: 'image',
      asset: {_type: 'reference', _ref: tellCityRef},
      alt: 'Campaign float with Brad Hochgesang for State Senate signs at the Tell City Fourth of July parade',
    },
    body: [
      block(
        'block-1',
        'Independence Day in District 48 meant two parades. We started the afternoon in Otwell, up in Pike County, walking the route and waving at neighbors along the way.',
      ),
      {
        _key: 'image-otwell',
        _type: 'image',
        asset: {_type: 'reference', _ref: otwellRef},
        alt: 'Brad Hochgesang in a campaign shirt greeting parade-goers in Otwell, Indiana',
      },
      block(
        'block-2',
        'Then we headed south to Tell City, where we joined the Perry County Democratic Party and the rest of the candidates on the ticket — with a hay-bale float our volunteers decked out in bunting, flags, and campaign signs.',
      ),
      block(
        'block-3',
        'That’s two of the six counties in this district in one afternoon. This district is big — Crawford, Dubois, Gibson, Perry, Pike, and Spencer counties — and every one of them deserves a candidate who shows up.',
      ),
      block(
        'block-4',
        'Thank you to everyone who waved, cheered, and came over to talk — and to the folks who put that float together. You’ll find us at county fairs and festivals all summer, including Jasper Strassenfest, July 30 through August 2.',
      ),
    ],
    newsCardLayout: 'feature-split',
    newsImageOrientation: 'landscape',
    newsImageAspectRatio: '16:9',
    newsCardAnimation: 'fade-up',
    newsBodyPreviewChars: 2000,
    tags: ['parades', 'july 4', 'district 48', 'on the trail'],
  })
  console.log('✓ post-two-parades-six-counties')

  // ── Media link: the Tell City parade Facebook post ──
  await client.createOrReplace({
    _id: 'media-fb-post-tell-city-parade',
    _type: 'mediaLink',
    title: 'Facebook: Fourth of July with the Perry County Democrats in Tell City',
    mediaType: 'facebook',
    url: 'https://www.facebook.com/photo.php?fbid=122132727651239868',
    description:
      'Photos from the Tell City Fourth of July parade — the campaign float, volunteers in purple, and the Perry County Democratic Party ticket walking together.',
    publishedAt: '2026-07-04T19:09:00-04:00',
    highlight: true,
    highlightNote: '98 reactions · 14 shares',
    thumbnail: {_type: 'image', asset: {_type: 'reference', _ref: tellCityRef}},
  })
  console.log('✓ media-fb-post-tell-city-parade')

  // ── Past event: Meet the Candidates at Social Pour ──
  await client.createOrReplace({
    _id: 'event-meet-the-candidates-social-pour-july-2026',
    _type: 'event',
    title: 'Meet the Candidates — Social Pour, Jasper',
    slug: {_type: 'slug', current: 'meet-the-candidates-social-pour-july-2026'},
    startDate: '2026-07-15T18:00:00-04:00',
    endDate: '2026-07-15T20:00:00-04:00',
    location: 'Social Pour, 225 River Center, Jasper, IN',
    description:
      'An evening with the candidates: Brad Hochgesang (State Senate 48), Tiffanie Arthur (State Representative 63), and Lena Goffinet (State Representative 74). Cash bar and light hors d’oeuvres. Hosted by Common Ground Indiana.',
    detailBody: [
      block(
        'block-1',
        'Thanks to everyone who came out to Social Pour to talk with Brad, Tiffanie Arthur, and Lena Goffinet about the issues that matter to Dubois County and District 48.',
      ),
    ],
    scheduleImage: {_type: 'image', asset: {_type: 'reference', _ref: flyerRef}},
    eventCardLayout: 'stacked',
    eventImageOrientation: 'landscape',
    eventImageAspectRatio: '16:9',
    eventCardAnimation: 'fade-up',
    eventDescriptionPreviewChars: 2000,
    tags: ['meet and greet', 'jasper', 'candidates'],
  })
  console.log('✓ event-meet-the-candidates-social-pour-july-2026')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
