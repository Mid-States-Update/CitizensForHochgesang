/**
 * Helpers for pulling a lead image out of a Portable Text body so pages can
 * lay the photo out independently of the prose (e.g. the About Brad feature
 * on /platform).
 */

type PortableBlock = {
  _type?: string
  _key?: string
  alt?: string
  asset?: {url?: string}
  children?: Array<{text?: string}>
} & Record<string, unknown>

export type LeadImage = {url: string; alt: string}

function isEmptyTextBlock(block: PortableBlock): boolean {
  if (block._type !== 'block') {
    return false
  }
  const children = Array.isArray(block.children) ? block.children : []
  return children.every((child) => !child.text || child.text.trim() === '')
}

export function splitLeadImage(body: PortableBlock[] | undefined): {
  leadImage: LeadImage | undefined
  rest: PortableBlock[]
} {
  const blocks = Array.isArray(body) ? body.filter((block) => !isEmptyTextBlock(block)) : []
  const [first, ...others] = blocks

  if (first && first._type === 'image' && typeof first.asset?.url === 'string') {
    return {
      leadImage: {url: first.asset.url, alt: typeof first.alt === 'string' ? first.alt : ''},
      rest: others,
    }
  }

  return {leadImage: undefined, rest: blocks}
}
