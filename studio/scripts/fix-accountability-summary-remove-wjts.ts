import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  useCdn: false,
})

/**
 * One-off fix (2026-07-17):
 * 1. The accountability priority summary said "They built it anyway" — the
 *    Mid-States Corridor has not been built; it is still being pushed through
 *    the federal study process over the county's objection.
 * 2. Remove the WJTS media link (wjts.tv is mid-rebuild and the URL 404s;
 *    GitHub issue #16). The poll story is still covered by the WFIE and
 *    DCFP links.
 */
async function main() {
  const patched = await client
    .patch('aboutPriorities')
    .set({
      'priorities[_key=="priority-accountability"].summary':
        "81% of Dubois County opposed the Mid-States Corridor. They kept pushing it anyway. That's why I'm running. Accountability starts with showing up.",
    })
    .commit()
  console.log(`✓ patched ${patched._id} accountability summary`)

  await client.delete('media-wjts-poll-results-dec-2025')
  console.log('✓ deleted media-wjts-poll-results-dec-2025')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
