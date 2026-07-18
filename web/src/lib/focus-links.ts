// Maps homepage focus-item strings to their /platform/[slug] detail pages.
// Focus items are free text in Sanity, so match on significant-word overlap
// with priority titles instead of requiring exact equality.

type PriorityRef = {
  slug: string
  title: string
}

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'can',
  'done',
  'every',
  'for',
  'here',
  'in',
  'of',
  'on',
  'our',
  'the',
  'to',
  'with',
  'your',
])

function significantTokens(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
    // naive singularization so "taxes" meets "tax" and "centers" meets "center"
    .map((token) => (token.length > 3 && token.endsWith('s') ? token.slice(0, -1) : token))
  return new Set(tokens)
}

export function priorityHrefForFocusItem(focusItem: string, priorities: PriorityRef[]): string {
  const itemTokens = significantTokens(focusItem)
  let best: {slug: string; score: number} | null = null

  for (const priority of priorities) {
    let score = 0
    for (const token of significantTokens(priority.title)) {
      if (itemTokens.has(token)) {
        score += 1
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = {slug: priority.slug, score}
    }
  }

  return best ? `/platform/${best.slug}` : '/platform'
}
