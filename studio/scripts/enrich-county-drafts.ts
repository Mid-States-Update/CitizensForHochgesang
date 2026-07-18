// Enrichment pass 2026-07-18: field-targeted patches to the six county DRAFTS only.
// 1. Spencer: listeningPrompt was truncated mid-word ("...hear from you fi") — full replacement.
// 2. Perry: wheel-tax card gains the Feb 2026 statewide poll datapoint (with PPP/PRA attribution).
// 3. Dubois + Crawford: one district-balance sentence appended to the intro.
// Run: cd studio && npx sanity exec scripts/enrich-county-drafts.ts --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})

async function main() {
  const tx = client.transaction()

  tx.patch('drafts.countyPage-spencer-county', (p) =>
    p.set({
      listeningPrompt:
        'From Santa Claus to the riverfront, this county is carrying more big decisions at once than almost anywhere in Indiana. If you work at the plant, farm along the corridor maps, or run a well near the proposed gas plant site, I want to hear from you first. The state will hear about it second.',
      lastUpdated: '2026-07-18',
    })
  )

  tx.patch('drafts.countyPage-perry-county', (p) =>
    p
      .insert('after', 'issueCards[_key=="perry-wheel-tax"].body[-1]', [
        {
          _key: 'perry-wheel-tax-b2',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [
            {
              _key: 'perry-wheel-tax-b2-span',
              _type: 'span',
              marks: [],
              text: 'One more number worth knowing. When Public Policy Polling surveyed Indiana voters statewide in February 2026, in a poll commissioned by the Property Rights Alliance, 88 percent said they would rather see transportation money go to local road and bridge projects than to the Mid-States Corridor. Perry County roads are a district issue, and the district agrees with the river towns.',
            },
          ],
        },
      ])
      .set({lastUpdated: '2026-07-18'})
  )

  tx.patch('drafts.countyPage-dubois-county', (p) =>
    p.set({
      intro:
        'Home base for me and for this campaign. Dubois County is where I learned that showing up, pulling the records, and asking for a vote can actually move a county government. This district is bigger than my home county. The promise on all six pages is the same: whoever is closest to a decision gets heard first.',
      lastUpdated: '2026-07-18',
    })
  )

  tx.patch('drafts.countyPage-crawford-county', (p) =>
    p.set({
      intro:
        'The June flood is still an open emergency here, and the state cut road funding the same year. Crawford County does not need sympathy. It needs someone doing the homework and following the money. Six counties share this district, and my rule in all of them is the same: whoever is closest to the problem gets heard first.',
      lastUpdated: '2026-07-18',
    })
  )

  const result = await tx.commit()
  console.log('Patched:', result.results.map((r) => r.id).join(', '))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
