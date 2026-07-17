import {getCliClient} from 'sanity/cli'

const DATASET = process.env.SANITY_STUDIO_DATASET ?? 'production'
const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv'
const API_VERSION = '2025-02-19'

const client = getCliClient({apiVersion: API_VERSION}).withConfig({
  projectId: PROJECT_ID,
  dataset: DATASET,
  useCdn: false,
})

function block(key: string, text: string, style = 'normal') {
  return {
    _key: key,
    _type: 'block',
    style,
    children: [{_key: `${key}-span`, _type: 'span', text, marks: []}],
    markDefs: [],
  }
}

/**
 * RDA withdrawal content — sourced from Dubois County Free Press:
 * - https://duboiscountyfreepress.com/council-approves-withdrawal-from-mid-states-corridor-rda/ (2026-04-28)
 * - https://duboiscountyfreepress.com/county-council-shows-intent-to-withdraw-from-mid-states-corridor-regional-development-authority/ (2026-03-31)
 * - https://duboiscountyfreepress.com/mid-states-corridor-comment-period-underway-ends-july-1/ (2026-06-09)
 */
const docs = [
  // ── Past event: final withdrawal vote (council meets 4:30 PM Eastern) ──
  {
    _id: 'event-county-council-rda-final-vote-april-2026',
    _type: 'event',
    title: 'Dubois County Council — Final RDA Withdrawal Vote',
    slug: {_type: 'slug', current: 'county-council-rda-final-vote-april-2026'},
    startDate: '2026-04-27T16:30:00-04:00',
    endDate: '2026-04-27T18:30:00-04:00',
    location: 'Dubois County Courthouse Annex, Jasper, IN',
    description:
      'The Dubois County Council took its final vote on Ordinance 2026-05, authorizing the county’s withdrawal from the Mid-States Corridor Regional Development Authority. The ordinance passed on second reading with one dissenting vote — the culmination of months of resolutions, presentations, and public pressure from residents across the county.',
    detailBody: [
      block(
        'block-1',
        'After a 6–1 first-reading vote on March 30 and a 30-day discussion window, the council passed Ordinance 2026-05 on second reading, formally starting the withdrawal clock. Under the Indiana Attorney General’s guidance, withdrawal takes effect 12 to 18 months after notice.',
      ),
      block(
        'block-2',
        'Brad spoke at the meeting, as he has at every step of this process — from presenting the original withdrawal resolution in February to answering the council’s questions on the polling data that showed 81% of Dubois County opposed the corridor.',
      ),
    ],
    eventCardLayout: 'stacked',
    eventImageOrientation: 'landscape',
    eventImageAspectRatio: '3:2',
    eventCardAnimation: 'fade-up',
    eventDescriptionPreviewChars: 2000,
    tags: ['county council', 'mid-states corridor', 'rda'],
  },

  // ── News post: the withdrawal is official ──
  {
    _id: 'post-dubois-county-withdraws-from-rda',
    _type: 'post',
    title: 'Dubois County Is Withdrawing from the Mid-States Corridor RDA',
    slug: {_type: 'slug', current: 'dubois-county-withdraws-from-rda'},
    excerpt:
      'On April 27, the Dubois County Council passed Ordinance 2026-05 on second reading, formally beginning the county’s withdrawal from the Mid-States Corridor Regional Development Authority. You did this.',
    publishedAt: '2026-04-28T12:00:00-04:00',
    body: [
      block(
        'block-1',
        'It’s official. On April 27, the Dubois County Council passed Ordinance 2026-05 on second reading, authorizing the county’s withdrawal from the Mid-States Corridor Regional Development Authority. Only one council member voted no.',
      ),
      block(
        'block-2',
        'This didn’t happen because of me. It happened because 81% of this county said no and then kept saying it — at eight town halls, on the courthouse steps, in letters, and at every council meeting for months. When the December recommendation to withdraw went in front of the council, when the first reading passed 6–1 on March 30, and when the final vote came on April 27, the people of Dubois County were in the room.',
      ),
      block(
        'block-3',
        'What happens next: under the Indiana Attorney General’s guidance, the withdrawal takes effect 12 to 18 months after notice. That’s longer than any of us would like — I said so at the podium — and the RDA has voted to extend its own life by another year. The county will still be involved in whatever INDOT ultimately decides. This fight is not over.',
      ),
      block(
        'block-4',
        'But make no mistake about what this is: the elected government of Dubois County formally walking away from the entity created to fund and promote this highway. The council has also said it will not put additional county money into the project.',
      ),
      block(
        'block-5',
        'Two and a half years ago, they told us this road was inevitable. It isn’t. Thank you to every neighbor who showed up. Representation works when the people demand it — and that’s exactly what this campaign is about.',
      ),
    ],
    newsCardLayout: 'stacked',
    newsImageOrientation: 'landscape',
    newsImageAspectRatio: '3:2',
    newsCardAnimation: 'fade-up',
    newsBodyPreviewChars: 2000,
    tags: ['mid-states corridor', 'rda', 'county council', 'victory'],
  },

  // ── Press coverage links ──
  {
    _id: 'media-dcfp-council-approves-withdrawal-april-2026',
    _type: 'mediaLink',
    title: 'Dubois County Free Press: Council Approves Withdrawal from Mid-States Corridor RDA',
    mediaType: 'other',
    url: 'https://duboiscountyfreepress.com/council-approves-withdrawal-from-mid-states-corridor-rda/',
    publishedAt: '2026-04-28T12:00:00-04:00',
  },
  {
    _id: 'media-dcfp-fhwa-comment-period-june-2026',
    _type: 'mediaLink',
    title: 'Dubois County Free Press: Mid-States Corridor Comment Period Underway; Ends July 1',
    mediaType: 'other',
    url: 'https://duboiscountyfreepress.com/mid-states-corridor-comment-period-underway-ends-july-1/',
    publishedAt: '2026-06-09T12:00:00-04:00',
  },
]

async function main() {
  const transaction = client.transaction()
  for (const doc of docs) {
    transaction.createOrReplace(doc)
  }
  await transaction.commit()
  console.log(`Created/updated ${docs.length} document(s):`)
  for (const doc of docs) {
    console.log(`  - ${doc._id} (${doc._type})`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
