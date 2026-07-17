import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  useCdn: false,
})

/**
 * Corrections to the six county page DRAFTS (2026-07-17), from Brad's review
 * plus two verification deep dives:
 *  1. Crawford: the campaign has NO Crawford County poll. Remove that claim.
 *  2. Pike: Petersburg's conversion status stated precisely (Unit 3 offline
 *     Feb 2026, Unit 4 scheduled June 2026, coal ends in 2026; BESS in
 *     service Mar 2025; Petersburg Energy Center in service Feb 2026).
 *  3. Spencer: the corridor's Spencer leg is the existing four lane US 231
 *     finished in 2011; the Aug 23, 2023 Tier 1 decision plans NO corridor
 *     construction in Spencer County; all mapped displacements are in Dubois.
 *  4. Everywhere: evergreen dating. Absolute dates only; no "this fall",
 *     "last September", "this month" phrasing that goes stale.
 * Patches are field-targeted so any other edits Brad made in Studio survive.
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

const blockText = (blockKey: string) => `children[0].text`

async function patchDraft(id: string, sets: Record<string, unknown>) {
  await client.patch(id).set(sets).commit()
  console.log(`✓ patched ${id} (${Object.keys(sets).length} fields)`)
}

async function main() {
  // ── Crawford ──────────────────────────────────────────────────────
  await patchDraft('drafts.countyPage-crawford-county', {
    listeningPrompt:
      'Crawford County gets talked about more than it gets listened to. Tell me what English, Marengo, Milltown, Leavenworth, and the townships actually need, and I will put it on the record.',
    [`ledeBody[_key=="crawford-lede-1"].${blockText('crawford-lede-1')}`]:
      "The flash flooding of June 26 through 28, 2026 trapped drivers on State Road 66 and at the English cloverleaf, partially collapsed Allen Creek Road, destroyed the asphalt on Devil's Hollow Road, and took down a 94 year old bridge on Kemp Road. The commissioners declared an emergency on June 26, 2026 and extended it indefinitely on July 2, 2026.",
    [`ledeBody[_key=="crawford-lede-2"].${blockText('crawford-lede-2')}`]:
      'Here is the part that should make everyone angry. In 2025 the state legislature cut the Community Crossings road grant program to a 100 million dollar annual cap, down from an average of roughly 255 million. Crawford County received $611,477 from the program in 2025. A county hit by federally declared flooding in April 2025 and another emergency in June 2026 cannot repair this alone, and the state made its main repair tool smaller.',
    [`issueCards[_key=="crawford-utilities"].body`]: [
      block(
        'crawford-utilities-b1',
        "Duke's two step electric increase totaled about 13 percent, with the second step in early 2026, and the Patoka Lake regional water district raised rates 4.8 percent effective February 1, 2026. In one of Indiana's lowest income counties, those increases take the biggest bite from the smallest paychecks. That is why I keep pushing utility affordability at the state level, and why any giant new power user should cover more than its full cost.",
      ),
    ],
  })

  // ── Dubois ────────────────────────────────────────────────────────
  await patchDraft('drafts.countyPage-dubois-county', {
    [`ledeBody[_key=="dubois-lede-1"].${blockText('dubois-lede-1')}`]:
      'In February 2026 your neighbors delivered more than 8,000 petition signatures and a professional poll showing 81 percent opposition to the Mid-States Corridor. On March 31, 2026 the County Council voted 6 to 1 to begin withdrawing from the corridor RDA, and the withdrawal ordinance passed second reading in April 2026. Jasper council members announced their opposition in December 2025.',
    [`ledeBody[_key=="dubois-lede-2"].${blockText('dubois-lede-2')}`]:
      'That happened because people did the homework and kept showing up. The project is not dead. In October 2025 INDOT narrowed the route to two expressway options east of Huntingburg and Jasper, each consuming an estimated 1,400 acres or more of farms and homes, and INDOT scheduled the draft environmental study for fall 2026 with a final decision expected in summer 2027. I will keep treating this the way it deserves: with records requests, public meetings, and votes.',
    [`issueCards[_key=="dubois-crossvine"].body[_key=="dubois-crossvine-b1"].${blockText('x')}`]:
      'AES is building a large solar and battery storage project between Huntingburg and Holland. The battery system would be one of the largest in Indiana, and it sits within about two miles of Holland Elementary and the Southridge schools. Residents raised permit discrepancies and safety questions at public meetings through 2025 and 2026, and commissioners said the current ordinance gives the county little room to act. Construction was scheduled to begin in March 2026, with operation targeted for late 2027.',
    [`issueCards[_key=="dubois-zoning"].body[_key=="dubois-zoning-b1"].${blockText('x')}`]:
      "Most of unincorporated Dubois County has no zoning. The county's comprehensive plan was scheduled to reach its steering committee in August 2026, and the county's solar moratorium expires in December 2026. Corridors, solar, batteries, and data centers all come down to the same question: do the people who live here get a real say in what gets built next to them? I believe local control has to mean more than a formality.",
    [`issueCards[_key=="dubois-healthcare"].body[_key=="dubois-healthcare-b1"].${blockText('x')}`]:
      "Memorial Hospital ran locally for about 75 years. Its ambulance service moved to Deaconess EMS in October 2024, and in August 2025 the hospital itself became Deaconess Memorial. Deaconess has promised major investment, and nothing here is an accusation. It is a question worth asking out loud: when decisions about local care move to a regional system, who speaks for Dubois County patients?",
    [`issueCards[_key=="dubois-workforce"].body[_key=="dubois-workforce-b1"].${blockText('x')}`]:
      "Dubois County unemployment was 2.1 percent in April 2026, near the lowest in Indiana. Employers here cannot find workers, and workers cannot find childcare or a house they can afford. By the county's own study, we need roughly 2,200 to 2,900 new homes by 2035. If we want the next generation to stay, this is the work.",
  })

  // ── Gibson ────────────────────────────────────────────────────────
  await patchDraft('drafts.countyPage-gibson-county', {
    [`ledeBody[_key=="gibson-lede-1"].${blockText('gibson-lede-1')}`]:
      'In May 2026 Oakland City University suspended every undergraduate program for the 2026-27 school year. The layoff notice filed with the state in April 2026 listed 167 jobs, and more than a hundred employees reported going unpaid that spring. Students scrambled for transfer offers from USI, Evansville, and Ivy Tech. For a town of about 2,300 people, the university is not a line item. It is the anchor.',
    [`issueCards[_key=="gibson-centerpoint"].body[_key=="gibson-centerpoint-b1"].${blockText('x')}`]:
      'Gibson County is CenterPoint electric territory, and the second phase of a roughly 20 percent increase took effect in March 2026. In July 2026 a grassroots group delivered a petition with more than 300 signatures asking the governor to push for a rehearing of the 2025 rate case. People choosing between medicine and air conditioning is not a talking point. It is happening here.',
    [`issueCards[_key=="gibson-toyota"].body[_key=="gibson-toyota-b1"].${blockText('x')}`]:
      'Toyota announced a 1.4 billion dollar investment in the Princeton plant in April 2024 for a new electric SUV and battery assembly, with hiring that began in early 2026, and added roughly 200 million dollars more for Grand Highlander capacity in March 2026. That is good news, and it also raises real questions the county has to plan for: housing for new workers, roads, childcare, and the power to run it all. Growth this big should come with a seat at the table for the people who live around it.',
    [`issueCards[_key=="gibson-flooding"].body[_key=="gibson-flooding-b1"].${blockText('x')}`]:
      "The Patoka near Princeton reached moderate flood stage in July 2026, and the White River at Hazleton carried flood warnings in March 2026. Some of the county's best ground sits in those bottoms. Levees, drainage, and honest flood planning are old fashioned government work, and they are exactly the kind of thing I will show up for.",
  })

  // ── Perry ─────────────────────────────────────────────────────────
  await patchDraft('drafts.countyPage-perry-county', {
    [`ledeBody[_key=="perry-lede-1"].${blockText('perry-lede-1')}`]:
      'In 2025 a state bill named Cannelton City Schools on a list of districts to dissolve. Then a new law forced small districts to win a referendum just to keep their operating levy. Cannelton is one of the poorest cities in Indiana, and its school is the center of town. In November 2025 your neighbors answered: 71 percent voted yes, on a measure the superintendent made sure would not raise taxes. In June 2026 the board committed to meeting the state minimum teacher salary.',
    [`issueCards[_key=="perry-wheel-tax"].body[_key=="perry-wheel-tax-b1"].${blockText('x')}`]:
      "The state's 2025 road funding law ties new state road dollars to whether a city adopts a wheel tax. Tell City's council delayed one in August 2025 while it looked for alternatives, and by July 2026 local reporting called it likely. Add the 2026 gas tax holiday, which pulls over half a billion dollars from state and local road funds, and the pattern is plain: the state cuts ribbons, river towns get invoices.",
    [`issueCards[_key=="perry-hospital"].body[_key=="perry-hospital-b1"].${blockText('x')}`]:
      "Perry County Memorial is the county's only hospital, and it runs the county's ambulance service. In July 2026 the hospital board and the county commissioners held a work session on hospital finances, and the commissioners appointed two of their own members to the hospital board. I am not going to speculate past the public record. I am going to watch it closely, because rural hospital finance is a state policy problem wearing a local name.",
    [`issueCards[_key=="perry-water-sewer"].body[_key=="perry-water-sewer-b1"].${blockText('x')}`]:
      'Tell City is replacing lead water service lines with a 4.2 million dollar state loan approved through the state revolving fund. Brushy Hollow residents spent June 2026 documenting sewage backups from failing grinder pumps. And in April 2025 the Ohio neared 49 feet at Tell City while the levee and the pump stations held. None of this is glamorous. All of it is what government is actually for.',
  })

  // ── Pike ──────────────────────────────────────────────────────────
  await patchDraft('drafts.countyPage-pike-county', {
    intro:
      'Pike County kept the lights on for Indianapolis for a hundred years. In 2026 the Petersburg plant is ending coal for good, and the question is what comes next and who decides.',
    [`ledeBody[_key=="pike-lede-1"].${blockText('pike-lede-1')}`]:
      'In September 2025 the county commissioners passed a resolution welcoming data center development. By their own account at public meetings, they did it without knowing much about data centers. Your neighbors noticed. More than a hundred people packed a commissioners meeting in June 2026, and a group of Pike County residents is organizing to ask the questions the resolution skipped: how much water, whose power bills, and what happens to the land.',
    [`issueCards[_key=="pike-transition"].body`]: [
      block(
        'pike-transition-b1',
        "AES is putting about 1.1 billion dollars into Pike County. The plant's last two coal units are being converted to natural gas: Unit 3 went offline for its conversion in February 2026, Unit 4 was scheduled to follow in June 2026, and AES plans to end coal at Petersburg entirely in 2026, the first Indiana investor owned utility to do it. A 200 megawatt battery installation has been in service since March 2025, and the Petersburg Energy Center, 250 megawatts of solar with battery storage, entered service in February 2026.",
      ),
      block(
        'pike-transition-b2',
        "The plant has long been the county's largest taxpayer, and the school district lost about $300,000 as assets shifted. Plant families, miners, and Pike Central parents live with this transition every day. I want to hear what you are seeing before I tell anyone what the state should do about it.",
      ),
    ],
    [`issueCards[_key=="pike-transition"].sources`]: sources('pike-transition', [
      ['AES Indiana, 1.1 billion dollar Pike County investment', 'https://www.aesindiana.com/press-release/aes-indiana-accelerates-future-energy-11-billion-investments-pike-county'],
      ['IPALCO Q1 2026 SEC filing (conversion schedule)', 'https://www.sec.gov/Archives/edgar/data/0000728391/000072839126000027/cik0000728391-20260331.htm'],
      ['AES Indiana, Petersburg Energy Center in service', 'https://www.aesindiana.com/press-release/aes-indiana-announces-petersburg-energy-center-now-service-delivering-balanced'],
      ['WFYI, how the closure could affect Petersburg', 'https://www.wfyi.org/news/articles/how-a-coal-plants-closures-could-affect-one-indiana-town-and-what-it-plans-to-do-about-it'],
    ]),
    [`issueCards[_key=="pike-power-bill"].body[_key=="pike-power-bill-b1"].${blockText('x')}`]:
      'Pike County households are served by three different utilities: CenterPoint across much of the county, Duke in Petersburg, and WIN Energy REMC in the countryside. CenterPoint customers absorbed the second phase of a roughly 20 percent increase in March 2026. Meanwhile the county hosts the plant, the batteries, and the solar farms. People who live next to the infrastructure should not be an afterthought on rates, and any data center that comes here should cover more than its full cost of power so your bill goes down, not up.',
  })

  // ── Spencer ───────────────────────────────────────────────────────
  await patchDraft('drafts.countyPage-spencer-county', {
    [`ledeBody[_key=="spencer-lede-2"].${blockText('spencer-lede-2')}`]:
      "At the same time, the state's 2025 property tax law is squeezing local budgets, and the county council showed in June 2026 that it will not rubber-stamp whatever gets offered: it voted down a tax abatement for a proposed gas plant after residents showed up with hard questions about the aquifer, air quality, and who actually benefits. That is exactly how this is supposed to work. Officials listened because people came.",
    [`issueCards[_key=="spencer-corridor"].title`]: 'The corridor next door',
    [`issueCards[_key=="spencer-corridor"].body`]: [
      block(
        'spencer-corridor-b1',
        "On paper the Mid-States Corridor starts at the Natcher Bridge in Rockport. Spencer County's share is the four lane US 231 that was finished back in 2011, and the state's August 2023 decision says no corridor construction is planned in this county. The new construction under study runs from I-64 at Dale north past Huntingburg and Jasper, and every home and farm on the route maps released in October 2025 sits in Dubois County.",
      ),
      block(
        'spencer-corridor-b2',
        'I still watch this project for Spencer County, because what gets built next door changes traffic, taxes, and farmland here too. INDOT scheduled the draft environmental study for fall 2026 and a final decision for summer 2027. You know where I stand: 81 percent of Dubois County said no in a professional poll, and I have spent three years doing the homework this project never did.',
      ),
    ],
    [`issueCards[_key=="spencer-corridor"].sources`]: sources('spencer-corridor', [
      ['Mid-States Corridor, project key points (existing US 231 in Spencer County)', 'https://midstatescorridor.com/project-key-points/'],
      ['Tier 1 Record of Decision, August 2023 (no construction in Section 1)', 'https://midstatescorridor.com/wp-content/uploads/2023/09/Record-of-Decision.pdf'],
      ['Screening of Alternatives Report, October 2025', 'https://midstatescorridor.com/wp-content/uploads/2026/01/Screening-of-Alternatives-Report.pdf'],
    ]),
    [`issueCards[_key=="spencer-centerpoint"].body[_key=="spencer-centerpoint-b1"].${blockText('x')}`]:
      'Spencer County is CenterPoint electric territory, and the second phase of a roughly 20 percent increase took effect in March 2026. When the biggest new electricity users in the country come asking for power, they should cover more than their full cost so bills fall for everyone else. That is my line, and I will hold it.',
    [`issueCards[_key=="spencer-smr"].body[_key=="spencer-smr-b1"].${blockText('x')}`]:
      'Indiana Michigan Power wants to pursue a small modular reactor at the Rockport site, with a reactor design from GE and a timeline its own executives put in the mid-2030s. As of July 2026 it is early: a federal grant application, a planning document, and no application before nuclear regulators or the state utility commission. Every named local official on the record supports exploring it, mostly because of the jobs and the tax base. The state passed a law in 2025 that lets utilities charge customers for development costs before anything is built, and consumer groups oppose that mechanism.',
    [`issueCards[_key=="spencer-tenaska"].body[_key=="spencer-tenaska-b1"].${blockText('x')}`]:
      'A developer wants to build a large gas power plant near Rockport, next to the AEP site. Commissioners rezoned the ground in June 2026, and the county council then rejected the proposed tax abatement after residents raised water use from the local aquifer, air quality, and the suspicion that the plant would end up serving data centers. The company promised neighbor well testing in the fall of 2026. Nothing about this is settled, and I want to hear from the neighbors and well owners closest to it.',
    [`issueCards[_key=="spencer-momentum"].body[_key=="spencer-momentum-b1"].${blockText('x')}`]:
      'Holiday World is building a 22 million dollar water coaster announced for a 2027 opening, the county ambulance service won a state grant in 2025 for mobile health care and in 2026 began working to add ultrasound units to its rigs, and a farm co-op announced more than 20 million dollars for a fertilizer river terminal at Rockport in early 2025. Spencer County has real momentum to protect. The job is making sure the big decisions above do not squander it.',
  })

  console.log('\nAll six drafts corrected. Review in Studio under "County Pages".')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
