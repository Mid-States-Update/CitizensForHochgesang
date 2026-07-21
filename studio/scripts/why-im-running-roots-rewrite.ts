// 2026-07-20 "Why I'm Running" rewrite — lead with southern Indiana roots.
//
// Problem: both the homepage section and the post opened with "I moved back to
// Jasper in 2023," which reads like a transplant and invites a carpetbagger
// attack. Brad was born in Dubois County and grew up in Jasper; he left in
// December 2010 for Chicago and came home September 2023 to put down roots.
//
// Timeline confirmed by Brad 2026-07-20:
//   Dec 2010 ......... left for Chicago (met Maggie 2008)
//   Sept 2023 ........ moved home; aware of the corridor but not the detail
//   late Dec 2024 .... bought the "forever home"
//   Jan 2025 ......... learned the home sits in the corridor study area
//
// Source: Z:\Election\Strategy Files\Speeches\Hochgesang_SpencerCounty_StumpSpeech.docx
// (the "realtor knew / brokerage knew / nobody told us" beat) and
// County Council - RDA Withdrawl Case.docx (poll numbers, Feb 23 2026 date).
//
// Dry run (default):  cd studio && npx sanity exec scripts/why-im-running-roots-rewrite.ts --with-user-token
// Apply:              cd studio && APPLY=true npx sanity exec scripts/why-im-running-roots-rewrite.ts --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})
const APPLY = process.env.APPLY === 'true'

const POST_ID = 'post-why-im-running-for-state-senate'
const ARTICLE_PATH = '/news/why-im-running-for-state-senate'

/** Build a normal portable-text paragraph with stable keys. */
function para(key: string, text: string) {
  return {
    _key: key,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{_key: `${key}-s`, _type: 'span', marks: [], text}],
  }
}

// ── Homepage section: story in the first paragraph, then Read more ──
const HOME_BODY = [
  para(
    'wr-roots',
    "I was born in Dubois County and grew up in Jasper. I left in December 2010 for Chicago, " +
      "to be with the woman I'd marry, and I came home in September 2023 to put down roots for " +
      'good. In late December 2024, Maggie and I bought what we thought would be our forever ' +
      'home. That January, we learned it sits in the study area for a billion-dollar highway. ' +
      'The realtor knew. The brokerage knew. The city, the county, and the state knew. Nobody ' +
      'told us.'
  ),
  para(
    'wr-turn',
    "What got me involved wasn't the house. It was what I found when I started asking " +
      "questions: a project the people paying for it didn't want, nobody who could say what " +
      'we would actually get for the money, plenty of upside for insiders, and elected ' +
      'officials determined to ram it through without listening. So I did what I do for a ' +
      'living and pulled the data. A professional poll of 636 registered voters found that ' +
      '81% of Dubois County opposed it. I organized ten town halls, presented the numbers, ' +
      "and asked for a vote. This was never really about one highway. It's about who this " +
      'government actually works for.'
  ),
  {
    _key: 'wr-cta',
    _type: 'ctaButton',
    label: 'Read the full story',
    url: ARTICLE_PATH,
    style: 'outline',
  },
]

// ── Full article ──
const POST_EXCERPT =
  'I was born in Dubois County and grew up in Jasper. I left in 2010, came home in 2023 to ' +
  'put down roots, and found out the hard way how decisions get made around here.'

