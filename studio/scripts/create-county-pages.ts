import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  useCdn: false,
})

/**
 * County pages, first drafts (2026-07-17).
 *
 * Creates the six District 48 county pages as UNPUBLISHED DRAFTS
 * (_id prefixed "drafts.") so Brad reviews each in the Studio before
 * publishing. Facts trace to the July 2026 research sweep; claims that
 * could not be verified to a primary source were left out. Copy rules:
 * no em dashes, plain talk, and a listening posture (no position) on
 * issues where the affected residents have not yet been heard.
 */

function block(key: string, text: string) {
  return {
    _key: key,
    _type: 'block',
    style: 'normal',
    children: [{_key: `${key}-span`, _type: 'span', text, marks: []}],
    markDefs: [],
  }
}

type SourceInput = [label: string, url: string]

function sources(cardKey: string, items: SourceInput[]) {
  return items.map(([label, url], index) => ({
    _key: `${cardKey}-src-${index + 1}`,
    label,
    url,
  }))
}

type CardInput = {
  key: string
  title: string
  tag: 'stand' | 'listening' | 'radar'
  paragraphs: string[]
  platformSlug?: string
  sourceLinks: SourceInput[]
}

function card({key, title, tag, paragraphs, platformSlug, sourceLinks}: CardInput) {
  return {
    _key: key,
    _type: 'issueCard',
    title,
    tag,
    body: paragraphs.map((text, index) => block(`${key}-b${index + 1}`, text)),
    ...(platformSlug ? {platformSlug} : {}),
    sources: sources(key, sourceLinks),
  }
}

function outlets(countyKey: string, items: SourceInput[]) {
  return items.map(([name, url], index) => ({
    _key: `${countyKey}-outlet-${index + 1}`,
    name,
    url,
  }))
}

const LAST_UPDATED = '2026-07-17'

