import type {IconName} from '@/lib/cms/types'

export type NavItem = {
  href: string
  label: string
  icon?: IconName
}

/* Normalizes CMS-driven nav items so structural pages are always reachable:
 * /press folds into /media, and About & Priorities plus Our District are
 * guaranteed a slot even when the CMS list predates them. */
export function normalizeNavItems(items: NavItem[]): NavItem[] {
  const normalized: NavItem[] = []

  for (const item of items) {
    if (item.href === '/press' || item.href === '/media') {
      if (normalized.some((entry) => entry.href === '/media')) {
        continue
      }

      normalized.push({
        href: '/media',
        label: 'Media & Press',
        icon: item.icon === 'reg-newspaper' ? 'video' : item.icon,
      })
      continue
    }

    normalized.push(item)
  }

  if (!normalized.some((entry) => entry.href === '/platform')) {
    const eventsIndex = normalized.findIndex((entry) => entry.href === '/events')
    const platformItem: NavItem = {href: '/platform', label: 'About & Priorities', icon: 'user-friends'}

    if (eventsIndex >= 0) {
      normalized.splice(eventsIndex + 1, 0, platformItem)
    } else {
      normalized.unshift(platformItem)
    }
  }

  if (!normalized.some((entry) => entry.href === '/district')) {
    const newsIndex = normalized.findIndex((entry) => entry.href === '/news')
    const districtItem: NavItem = {href: '/district', label: 'Our District', icon: 'map-marked-alt'}

    if (newsIndex >= 0) {
      normalized.splice(newsIndex + 1, 0, districtItem)
    } else {
      normalized.unshift(districtItem)
    }
  }

  return normalized
}
