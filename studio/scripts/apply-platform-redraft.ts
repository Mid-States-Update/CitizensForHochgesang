import {readFileSync} from 'node:fs'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  useCdn: false,
})

const POLL_DIR = 'Z:/Election/Strategy Files/Polls'

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
 * Platform redraft (2026-07-17), approved by Brad after redline. Sources:
 * Z:\Election\Strategy Files (data-center strategy memos, Farm Bureau
 * SB1 piece and Q&A sheet, stump speeches, PPP poll PDFs). Fact checks:
 * IC 6-2.5-15 50-year exemption (IEDC), HB1333 House 54-45 then stopped
 * in Senate, SB257/SB79 died without a hearing (2026 session).
 * Homeowner/renter tax content pending Brad's documents (issue #17).
 */
async function main() {
  // ── 1. New priority card: Data Centers & Your Electric Bill ──
  const dataCenterCard = {
    _key: 'priority-data-centers',
    slug: {_type: 'slug', current: 'data-centers'},
    title: 'Data Centers & Your Electric Bill',
    summary:
      "I'm not against data centers. I build software for a living. I'm against you being handed the bill. Pay your own way in full, bring more power than you take, or build somewhere else.",
    body: [
      block(
        'dc-1',
        "When a company invests billions, pays little or nothing in tax for decades, and the cost of the power lines and water mains to serve it gets spread onto everyone else's bill, the community carries the cost and the company keeps the benefit. That's not the free market. That's the government picking a winner and mailing you the invoice.",
      ),
      block(
        'dc-2',
        "When a utility builds new plants and lines to serve one of these facilities, that cost lands on every ratepayer, including you, unless the state requires the data center to cover it. Right now Indiana mostly doesn't. Last session, the bills that would have protected ratepayers never even got a hearing, while a bill letting data centers build on certain farmland without a public hearing passed the House before the Senate stopped it.",
      ),
      block(
        'dc-3',
        'My standard is a condition of admission, not a punishment. Before a data center plugs in, it brings online more new power than it will ever draw, available around the clock, and it pays for its own wires and backup instead of billing the neighbors. The big tech companies have already promised to "build, bring, or buy" their own power. I would make that promise the law.',
      ),
      block(
        'dc-4',
        'The same rule applies to water and land. Closed-loop cooling, water use metered and capped to what the aquifer can sustain, and farms and existing wells come first. No incentive deal without an independent, public showing that the county comes out ahead after every tax break and every service cost. Indiana already signs sales tax exemptions that can run 50 years. Nobody should give away two generations of tax base without proof.',
      ),
      block(
        'dc-5',
        "None of this is abstract in District 48. Indiana residential electric bills jumped 17.5% in a single year, and CenterPoint, which serves most of this district, now charges among the highest residential bills in the state. After regulators approved an $80 million annual increase, average bills rose about $44 a month. Adding massive new loads to that system without protections would pour gasoline on the fire.",
      ),
      block(
        'dc-6',
        'Three of the nation’s largest coal plants sit in our district: Gibson, Rockport in Spencer County, and Petersburg in Pike County. The workers there deserve a real transition plan, and the ratepayers deserve honest oversight: real scrutiny in every rate case, disclosure of executive compensation, and protection from paying for dead investments.',
      ),
    ],
    links: [],
  }

  await client
    .patch('aboutPriorities')
    .insert('after', 'priorities[_key=="priority-property-taxes"]', [dataCenterCard])
    .commit()
  console.log('✓ inserted data-centers card')

  // ── 2. Property taxes: farm-focused rewrite (homeowner/renter half pending, issue #17) ──
  await client
    .patch('aboutPriorities')
    .set({
      'priorities[_key=="priority-property-taxes"].title': 'Property Taxes & Rural Services',
      'priorities[_key=="priority-property-taxes"].summary':
        'Relief that lasts, for the land and the barns, without gutting the schools, ambulances, and county roads that make rural life work.',
      'priorities[_key=="priority-property-taxes"].body': [
        block(
          'pt-1',
          "Senate Bill 1 delivered real farmland relief, and I'll say that plainly: about an 11% cut to farmland bills after three straight years of double-digit increases. But it was a down payment, not the fix. It helped the dirt and left the barns out. The same year, barn, grain, and livestock building assessments jumped, some by as much as 300%.",
        ),
        block(
          'pt-2',
          "Dubois County is the #1 turkey county in Indiana, and the families who raise those birds hold their value in barns and equipment, not dirt. They got little from the land-side relief and took the full force of the building reassessment. I'll fight to move agricultural buildings from the 3% tax cap to the 2% cap, smooth reassessment shocks, and lock regular cost-table updates into statute so we never get another 300% cliff.",
        ),
        block(
          'pt-3',
          "There's a trap in the current law: the good part sunsets in 2027, while the building increases don't roll back. Relief should be permanent and structural, not a two-year patch we re-fight every session.",
        ),
        block(
          'pt-4',
          "And we can't fund tax relief by hollowing out the communities taxpayers live in. The costs landed on local budgets: the county roads our grain trucks run on, the volunteer EMS that answers a farm accident, the small school our kids attend. A tax cut that shows up as a longer ambulance response isn't much of a win. The state collects zero property tax and sits on reserves. Real reform pairs relief with a state backstop for rural schools and emergency services.",
        ),
      ],
    })
    .commit()
  console.log('✓ property-taxes card rewritten')

  // ── 3. Accountability: representation leads, the road closes ──
  await client
    .patch('aboutPriorities')
    .set({
      'priorities[_key=="priority-accountability"].summary':
        'The job is simple to describe and rare in practice. Show up, listen before deciding, tell the truth about what is coming, and own the outcome. I work for you whether you voted for me or not.',
      'priorities[_key=="priority-accountability"].body': [
        block(
          'acc-1',
          'I believe a representative has one job: represent. Show up. Listen before deciding. Tell people the truth about what is coming, even when it is uncomfortable, especially when it touches their homes, their land, and their livelihoods. Bring the people affected into the decision before it is made, not after. And when you get something wrong, own it.',
        ),
        block(
          'acc-2',
          "In practice that means this. If you call, I'll call back. If there's a meeting, I'll be at it. Before any vote that matters, I'll find the people it affects most and ask them what I'm missing. I'll publish every vote with my reasoning and hold town halls in every county, every year. You don't have to agree with me for me to work for you. When Republicans and Democrats are both telling you they aren't being listened to, that isn't a partisan problem. It's a representation problem.",
        ),
        block(
          'acc-3',
          "I learned all of this the hard way. When a billion-dollar project showed up over my community, I spent two years doing the job our government wouldn't: I commissioned real polls, organized eight town halls, and brought the results to the people in charge. The people didn't want it, and the process wasn't designed to listen. Changing that is why I'm running.",
        ),
      ],
    })
    .commit()
  console.log('✓ accountability card rewritten')

  // ── 4. Standing with Workers: plain talk ──
  await client
    .patch('aboutPriorities')
    .set({
      'priorities[_key=="priority-utilities"].summary':
        'A fair day’s pay, a safe job site, and the right to stand together with your coworkers without being punished for it.',
      'priorities[_key=="priority-utilities"].body': [
        block(
          'wk-1',
          "One worker almost never holds the same power as the company across the table, even though there are a lot more of us than there are of them. When workers stand together, that evens out, and the whole community is better for it. Nobody should be punished for it, and I'll oppose any law that treats one group of workers as second class.",
        ),
        block(
          'wk-2',
          'If your tax dollars help build something, the people building it should be your neighbors, paid the going local rate, home safe every night. And when a company promises jobs to get a tax break, the jobs that count are the permanent ones you can raise a family on, not a construction headcount that packs up when the pour is done. Public money should follow proof.',
        ),
        block(
          'wk-3',
          'One more thing. Nobody should be forced to sit through a mandatory meeting on the clock while the boss tells them what to think about their own rights. Other states have ended that practice, and Indiana should too. What you and your coworkers decide is your business.',
        ),
      ],
    })
    .commit()
  console.log('✓ workers card rewritten')

  // ── 5. Housing: split utilities out of summary AND body (utility content now
  //       lives on the data-centers card). Also date the 2015 McConnell quote
  //       accurately and use his exact words (Princeton Daily Clarion). ──
  await client
    .patch('aboutPriorities')
    .set({
      'priorities[_key=="priority-housing"].summary':
        "Young families can't stay if there's nowhere to live. We need housing policy that builds communities, not just developments.",
      'priorities[_key=="priority-housing"].body[_key=="block-2"].children[0].text':
        "Gibson County Council member Bill McConnell put it plainly back in 2015: 'We don't need jobs, what we need is residents in this county.' A decade later it still holds. Many of the 7,000+ Toyota employees commute from outside Gibson County because housing and amenities are insufficient.",
      'priorities[_key=="priority-housing"].body[_key=="block-3"].children[0].text':
        "Housing is both a cause and consequence of population decline. Every county except Dubois is losing people. I'll push for state-level tools that help rural communities build starter homes, reduce regulatory barriers, and attract families who want to put down roots.",
    })
    .unset([
      'priorities[_key=="priority-housing"].body[_key=="90e71200e8c8"]',
      'priorities[_key=="priority-housing"].body[_key=="dfe94ede0755"]',
    ])
    .commit()
  console.log('✓ housing split from utilities (summary + body)')

  // ── 5b. Infrastructure: soften the unverifiable 79.6% broadband projection ──
  await client
    .patch('aboutPriorities')
    .set({
      'priorities[_key=="priority-infrastructure"].body[_key=="block-2"].children[0].text':
        'Broadband is improving. Crawford County had essentially no residential fiber in 2019 and a county-wide buildout is now underway. But gaps persist, and the expiration of the federal Affordable Connectivity Program means low-income households now pay full price.',
    })
    .commit()
  console.log('✓ infrastructure broadband claim softened')

  // ── 6. Infrastructure: local control closing paragraph ──
  await client
    .patch('aboutPriorities')
    .insert('after', 'priorities[_key=="priority-infrastructure"].body[-1]', [
      block(
        'inf-local-control',
        'Decisions about what gets built here belong to the people who live here, not just the monied interests and the folks with the right connections. Before any big project is approved, the community gets the facts, gets a hearing, and gets listened to. And when a megaproject’s construction traffic tears up county roads, the project pays for what it burdens, through impact fees and host agreements that fund the specific roads, water lines, and emergency response it triggers.',
      ),
    ])
    .commit()
  console.log('✓ infrastructure local-control paragraph added')

  // ── 7. Values: add the two stump one-liners, drop the trailing empty entry ──
  const about = await client.getDocument('aboutPriorities')
  const values = ((about?.values as string[]) ?? []).filter((v) => v.trim() !== '')
  for (const quote of ['I started fighting before I started running.', "Make them listen. That's the job."]) {
    if (!values.includes(quote)) values.push(quote)
  }
  await client.patch('aboutPriorities').set({values}).commit()
  console.log('✓ values updated')

  // ── 8. Five new FAQ docs (after the existing corridor FAQs) ──
  const faqs: Array<{id: string; rank: string; title: string; answer: string[]}> = [
    {
      id: 'faq-against-data-centers',
      rank: '0|100060:',
      title: 'Are you against data centers?',
      answer: [
        "No. I build software for a living, so I know why this infrastructure exists. My objection is narrow and it's conservative: a good business pays its own way. When the cost of serving a billion-dollar facility lands on everyone else's bill, that's not the free market.",
        "And whatever the project, the community gets a real say. If a county asks its questions and says yes, that's their right. If they say no, that has to mean something too.",
      ],
    },
    {
      id: 'faq-data-center-power-standard',
      rank: '0|100064:',
      title: "Won't making data centers build their own power raise costs?",
      answer: [
        "It's the opposite, and this comes straight from what I hear across the district: people are worried about their electric bills. Right now, when a utility builds new plants and lines to serve a data center, that cost gets spread across every ratepayer unless the state requires the company to cover it.",
        "So my rule is that any big new user brings more power than it takes. I won't pretend to know the perfect number, but it has to be more than 100 percent, so the grid ends up stronger than they found it, and they pay for their own wires and backup. That protects your bill up front instead of arguing about it after the fact.",
      ],
    },
    {
      id: 'faq-democrat-red-district',
      rank: '0|100068:',
      title: "You're a Democrat in a red district. Why should I trust you?",
      answer: [
        "Because I believe a representative works for everyone in the district, and I've already been doing it. The groups I've helped build are full of Democrats, Republicans, independents, and people who had never voted in their lives, and I am proud to represent every one of them.",
        "That experience taught me something the loud voices don't want you to know: we agree about 95 percent of the time. Don't let anyone distract you with the other five. Let's focus on what we agree on and get it done.",
      ],
    },
    {
      id: 'faq-state-senator-farm-costs',
      rank: '0|10006c:',
      title: 'What can a state senator actually do about farm costs?',
      answer: [
        "Honest answer: I can't set the price of beans, the weather, or what a gallon of diesel costs. What the Statehouse actually controls is property tax, energy and ratepayer rules, and siting protections. I focus where I hold the lever, not where I'd just be posturing.",
      ],
    },
    {
      id: 'faq-water-who-comes-first',
      rank: '0|10006g:',
      title: 'When a big water user and a farmer draw from the same aquifer, who comes first?',
      answer: [
        'Agriculture and existing wells. A newcomer proves it won’t draw down the aquifer before it plugs in, not after: closed-loop cooling, metered and capped withdrawals, monitoring wells in place.',
        "And we should get ahead of this instead of waiting for a crisis. I want Indiana to study banking water, saving in the wet years to draw on in a dry one, the way any farmer thinks about a granary. Pair that with grants for water conservation so our aquifers are protected before they're stressed, not after.",
      ],
    },
  ]

  for (const faq of faqs) {
    await client.createOrReplace({
      _id: faq.id,
      _type: 'faq',
      title: faq.title,
      orderRank: faq.rank,
      body: faq.answer.map((text, i) => block(`${faq.id}-${i + 1}`, text)),
    })
    console.log(`✓ ${faq.id}`)
  }

  // ── 9. Poll PDFs: upload, press assets, and a "Read the polls yourself" post ──
  const duboisPdf = await client.assets.upload(
    'file',
    readFileSync(`${POLL_DIR}/MidStatesCorridorPollResults-2025-12-22.pdf`),
    {filename: 'ppp-dubois-county-poll-dec-2025.pdf', contentType: 'application/pdf'},
  )
  console.log('+ uploaded Dubois County poll PDF')
  const statewidePdf = await client.assets.upload(
    'file',
    readFileSync(`${POLL_DIR}/2-21-2025_StatewidePoll.pdf`),
    {filename: 'ppp-indiana-statewide-poll-feb-2026.pdf', contentType: 'application/pdf'},
  )
  console.log('+ uploaded statewide poll PDF')

  await client.createIfNotExists({_id: 'mediaSettings', _type: 'mediaSettings'})
  await client
    .patch('mediaSettings')
    .set({
      pressAssetLinks: [
        {
          _key: 'press-poll-dubois',
          label: 'PPP poll: Dubois County on the Mid-States Corridor (Dec 2025, full crosstabs, PDF)',
          url: duboisPdf.url,
        },
        {
          _key: 'press-poll-statewide',
          label: 'PPP poll: Indiana statewide on the Mid-States Corridor (Feb 2026, full crosstabs, PDF)',
          url: statewidePdf.url,
        },
      ],
    })
    .commit()
  console.log('✓ press asset links added')

  await client.createOrReplace({
    _id: 'post-read-the-polls-yourself',
    _type: 'post',
    title: 'Read the Polls Yourself',
    slug: {_type: 'slug', current: 'read-the-polls-yourself'},
    excerpt:
      'Every big number this campaign cites comes from a professional, independent poll, and you should not have to take our word for any of it. The full results and crosstabs from both Public Policy Polling surveys are here to download.',
    publishedAt: '2026-07-17T12:00:00-04:00',
    body: [
      block(
        'rp-1',
        "Every big number this campaign cites comes from a professional, independent poll, and you shouldn't have to take our word for any of it. Both surveys were conducted by Public Policy Polling and paid for by ordinary citizens. The full results and crosstabs are linked below.",
      ),
      {
        _key: 'rp-2',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 'rp-2-link',
            _type: 'span',
            text: 'December 2025, Dubois County (PDF)',
            marks: ['rp-link-dubois'],
          },
          {
            _key: 'rp-2-rest',
            _type: 'span',
            text: ': 636 registered voters. 81% oppose the Mid-States Corridor, 72% strongly. Strong opposition runs 75% among Republicans, 70% among Democrats, and 68% among independents. 77% say they are less likely to re-elect an official who publicly supports the project.',
            marks: [],
          },
        ],
        markDefs: [{_key: 'rp-link-dubois', _type: 'link', href: duboisPdf.url}],
      },
      {
        _key: 'rp-3',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 'rp-3-link',
            _type: 'span',
            text: 'February 2026, statewide (PDF)',
            marks: ['rp-link-statewide'],
          },
          {
            _key: 'rp-3-rest',
            _type: 'span',
            text: ': 554 Indiana voters. 65% oppose the project. 88% would rather the state spend the money on local road and bridge projects across Indiana, against 3% who prefer the corridor. 85% say the state should respect local opposition to a highway project.',
            marks: [],
          },
        ],
        markDefs: [{_key: 'rp-link-statewide', _type: 'link', href: statewidePdf.url}],
      },
      block(
        'rp-4',
        "Download both documents, read the questions exactly as they were asked, and check the math. That's the standard we hold everyone else to, so it's the standard we hold ourselves to.",
      ),
    ],
    newsCardLayout: 'stacked',
    newsImageOrientation: 'landscape',
    newsImageAspectRatio: '16:9',
    newsCardAnimation: 'fade-up',
    newsBodyPreviewChars: 2000,
    tags: ['polls', 'transparency', 'mid-states corridor'],
  })
  console.log('✓ post-read-the-polls-yourself')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
