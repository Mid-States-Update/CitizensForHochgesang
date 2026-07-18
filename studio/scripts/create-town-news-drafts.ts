// Creates DRAFT media links for local-news coverage of district towns that had
// no news presence (2026-07-18 research pass; all URLs verified by research
// agents, see session notes). Everything lands as drafts.* for Brad's review;
// nothing publishes. Run:
//   cd studio && npx sanity exec scripts/create-town-news-drafts.ts --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})

type Item = {
  id: string
  title: string
  url: string
  description: string
  publishedAt?: string
  geoTags: string[]
}

const ITEMS: Item[] = [
  // ── Dubois ──
  {
    id: 'media-dcfp-huntingburg-data-centers-apr-2026',
    title: 'Dubois County Free Press: Huntingburg Council Debates Data Center and Battery Rules',
    url: 'https://duboiscountyfreepress.com/huntingburg-council-discusses-development-issues-with-data-centers-battery-storage/',
    description:
      "Huntingburg's council debates how to regulate data centers and battery energy storage, with residents pushing to close ordinance gaps before the next project arrives.",
    publishedAt: '2026-04-30T12:00:00.000Z',
    geoTags: ['Dubois County', 'Huntingburg'],
  },
  {
    id: 'media-wfie-holland-bess-mar-2026',
    title: 'WFIE: Residents Sound the Alarm on Battery Storage Coming to Dubois County',
    url: 'https://www.14news.com/2026/03/17/residents-sound-alarm-battery-energy-storage-system-coming-dubois-county/',
    description:
      'Neighbors near Holland raise fire safety and school proximity questions about the Crossvine battery storage project, in a county still writing its solar and battery rules.',
    publishedAt: '2026-03-16T12:00:00.000Z',
    geoTags: ['Dubois County', 'Holland'],
  },
  {
    id: 'media-dcfp-birdseye-sewer-apr-2025',
    title: 'Dubois County Free Press: County Agrees to Support Critical Sewer Work in Birdseye',
    url: 'https://duboiscountyfreepress.com/county-agrees-to-support-critical-sewer-work-in-birdseye/',
    description:
      'Dubois County approves $350,000 to help Birdseye fix failing wastewater infrastructure. The town has been under a state sewer connection ban for roughly a decade.',
    publishedAt: '2025-04-02T12:00:00.000Z',
    geoTags: ['Dubois County', 'Birdseye'],
  },
  // ── Perry ──
  {
    id: 'media-wfie-tell-city-river-road-may-2026',
    title: 'WFIE: Tell City River Road Project Complete After Nearly 20 Years',
    url: 'https://www.14news.com/2026/05/21/tell-city-river-road-project-complete-after-nearly-20-years/',
    description:
      "After nearly 20 years and about $6 million, Tell City's River Road now connects the riverport straight to State Road 66, moving heavy trucks off downtown streets.",
    publishedAt: '2026-05-20T12:00:00.000Z',
    geoTags: ['Perry County', 'Tell City'],
  },
  {
    id: 'media-wfyi-cannelton-hb1136-jan-2025',
    title: 'WFYI: Bill Would Dissolve Cannelton Schools, Convert Them to Charters',
    url: 'https://www.wfyi.org/news/articles/indiana-house-bill-1136-disband-ips-gary-union-cannelton-tri-township-schools',
    description:
      'House Bill 1136, filed for the 2025 session, would have dissolved five districts including Cannelton City Schools and handed their schools to charter operators by 2028.',
    publishedAt: '2025-01-06T12:00:00.000Z',
    geoTags: ['Perry County', 'Cannelton'],
  },
  {
    id: 'media-telecompetitor-psc-fiber-bead-dec-2025',
    title: 'Telecompetitor: Federal Broadband Award Funds PSC Fiber in Perry and Spencer Counties',
    url: 'https://www.telecompetitor.com/updated-comprehensive-list-bead-benefit-of-the-bargain-provisional-awards/',
    description:
      "Indiana's federal BEAD broadband awards include about $1.8 million for the St. Meinrad based Perry Spencer Rural Telephone Cooperative to extend fiber in rural Perry and Spencer counties.",
    publishedAt: '2025-12-03T12:00:00.000Z',
    geoTags: ['Perry County', 'Spencer County', 'St. Meinrad'],
  },
  // ── Spencer ──
  {
    id: 'media-wzdm-corridor-groundbreak-dec-2025',
    title: 'WZDM: Mid-States Corridor Looking at Mid-2027 Groundbreak',
    url: 'https://www.wzdm.com/2025/12/16/mid-states-corridor-looking-at-mid-2027-groundbreak/',
    description:
      'INDOT holds an industry day as it targets a mid-2027 groundbreaking for the Mid-States Corridor, whose new construction would begin near Dale in Spencer County.',
    publishedAt: '2025-12-16T12:00:00.000Z',
    geoTags: ['Spencer County', 'Dale'],
  },
  {
    id: 'media-scjd-spencer-joins-rda-mar-2026',
    title: 'Spencer County Journal-Democrat: Spencer County Hears Mid-States Update',
    url: 'https://www.duboiscountyherald.com/spencer_county_news/news/government/spencer-county-hears-midstates-update/article_0bd557f3-6aaa-5cd0-b265-3f8568380b89.html',
    description:
      'Spencer County commissioners approve Resolution 2026-01 joining the Mid-States Corridor Regional Development Authority, with a preferred route announcement and public comment period ahead.',
    publishedAt: '2026-03-18T12:00:00.000Z',
    geoTags: ['Spencer County'],
  },
  {
    id: 'media-wfie-rockport-smr-jan-2025',
    title: 'WFIE: Plans Ongoing to Potentially Build Nuclear Power Plant in Rockport',
    url: 'https://www.14news.com/2025/01/17/plans-ongoing-potentially-build-nuclear-power-plant-rockport/',
    description:
      'Indiana Michigan Power pursues federal grant money toward early site permitting for a small modular reactor at the Rockport plant site, a project its own executives put 10 to 15 years out.',
    publishedAt: '2025-01-17T12:00:00.000Z',
    geoTags: ['Spencer County', 'Rockport'],
  },
  {
    id: 'media-scjd-grandview-solar-decommission-may-2026',
    title: 'Spencer County Journal-Democrat: Grandview Solar Updates Decommission Plan',
    url: 'https://www.duboiscountyherald.com/spencer_county_news/spencer_county_news/news/government/grandview-solar-updates-decommission-plan/article_3a59d178-14dd-56bc-9b50-0ceeb293384b.html',
    description:
      'The owner of the 91 megawatt Grandview Solar Project files an updated decommissioning plan with Spencer County, the latest step in the county\'s most contested solar project.',
    publishedAt: '2026-05-27T12:00:00.000Z',
    geoTags: ['Spencer County', 'Grandview'],
  },
  {
    id: 'media-scjd-santa-claus-waterline-jun-2026',
    title: 'Spencer County Journal-Democrat: Santa Claus Changes Waterline Annexation Rule',
    url: 'https://www.duboiscountyherald.com/spencer_county_news/news/government/santa-claus-makes-changes-to-waterline-ordinance/article_0b15c567-e616-5081-af0a-eecbe5c4a665.html',
    description:
      'Santa Claus drops a rule that let the town annex property when residents connected to municipal water, voiding annexation documents dating to 2003 after neighbors objected.',
    publishedAt: '2026-06-24T12:00:00.000Z',
    geoTags: ['Spencer County', 'Santa Claus'],
  },
  {
    id: 'media-wfie-centerpoint-credit-oct-2025',
    title: 'WFIE: CenterPoint Gives Monthly Credit as Part of Affordability Actions',
    url: 'https://www.14news.com/2025/10/23/centerpoint-energy-gives-monthly-credit-part-affordability-actions/',
    description:
      'Under pressure over bill spikes after its 2025 rate increase, CenterPoint announces a monthly credit and pledges to hold rates near inflation for two years across southwestern Indiana.',
    publishedAt: '2025-10-23T12:00:00.000Z',
    geoTags: ['Dubois County', 'Gibson County', 'Pike County', 'Spencer County'],
  },
  // ── Pike ──
  {
    id: 'media-pcpd-solar-road-damage-feb-2025',
    title: 'Pike County Press-Dispatch: Prosecutor Questions Commissioners About Solar Farm Damage',
    url: 'https://www.suncommercial.com/press_dispatch/news/article_b6d834d9-077c-5061-a7e7-a9fea009933d.html',
    description:
      "Pike County's prosecutor confronts commissioners over solar construction damage: trucks on unbonded roads, torn up yards, and a county with no building permits for solar projects.",
    publishedAt: '2025-02-27T12:00:00.000Z',
    geoTags: ['Pike County', 'Petersburg'],
  },
  {
    id: 'media-pcpd-pcsc-finances-mar-2026',
    title: 'Pike County Press-Dispatch: School Board Meeting Focuses on Financial Challenges',
    url: 'https://www.suncommercial.com/press_dispatch/community/article_d320906c-65ea-5615-82fb-3b859740167b.html',
    description:
      'Pike County schools present a financial recovery plan to the state after losing about $2.95 million as students transferred out, with wage freezes and possible state takeover on the table.',
    publishedAt: '2026-03-26T12:00:00.000Z',
    geoTags: ['Pike County', 'Petersburg', 'Winslow', 'Otwell'],
  },
  // ── Gibson ──
  {
    id: 'media-wfie-gibson-community-crossings-dec-2025',
    title: 'WFIE: Gibson County Wins Maximum $1 Million Road Grant',
    url: 'https://www.14news.com/2025/12/10/vanderburgh-co-among-several-tri-state-counties-receive-state-funding-road-improvements/',
    description:
      'Gibson County wins the maximum $1 million Community Crossings grant toward Tulip Tree Drive near Toyota, in a round where 450 applications chased a shrunken $100 million pot.',
    publishedAt: '2025-12-09T12:00:00.000Z',
    geoTags: ['Gibson County', 'Princeton'],
  },
  {
    id: 'media-wfie-toyota-200m-mar-2026',
    title: 'WFIE: Toyota Investing $200 Million in Gibson County Plant',
    url: 'https://www.14news.com/2026/03/23/toyota-investing-200-million-gibson-co-plant/',
    description:
      'Toyota puts another $200 million into its Princeton plant for Grand Highlander capacity as the plant marks 30 years and 7,300 jobs in Gibson County.',
    publishedAt: '2026-03-23T12:00:00.000Z',
    geoTags: ['Gibson County', 'Princeton'],
  },
  {
    id: 'media-wevv-francisco-solar-abatement-dec-2025',
    title: 'WEVV: Gibson County Council to Vote on Francisco Solar Tax Abatement',
    url: 'https://www.wevv.com/news/indiana/gibson-county-council-to-vote-on-solar-project-tax-abatement/article_6a9c110a-c229-4dd8-8036-1a5c0e1f7ca8.html',
    description:
      "RWE's proposed $300 million solar farm near Francisco would cover 3,800 acres and power roughly 42,500 homes; the county council set a December 2025 abatement vote after a public hearing.",
    publishedAt: '2025-12-02T12:00:00.000Z',
    geoTags: ['Gibson County', 'Francisco'],
  },
  {
    id: 'media-wfie-centerpoint-petition-jul-2026',
    title: 'WFIE: Ratepayer Petition Asks Governor to Rehear CenterPoint Rate Increase',
    url: 'https://www.14news.com/2026/07/16/direct-action-against-centerpoint-energy-sends-petition-governor-rehear-feb-2025-rate-hike/',
    description:
      'A ratepayer group delivers more than 300 signatures asking the governor to seek a rehearing of CenterPoint\'s February 2025 rate increase, saying past due balances have nearly tripled.',
    publishedAt: '2026-07-15T12:00:00.000Z',
    geoTags: ['Gibson County', 'Princeton'],
  },
  {
    id: 'media-pdclarion-princeton-lit',
    title: 'Princeton Daily Clarion: Local Income Tax Changes Looming for Local Government',
    url: 'https://www.pdclarion.com/news/local-income-tax-changes-looming-for-local-government/article_046f7729-bcdf-5507-a8df-0060abae98ef.html',
    description:
      "Princeton's financial consultant briefs the council on the state's property tax overhaul: city revenue projected to dip in 2026, and a municipal local income tax decision due by 2027.",
    publishedAt: '2025-07-26T12:00:00.000Z',
    geoTags: ['Gibson County', 'Princeton'],
  },
  {
    id: 'media-pdclarion-oakland-city-water',
    title: 'Princeton Daily Clarion: Water Woes Addressed in Oakland City',
    url: 'https://www.pdclarion.com/news/local_news/water-woes-addressed-in-oakland-city/article_d972fbe8-f592-5f86-9b0e-000e846b1611.html',
    description:
      'Oakland City battles a broken main found when water bubbled through highway asphalt, overage charges on Patoka Lake water, and a meter replacement project nearing completion.',
    publishedAt: '2025-01-31T12:00:00.000Z',
    geoTags: ['Gibson County', 'Oakland City'],
  },
  // ── Crawford ──
  {
    id: 'media-clarion-crawford-four-day-week-apr-2025',
    title: 'The Clarion News: Crawford Schools Consider Moving to 4-Day Week',
    url: 'https://www.madisoncourier.com/the_clarion_news/news/crawford-schools-consider-moving-to-4-day-week/article_1e995c5d-c68b-5b58-8c85-323172a3dffb.html',
    description:
      'Crawford County schools weigh a four day week with a flexible fifth day for tutoring and job training, after visits to rural districts that saw attendance and scores improve.',
    publishedAt: '2025-04-30T12:00:00.000Z',
    geoTags: ['Crawford County', 'Marengo'],
  },
  {
    id: 'media-clarion-tower-subdivision-may-2026',
    title: "The Clarion News: Tower Subdivision a 'Major Step' for Crawford County",
    url: 'https://www.madisoncourier.com/the_clarion_news/news/tower-subdivision-major-step-for-cc/article_68427552-2fdd-5027-af18-5d472ceb8d5f.html',
    description:
      'Ground breaks on the Tower Subdivision near Leavenworth: 57 homes sold at cost, backed by READI money, Jasper Engines, French Lick Resort, and county infrastructure dollars.',
    publishedAt: '2026-05-06T12:00:00.000Z',
    geoTags: ['Crawford County', 'Leavenworth'],
  },
]

async function main() {
  for (const item of ITEMS) {
    const doc: Record<string, unknown> = {
      _id: `drafts.${item.id}`,
      _type: 'mediaLink',
      title: item.title,
      mediaType: 'other',
      url: item.url,
      description: item.description,
      geoTags: item.geoTags,
      highlight: false,
    }
    if (item.publishedAt) doc.publishedAt = item.publishedAt
    await client.createOrReplace(doc as any)
    console.log(`draft: ${item.id}  [${item.geoTags.join(', ')}]`)
  }
  console.log(`\n${ITEMS.length} draft media links created. Nothing published.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
