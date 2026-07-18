// 2026-07-18: set cover images on three posts from assets the campaign
// already owns (Brad: "If we have them, we should add them").
//  - 81% poll post <- its own PPP toplines card (16:9 card graphic)
//  - council speech post <- the campaign's reel thumbnail (portrait)
//  - why-I'm-running post <- the candidate portrait (square)
// Run: cd studio && npx sanity exec scripts/apply-cover-images.ts --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})

const ASSIGNMENTS: Array<{slug: string; assetId: string; ratio: string; orientation: 'landscape' | 'portrait'}> = [
  {
    slug: 'dubois-county-poll-results-81-percent-oppose',
    assetId: 'image-f2937bd6b4201ff90932c2a8a7810eda0ed7aa71-1200x630-png',
    ratio: '16:9',
    orientation: 'landscape',
  },
  {
    slug: 'dubois-county-council-speech-withdraw-from-rda',
    assetId: 'image-58a5b3222ee3385b314141f5b46c8c55100a7463-698x1240-png',
    ratio: '4:5',
    orientation: 'portrait',
  },
  {
    slug: 'why-im-running-for-state-senate',
    assetId: 'image-1673c9ade486b2e8e9365bec8da27594746abf2d-1254x1254-jpg',
    ratio: '1:1',
    orientation: 'portrait',
  },
]

async function main() {
  for (const {slug, assetId, ratio, orientation} of ASSIGNMENTS) {
    const post = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{_id, "hasCover": defined(coverImage)}`, {slug})
    if (!post) {
      console.log(`! no post for ${slug}`)
      continue
    }
    if (post.hasCover) {
      console.log(`skip (already has cover): ${slug}`)
      continue
    }
    await client
      .patch(post._id)
      .set({
        coverImage: {_type: 'image', asset: {_type: 'reference', _ref: assetId}},
        newsImageAspectRatio: ratio,
        newsImageOrientation: orientation,
      })
      .commit()
    console.log(`cover set: ${slug} <- ${assetId} (${ratio})`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
