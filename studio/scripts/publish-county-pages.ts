import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'}).withConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'n2oyijjv',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  useCdn: false,
})

/**
 * Publishes the six county pages and points the district map at them.
 * Run AFTER Brad has reviewed the drafts in the Studio (any edits he made
 * to the drafts are what gets published). Steps:
 *   1. For each county: publish the draft (draft wins over published copy),
 *      then delete the draft.
 *   2. Retarget the map's county pin and county region popups from
 *      /platform to /district/<slug>.
 *   3. Fix the District 48 pin popup link (/about redirects; use /platform).
 */

const COUNTY_SLUGS = [
  'crawford-county',
  'dubois-county',
  'gibson-county',
  'perry-county',
  'pike-county',
  'spencer-county',
]

const COUNTY_KEYS: Record<string, string> = {
  'crawford-county': 'crawford',
  'dubois-county': 'dubois',
  'gibson-county': 'gibson',
  'perry-county': 'perry',
  'pike-county': 'pike',
  'spencer-county': 'spencer',
}

async function main() {
  for (const slug of COUNTY_SLUGS) {
    const publishedId = `countyPage-${slug}`
    const draftId = `drafts.${publishedId}`
    const draft = await client.getDocument(draftId)
    const source = draft ?? (await client.getDocument(publishedId))
    if (!source) {
      console.warn(`! no draft or published document for ${slug}, skipping`)
      continue
    }
    await client.createOrReplace({...source, _id: publishedId})
    if (draft) {
      await client.delete(draftId)
    }
    console.log(`✓ published ${publishedId}`)
  }

  let patch = client.patch('interactiveMap-district48')
  for (const slug of COUNTY_SLUGS) {
    const key = COUNTY_KEYS[slug]
    patch = patch.set({
      [`pins[_key=="pin-county-${key}"].popupLinkLabel`]: 'Local issues and where I stand →',
      [`pins[_key=="pin-county-${key}"].popupLinkUrl`]: `/district/${slug}`,
      [`layers[label=="District 48 Counties"].regions[_key=="county-${key}"].popupLinkLabel`]:
        'Local issues and where I stand →',
      [`layers[label=="District 48 Counties"].regions[_key=="county-${key}"].popupLinkUrl`]: `/district/${slug}`,
    })
  }
  patch = patch.set({'pins[_key=="pin-district-48"].popupLinkUrl': '/platform'})
  await patch.commit()
  console.log('✓ map pins and county regions now link to the county pages')
  console.log('\nSanity webhook will rebuild the site; pages appear at /district/<county> in about a minute.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
