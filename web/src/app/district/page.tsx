import type {Metadata} from 'next'
import Link from 'next/link'

import {DistrictMapV2} from '@/components/district-map-v2'
import {PageEffects} from '@/components/page-effects'
import {newsHrefForPlace} from '@/lib/map/model'
import {geoTagsIn} from '@/lib/geo-tags'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
import {getAllPosts, getCityPages, getCountyPages, getPageVisualSettings} from '@/lib/cms/repository'

export const metadata: Metadata = {
  title: 'Our District',
  description:
    'Indiana Senate District 48: Crawford, Dubois, Gibson, Perry, Pike, and Spencer counties. Explore the map, find your county and town, and see what neighbors are saying.',
}

/* District index: the interactive map plus a directory of every county page,
 * its town pages, and filtered news. Linked from the nav and the homepage. */
export default async function DistrictIndexPage() {
  const [counties, cities, posts, pageVisualSettings] = await Promise.all([
    getCountyPages(),
    getCityPages(),
    getAllPosts(),
    getPageVisualSettings('platform'),
  ])
  const geo = geoTagsIn(posts.flatMap((post) => post.tags))
  const newsPlaces = [...geo.counties, ...geo.cities]

  return (
    <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
      <PageEffects visuals={pageVisualSettings} />
      <section className="card flex flex-col gap-4">
        <div className="map-section-heading">
          <p className="eyebrow">Our district</p>
          <h1 className="section-title">Six counties, one district</h1>
        </div>
        {/* On phones the map leads and this description follows it (CSS order) */}
        <p className="district-intro max-w-3xl text-base text-[color:var(--color-muted)]">
          Indiana Senate District 48 covers Crawford, Dubois, Gibson, Perry, Pike, and Spencer
          counties. Every county has its own page here, written from public records and from what
          neighbors say in person. Click a county to zoom in; towns with news are clickable too.
        </p>
        <DistrictMapV2 counties={counties} cities={cities} newsPlaces={newsPlaces} />
      </section>

      <section className="grid gap-4 py-6">
        <h2 className="section-title">Find your county</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {counties.map((county) => {
            const countyCities = cities.filter((city) => city.countySlug === county.slug)
            return (
              <div key={county.slug} className="card flex flex-col gap-3">
                <h3 className="text-xl font-semibold text-[color:var(--color-ink)]">
                  <Link href={`/district/${county.slug}`}>{county.title}</Link>
                </h3>
                <p className="text-sm text-[color:var(--color-muted)]">{county.townsLine}</p>
                <p className="text-sm text-[color:var(--color-muted)]">{county.intro}</p>
                <div className="flex flex-wrap gap-2">
                  <Link className="btn btn-outline" href={`/district/${county.slug}`}>
                    County page
                  </Link>
                  <Link className="btn btn-outline" href={newsHrefForPlace(county.title)}>
                    County news
                  </Link>
                  {countyCities.map((city) => (
                    <Link
                      key={city.slug}
                      className="btn btn-outline"
                      href={`/district/${county.slug}/${city.slug}`}
                    >
                      {city.title}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
