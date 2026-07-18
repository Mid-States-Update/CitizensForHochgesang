// Pre-publish review fixes for county page drafts (2026-07-18 review):
//  1. Dubois lede: 81% poll number needs PPP/PRA attribution (campaign disclosure rule).
//  2. Spencer corridor card: same 81% number, same missing attribution.
//  3. Crawford intro: "The June flood" needs its year (evergreen dating rule).
// Run: cd studio && npx sanity exec scripts/fix-county-draft-review.ts --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})

function replaceInPortableText(blocks: any[], from: string, to: string): boolean {
  for (const block of blocks ?? []) {
    if (block._type !== 'block') continue
    for (const child of block.children ?? []) {
      if (typeof child.text === 'string' && child.text.includes(from)) {
        child.text = child.text.replace(from, to)
        return true
      }
    }
  }
  return false
}

async function main() {
  // 1. Dubois lede
  const dubois = await client.getDocument('drafts.countyPage-dubois-county')
  if (!dubois) throw new Error('Dubois draft missing')
  const duboisOk = replaceInPortableText(
    dubois.ledeBody,
    'a professional poll showing 81 percent opposition',
    'a December 2025 Public Policy Polling survey, commissioned by the Property Rights Alliance, showing 81 percent opposition'
  )
  if (!duboisOk) throw new Error('Dubois lede target text not found')
  await client.patch(dubois._id).set({ledeBody: dubois.ledeBody}).commit()
  console.log('Fixed: Dubois lede poll attribution')

  // 2. Spencer corridor card
  const spencer = await client.getDocument('drafts.countyPage-spencer-county')
  if (!spencer) throw new Error('Spencer draft missing')
  let spencerOk = false
  for (const card of spencer.issueCards ?? []) {
    if (
      replaceInPortableText(
        card.body,
        '81 percent of Dubois County said no in a professional poll',
        '81 percent of Dubois County said no in a December 2025 Public Policy Polling survey commissioned by the Property Rights Alliance'
      )
    ) {
      spencerOk = true
      break
    }
  }
  if (!spencerOk) throw new Error('Spencer card target text not found')
  await client.patch(spencer._id).set({issueCards: spencer.issueCards}).commit()
  console.log('Fixed: Spencer corridor card poll attribution')

  // 3. Crawford intro year
  const crawford = await client.getDocument('drafts.countyPage-crawford-county')
  if (!crawford) throw new Error('Crawford draft missing')
  if (typeof crawford.intro !== 'string' || !crawford.intro.includes('The June flood'))
    throw new Error('Crawford intro target text not found')
  await client
    .patch(crawford._id)
    .set({intro: crawford.intro.replace('The June flood', 'The June 2026 flood')})
    .commit()
  console.log('Fixed: Crawford intro flood year')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
