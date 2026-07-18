// Dumps posts and media links (title, slug, tags, plain-text body) for tag review.
// Run: cd studio && npx sanity exec scripts/dump-post-tags.ts --with-user-token
import {getCliClient} from 'sanity/cli'
import {writeFileSync} from 'node:fs'

const client = getCliClient({apiVersion: '2025-01-01'})
const OUT =
  'C:\\Users\\Brad\\AppData\\Local\\Temp\\claude\\c--Users-Brad-source-repos-CitizensForHochgesang\\3a42b51a-d125-469d-9200-2e6d5a0e0d89\\scratchpad\\post-tags.json'

async function main() {
  const posts = await client.fetch(
    `*[_type == "post"] | order(publishedAt desc) {
      _id, title, "slug": slug.current, publishedAt, tags,
      "text": pt::text(body)
    }`
  )
  const media = await client.fetch(
    `*[_type == "mediaLink"] | order(date desc) {
      _id, title, url, date, outlet, geoTags
    }`
  )
  writeFileSync(OUT, JSON.stringify({posts, media}, null, 2))
  console.log(`Wrote ${posts.length} posts, ${media.length} media links`)
  for (const p of posts) console.log(`POST ${p._id}  [${(p.tags ?? []).join(', ')}]  ${p.title}`)
  for (const m of media) console.log(`MEDIA ${m._id}  [${(m.geoTags ?? []).join(', ')}]  ${m.title}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
