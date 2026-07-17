import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  useCdn: false,
})

function block(key: string, text: string) {
  return {
    _key: key,
    _type: 'block',
    style: 'normal',
    children: [{_key: `${key}-span`, _type: 'span', text, marks: []}],
    markDefs: [],
  }
}

/**
 * Homepage reorder companion (2026-07-18):
 * 1. Condense the Why I'm Running story to three paragraphs (the district
 *    map block is preserved in place; the page now renders it as its own
 *    "Our District" section near events).
 * 2. Trim the hero proof strip to the two stats that don't repeat the
 *    "I didn't wait" stats band further down the page.
 */
async function main() {
  const home = await client.fetch<{
    whyRunningBody: Array<{_type: string}>
    heroBadges: Array<{_key?: string; label: string; placement: string; icon?: string; url?: string}>
  } | null>(`*[_type=="homePageSettings"][0]{whyRunningBody, heroBadges}`)
  if (!home) {
    throw new Error('homePageSettings not found')
  }

  const mapBlocks = (home.whyRunningBody ?? []).filter((b) => b._type === 'mapEmbed')
  const story = [
    block(
      'wr-1',
      "I moved back to Jasper in 2023. Within months, I learned a billion-dollar highway was being pushed through our county, and almost nobody knew. So I did what I do for a living: I pulled the data. A professional poll of 636 registered voters found that 81% of Dubois County opposed the project. Not a slim margin. Eighty-one percent.",
    ),
    block(
      'wr-2',
      "I organized eight town halls, spoke at council meetings, presented the numbers, and asked for a vote. And somewhere along the way I realized this was never about one highway. It's a pattern: decisions made without the people who live here, representatives who stopped representing, a government that forgot who it works for.",
    ),
    block(
      'wr-3',
      "That's why I'm running. The people of District 48 deserve someone who will do the homework, ask the hard questions, and fight for them. I intend to prove it.",
    ),
    ...mapBlocks,
  ]

  const keepBadges = new Set(['2 Professional Polls commissioned', '15+ years software engineering'])
  const heroBadges = (home.heroBadges ?? []).filter(
    (badge) => badge.placement !== 'proof' || keepBadges.has(badge.label),
  )

  await client.patch('homePageSettings').set({whyRunningBody: story, heroBadges}).commit()
  console.log(`✓ story condensed to 3 paragraphs (+${mapBlocks.length} map block preserved)`)
  console.log(`✓ hero proof strip trimmed to ${heroBadges.filter((b) => b.placement === 'proof').length} badges`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
