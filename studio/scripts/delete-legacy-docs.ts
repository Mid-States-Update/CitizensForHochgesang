import {getCliClient} from 'sanity/cli'

const DATASET = process.env.SANITY_STUDIO_DATASET ?? 'production'
const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv'
const API_VERSION = '2025-02-19'

const client = getCliClient({apiVersion: API_VERSION}).withConfig({
  projectId: PROJECT_ID,
  dataset: DATASET,
  useCdn: false,
})

/**
 * One-off cleanup (2026-07-16): removes design-phase leftovers found during
 * the fake-content audit. A verified full backup was taken first
 * (backups/production-backup-2026-07-16.tar.gz).
 */
const LEGACY_IDS = [
  // Unpublished test event ("Here is some text!", Jeffersonville — not in District 48)
  'drafts.event-jeffersonville-townhall',
  // Stale presentation preview secret pointing at the old stopthemidstatescorridor.org studio
  'drafts.f11d25f9-7566-4f55-a041-cfcb91e51642',
  // Legacy "Stop the Mid-States Corridor" landing page (type `page` — no longer in schema)
  '3b342838-f634-4009-98a8-0565f76cc14c',
  // Legacy site settings from the old site (type `settings` — no longer in schema)
  'settings',
]

async function main() {
  const existing = await client.fetch<string[]>(`*[_id in $ids]._id`, {ids: LEGACY_IDS})
  if (!existing.length) {
    console.log('No legacy documents found. Nothing to delete.')
    return
  }

  const transaction = client.transaction()
  for (const id of existing) {
    transaction.delete(id)
  }

  await transaction.commit()
  console.log(`Deleted ${existing.length} legacy document(s):`)
  for (const id of existing) {
    console.log(`  - ${id}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
