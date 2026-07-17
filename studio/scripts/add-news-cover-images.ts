import {readFileSync} from 'node:fs'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  useCdn: false,
})

const POLL_COVER =
  'C:/Users/Brad/AppData/Local/Temp/claude/c--Users-Brad-source-repos-CitizensForHochgesang/3a42b51a-d125-469d-9200-2e6d5a0e0d89/scratchpad/poll-cover.png'
const FLYER =
  'C:/Users/Brad/AppData/Local/Temp/claude-chrome-screenshots-E4Hg0O/screenshot-1784274471113-13.png'

/**
 * Cover images for the two bare news cards (2026-07-18):
 * 1. "Read the Polls Yourself" gets a document-style graphic of the PPP
 *    Dubois County toplines (81% oppose) on the campaign purple.
 * 2. The Big Tent town hall post gets the Dubois County Democratic Party's
 *    own Town Hall Tour flyer, captured from their Facebook page.
 */
async function main() {
  const pollAsset = await client.assets.upload('image', readFileSync(POLL_COVER), {
    filename: 'ppp-dubois-poll-toplines-card.png',
    contentType: 'image/png',
  })
  console.log('+ uploaded poll toplines graphic')
  await client
    .patch('post-read-the-polls-yourself')
    .set({
      coverImage: {
        _type: 'image',
        asset: {_type: 'reference', _ref: pollAsset._id},
        alt: 'Public Policy Polling document showing 81% of Dubois County registered voters oppose the Mid-States Corridor',
      },
      newsImageOrientation: 'landscape',
      newsImageAspectRatio: '16:9',
    })
    .commit()
  console.log('✓ post-read-the-polls-yourself cover set')

  const flyerAsset = await client.assets.upload('image', readFileSync(FLYER), {
    filename: 'duco-dems-town-hall-tour-flyer-july-2026.png',
    contentType: 'image/png',
  })
  console.log('+ uploaded town hall tour flyer')
  await client
    .patch('post-big-tent-town-hall-july-2026')
    .set({
      coverImage: {
        _type: 'image',
        asset: {_type: 'reference', _ref: flyerAsset._id},
        alt: 'Dubois County Democratic Party Town Hall Tour flyer: St. Anthony Community Center, Wednesday July 22nd, 6:30 PM, featuring Brad Hochgesang and the Property Rights Alliance',
      },
      newsImageOrientation: 'portrait',
      newsImageAspectRatio: '3:4',
    })
    .commit()
  console.log('✓ post-big-tent-town-hall-july-2026 cover set')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
