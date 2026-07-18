// Creates six cityPage DRAFTS (one per county, from the dossier priority list):
// Petersburg, Rockport, Oakland City, Cannelton, Huntingburg, English.
// Drafts only; nothing publishes. All facts verified in the district48-dossier;
// evergreen absolute dates; opponent never named; listening-first framing.
// Run: cd studio && npx sanity exec scripts/create-city-pages.ts --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})

type Card = {
  key: string
  title: string
  tag: 'stand' | 'listening' | 'radar'
  paras: string[]
}

function block(key: string, text: string) {
  return {
    _key: key,
    _type: 'block' as const,
    style: 'normal' as const,
    markDefs: [],
    children: [{_key: `${key}-span`, _type: 'span' as const, marks: [], text}],
  }
}

function card(c: Card) {
  return {
    _key: c.key,
    _type: 'issueCard' as const,
    title: c.title,
    tag: c.tag,
    body: c.paras.map((text, i) => block(`${c.key}-b${i + 1}`, text)),
  }
}

type City = {
  id: string
  title: string
  slug: string
  countySlug: string
  intro: string
  ledeTitle: string
  ledeParas: string[]
  cards: Card[]
  listeningPrompt: string
}

const CITIES: City[] = [
  {
    id: 'cityPage-petersburg',
    title: 'Petersburg',
    slug: 'petersburg',
    countySlug: 'pike-county',
    intro:
      'Petersburg hosts the plant, the batteries, the solar farms, and now the pitch for data centers. The people who live here should be the first ones asked about any of it, not the last.',
    ledeTitle: "The data center question will be answered in Petersburg's name",
    ledeParas: [
      'In September 2025 the county commissioners passed a resolution welcoming data center development, and said at public meetings that they did it without knowing much about data centers. By June 2026 more than a hundred of your neighbors packed a commissioners meeting to ask the questions the resolution skipped. An 8,000 acre megasite around the Petersburg interchange is already marketing itself to developers, and Pike County has no zoning ordinance, which means little legal authority to shape what gets built or where.',
      'Whatever the county decides, Petersburg lives closest to the outcome. I want the questions answered in public before the deals are signed in private: how much water, whose power bills, and what happens to the land.',
    ],
    cards: [
      {
        key: 'petersburg-plant',
        title: 'Ending coal at the plant',
        tag: 'listening',
        paras: [
          "The plant's last two coal units are being converted to natural gas: Unit 3 went offline for conversion in February 2026 and Unit 4 was scheduled to follow in June 2026, with coal at Petersburg ending entirely in 2026. A 200 megawatt battery installation has been in service since March 2025, and the Petersburg Energy Center added 250 megawatts of solar with storage in February 2026. The school district has already lost about $300,000 as plant assets shifted.",
          'Plant families, miners, and Pike Central parents live this transition every day. Tell me what you are seeing before I tell anyone what the state should do about it.',
        ],
      },
      {
        key: 'petersburg-ash',
        title: 'The ash stays unless someone deals with it',
        tag: 'stand',
        paras: [
          'The ash ponds at the plant rank among the worst in the country for coal ash groundwater contamination, with cobalt and other metals far above protection standards. Converting the plant to gas does not clean up the ash that is already in the ground. Protecting the White River and the wells around it is not a partisan idea. It is basic maintenance of the place we live, and I will treat it that way.',
        ],
      },
      {
        key: 'petersburg-bills',
        title: "Three utilities, one town's bills",
        tag: 'stand',
        paras: [
          'Duke serves Petersburg itself, CenterPoint serves much of the county, and WIN Energy REMC serves the countryside. CenterPoint customers absorbed the second phase of a roughly 20 percent increase in March 2026. The town that hosts the plant, the batteries, and the solar farms should not be an afterthought on rates. Any data center that comes here should cover more than its full cost of power, so bills around it go down, not up.',
        ],
      },
    ],
    listeningPrompt:
      'If you work at the plant, live near the ash ponds, or farm ground the megasite maps touch, you are the person this page is for. Tell me what Petersburg needs before anyone else signs it up for something.',
  },
  {
    id: 'cityPage-rockport',
    title: 'Rockport',
    slug: 'rockport',
    countySlug: 'spencer-county',
    intro:
      "Rockport carried Spencer County's tax base for fifty years. What replaces the plant, and what gets built beside it, should not be decided without the people who live here.",
    ledeTitle: 'Two units retiring, and everything depends on what comes next',
    ledeParas: [
      "Both units of the AEP plant retire by the end of 2028 under a federal court agreement. The plant's assessed value has been over 22 percent of the whole county's and more than half of South Spencer schools'. Whatever eventually replaces it, Rockport lives with the gap in between: the jobs, the school budgets, and the question of what this riverfront becomes.",
      'That is a district problem too, not just a Rockport problem. When one town carries a tax base this big, the whole district has a stake in a fair landing. My job is to make sure the people closest to the plant are heard first, and that the costs of whatever comes next are shared honestly.',
    ],
    cards: [
      {
        key: 'rockport-smr',
        title: 'The nuclear question',
        tag: 'listening',
        paras: [
          'Indiana Michigan Power wants to explore a small modular reactor at the Rockport site, on a timeline its own executives put in the mid-2030s. As of July 2026 there is no application before nuclear regulators or the state utility commission. County ordinance guarantees advance notice and a public hearing before any construction work begins, and I will be at that hearing.',
          'Here is what is missing from the public record: no plant worker and no Rockport or Grandview neighbor has spoken publicly that I can find. That silence is not consent. It is a gap, and I am asking you to help me fill it.',
        ],
      },
      {
        key: 'rockport-tenaska',
        title: 'The gas plant and the aquifer',
        tag: 'listening',
        paras: [
          'A developer wants to build a large gas power plant next to the AEP site. Commissioners rezoned the ground in June 2026, and the county council then rejected the proposed tax abatement after residents raised water use from the local aquifer, air quality, and the suspicion that the plant would end up serving data centers. The company promised neighbor well testing in the fall of 2026. If you run a well near the site, I want your reading on it, literally.',
        ],
      },
      {
        key: 'rockport-riverfront',
        title: 'The riverfront still works',
        tag: 'stand',
        paras: [
          'A farm co-op announced more than 20 million dollars in early 2025 for a fertilizer river terminal at Rockport, and the city kept its wastewater plant project moving through July 2026. River town infrastructure is unglamorous, essential, and exactly the kind of state level work I will own. The Ohio River made this town. It can keep making it.',
        ],
      },
    ],
    listeningPrompt:
      'Plant workers, retirees, neighbors along the river bottoms: the next fifty years of this town are being sketched right now. Tell me what you want on that drawing before it hardens.',
  },
  {
    id: 'cityPage-oakland-city',
    title: 'Oakland City',
    slug: 'oakland-city',
    countySlug: 'gibson-county',
    intro:
      'When the anchor institution of a town of 2,300 fails, that is not a private matter. Oakland City should not have to go through this quietly, and I do not intend to let it.',
    ledeTitle: 'After the university',
    ledeParas: [
      'In May 2026 Oakland City University suspended every undergraduate program for the 2026-27 school year. The layoff notice filed with the state in April 2026 listed 167 jobs, more than a hundred employees reported going unpaid that spring, and students scrambled for transfer offers from USI, Evansville, and Ivy Tech. For this town the university is not a line item. It is the anchor.',
      "I do not have a magic fix for a private university's finances, and I will not pretend to. Here is what a state senator can do: make sure displaced workers get every state resource they are owed, make sure students' credits transfer cleanly, and ask publicly what Indiana owes small towns when their anchor institution fails.",
    ],
    cards: [
      {
        key: 'oakland-city-schools',
        title: "Wood Memorial's budget is not collateral",
        tag: 'stand',
        paras: [
          "East Gibson schools project losing more than $400,000 over three years under the state's 2025 property tax law, and the superintendent has said out loud that outsourcing custodians is on the table. A town absorbing the loss of its university cannot also quietly absorb the defunding of its schools. Relief that shows up as fewer people looking after your kids' building is not relief.",
        ],
      },
      {
        key: 'oakland-city-next-chapter',
        title: "The university's next chapter",
        tag: 'listening',
        paras: [
          'What happens to the institution and its campus matters to every block of this town, and the town deserves a seat at that table. If you worked there, studied there, or run a business that depends on it, tell me what outcome Oakland City actually needs, and what the state could do that would genuinely help rather than decorate a press release.',
        ],
      },
      {
        key: 'oakland-city-jobs',
        title: 'Jobs within reach',
        tag: 'radar',
        paras: [
          "Toyota's Princeton expansion began hiring in early 2026, within commuting distance of Oakland City. That helps, and it is not a plan by itself. Displaced workers need the state's workforce resources to actually reach them, and the roads and childcare that make a commute workable are exactly the kind of unglamorous follow-through I will keep asking about.",
        ],
      },
    ],
    listeningPrompt:
      'Laid-off staff, students mid-degree, business owners on the square: tell me what the state could actually do that would matter here, and I will carry it to Indianapolis by name.',
  },
  {
    id: 'cityPage-cannelton',
    title: 'Cannelton',
    slug: 'cannelton',
    countySlug: 'perry-county',
    intro:
      'Cannelton voted 71 percent to keep its school in November 2025. A town this determined should not have to keep proving it deserves to exist.',
    ledeTitle: 'The school the state told to justify itself',
    ledeParas: [
      'In 2025 a state bill named Cannelton City Schools on a list of districts to dissolve, and a new law forced small districts to win a referendum just to keep their operating levy. In November 2025 this town answered: 71 percent voted yes, on a measure the superintendent designed so it would not raise taxes. In June 2026 the school board committed to meeting the state minimum teacher salary.',
      'One of the poorest cities in Indiana defended its school with a supermajority. I take a simple lesson from that. Communities know what they value, and a legislature that keeps making river towns beg to keep what they built has its priorities upside down.',
    ],
    cards: [
      {
        key: 'cannelton-roads',
        title: 'Roads money with strings attached',
        tag: 'stand',
        paras: [
          "The state's 2025 road funding law ties new state road dollars to whether a city adopts a wheel tax, and the 2026 gas tax holiday pulls over half a billion dollars from the road funds that cities draw on. Either way, small cities pay. Cannelton should not have to choose between a new local tax and falling further behind on streets.",
        ],
      },
      {
        key: 'cannelton-river',
        title: 'The riverfront and the levee',
        tag: 'radar',
        paras: [
          'In April 2025 the Ohio River neared 49 feet at Tell City while the levee and the pump stations held. Flood protection is old fashioned government work, and Cannelton depends on it as much as anyone on this stretch of river. Keeping that infrastructure funded and inspected is exactly the kind of thing I will show up for.',
        ],
      },
      {
        key: 'cannelton-first',
        title: 'What does Cannelton need first?',
        tag: 'listening',
        paras: [
          "Tell City gets most of the county's attention. This page exists because Cannelton should not have to route its needs through anyone else. Housing, blight, the school, the riverfront: you rank them, and I will work the list in that order.",
        ],
      },
    ],
    listeningPrompt:
      'I need to hear more from Cannelton than any statistic can tell me. What should the state actually do here first? Be specific, and I will answer the same way.',
  },
  {
    id: 'cityPage-huntingburg',
    title: 'Huntingburg',
    slug: 'huntingburg',
    countySlug: 'dubois-county',
    intro:
      "Huntingburg is where three of the district's biggest questions land on one map: the corridor route options, the battery project near the schools, and the rules for data centers. You should be first in every one of those conversations.",
    ledeTitle: 'A battery plant within two miles of the schools',
    ledeParas: [
      'AES is building the Crossvine solar and battery storage project between Huntingburg and Holland. The battery system would be among the largest in Indiana, and it sits within about two miles of Holland Elementary and the Southridge schools. Residents raised permit discrepancies and safety questions at public meetings through 2025 and 2026, and commissioners said the current ordinance gives the county little room to act. Construction was scheduled to begin in March 2026, with operation targeted for late 2027.',
      "I have not taken a position on what the county should do next, because the people closest to the site have not finished being heard. If that is your neighborhood or your kids' school, you are exactly who I want to hear from.",
    ],
    cards: [
      {
        key: 'huntingburg-data-centers',
        title: 'Write the data center rules before the deals',
        tag: 'stand',
        paras: [
          'The city council is already debating how to regulate data centers and battery storage, and a solar farm west of town already sells its power to a data center campus in Fort Wayne under a long term contract. Rules first, then growth. Anything that big should pay its own way, cover more than its full cost of power, and answer to the people who live around it.',
        ],
      },
      {
        key: 'huntingburg-corridor',
        title: "The corridor's eastern options",
        tag: 'stand',
        paras: [
          'In October 2025 INDOT narrowed the corridor to expressway options east of Huntingburg and Jasper, each consuming an estimated 1,400 acres or more of farms and homes, all in Dubois County. The draft environmental study was scheduled for fall 2026 and a final decision expected in summer 2027. This is a county fight and a district question at once, and my method does not change: records requests, public meetings, and showing up. The county page has the full record.',
        ],
      },
      {
        key: 'huntingburg-housing',
        title: 'Housing for the people who work here',
        tag: 'radar',
        paras: [
          "By the county's own study, Dubois County needs roughly 2,200 to 2,900 new homes by 2035, and Huntingburg carries a large share of that demand. Employers cannot hire workers who cannot find a house or childcare. If we want the next generation to stay, this is the work, and it takes state level tools to do it.",
        ],
      },
    ],
    listeningPrompt:
      'Neighbors near the Crossvine site, parents at Holland Elementary and Southridge, families on the corridor maps east of town: I want your account on the record before any of these decisions harden. Tell me what you are seeing.',
  },
  {
    id: 'cityPage-english',
    title: 'English',
    slug: 'english',
    countySlug: 'crawford-county',
    intro:
      'English sat at the center of the June 2026 flood emergency, and it sits at the center of how Crawford County gets ambulances, roads, and fair treatment from the state. This page is for both.',
    ledeTitle: 'The emergency is still open',
    ledeParas: [
      "The flash flooding of June 26 through 28, 2026 trapped drivers on State Road 66 and at the English cloverleaf, partially collapsed Allen Creek Road, destroyed the asphalt on Devil's Hollow Road, and took down a 94 year old bridge on Kemp Road. The commissioners declared an emergency on June 26 and extended it indefinitely on July 2.",
      'Meanwhile the state capped its main road repair grant program at 100 million dollars a year, down from an average near 255 million, and Crawford County received $611,477 from it in 2025. A county hit by federally declared flooding in April 2025 and another emergency in June 2026 cannot repair this alone, and the state made its repair tool smaller. I will say that anywhere, to anyone.',
    ],
    cards: [
      {
        key: 'english-ems',
        title: 'The ambulance base',
        tag: 'radar',
        paras: [
          'Crawford County has no hospital, so response time is the whole ballgame, and for years the county funded EMS by moving money from other departments. Rural ambulance service needs a state answer, not another year of budget shuffling, and English, as the county seat and an EMS base, feels that math first.',
        ],
      },
      {
        key: 'english-fair-share',
        title: 'Fair share for small counties',
        tag: 'stand',
        paras: [
          'Six counties share this district, and the small ones should not be an afterthought. When road money and disaster help get divided up in Indianapolis, somebody has to say the words Crawford County out loud, in the room where it happens. That is the job, and I am asking to be hired for it.',
        ],
      },
      {
        key: 'english-uncounted',
        title: 'What did the flood take that is not on a list?',
        tag: 'listening',
        paras: [
          'Damage assessments count culverts and bridges. They do not count a business that lost a season, or a family that lost the car it needed for work. Tell me what June 2026 took from you, so the record is complete when the state decides what recovery means here.',
        ],
      },
    ],
    listeningPrompt:
      'If your road, bridge, business, or basement is still not right from June 2026, tell me. I keep records, I file requests, and I follow up. That is the whole method.',
  },
]

async function main() {
  const tx = client.transaction()
  for (const c of CITIES) {
    tx.createOrReplace({
      _id: `drafts.${c.id}`,
      _type: 'cityPage',
      title: c.title,
      slug: {_type: 'slug', current: c.slug},
      countySlug: c.countySlug,
      intro: c.intro,
      ledeTitle: c.ledeTitle,
      ledeBody: c.ledeParas.map((text, i) => block(`${c.slug}-lede-b${i + 1}`, text)),
      issueCards: c.cards.map(card),
      listeningPrompt: c.listeningPrompt,
      lastUpdated: '2026-07-18',
      orderRank: '10',
    })
  }
  const result = await tx.commit()
  console.log('Created drafts:', result.results.map((r) => r.id).join(', '))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
