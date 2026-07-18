// Backfills canonical place tags on published posts and geoTags on media links.
// Append-only and idempotent: existing tags are kept, additions are unioned in.
// Basis: each addition is supported by the post's own text (events held there,
// or the place is substantively discussed), reviewed 2026-07-18.
// Run: cd studio && npx sanity exec scripts/backfill-place-tags.ts --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})

const POST_TAGS: Record<string, string[]> = {
  'post-big-tent-town-hall-july-2026': ['St. Anthony'],
  'post-two-parades-six-counties': ['Otwell', 'Tell City', 'Pike County', 'Perry County'],
  'post-dubois-county-withdraws-from-rda': ['Dubois County'],
  'post-why-im-running-for-state-senate': ['Jasper', 'Dubois County'],
  'post-property-tax-relief-fine-print': ['Spencer County', 'Gibson County', 'Rockport'],
  'post-dubois-county-council-speech-withdraw-from-rda': ['Dubois County'],
  'post-three-counties-zero-hospitals': [
    'Crawford County',
    'Pike County',
    'Spencer County',
    'Perry County',
    'Gibson County',
    'Tell City',
    'Princeton',
  ],
  'post-courthouse-steps-poll-announcement': ['Dubois County'],
  'post-dubois-county-poll-results-81-percent-oppose': ['Dubois County'],
  'post-eight-town-halls-one-message': [
    'Dubois County',
    'St. Anthony',
    'Celestine',
    'Holland',
    'Dubois',
    'Jasper',
    'Huntingburg',
    'Ferdinand',
  ],
  'post-read-the-polls-yourself': ['Dubois County'],
}

const MEDIA_GEOTAGS: Record<string, string[]> = {
  'media-dcfp-big-tent-town-hall-july-2026': ['Dubois County', 'St. Anthony'],
  'media-dcfp-council-approves-withdrawal-april-2026': ['Dubois County'],
  'media-dcfp-council-intent-withdraw-march-2026': ['Dubois County'],
  'media-dcfp-county-council-rda-feb-2026': ['Dubois County'],
  'media-dcfp-fhwa-comment-period-june-2026': ['Dubois County'],
  'media-dcfp-poll-opposition-dec-2025': ['Dubois County', 'Jasper'],
  'media-dcfp-pra-urges-withdrawal-dec-2025': ['Dubois County'],
  'media-dch-rda-defends-role-jan-2026': ['Dubois County'],
  'media-fb-post-tell-city-parade': ['Perry County', 'Tell City'],
  'media-fb-reel-65-million': ['Dubois County'],
  'media-fb-reel-comp-plan-survey': ['Dubois County'],
  'media-fb-reel-council-speech-full': ['Dubois County', 'Jasper'],
  'media-fb-reel-council-speech-highlights': ['Dubois County', 'Jasper'],
  'media-wfie-msc-update-feb-2026': ['Dubois County'],
  'media-wfie-poll-results-dec-2025': ['Dubois County', 'Jasper'],
  'media-wfie-town-hall-oct-2025': ['Dubois County'],
  'media-ipr-mishler-budget-law-may-2026': ['Dubois County'],
}

async function union(id: string, field: 'tags' | 'geoTags', additions: string[]) {
  const doc = await client.getDocument(id)
  if (!doc) {
    console.warn(`  ! missing: ${id}`)
    return
  }
  const current: string[] = doc[field] ?? []
  const merged = [...current, ...additions.filter((t) => !current.includes(t))]
  if (merged.length === current.length) {
    console.log(`  = ${id} (no change)`)
    return
  }
  await client.patch(id).set({[field]: merged}).commit()
  console.log(`  + ${id}: ${merged.filter((t) => !current.includes(t)).join(', ')}`)
}

async function main() {
  console.log('Posts:')
  for (const [id, tags] of Object.entries(POST_TAGS)) await union(id, 'tags', tags)
  console.log('Media links:')
  for (const [id, tags] of Object.entries(MEDIA_GEOTAGS)) await union(id, 'geoTags', tags)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