const POST_BODY = [
  para(
    'p-born',
    'I was born in a hospital just outside Jasper. Dubois County, technically, since my parents ' +
      "were living in Jasper at the time. Either way, this is home, and it's where I grew up."
  ),
  para(
    'p-left',
    "I left in December 2010. I'd met Maggie in 2008, and when the time came to choose, I " +
      'moved up to Chicago to be with her. I never really let go of this place. I was back all ' +
      'the time.'
  ),
  para(
    'p-return',
    'We came home in September 2023. Not for a job, and definitely not for a campaign. We came ' +
      'back to put down roots.'
  ),
  para(
    'p-changed',
    'Over a decade is a long time to be away, and the place had changed. Some of that is ' +
      'just how time works. But the change that stuck with me was in the representation. ' +
      'Somewhere in those years, too many of the people we elect seem to have forgotten that ' +
      'they work for the people who live here, not for the party leaders who put them on the ' +
      'ballot.'
  ),
  para(
    'p-home',
    'In late December 2024, Maggie and I bought what we thought would be our forever home. In ' +
      'January 2025, we found out it sits in the study area for a billion-dollar highway.'
  ),
  para(
    'p-nobody',
    'The realtor knew. The brokerage knew. The city knew. The county knew. The state knew. ' +
      'Nobody told us.'
  ),
  para(
    'p-changedme',
    'I want to be honest about that. It changed me. Not because of what could happen to our ' +
      'house, but because of what it taught me about how decisions get made around here.'
  ),
  para(
    'p-listening',
    'So I started paying attention. I went to meetings. I talked to neighbors, to farmers, to ' +
      'small business owners, to people whose families have worked the same land for four and ' +
      'five generations. And I kept hearing the same thing in different words: nobody asked us. ' +
      'By the time we found out, it was a done deal. I called my representative and they never ' +
      "called back. I showed up to speak and they'd already taken the vote."
  ),
  para(
    'p-bothsides',
    "Republicans said it. Democrats said it. People who hadn't voted in twenty years said it. " +
      "When Republicans and Democrats agree you're not listening, you're not listening."
  ),
  para(
    'p-found',
    "And what I found is what actually got me involved. This wasn't a case of a good project " +
      'explained badly. The highway was deeply unpopular with the people who would pay for it ' +
      'and live beside it. Nobody could tell me what we would actually get for the money. What ' +
      'it did have was a clear set of people on the inside who stood to do well out of it. And ' +
      'the officials we elected were determined to ram it through anyway.'
  ),
  para(
    'p-data',
    'Then I did what I do for a living. I pulled the data. We commissioned a real poll of 636 ' +
      'registered voters across Dubois County, conducted by Public Policy Polling. The result: ' +
      '81% opposed the project. Not a slim margin. Not ambiguous. Eighty-one percent.'
  ),
  para(
    'p-statewide',
    'Some people said that was just a local issue, just the folks in the path. So we tested it. ' +
      'A statewide poll of 554 Indiana voters found that 74% want the Mid-States Corridor ' +
      'canceled, and 88% want the money redirected to local road and bridge projects.'
  ),
  para(
    'p-organized',
    'I organized ten town halls across the district. I spoke at council meetings. I presented ' +
      'the numbers and asked for a vote. On February 23, 2026, I stood in front of the Dubois ' +
      'County Council and asked them to withdraw the county from the corridor Regional ' +
      'Development Authority.'
  ),
  para(
    'p-pattern',
    "Somewhere along the way I realized this was never really about one highway. It's a " +
      'pattern. Decisions made without the people who live here. Representatives who stopped ' +
      'representing. A government that forgot who it works for.'
  ),
  para(
    'p-why',
    "That's why I'm running for Indiana State Senate, District 48. Not because I ever wanted " +
      "to be a politician — I didn't. Because the people of this district deserve " +
      'someone who will do the homework, ask the people, and fight for their answer.'
  ),
  para(
    'p-promise',
    "If you call, I'll call back. If there's a meeting, I'll be at it. Before any vote that " +
      "matters, I'll find the people it affects most and ask them what I'm missing. If I get " +
      "something wrong, I'll own it. That's not a campaign promise. That's just how I was " +
      "raised, and it's how I'd do this job."
  ),
  para('p-prove', 'I intend to prove it.'),
]

function preview(label: string, blocks: Array<Record<string, unknown>>) {
  console.log(`\n──────── ${label} ────────`)
  for (const block of blocks) {
    if (block._type === 'ctaButton') {
      console.log(`  [BUTTON] ${block.label as string} -> ${block.url as string}`)
      continue
    }
    const children = block.children as Array<{text: string}> | undefined
    console.log(`  ${(children ?? []).map((c) => c.text).join('')}\n`)
  }
}

async function main() {
  const home = await client.fetch(`*[_type == "homePageSettings"][0]{_id, whyRunningBody}`)
  if (!home?._id) throw new Error('homePageSettings not found')

  const post = await client.getDocument(POST_ID)
  if (!post) throw new Error(`${POST_ID} not found`)

  console.log(`\n=== CURRENT (homepage, ${(home.whyRunningBody ?? []).length} blocks) ===`)
  preview('homepage before', home.whyRunningBody ?? [])
  preview('homepage after', HOME_BODY)
  preview('article after', POST_BODY)
  console.log(`\nexcerpt after: ${POST_EXCERPT}`)

  if (!APPLY) {
    console.log('\nDRY RUN — nothing written. Re-run with APPLY=true to commit.')
    return
  }

  await client.patch(home._id).set({whyRunningBody: HOME_BODY}).commit()
  console.log(`\npatched whyRunningBody -> ${home._id}`)

  await client.patch(POST_ID).set({body: POST_BODY, excerpt: POST_EXCERPT}).commit()
  console.log(`patched body + excerpt -> ${POST_ID}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
