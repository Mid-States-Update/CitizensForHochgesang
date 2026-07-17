import type {MetadataRoute} from 'next'

import {getCountyPages} from '@/lib/cms/repository'
import {SITE_URL} from '@/lib/site'

export const dynamic = 'force-static'

const staticRoutes = ['/', '/news', '/events', '/faq', '/media', '/platform', '/press', '/support']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const counties = await getCountyPages()

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
  ]
}
