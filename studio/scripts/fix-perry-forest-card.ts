import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  useCdn: false,
})

/**
 * Correction (2026-07-17): the Perry draft's forest card conflated two
 * Hoosier NF projects. The Sept 2025 federal-court halt was the Houston
 * South project (Lake Monroe watershed, Judge Pratt, Sept 18, 2025).
 * Buffalo Springs (near English) has commissioner and governor opposition
 * but NO final USFS decision and no court injunction as of mid-2026.
 */
async function main() {
  await client
    .patch('drafts.countyPage-perry-county')
    .set({
      'issueCards[_key=="perry-forest"].body[_key=="perry-forest-b1"].children[0].text':
        'The Forest Service logging and burning plan between Paoli, French Lick, and English drew opposition from county commissioners in the region, and Governor Braun asked the Forest Service to withdraw it in February 2025. As of mid-2026 the agency had issued no final decision. A separate Forest Service logging project farther north was halted by a federal judge in September 2025 over gaps in its water impact study, so the courts are watching this closely too. Perry County holds a big share of the Hoosier National Forest, and the trails economy is real. Before I take a position on forest management, I want to hear from the people who hunt, hike, log, and guide here.',
    })
    .commit()
  console.log('✓ perry-forest card corrected (Buffalo Springs vs Houston South)')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
