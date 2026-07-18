// Creates DRAFT city pages for the district's three biggest cities, which the
// first one-per-county pass skipped: Jasper (16,703), Princeton (8,301), and
// Tell City (7,506). Content is grounded in the published county pages, the
// campaign's own posts, and news items verified 2026-07-18. All drafts.*;
// nothing publishes. Run:
//   cd studio && npx sanity exec scripts/create-anchor-city-pages.ts --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})

function block(key: string, text: string) {
  return {
    _key: key,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{_key: `${key}-span`, _type: 'span', marks: [], text}],
  }
}

function card(key: string, title: string, tag: 'stand' | 'listening' | 'radar', paragraphs: string[]) {
  return {
    _key: key,
    _type: 'issueCard',
    title,
    tag,
    body: paragraphs.map((text, i) => block(`${key}-b${i + 1}`, text)),
  }
}

const PAGES = [
  {
    _id: 'drafts.cityPage-jasper',
    _type: 'cityPage',
    title: 'Jasper',
    slug: {_type: 'slug', current: 'jasper'},
    countySlug: 'dubois-county',
    orderRank: '5',
    lastUpdated: '2026-07-18',
    intro:
      "Jasper is the biggest city in this district and the place where the corridor fight found its footing: council chambers, courthouse steps, and a packed room at KlubHaus61. This page is where city decisions and the district's biggest project meet.",
    listeningPrompt:
      'Jasper has already shown what showing up does. Now I want the quieter list: the street that floods, the childcare waitlist, the decision that moved to a regional office. If it deserves attention, put it on my radar.',
    ledeTitle: 'The corridor decision runs right past Jasper',
    ledeBody: [
      block(
        'jasper-lede-b1',
        "In October 2025 INDOT narrowed the Mid-States Corridor to two expressway options east of Huntingburg and Jasper, each consuming an estimated 1,400 acres or more of farms and homes. Jasper's own council members announced their opposition in December 2025, and in February 2026 your neighbors delivered more than 8,000 petition signatures and a December 2025 Public Policy Polling survey, commissioned by the Property Rights Alliance, showing 81 percent opposition countywide."
      ),
      block(
        'jasper-lede-b2',
        'The draft environmental study was scheduled for fall 2026, with a final decision expected in summer 2027. That timeline crosses this election. The full record lives on the Dubois County page, and my method does not change: records requests, public meetings, and votes.'
      ),
    ],
    issueCards: [
      card('jasper-healthcare', 'Healthcare decisions moving out of town', 'listening', [
        'Memorial Hospital ran locally for about 75 years. Its ambulance service moved to Deaconess EMS in October 2024, and in August 2025 the hospital became Deaconess Memorial. Deaconess has promised major investment, and nothing here is an accusation. It is a question Jasper should keep asking out loud: when decisions about local care move to a regional system, who speaks for the patients who live here?',
      ]),
      card('jasper-housing', 'Housing and childcare are the workforce issue', 'radar', [
        "Dubois County unemployment was 2.1 percent in April 2026, near the lowest in Indiana, and by the county's own study we need roughly 2,200 to 2,900 new homes by 2035. Jasper carries the biggest share of that demand. Employers cannot hire workers who cannot find a house or childcare, and fixing that takes state level tools as much as local will.",
      ]),
      card('jasper-growth', 'Growth that pays its own way', 'stand', [
        "A solar farm west of Huntingburg already sells its power to a data center campus in Fort Wayne, and Huntingburg's council is writing data center rules now. Jasper will face the same knock on the door. My line is the same everywhere in this district: rules first, then growth, and any enormous new power user should cover more than its full cost so your bill goes down, not up.",
      ]),
    ],
  },
  {
    _id: 'drafts.cityPage-tell-city',
    _type: 'cityPage',
    title: 'Tell City',
    slug: {_type: 'slug', current: 'tell-city'},
    countySlug: 'perry-county',
    orderRank: '5',
    lastUpdated: '2026-07-18',
    intro:
      'Tell City keeps getting handed bills it did not run up, starting with a wheel tax the state all but ordered. This page tracks the river town ledger: roads, the hospital, water lines, and the jobs worth protecting.',
    listeningPrompt:
      'I have walked Tell City parades and met a lot of you at events. What I need now is the block by block list: the alley that floods, the grinder pump that fails, the bill that doubled. Tell me and it goes on the record.',
    ledeTitle: 'The wheel tax squeeze, by the numbers',
    ledeBody: [
      block(
        'tell-city-lede-b1',
        "The state's 2025 road funding law ties new state road dollars to whether a city adopts a wheel tax. Tell City's council delayed one in August 2025 while it looked for alternatives, and by July 2026 local reporting called it likely. Add the 2026 gas tax holiday, which pulls over half a billion dollars from state and local road funds, and the pattern is plain: the state cuts ribbons, river towns get invoices."
      ),
      block(
        'tell-city-lede-b2',
        "When Public Policy Polling surveyed Indiana voters statewide in February 2026, in a poll commissioned by the Property Rights Alliance, 88 percent said they would rather see transportation money go to local road and bridge projects than to the Mid-States Corridor. Tell City's roads are exactly what the district says it wants funded."
      ),
    ],
    issueCards: [
      card('tell-city-hospital', "The hospital's books", 'listening', [
        'Perry County Memorial is the county\'s only hospital, it runs the ambulance service, and it has stopped providing obstetric and delivery care. In July 2026 the hospital board and the county commissioners held a work session on hospital finances, and the commissioners appointed two of their own members to the board. I am not going to speculate past the public record. I am going to watch it closely, because rural hospital finance is a state policy problem wearing a local name.',
      ]),
      card('tell-city-water', 'Water, street by street', 'stand', [
        'Tell City is replacing lead water service lines with a 4.2 million dollar state loan through the state revolving fund. Brushy Hollow residents spent June 2026 documenting sewage backups from failing grinder pumps. And in April 2025 the Ohio neared 49 feet while the levee and the pump stations held. None of this is glamorous. All of it is what government is actually for.',
      ]),
      card('tell-city-river-road', 'River Road, finally finished', 'stand', [
        'After nearly 20 years and about 6 million dollars, River Road now connects the riverport straight to State Road 66, moving heavy trucks off downtown streets. It got done through an 80/20 state grant program: state money for a local priority, decided locally. That is the model, and river towns should be first in line for more of it.',
      ]),
      card('tell-city-jobs', 'Jobs worth protecting', 'stand', [
        "Waupaca's Tell City foundry picked up work when the company idled plants elsewhere, and Webb Wheel is expanding with 28 new jobs after the county approved abatements with claw-back protections. Abatements should always come with strings that protect the public, and skilled trades here should never be an afterthought in Indianapolis.",
      ]),
    ],
  },
  {
    _id: 'drafts.cityPage-princeton',
    _type: 'cityPage',
    title: 'Princeton',
    slug: {_type: 'slug', current: 'princeton'},
    countySlug: 'gibson-county',
    orderRank: '5',
    lastUpdated: '2026-07-18',
    intro:
      "Princeton sits next to the district's biggest employer and pays some of its fastest rising electric bills. Growth is coming either way. The question this page cares about is whether Princeton's people get a real say in how it lands.",
    listeningPrompt:
      'Many of you are meeting me for the first time on this page. Fair enough. Tell me what Princeton needs that nobody with a title has asked you about: your CenterPoint bill, the clinic waitlist, a road the plant traffic is grinding down.',
    ledeTitle: 'Toyota is growing. Princeton should grow with it, not under it.',
    ledeBody: [
      block(
        'princeton-lede-b1',
        'Toyota announced a 1.4 billion dollar investment in the Princeton plant in April 2024 for a new electric SUV and battery assembly, with hiring that began in early 2026, then added roughly 200 million dollars more for Grand Highlander capacity in March 2026. The plant marks 30 years in Gibson County with about 7,300 jobs.'
      ),
      block(
        'princeton-lede-b2',
        'That is good news, and it raises the questions a company town has to plan for out loud: housing for new workers, roads, childcare, and the power to run it all. Growth this big should come with a seat at the table for the people who live around it, and that is the seat I intend to hold.'
      ),
    ],
    issueCards: [
      card('princeton-centerpoint', 'CenterPoint bills, and neighbors doing something about it', 'stand', [
        'Princeton is CenterPoint electric territory, and the second phase of a roughly 20 percent increase took effect in March 2026. In July 2026 a grassroots group delivered a petition with more than 300 signatures asking the governor to push for a rehearing of the 2025 rate case. People choosing between medicine and air conditioning is not a talking point. It is happening here.',
      ]),
      card('princeton-roads', 'Road money is homework', 'stand', [
        'Gibson County missed out on 1.5 million dollars in state road money in 2025 because paperwork went unsigned, then won the maximum 1 million dollar Community Crossings grant in December 2025 for Tulip Tree Drive near Toyota, adding 3 million dollars of its own. The same law that funds those grants shrank the statewide pot to 100 million dollars a year. Local diligence and state funding both have to show up for roads to get built.',
      ]),
      card('princeton-healthcare', 'Healthcare capacity in a growing county', 'listening', [
        'Deaconess Gibson Hospital in Princeton serves a county where the primary care ratio is about 3,040 residents per provider. If your family has waited months for an appointment, or driven to Evansville for care a county seat should have, that is exactly the account I want on the record.',
      ]),
      card('princeton-taxes', 'The property tax fine print', 'radar', [
        "Princeton's own financial advisers project city revenue dipping in 2026 under the state's 2025 property tax law, and the city faces a decision on a new municipal local income tax between July 1 and October 1, 2027. I will track what that means in dollars and publish it once the numbers are public.",
      ]),
    ],
  },
]

async function main() {
  for (const page of PAGES) {
    await client.createOrReplace(page as any)
    console.log(`draft: ${page._id}  (${page.issueCards.length} cards)`)
  }
  console.log('\n3 anchor city drafts created. Nothing published.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
