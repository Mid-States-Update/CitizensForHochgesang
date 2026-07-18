import type {MetadataRoute} from 'next'

import {getCityPages, getCountyPages} from '@/lib/cms/repository'
import {SITE_URL} from '@/lib/site'

export const dynamic = 'force-static'

const staticRoutes = ['/', '/news', '/district', '/events', '/faq', '/media', '/platform', '/press', '/support']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [counties, cities] = await Promise.all([getCountyPages(), getCityPages()])

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: (route === '/' ? 'daily' : 'weekly') as 'daily' | 'weekly',
      priority: route === '/' ? 1 : 0.7,
    })),
    ...counties.map((county) => ({
      url: `${SITE_URL}/district/${county.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...cities.map((city) => ({
      url: `${SITE_URL}/district/${city.countySlug}/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
