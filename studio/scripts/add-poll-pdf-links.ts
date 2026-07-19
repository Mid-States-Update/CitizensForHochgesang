// 2026-07-18: both poll posts published without linking the polls themselves
// (only read-the-polls-yourself linked the PDFs). Append a source-link block
// to each, matching the campaign's "verify everything" posture.
// Run: cd studio && npx sanity exec scripts/add-poll-pdf-links.ts --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-01-01'})

const LINKS: Array<{slug: string; url: string; label: string}> = [
  {
    slug: 'dubois-county-poll-results-81-percent-oppose',
    url: 'https://cdn.sanity.io/files/n2oyijjv/production/75a8e012f5ca5cba05ccea0a7c3a829c4b7efa5e.pdf',
    label: 'December 2025 Dubois County poll toplines and crosstabs (PDF)',
  },
  {
    slug: 'statewide-poll-74-percent-oppose',
    url: 'https://cdn.sanity.io/files/n2oyijjv/production/30ea8099a40b8aa0c4938faf88e257de349ce036.pdf',
    label: 'February 2026 statewide poll toplines and crosstabs (PDF)',
  },
]

async function main() {
  for (const {slug, url, label} of LINKS) {
    const post = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{_id, body}`, {slug})
    if (!post) {
      console.log(`! missing post ${slug}`)
      continue
    }
    if (JSON.stringify(post.body ?? []).includes(url)) {
      console.log(`skip (already linked): ${slug}`)
      continue
    }
    const linkKey = `${slug.slice(0, 12)}-pdf-link`
    const block = {
      _key: `${slug.slice(0, 12)}-pdf-block`,
      _type: 'block',
      style: 'normal',
      markDefs: [{_key: linkKey, _type: 'link', href: url}],
      children: [
        {_key: `${linkKey}-s1`, _type: 'span', marks: [], text: 'Read the poll yourself: '},
        {_key: `${linkKey}-s2`, _type: 'span', marks: [linkKey], text: label},
        {_key: `${linkKey}-s3`, _type: 'span', marks: [], text: '.'},
      ],
    }
    await client.patch(post._id).set({body: [...(post.body ?? []), block]}).commit()
    console.log(`poll PDF linked -> ${slug}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
