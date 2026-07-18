// Dumps current county/city page documents (drafts + published) to a JSON file for review.
// Run: cd studio && npx sanity exec scripts/dump-geo-drafts.ts --with-user-token
import {getCliClient} from 'sanity/cli'
import {writeFileSync} from 'node:fs'

const client = getCliClient({apiVersion: '2025-01-01'})
const OUT =
  'C:\\Users\\Brad\\AppData\\Local\\Temp\\claude\\c--Users-Brad-source-repos-CitizensForHochgesang\\3a42b51a-d125-469d-9200-2e6d5a0e0d89\\scratchpad\\geo-docs.json'

async function main() {
  const docs = await client.fetch(
    `*[_type in ["countyPage", "cityPage"]] | order(_type asc, slug.current asc)`
  )
  writeFileSync(OUT, JSON.stringify(docs, null, 2))
  console.log(`Wrote ${docs.length} docs to ${OUT}`)
  for (const d of docs) {
    console.log(`${d._id}  (${d._type})  ${d.title ?? d.slug?.current}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