const counties = [
  {
    _id: 'drafts.countyPage-crawford-county',
    _type: 'countyPage',
    title: 'Crawford County',
    slug: {_type: 'slug', current: 'crawford-county'},
    townsLine: 'English · Marengo · Milltown · Leavenworth · Alton · Taswell · Eckerty',
    intro:
      'The June flood is still an open emergency here, and the state cut road funding the same year. Crawford County does not need sympathy. It needs someone doing the homework and following the money.',
    ledeTitle: 'Washed-out roads, a collapsed bridge, and a shrinking road fund',
    ledeBody: [
      block(
        'crawford-lede-1',
        "The flash flooding in late June trapped drivers on State Road 66 and at the English cloverleaf, partially collapsed Allen Creek Road, destroyed the asphalt on Devil's Hollow Road, and took down a 94 year old bridge on Kemp Road. The commissioners declared an emergency on June 26 and extended it indefinitely on July 2. Some of you are still driving detours today.",
      ),
      block(
        'crawford-lede-2',
        'Here is the part that should make everyone angry. The same state legislature that loves a groundbreaking cut the Community Crossings road grant program to a 100 million dollar annual cap, down from an average of roughly 255 million. Crawford County received $611,477 in 2025. A county hit by federally declared flooding last year and another emergency this summer cannot repair this alone, and the state just made the main tool smaller.',
      ),
    ],
    issueCards: [
      card({
        key: 'crawford-ems',
        title: 'An ambulance service running on borrowed money',
        tag: 'radar',
        paragraphs: [
          "For years the county funded EMS by moving money from other departments; the 2025 budget was described locally as the first in years that did not. In a county with no hospital, response time is the whole ballgame. The state's own EMS report says the system is at a crossroads statewide. Rural ambulance funding needs a state answer, not another year of budget shuffling.",
        ],
        sourceLinks: [
          [
            'Clarion News, county council candidate on EMS funding',
            'https://www.madisoncourier.com/the_clarion_news/news/meet-the-candidate-running-for-crawford-county-council-treasurer/article_c0013dc0-b423-506b-aef1-6ccade0e70b9.html',
          ],
          ['Indiana EMS 2025 Report', 'https://www.in.gov/dhs/files/indiana-ems-2025-report.pdf'],
        ],
      }),
      card({
        key: 'crawford-school-week',
        title: 'The four-day school week',
        tag: 'listening',
        paragraphs: [
          'Crawford County schools held listening sessions in 2025 on moving to a four day week with a flexible fifth day for tutoring and job training. I have not seen a final decision published, and I am not going to guess at one. Parents and teachers: tell me how this is landing in your house before I say a word about it at the Statehouse.',
        ],
        sourceLinks: [
          [
            'Clarion News, "Crawford schools consider moving to 4-day week"',
            'https://www.madisoncourier.com/the_clarion_news/news/crawford-schools-consider-moving-to-4-day-week/article_1e995c5d-c68b-5b58-8c85-323172a3dffb.html',
          ],
        ],
      }),
      card({
        key: 'crawford-utilities',
        title: 'Two rate increases in one year',
        tag: 'stand',
        platformSlug: 'data-centers',
        paragraphs: [
          "Duke's two step electric increase finished in early 2026 at about 13 percent total, and the Patoka Lake regional water district raised rates 4.8 percent in February. In one of Indiana's lowest income counties, those increases take the biggest bite from the smallest paychecks. That is why I keep pushing utility affordability at the state level, and why any giant new power user should cover more than its full cost.",
        ],
        sourceLinks: [
          ['Fox59, Duke rate approval', 'https://fox59.com/news/duke-energy-gets-approval-to-raise-rates-in-indiana/'],
          ['Patoka Lake Regional Water and Sewer District', 'https://www.plrws.net/'],
        ],
      }),
      card({
        key: 'crawford-data-centers',
        title: 'Get ahead of the data centers',
        tag: 'stand',
        platformSlug: 'data-centers',
        paragraphs: [
          'Nearly a third of Indiana counties have adopted data center moratoriums, ordinances, or bans. Crawford County has none on the books. Nothing is proposed here today, which is exactly why now is the calm, cheap moment to set local rules: how much water, what setbacks, and who pays for the power. Local choice only works if it happens before the land options get signed.',
        ],
        sourceLinks: [
          [
            'WFYI, a third of Indiana counties restrict data centers',
            'https://www.wfyi.org/statewide/2026-07-06/indiana-counties-data-center-moratoriums-bans-2026',
          ],
        ],
      }),
      card({
        key: 'crawford-blue-river',
        title: 'The Blue River economy',
        tag: 'stand',
        paragraphs: [
          "Indiana's first scenic river runs through Milltown, where one canoe outfitter alone brings about 30,000 visitors a year. Biologists have released nearly a thousand hellbenders into the Blue River, and farmers upstream can get paid through conservation programs to protect the water that makes all of it possible. Clean water is a jobs program in Crawford County. I will treat it like one.",
        ],
        sourceLinks: [
          [
            'Southern Indiana Business Report, Cave Country Canoes',
            'https://southernindianabusinessreport.com/2023/03/16/milltown-revival-canoe-outfitter-brings-30k-visitors-a-year-to-blue-river-crawford-county/',
          ],
          ['WBIW, nearly 1,000 hellbenders released', 'https://www.wbiw.com/2025/11/21/nearly-1000-hellbenders-released-into-blue-river/'],
        ],
      }),
      card({
        key: 'crawford-housing',
        title: 'Housing built for staying',
        tag: 'stand',
        platformSlug: 'housing',
        paragraphs: [
          'The Tower Subdivision in Leavenworth, a partnership between Cook Group, local government, and state READI money, is set to put 57 homes within reach of young families so they can stay. That model, public and private money splitting the risk small markets cannot carry alone, is one I want the state to repeat across the district.',
        ],
        sourceLinks: [
          [
            'Regional Opportunity Initiatives, READI 2.0 Tower Subdivision',
            'https://regionalopportunityinc.org/readi-2-0-project-tower-subdivision-leavenworth/',
          ],
        ],
      }),
    ],
    listeningPrompt:
      'Crawford County gets talked about more than it gets listened to. I commissioned a professional poll here because I wanted your opinions on the record instead of guessed at. Keep going: tell me what English, Marengo, Milltown, Leavenworth, and the townships actually need.',
    localOutlets: outlets('crawford', [
      ['The Clarion News', 'https://www.madisoncourier.com/the_clarion_news/'],
      ['Corydon Democrat', 'https://www.madisoncourier.com/corydon_democrat/'],
      ['WBIW', 'https://www.wbiw.com/'],
    ]),
    lastUpdated: LAST_UPDATED,
    orderRank: '10',
  },
  {
    _id: 'drafts.countyPage-dubois-county',
    _type: 'countyPage',
    title: 'Dubois County',
    slug: {_type: 'slug', current: 'dubois-county'},
    townsLine: 'Jasper · Huntingburg · Ferdinand · Holland · Ireland · Birdseye · St. Anthony',
    intro:
      'Home base for me and for this campaign. Dubois County is where I learned that showing up, pulling the records, and asking for a vote can actually move a county government.',
    ledeTitle: 'The corridor fight is working. Now finish it.',
    ledeBody: [
      block(
        'dubois-lede-1',
        'In February your neighbors delivered more than 8,000 petition signatures and a professional poll showing 81 percent opposition to the Mid-States Corridor. On March 31 the County Council voted 6 to 1 to begin withdrawing from the corridor RDA, and the withdrawal ordinance passed second reading in April. Jasper council members have announced their opposition too.',
      ),
      block(
        'dubois-lede-2',
        'That happened because people did the homework and kept showing up. The project is not dead. INDOT narrowed the route to two expressway options east of Huntingburg and Jasper, each consuming an estimated 1,400 acres or more of farms and homes, and the draft environmental study lands this fall. I will keep treating this the way it deserves: with records requests, public meetings, and votes.',
      ),
    ],
    issueCards: [
      card({
        key: 'dubois-property-tax',
        title: 'Property taxes with real local numbers',
        tag: 'stand',
        platformSlug: 'property-taxes',
        paragraphs: [
          "The state's 2025 tax law phases in cuts that hit local budgets hard. County government is projected to lose about $349,000 in 2026, growing to about $934,000 by 2028. Northeast Dubois schools stand to lose enough to nearly cancel the referendum their own voters approved. A tax cut that shows up as a longer ambulance response is not much of a win.",
        ],
        sourceLinks: [
          [
            'Dubois County Free Press, all county entities set to lose funding',
            'https://duboiscountyfreepress.com/northeast-dubois-school-board-discusses-budget-cuts-all-county-entities-set-to-lose-funding/',
          ],
          [
            'DLGF, Dubois County 2026 budget order',
            'https://www.in.gov/dlgf/files/2026-reports/2026-budget-orders/Dubois-260114-2026-Budget-Order.pdf',
          ],
        ],
      }),
      card({
        key: 'dubois-crossvine',
        title: 'The battery project near Holland and Huntingburg schools',
        tag: 'listening',
        paragraphs: [
          'AES is building a large solar and battery storage project between Huntingburg and Holland. The battery system would be one of the largest in Indiana, and it sits within about two miles of Holland Elementary and the Southridge schools. Residents have raised permit discrepancies and safety questions at public meetings, and commissioners have said the current ordinance gives the county little room to act. Construction was set to begin this spring.',
          'If you live near the site or send kids to those schools, I want to hear from you before I take a position on what the county should do next.',
        ],
        sourceLinks: [
          [
            'Dubois County Free Press, residents seek ways to stop the battery system',
            'https://duboiscountyfreepress.com/residents-continue-seeking-ways-to-stop-aes-battery-energy-storage-system/',
          ],
          [
            '14 News, residents sound alarm on battery storage',
            'https://www.14news.com/2026/03/17/residents-sound-alarm-battery-energy-storage-system-coming-dubois-county/',
          ],
        ],
      }),
      card({
        key: 'dubois-zoning',
        title: 'Who decides what rural Dubois County becomes',
        tag: 'radar',
        platformSlug: 'infrastructure',
        paragraphs: [
          "Most of unincorporated Dubois County has no zoning. The county's comprehensive plan reaches its steering committee in August, and the solar moratorium expires in December. Corridors, solar, batteries, and data centers all come down to the same question: do the people who live here get a real say in what gets built next to them? I believe local control has to mean more than a formality.",
        ],
        sourceLinks: [
          [
            'Dubois County Free Press, comprehensive planning update',
            'https://duboiscountyfreepress.com/dubois-county-gets-comprehensive-planning-update-public-outreach-and-zoning-questions-on-the-horizon/',
          ],
        ],
      }),
      card({
        key: 'dubois-data-centers',
        title: 'Data centers and your utility bill',
        tag: 'stand',
        platformSlug: 'data-centers',
        paragraphs: [
          "Huntingburg's council is already debating how to regulate data centers and battery storage. A solar farm west of Huntingburg already sells its power to a data center campus in Fort Wayne under a long term contract. I am not against growth. I am against ordinary families paying higher bills to subsidize some of the largest companies on earth.",
        ],
        sourceLinks: [
          [
            'Dubois County Free Press, Huntingburg council on data centers and battery storage',
            'https://duboiscountyfreepress.com/huntingburg-council-discusses-development-issues-with-data-centers-battery-storage/',
          ],
          ['EDPR, Duff Solar power purchase agreement with Google', 'https://edpr.com/en/news/edpr-informs-ppa-secured-100-mwac-solar-project-us-google'],
        ],
      }),
      card({
        key: 'dubois-healthcare',
        title: 'Healthcare decisions moving out of the county',
        tag: 'radar',
        paragraphs: [
          "Memorial Hospital ran locally for about 75 years. In 2025 it became Deaconess Memorial, and the county's ambulance service moved to Deaconess EMS the fall before. Deaconess has promised major investment, and nothing here is an accusation. It is a question worth asking out loud: when decisions about local care move to a regional system, who speaks for Dubois County patients?",
        ],
        sourceLinks: [
          ['14 News, Memorial rebrands as Deaconess Memorial', 'https://www.14news.com/2025/08/01/memorial-hospital-jasper-officially-rebrands-deaconess-memorial/'],
          [
            'Dubois County Free Press, ambulance services transition to Deaconess EMS',
            'https://duboiscountyfreepress.com/memorial-hospital-ambulance-services-transition-to-deaconess-ems/',
          ],
        ],
      }),
      card({
        key: 'dubois-workforce',
        title: 'Childcare and housing are the workforce issue',
        tag: 'radar',
        platformSlug: 'housing',
        paragraphs: [
          "Dubois County unemployment was 2.1 percent in April, near the lowest in Indiana. Employers here cannot find workers, and workers cannot find childcare or a house they can afford. By the county's own study, we need roughly 2,200 to 2,900 new homes by 2035. If we want the next generation to stay, this is the work.",
        ],
        sourceLinks: [
          [
            'Dubois County Herald, third lowest unemployment in Indiana',
            'https://www.duboiscountyherald.com/news/local/dubois-county-posts-indianas-third-lowest-unemployment-rates-in-april/article_0efacf69-648e-5423-b94d-05de95124389.html',
          ],
          [
            'Southern Indiana Business Report, Dubois Strong housing study',
            'https://southernindianabusinessreport.com/2024/01/17/dubois-strong-housing-study-identifies-need-for-affordable-sustainable-housing-to-suit-all-ages-incomes/',
          ],
        ],
      }),
    ],
    listeningPrompt:
      'I live here, but I do not pretend to see everything. If something in Dubois County deserves attention, from a road that floods every spring to a decision made without a public meeting, tell me about it.',
    localOutlets: outlets('dubois', [
      ['Dubois County Herald', 'https://www.duboiscountyherald.com/'],
      ['Dubois County Free Press', 'https://duboiscountyfreepress.com/'],
      ['WITZ 104.7', 'https://www.witzamfm.com/'],
      ['WJTS 18', 'https://wjts.tv/'],
      ['WBDC 100.9', 'https://wbdc.us/'],
    ]),
    lastUpdated: LAST_UPDATED,
    orderRank: '20',
  },
  {
    _id: 'drafts.countyPage-gibson-county',
    _type: 'countyPage',
    title: 'Gibson County',
    slug: {_type: 'slug', current: 'gibson-county'},
    townsLine: 'Princeton · Fort Branch · Haubstadt · Owensville · Oakland City · Francisco · Hazleton · Patoka',
    intro:
      'All of Gibson County is in Senate District 48, from Princeton to Oakland City. If you did not know that, you are not alone. I intend to earn this county, not assume it.',
    ledeTitle: 'Oakland City deserves better than silence',
    ledeBody: [
      block(
        'gibson-lede-1',
        'Oakland City University suspended every undergraduate program for the coming school year. The layoff notice filed with the state listed 167 jobs, and more than a hundred employees reported going unpaid this spring. Students scrambled for transfer offers from USI, Evansville, and Ivy Tech. For a town of about 2,300 people, the university is not a line item. It is the anchor.',
      ),
      block(
        'gibson-lede-2',
        "I do not have a magic fix for a private university's finances, and I will not pretend to. Here is what a state senator can do: make sure displaced workers get every state resource they are owed, make sure students' credits transfer cleanly, and ask publicly what Indiana owes small towns when their anchor institution fails. Oakland City should not have to go through this quietly.",
      ),
    ],
    issueCards: [
      card({
        key: 'gibson-centerpoint',
        title: 'CenterPoint bills, and neighbors doing something about it',
        tag: 'stand',
        platformSlug: 'data-centers',
        paragraphs: [
          'Gibson County is CenterPoint electric territory, and the second phase of a roughly 20 percent increase landed in March. This month a grassroots group delivered a petition with more than 300 signatures asking the governor to push for a rehearing of the 2025 rate case. People choosing between medicine and air conditioning in July is not a talking point. It is happening here.',
        ],
        sourceLinks: [
          ['14 News, IURC approves CenterPoint increase', 'https://www.14news.com/2025/02/03/iurc-make-final-decision-centerpoint-rate-hike/'],
          [
            '14 News, petition asks governor for rate case rehearing',
            'https://www.14news.com/2026/07/16/direct-action-against-centerpoint-energy-sends-petition-governor-rehear-feb-2025-rate-hike/',
          ],
        ],
      }),
      card({
        key: 'gibson-duke-coal',
        title: 'Duke will burn coal at Gibson Station until 2038, and says data centers are why',
        tag: 'stand',
        platformSlug: 'data-centers',
        paragraphs: [
          "Duke's own resource plan keeps Indiana's largest coal plant running years longer than previously planned and adds a new gas plant at the site, citing demand growth that includes data centers. Whatever you think about coal, the pattern deserves attention: enormous new customers show up, and the costs and the smoke stay local. Growth that comes here should pay its own way and answer to the people who live with it.",
        ],
        sourceLinks: [
          [
            'Power Engineering, Duke Indiana resource plan',
            'https://www.power-eng.com/coal/duke-energy-indiana-could-burn-coal-through-2038-per-latest-resource-proposal/',
          ],
          ['Inside Climate News, Gibson coal extension', 'https://insideclimatenews.org/news/04102024/indiana-duke-energy-coal-plant-extension/'],
        ],
      }),
      card({
        key: 'gibson-solar-farmland',
        title: 'Solar on prime farmland',
        tag: 'stand',
        platformSlug: 'infrastructure',
        paragraphs: [
          "When a 2,250 acre solar project moved in southeast of Princeton, residents petitioned the commissioners for bigger setbacks and tighter rules, pointing out that about two thirds of the county is farmland and roughly a tenth of its acres are already in energy production. I am not against solar, and I am not against a farmer's right to lease their own ground. I am for neighbors having a real voice in the rules before the bulldozers arrive.",
        ],
        sourceLinks: [
          [
            'Princeton Daily Clarion, residents want tighter solar rules',
            'https://www.pdclarion.com/news/local_news/residents-want-tighter-rules-for-solar-arrays/article_24e9afd7-b71c-5ed5-a51b-51dba38ed526.html',
          ],
        ],
      }),
      card({
        key: 'gibson-schools',
        title: 'School budgets under the new tax law',
        tag: 'stand',
        platformSlug: 'property-taxes',
        paragraphs: [
          'East Gibson schools project losing more than $400,000 over three years under the 2025 property tax law, and the superintendent has said out loud that outsourcing custodians is on the table. The county itself moved about $210,000 from its levy excess fund because projected revenue could not cover the adopted budget. Relief that quietly defunds Wood Memorial is not relief.',
        ],
        sourceLinks: [
          ['14 News, property tax cuts hurting Indiana public schools', 'https://www.14news.com/2026/05/15/property-tax-cuts-hurting-indiana-public-schools/'],
          [
            'DLGF, Gibson County 2026 budget order',
            'https://www.in.gov/dlgf/files/2026-reports/2026-budget-orders/Gibson-260114-2026-Budget-Order.pdf',
          ],
        ],
      }),
      card({
        key: 'gibson-toyota',
        title: "Toyota's next chapter",
        tag: 'radar',
        paragraphs: [
          'Toyota is investing 1.4 billion dollars in the Princeton plant for a new electric SUV and battery assembly, with hiring underway and more capacity announced this spring. That is good news, and it also raises real questions the county has to plan for: housing for new workers, roads, childcare, and the power to run it all. Growth this big should come with a seat at the table for the people who live around it.',
        ],
        sourceLinks: [
          ['14 News, Toyota 1.4 billion dollar Princeton investment', 'https://www.14news.com/2024/04/25/toyota-investing-14-billion-make-new-electric-suv-princeton-plant/'],
          ['CNBC, Toyota adds US plant investment', 'https://www.cnbc.com/2026/03/23/toyota-investment-united-states.html'],
        ],
      }),
      card({
        key: 'gibson-flooding',
        title: 'River bottoms flooding',
        tag: 'radar',
        paragraphs: [
          "The Patoka near Princeton hit moderate flood stage this month, and the White River at Hazleton carried flood warnings this spring. Some of the county's best ground sits in those bottoms. Levees, drainage, and honest flood planning are old fashioned government work, and they are exactly the kind of thing I will show up for.",
        ],
        sourceLinks: [['NOAA, White River at Hazleton gauge', 'https://water.noaa.gov/gauges/hazi3']],
      }),
    ],
    listeningPrompt:
      'I will be honest: I have work to do in Gibson County, and I am asking for it. Tell me what matters in Princeton, Fort Branch, Haubstadt, Owensville, or Oakland City that this page missed, and I will come listen in person.',
    localOutlets: outlets('gibson', [
      ['Princeton Daily Clarion', 'https://www.pdclarion.com/'],
      ['South Gibson Star-Times', 'https://www.pdclarion.com/star_times/'],
      ['The Press-Dispatch', 'https://www.suncommercial.com/press_dispatch/'],
      ['14 News', 'https://www.14news.com/'],
    ]),
    lastUpdated: LAST_UPDATED,
    orderRank: '30',
  },
  {
    _id: 'drafts.countyPage-perry-county',
    _type: 'countyPage',
    title: 'Perry County',
    slug: {_type: 'slug', current: 'perry-county'},
    townsLine: 'Tell City · Cannelton · Troy · Leopold · Bristow · Derby',
    intro:
      'Perry County keeps getting handed bills it did not run up: a wheel tax to keep road money, a referendum to keep a school. I think the state owes its river towns better.',
    ledeTitle: 'Cannelton voted 71 percent to keep its school. The state should hear that.',
    ledeBody: [
      block(
        'perry-lede-1',
        'In 2025 a state bill named Cannelton City Schools on a list of districts to dissolve. Then a new law forced small districts to win a referendum just to keep their operating levy. Cannelton is one of the poorest cities in Indiana, and its school is the center of town. In November your neighbors answered: 71 percent voted yes, on a measure the superintendent made sure would not raise taxes. This June the board committed to meeting the state minimum teacher salary.',
      ),
      block(
        'perry-lede-2',
        'I take a simple lesson from that. Communities know what they value. A legislature that keeps making small towns beg to keep what they built has its priorities upside down.',
      ),
    ],
    issueCards: [
      card({
        key: 'perry-wheel-tax',
        title: 'The wheel tax squeeze',
        tag: 'stand',
        platformSlug: 'property-taxes',
        paragraphs: [
          "The state's 2025 road funding law ties new state road dollars to whether a city adopts a wheel tax. Tell City's council delayed one last August while it looked for alternatives, and local reporting now calls it likely. Add the gas tax holiday, which pulls over half a billion dollars from state and local road funds, and the pattern is plain: the state cuts ribbons, river towns get invoices.",
        ],
        sourceLinks: [
          ['InkFree News, Evansville adopts wheel tax while Tell City delays', 'https://www.inkfreenews.com/2025/08/29/evansville-approves-wheel-tax-tell-city-delays-decision/'],
          ['WFYI, concerns about the road funding plan', 'https://www.wfyi.org/wfyi-news/2026-06-15/taxed-on-taxed-on-taxed-some-raise-concerns-about-road-funding-plan'],
        ],
      }),
      card({
        key: 'perry-hospital',
        title: "The hospital's books",
        tag: 'radar',
        paragraphs: [
          "Perry County Memorial is the county's only hospital, and it runs the county's ambulance service. This month the hospital board and the county commissioners held a work session on hospital finances, and the commissioners appointed two of their own members to the hospital board. I am not going to speculate past the public record. I am going to watch it closely, because rural hospital finance is a state policy problem wearing a local name.",
        ],
        sourceLinks: [
          ['Perry County News (via Dubois County Herald)', 'https://www.duboiscountyherald.com/perry_county_news/'],
          ['Perry County Memorial Hospital, EMS services', 'https://www.pchospital.org/our-services/perry-county-ems/'],
        ],
      }),
      card({
        key: 'perry-utilities',
        title: 'Your utilities already have the right idea',
        tag: 'stand',
        platformSlug: 'data-centers',
        paragraphs: [
          "Perry County electricity comes from Tell City Electric and the Southern Indiana Power co-op, not from the big investor owned utilities, and CenterPoint is your gas company. The co-op's wholesale supplier has already adopted a rule that any huge new customer, like a data center, must pay all of its own costs so members do not subsidize it. That is the right instinct, and it is exactly the standard I want written into state law.",
        ],
        sourceLinks: [
          ['Hoosier Energy, data centers and affordability', 'https://www.hoosierenergy.com/news-resources/data-centers-affordability-in-focus-at-annual-meeting/'],
          ['IMPA, Tell City municipal power', 'https://www.impa.com/impa-municipal-power/tell-city/'],
        ],
      }),
      card({
        key: 'perry-water-sewer',
        title: 'Water and sewer, street by street',
        tag: 'radar',
        paragraphs: [
          'Tell City is replacing lead water service lines with a 4.2 million dollar state loan. Brushy Hollow residents spent June documenting sewage backups from failing grinder pumps. And in April 2025 the Ohio neared 49 feet while the levee and the pump stations held. None of this is glamorous. All of it is what government is actually for.',
        ],
        sourceLinks: [
          ['Indiana Finance Authority, Tell City lead line replacement', 'https://www.in.gov/ifa/srf/files/Tell-City-LSLR-and-System-Improvements-CE.pdf-1.22.2026.pdf'],
          ['NWS Louisville, April 2025 historic flooding', 'https://www.weather.gov/lmk/HistoricRainfallFloodingApril2-62025'],
        ],
      }),
      card({
        key: 'perry-forest',
        title: 'The forest next door',
        tag: 'listening',
        paragraphs: [
          'The Forest Service logging and burning plan between Paoli, French Lick, and English drew opposition from county officials and the governor alike, and a federal judge halted it over drinking water questions. Perry County holds a big share of the Hoosier National Forest, and the trails economy is real. Before I take a position on forest management, I want to hear from the people who hunt, hike, log, and guide here.',
        ],
        sourceLinks: [
          [
            'Indiana Capital Chronicle, Braun joins opposition to forest project',
            'https://indianacapitalchronicle.com/2025/02/14/gov-mike-braun-joins-indiana-locals-in-long-held-opposition-against-proposed-forest-project/',
          ],
          [
            'Seymour Tribune, forest project moving forward amid lawsuits',
            'https://tribtown.com/2025/08/26/contentious-hoosier-national-forest-project-moving-forward-foresters-say-its-the-best-path-forward/',
          ],
        ],
      }),
      card({
        key: 'perry-jobs',
        title: 'Jobs worth protecting',
        tag: 'stand',
        platformSlug: 'jobs',
        paragraphs: [
          "Waupaca's Tell City foundry picked up work when the company idled plants elsewhere, and Webb Wheel is expanding with 28 new jobs after the county approved abatements with claw-back protections. Good. Abatements should always come with strings that protect the public, and skilled trades in Perry County should never be an afterthought in Indianapolis.",
        ],
        sourceLinks: [
          ['Waupaca Foundry, Etowah production shifts', 'https://waupacafoundry.com/blog/waupaca-to-idle-most-of-etowah-foundry-cut-540-jobs'],
          [
            'Perry County News, Webb Wheel abatement request',
            'https://www.duboiscountyherald.com/perry_county_news/news/webb-wheel-request-tax-abatements-from-county-for-potential-expansion/article_849b258d-c005-5f38-a5c0-a28d68e3ae49.html',
          ],
        ],
      }),
    ],
    listeningPrompt:
      'Tell City has heard from me at parades and events. I need more from Cannelton, Troy, and the townships. What is this page missing?',
    localOutlets: outlets('perry', [
      ['Perry County News', 'https://www.duboiscountyherald.com/perry_county_news/'],
      ['14 News', 'https://www.14news.com/'],
      ['Eyewitness News WEHT', 'https://www.tristatehomepage.com/'],
    ]),
    lastUpdated: LAST_UPDATED,
    orderRank: '40',
  },
  {
    _id: 'drafts.countyPage-pike-county',
    _type: 'countyPage',
    title: 'Pike County',
    slug: {_type: 'slug', current: 'pike-county'},
    townsLine: 'Petersburg · Winslow · Otwell · Spurgeon · Stendal · Velpen',
    intro:
      'Pike County kept the lights on for Indianapolis for a hundred years. This year the Petersburg plant burns its last coal, and the question is what comes next and who decides.',
    ledeTitle: 'Data centers are being invited in. Nobody asked you first.',
    ledeBody: [
      block(
        'pike-lede-1',
        'Last September the county commissioners passed a resolution welcoming data center development. By their own account at public meetings, they did it without knowing much about data centers. Your neighbors noticed. More than a hundred people packed a commissioners meeting in June, and a group of Pike County residents is organizing to ask the questions the resolution skipped: how much water, whose power bills, and what happens to the land.',
      ),
      block(
        'pike-lede-2',
        'Two facts make this urgent. Pike County has no zoning ordinance, so right now there is little legal authority to shape where or how a data center gets built. And an 8,000 acre megasite around the Petersburg interchange is already marketing itself to data center developers, advertising transmission lines and expanding water capacity. Nearly a third of Indiana counties have adopted data center rules or moratoriums. Pike County has none.',
      ),
      block(
        'pike-lede-3',
        'I do not think asking questions is anti-growth. I think it is the homework. It is the same homework I did on the corridor, and I want to do it with you.',
      ),
    ],
    issueCards: [
      card({
        key: 'pike-transition',
        title: 'What should follow coal at Petersburg?',
        tag: 'listening',
        paragraphs: [
          "AES is putting about 1.1 billion dollars into Pike County: a gas conversion at the plant, one of the largest battery installations in the region, and a large solar farm. The plant has long been the county's largest taxpayer, and the school district has already lost about $300,000 as assets shifted. Plant families, miners, and Pike Central parents live with this transition every day. I want to hear what you are seeing before I tell anyone what the state should do about it.",
        ],
        sourceLinks: [
          ['AES Indiana, 1.1 billion dollar Pike County investment', 'https://www.aesindiana.com/press-release/aes-indiana-accelerates-future-energy-11-billion-investments-pike-county'],
          ['WFYI, how the closure could affect Petersburg', 'https://www.wfyi.org/news/articles/how-a-coal-plants-closures-could-affect-one-indiana-town-and-what-it-plans-to-do-about-it'],
        ],
      }),
      card({
        key: 'pike-coal-ash',
        title: 'Coal ash on the White River',
        tag: 'stand',
        paragraphs: [
          'The ash ponds at Petersburg rank among the worst in the country for coal ash groundwater contamination, with cobalt and other metals far above protection standards. Converting the plant to gas does not clean up the ash that is already there. Protecting the river and the wells around it is not a partisan idea, and I will treat it as basic maintenance of the place we live.',
        ],
        sourceLinks: [
          ['Earthjustice, toxic coal ash in Indiana', 'https://earthjustice.org/feature/coal-ash-states/indiana'],
          [
            'Indianapolis Business Journal, discharge into the White River',
            'https://www.ibj.com/articles/aes-indiana-power-plant-discharging-millions-of-gallons-of-toxic-water-into-white-river-group-says',
          ],
        ],
      }),
      card({
        key: 'pike-power-bill',
        title: 'Your power bill',
        tag: 'stand',
        platformSlug: 'data-centers',
        paragraphs: [
          'Pike County households are served by three different utilities: CenterPoint across much of the county, Duke in Petersburg, and WIN Energy REMC in the countryside. CenterPoint customers absorbed the second phase of a roughly 20 percent increase this March. Meanwhile the county hosts the plant, the batteries, and the solar farms. People who live next to the infrastructure should not be an afterthought on rates, and any data center that comes here should cover more than its full cost of power so your bill goes down, not up.',
        ],
        sourceLinks: [
          ['OUCC, CenterPoint electric rate case', 'https://www.in.gov/oucc/electric/key-cases-by-utility/vectren-electric-rates/centerpoint-energy-electric-rate-case/'],
        ],
      }),
      card({
        key: 'pike-winslow-water',
        title: "Winslow's water rates",
        tag: 'radar',
        paragraphs: [
          'In January 2025 Winslow residents packed a town hall over a proposed 45 percent water rate increase. Small systems with old pipes and few customers face brutal math. The state has grant tools for exactly this, and towns like Winslow should be first in line for them, not last.',
        ],
        sourceLinks: [
          [
            '14 News, Winslow town hall on water rates',
            'https://www.14news.com/2025/01/16/this-town-needs-get-it-together-winslow-residents-left-questions-after-explosive-town-hall-meeting/',
          ],
        ],
      }),
      card({
        key: 'pike-patoka',
        title: 'The Patoka, brought back to life',
        tag: 'stand',
        paragraphs: [
          'Acid drainage from old strip mines once killed everything in the 17 mile South Fork of the Patoka. Federal reclamation money has been repairing that damage for years, and the wildlife refuge is rebuilding the river corridor mile by mile. That work is worth defending, and it shows what patient public investment does for a place.',
        ],
        sourceLinks: [
          [
            'Indiana DNR, abandoned mine land reclamation on the Patoka',
            'https://www.in.gov/dnr/reclamation/indiana-coal/about-us/awards/midwestern-abandoned-mine-land-reclamation-project/',
          ],
          ['Purdue, water resources of Pike County', 'https://engineering.purdue.edu/SafeWater/watershed/Pike.pdf'],
        ],
      }),
      card({
        key: 'pike-tax-base',
        title: 'A tax cap on a shrinking base',
        tag: 'stand',
        platformSlug: 'property-taxes',
        paragraphs: [
          "The state's property tax law caps local revenue at the exact moment the county's largest taxpayer is winding down its coal assets. Nobody in Indianapolis has published what that means for Pike County in dollars. I will, and once the numbers are out we can have an honest conversation about what the county can afford.",
        ],
        sourceLinks: [
          ['WFYI, property tax impact on schools', 'https://www.wfyi.org/news/articles/indiana-senate-bill-1-house-amended-property-tax-impact-on-schools'],
          ['DLGF, Pike County 2026 budget order', 'https://www.in.gov/dlgf/files/2026-reports/2026-budget-orders/Pike-251230-2026-Budget-Order.pdf'],
        ],
      }),
    ],
    listeningPrompt:
      'Some of you are meeting me for the first time on this page. Fair enough. Tell me what Pike County needs that nobody with a title has asked you about: the data center question, the plant transition, a road, a rate, anything.',
    localOutlets: outlets('pike', [
      ['The Press-Dispatch', 'https://www.suncommercial.com/press_dispatch/'],
      ['14 News', 'https://www.14news.com/'],
      ['Dubois County Free Press', 'https://duboiscountyfreepress.com/'],
    ]),
    lastUpdated: LAST_UPDATED,
    orderRank: '50',
  },
  {
    _id: 'drafts.countyPage-spencer-county',
    _type: 'countyPage',
    title: 'Spencer County',
    slug: {_type: 'slug', current: 'spencer-county'},
    townsLine: 'Rockport · Santa Claus · Dale · Chrisney · Grandview · Gentryville · St. Meinrad',
    intro:
      'Spencer County is about to decide the next fifty years of its economy: what replaces the coal plant, what gets built at Rockport, and who pays for it. Those decisions should not happen without you.',
    ledeTitle: 'The plant, the tax base, and what comes next',
    ledeBody: [
      block(
        'spencer-lede-1',
        "The AEP plant at Rockport has carried this county for decades. Its assessed value has been over 22 percent of the whole county's and more than half of South Spencer schools'. Both units retire by the end of 2028 under a federal court agreement. Whatever replaces it, Spencer County lives with the gap in between.",
      ),
      block(
        'spencer-lede-2',
        "At the same time, the state's property tax law is squeezing local budgets, and the county council just showed it will not rubber-stamp whatever gets offered: in June it voted down a tax abatement for a proposed gas plant after residents showed up with hard questions about the aquifer, air quality, and who actually benefits. That is exactly how this is supposed to work. Officials listened because people came.",
      ),
    ],
    issueCards: [
      card({
        key: 'spencer-smr',
        title: 'The nuclear question at Rockport',
        tag: 'listening',
        paragraphs: [
          'Indiana Michigan Power wants to pursue a small modular reactor at the Rockport site, with a reactor design from GE and a timeline its own executives put in the mid-2030s. So far it is early: a federal grant application, a planning document, and no application yet before nuclear regulators or the state utility commission. Every named local official on the record supports exploring it, mostly because of the jobs and the tax base. The state passed a law in 2025 that lets utilities charge customers for development costs before anything is built, and consumer groups oppose that mechanism.',
          'Here is where I stand: I am not for it or against it yet, because the people most affected have barely been heard. No plant worker and no Rockport or Grandview neighbor has spoken publicly that I can find. County ordinance guarantees a public hearing before construction work begins. I will be at that hearing. Between now and then, you live with this plant, so tell me what you want its next fifty years to look like.',
        ],
        sourceLinks: [
          ['AEP, Rockport SMR grant application', 'https://www.aep.com/news/stories/view/9974/'],
          ['Spencer County, Ordinance 2024-10', 'https://www.in.gov/counties/spencer/files/ordinances-resolutions/2024-10-Ordinance-Energy.pdf'],
          ['Spencer County Online, county officials on the SMR', 'https://spencercountyonline.com/spencer-county-on-the-cutting-edge-this-is-historic/'],
        ],
      }),
      card({
        key: 'spencer-tenaska',
        title: 'Tenaska and the aquifer',
        tag: 'listening',
        paragraphs: [
          'A developer wants to build a large gas power plant near Rockport, next to the AEP site. Commissioners rezoned the ground, and then the county council rejected the proposed tax abatement after residents raised water use from the local aquifer, air quality, and the suspicion that the plant would end up serving data centers. The company has promised well testing this fall. Nothing about this is settled, and I want to hear from the neighbors and well owners closest to it.',
        ],
        sourceLinks: [
          [
            'Spencer County Online, council votes down the abatement',
            'https://spencercountyonline.com/spencer-county-council-votes-down-tax-abatement-for-natural-gas-plant-members-may-consider-alternative-incentive-structures/',
          ],
        ],
      }),
      card({
        key: 'spencer-corridor',
        title: 'The corridor starts here',
        tag: 'stand',
        platformSlug: 'accountability',
        paragraphs: [
          'The Mid-States Corridor begins at the Natcher Bridge at Rockport. The draft environmental study and a preferred route are expected this fall, in the middle of this campaign, and Spencer County farms and homes are on those maps. You know where I stand: 81 percent of Dubois County said no in a professional poll, the county council there is walking away from the project funding body, and I have spent three years doing the homework this project never did.',
        ],
        sourceLinks: [
          ['Mid-States Corridor project overview', 'https://midstatescorridor.com/project-overview/'],
          [
            'Dubois County Free Press, INDOT narrows to two alternatives',
            'https://duboiscountyfreepress.com/indot-narrows-mid-states-corridor-options-to-two-expressway-alternatives/',
          ],
        ],
      }),
      card({
        key: 'spencer-centerpoint',
        title: 'CenterPoint, both phases',
        tag: 'stand',
        platformSlug: 'data-centers',
        paragraphs: [
          'Spencer County is CenterPoint electric territory, and the second phase of a roughly 20 percent increase hit in March. When the biggest new electricity users in the country come asking for power, they should cover more than their full cost so bills fall for everyone else. That is my line, and I will hold it.',
        ],
        sourceLinks: [
          ['14 News, IURC approves CenterPoint increase', 'https://www.14news.com/2025/02/03/iurc-make-final-decision-centerpoint-rate-hike/'],
        ],
      }),
      card({
        key: 'spencer-housing',
        title: 'Housing that working families can actually get',
        tag: 'stand',
        platformSlug: 'housing',
        paragraphs: [
          "Santa Claus is growing, and the numbers behind it are stubborn: a 44 unit apartment project needed a tax abatement to move, a small subdivision at Christmas Lake needed state infrastructure money, and the town's sewer rates had not changed since 2013 while costs, by the town's own account, tripled. Rural housing does not fix itself. It takes sewer and water capacity, and that is state level work I will own.",
        ],
        sourceLinks: [
          [
            'Spencer County Journal-Democrat, Santa Claus apartment development',
            'https://www.duboiscountyherald.com/spencer_county_news/announcements/apartment-development-in-progress-in-santa-claus/article_806ee2f4-bd72-57e0-9929-74609a3376fa.html',
          ],
          ['SWIDC, Back 9 housing development', 'https://swidc.org/regional-strategy/projects/back-9-housing-development/'],
        ],
      }),
      card({
        key: 'spencer-momentum',
        title: 'The good news column',
        tag: 'radar',
        paragraphs: [
          'Holiday World is building a 22 million dollar water coaster for 2027, the county ambulance service won a state grant for mobile health care and is working to add ultrasound units to its rigs, and a farm co-op is putting more than 20 million dollars into a fertilizer river terminal at Rockport. Spencer County has real momentum to protect. The job is making sure the big decisions above do not squander it.',
        ],
        sourceLinks: [
          [
            'WHAS11, Holiday World announces Cannonball',
            'https://www.whas11.com/article/news/local/indiana/holiday-world-indiana-unveils-plans-22-million-water-roller-coaster-cannonball/417-3ff1b54e-b7ef-485f-ba3c-3f3284153bf3',
          ],
          ['Waterways Journal, Superior Ag fertilizer terminal', 'https://www.waterwaysjournal.net/2025/02/07/superior-ag-plans-southwest-indiana-fertilizer-terminal/'],
        ],
      }),
    ],
    listeningPrompt:
      'From Santa Claus to the riverfront, this county is carrying more big decisions at once than almost anywhere in Indiana. If you work at the plant, farm along the corridor maps, or run a well near the proposed gas plant site, I want to hear from you first, not last.',
    localOutlets: outlets('spencer', [
      ['Spencer County Journal-Democrat', 'https://www.duboiscountyherald.com/spencer_county_news/'],
      ['Spencer County Online', 'https://spencercountyonline.com/'],
      ['14 News', 'https://www.14news.com/'],
    ]),
    lastUpdated: LAST_UPDATED,
    orderRank: '60',
  },
]

async function main() {
  const transaction = client.transaction()
  for (const county of counties) {
    transaction.createOrReplace(county)
  }
  await transaction.commit()
  for (const county of counties) {
    console.log(`✓ draft created: ${county._id} (${county.issueCards.length} issue cards)`)
  }
  console.log('\nAll six county pages are DRAFTS. Review and publish each in the Studio under "County Pages".')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
