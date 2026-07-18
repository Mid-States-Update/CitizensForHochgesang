import type {Metadata} from 'next'

import {DistrictMapV2} from '../../components/district-map-v2'
import {getAllPosts, getCityPages, getCountyPages} from '../../lib/cms/repository'
import {geoTagsIn} from '../../lib/geo-tags'

export const metadata: Metadata = {
  title: 'Map preview (internal)',
  robots: {index: false, follow: false},
}

/* Internal test route for the district map v2 module. Not linked from
 * anywhere and marked noindex; the live homepage keeps the current map
 * until this one is approved. */
export default async function MapPreviewPage() {
  const [counties, cities, posts] = await Promise.all([
    getCountyPages(),
    getCityPages(),
    getAllPosts(),
  ])
  const geo = geoTagsIn(posts.flatMap((post) => post.tags))
  const newsPlaces = [...geo.counties, ...geo.cities]
  return (
    <main className="map2-preview-page">
      <h1>District map v2 preview</h1>
      <p>
        Internal testing page. Counties light up as their pages publish; towns
        appear under a county once city pages publish.
      </p>
      <DistrictMapV2 counties={counties} cities={cities} newsPlaces={newsPlaces} />
    </main>
  )
}
