import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  useCdn: false,
})

/**
 * Sync the homepage section cards with the 2026-07-17 platform redraft.
 * The old utilities card carried unverified claims ($18M CEO pay, 174,000
 * disconnections) and there was no data-centers card. Cards now deep-link
 * to their platform detail pages instead of the generic /platform.
 */
async function main() {
  await client
    .patch('homePageSettings')
    .set({
      sectionCards: [
        {
          _key: 'card-property-taxes',
          title: 'Property Taxes & Rural Services',
          copy: 'Relief that lasts, for the land and the barns, without gutting the schools, ambulances, and county roads that make rural life work.',
          href: '/platform/property-taxes',
          ctaLabel: 'Read more',
          icon: 'receipt',
        },
        {
          _key: 'card-data-centers',
          title: 'Data Centers & Your Electric Bill',
          copy: "I'm not against data centers. I'm against you being handed the bill. Pay your own way in full, bring more power than you take, or build somewhere else.",
          href: '/platform/data-centers',
          ctaLabel: 'Read more',
          icon: 'lightbulb',
        },
        {
          _key: 'card-infrastructure',
          title: 'Infrastructure Done Right',
          copy: 'Our roads, bridges, and broadband need real investment, not political pet projects. Decisions belong to the people who live here, and data should drive where every dollar goes.',
          href: '/platform/infrastructure',
          ctaLabel: 'Read more',
          icon: 'road',
        },
        {
          _key: 'card-housing',
          title: 'Housing Families Can Afford',
          copy: "Young families can't stay if there's nowhere to live. We need housing policy that builds communities, not just developments.",
          href: '/platform/housing',
          ctaLabel: 'Read more',
          icon: 'home',
        },
        {
          _key: 'card-jobs',
          title: 'Jobs & Small Business',
          copy: "I'm a small business owner. I know what it takes. We need to keep young people here with real opportunity, not empty promises.",
          href: '/platform/jobs',
          ctaLabel: 'Read more',
          icon: 'store',
        },
        {
          _key: 'card-accountability',
          title: 'Government Accountability & Transparency',
          copy: 'The job is simple to describe and rare in practice. Show up, listen before deciding, tell the truth about what is coming, and own the outcome.',
          href: '/platform/accountability',
          ctaLabel: 'Read more',
          icon: 'clipboard-check',
        },
      ],
    })
    .commit()
  console.log('✓ homepage section cards synced with platform redraft')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
