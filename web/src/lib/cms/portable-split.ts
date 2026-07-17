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

export function extractBlocksOfType<T>(
  body: T[] | undefined,
  type: string,
): {extracted: T[]; rest: T[]} {
  const blocks = Array.isArray(body) ? body : []
  const extracted = blocks.filter((block) => (block as PortableBlock)._type === type)
  const rest = blocks.filter((block) => (block as PortableBlock)._type !== type)
  return {extracted, rest}
}

export function splitLeadImage<T>(body: T[] | undefined): {
  leadImage: LeadImage | undefined
  rest: T[]
} {
  const blocks = Array.isArray(body) ? body.filter((block) => !isEmptyTextBlock(block as PortableBlock)) : []
  const [first, ...others] = blocks
  const lead = first as PortableBlock | undefined

  if (lead && lead._type === 'image' && typeof lead.asset?.url === 'string') {
    return {
      leadImage: {url: lead.asset.url, alt: typeof lead.alt === 'string' ? lead.alt : ''},
      rest: others,
    }
  }

  return {leadImage: undefined, rest: blocks}
}
