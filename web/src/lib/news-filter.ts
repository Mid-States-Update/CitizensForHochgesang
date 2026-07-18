// Pure helpers behind the news page's filter bar: the topics/places split,
// the article search box, and URL-parameter preselection.

import {canonicalGeoTag} from '@/lib/geo-tags'

/**
 * True when a tag names a district place, including the lowercase and
 * hyphenated variants older posts still carry ('dubois-county').
 */
export function isPlaceTag(tag: string): boolean {
  return canonicalGeoTag(tag.replace(/[-_]+/g, ' ')) !== null
}

type SearchablePost = {
  title: string
  excerpt?: string
  bodyPreview?: string
  tags: string[]
}

/** Case-insensitive substring search across title, excerpt, preview, and tags. */
export function postMatchesQuery(post: SearchablePost, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return true
  }
  return [post.title, post.excerpt ?? '', post.bodyPreview ?? '', ...post.tags]
    .join(' ')
    .toLowerCase()
    .includes(needle)
}

/**
 * Resolves ?place= (from the district map) and ?tag= (from article tag chips)
 * to a filter value. Canonical places always work; anything else counts only
 * when a post actually carries that tag. Junk selects nothing.
 */
export function initialSelectedTag(
  placeParam: string | null,
  tagParam: string | null,
  allTags: string[]
): string | null {
  const findTag = (value: string) => allTags.find((tag) => tag.toLowerCase() === value.toLowerCase()) ?? null

  const place = placeParam?.trim() ?? ''
  if (place) {
    const resolved = canonicalGeoTag(place) ?? findTag(place)
    if (resolved) {
      return resolved
    }
  }

  const tag = tagParam?.trim() ?? ''
  if (tag) {
    const resolved = findTag(tag) ?? canonicalGeoTag(tag)
    if (resolved) {
      return resolved
    }
  }

  return null
}
