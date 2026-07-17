import type {MediaLink} from './types'

/**
 * Reads an approximate magnitude out of a highlight note like "84K+ views"
 * or "98 reactions · 14 shares". Only used to rank highlighted links, so a
 * loose parse is fine; notes without a number rank at zero.
 */
function parseApproxViews(note?: string): number {
  if (!note) {
    return 0
  }
  const match = note.match(/([\d.]+)\s*([KkMm])?/)
  if (!match) {
    return 0
  }
  const value = Number.parseFloat(match[1])
  if (Number.isNaN(value)) {
    return 0
  }
  const unit = match[2]?.toLowerCase()
  return value * (unit === 'm' ? 1_000_000 : unit === 'k' ? 1_000 : 1)
}

/**
 * Picks the strongest link to feature on the homepage: the highlighted link
 * with the biggest audience, then any link with a thumbnail, then whatever
 * comes first.
 */
export function pickFeaturedMedia(links: MediaLink[]): MediaLink | undefined {
  const withThumbnail = links.filter((item) => item.thumbnailUrl)
  const highlighted = [...withThumbnail.filter((item) => item.highlight)].sort(
    (a, b) => parseApproxViews(b.highlightNote) - parseApproxViews(a.highlightNote),
  )
  return highlighted[0] ?? withThumbnail[0] ?? links[0]
}
