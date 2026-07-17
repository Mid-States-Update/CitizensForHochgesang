import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  useCdn: false,
})

/**
 * One-off fix (2026-07-17): the Town Hall Tour flyer listed Strassenfest as
 * July 27–31, but the official festival dates are July 30 – August 2, 2026
 * (jasperstrassenfest.org). Booth days within the festival are TBA.
 */
async function main() {
  const result = await client
    .patch('event-strassenfest-ring-toss-2026')
    .set({
      startDate: '2026-07-30T17:00:00-04:00',
      endDate: '2026-08-02T22:00:00-04:00',
      description:
        'Come find Brad at the Dubois County Democratic Party ring toss booth during Jasper Strassenfest, July 30 – August 2. Stop by during the festival — booth hours vary with the festival schedule.',
    })
    .commit()
  console.log(`Updated ${result._id}: ${result.startDate} -> ${result.endDate}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
