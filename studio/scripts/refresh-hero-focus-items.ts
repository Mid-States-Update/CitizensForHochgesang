import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  useCdn: false,
})

/**
 * Companion to the 2026-07-17 homepage/platform redesign: the hero focus
 * chips now render inside the hero text column, so sync their wording with
 * the redrafted platform cards, and finish the housing/utilities split by
 * renaming the housing card (utility content moved to the data-centers card).
 */
async function main() {
  const home = await client.fetch<{_id: string} | null>(`*[_type=="homePageSettings"][0]{_id}`)
  if (!home) {
    throw new Error('homePageSettings document not found')
  }
  await client
    .patch(home._id)
    .set({
      focusItems: [
        'Property taxes & rural services',
        'Data centers & your electric bill',
        'Infrastructure done right: roads, bridges, broadband',
        'Housing families can afford',
        'Jobs & small business: keeping young people here',
        'Accountability: every vote published and explained',
      ],
    })
    .commit()
  console.log('✓ hero focus items synced with platform cards')

  await client
    .patch('aboutPriorities')
    .set({'priorities[_key=="priority-housing"].title': 'Housing Families Can Afford'})
    .commit()
  console.log('✓ housing card retitled')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
