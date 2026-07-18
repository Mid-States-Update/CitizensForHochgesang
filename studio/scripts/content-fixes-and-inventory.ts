// 2026-07-18 content pass:
//  1. property-tax post: add topical tags; fix opponent naming (standing rule:
//     the district's current senator is never named in public copy).
//  2. Sweep every post body for 'Senator Schmitt' and apply the same fix.
//  3. Council-speech post: append a link to the full Facebook video.
//  4. Inventory: posts without cover images; county/city pages without images;
//     available image assets, so Brad can match or shoot what's missing.
// Run: cd studio && npx sanity exec scripts/content-fixes-and-inventory.ts --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})

async function main() {
  // ── 1. property-tax post tags ──
  const pt = await client.getDocument('post-property-tax-relief-fine-print')
  if (!pt) throw new Error('property-tax post missing')
  const addTags = ['Governor Braun', 'agriculture', 'local income tax'].filter(
    (t) => !(pt.tags ?? []).includes(t)
  )
  if (addTags.length) {
    await client.patch(pt._id).set({tags: [...(pt.tags ?? []), ...addTags]}).commit()
    console.log(`tags + ${addTags.join(', ')} -> ${pt._id}`)
  }

  // ── 2. opponent-naming sweep across all post bodies ──
  const posts = await client.fetch(`*[_type == "post"]{_id, title, body}`)
  for (const post of posts) {
    let changed = false
    for (const block of post.body ?? []) {
      if (block._type !== 'block') continue
      for (const child of block.children ?? []) {
        if (typeof child.text === 'string' && child.text.includes('Senator Schmitt')) {
          child.text = child.text
            .replace("Senator Schmitt promoted it as a win for District 48.", "District 48's current senator promoted it as a win.")
            .replace(/Senator Schmitt/g, "District 48's current senator")
          changed = true
        }
      }
    }
    if (changed) {
      await client.patch(post._id).set({body: post.body}).commit()
      console.log(`opponent naming fixed -> ${post._id}`)
    }
  }

  // ── 3. council-speech post: link to the full video ──
  const reel = await client.getDocument('media-fb-reel-council-speech-full')
  const speech = await client.getDocument('post-dubois-county-council-speech-withdraw-from-rda')
  if (reel?.url && speech) {
    const already = JSON.stringify(speech.body ?? []).includes(reel.url)
    if (!already) {
      const linkKey = 'speech-video-link'
      speech.body = [
        ...(speech.body ?? []),
        {
          _key: 'speech-video-block',
          _type: 'block',
          style: 'normal',
          markDefs: [{_key: linkKey, _type: 'link', href: reel.url}],
          children: [
            {_key: 'speech-video-s1', _type: 'span', marks: [], text: 'Watch the full 30 minute speech: '},
            {_key: 'speech-video-s2', _type: 'span', marks: [linkKey], text: 'video on Facebook'},
            {_key: 'speech-video-s3', _type: 'span', marks: [], text: '.'},
          ],
        },
      ]
      await client.patch(speech._id).set({body: speech.body}).commit()
      console.log('video link appended -> council speech post')
    }
  } else {
    console.log('! reel or speech post missing; no video link added')
  }

  // ── 4. image inventory ──
  const noCover = await client.fetch(
    `*[_type == "post" && !defined(coverImage)]{ "slug": slug.current, title } | order(slug asc)`
  )
  console.log('\nPOSTS WITHOUT COVER IMAGE:')
  for (const p of noCover) console.log(`  ${p.slug}`)

  const geoNoImage = await client.fetch(
    `*[_type in ["countyPage", "cityPage"] && !defined(heroImage) && !defined(coverImage) && !defined(image)]{_id} | order(_id asc)`
  )
  console.log('\nCOUNTY/CITY PAGES WITHOUT ANY IMAGE FIELD SET:')
  for (const g of geoNoImage) console.log(`  ${g._id}`)

  const assets = await client.fetch(
    `*[_type == "sanity.image.asset"]{originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height} | order(originalFilename asc)`
  )
  console.log(`\nIMAGE ASSETS IN LIBRARY (${assets.length}):`)
  for (const a of assets.slice(0, 60)) console.log(`  ${a.originalFilename} (${a.w}x${a.h})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
