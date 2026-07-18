'use client'

import Image from 'next/image'
import {useMemo, useState} from 'react'

import {CmsLink} from '@/components/cms-link'
import {formatDate} from '@/lib/cms/format'
import type {MediaLink} from '@/lib/cms/types'
import {geoTagsIn} from '@/lib/geo-tags'

const MEDIA_TYPE_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  audio: 'Audio',
  other: 'Press / News',
}

function getTypeLabel(mediaType: string): string {
  return MEDIA_TYPE_LABELS[mediaType] ?? 'Media'
}

export function MediaLinkGrid({mediaLinks}: {mediaLinks: MediaLink[]}) {
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null)

  const geoFilters = useMemo(
    () => geoTagsIn(mediaLinks.flatMap((item) => item.geoTags ?? [])),
    [mediaLinks]
  )
  const places = [...geoFilters.counties, ...geoFilters.cities]

  const visible = selectedPlace
    ? mediaLinks.filter((item) =>
        (item.geoTags ?? []).some((tag) => tag.toLowerCase() === selectedPlace.toLowerCase())
      )
    : mediaLinks

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <h2 className="section-title md:col-span-2">Interviews, videos, and social updates</h2>
      {places.length > 0 ? (
        <div
          className="flex flex-wrap items-center gap-2 md:col-span-2"
          role="group"
          aria-label="Filter media by county or town"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            Filter by place
          </span>
          <button
            type="button"
            onClick={() => setSelectedPlace(null)}
            className={`pill-badge ${selectedPlace === null ? 'pill-badge-active' : ''}`}
          >
            <span>All</span>
          </button>
          {places.map((place) => (
            <button
              key={place}
              type="button"
              onClick={() => setSelectedPlace(selectedPlace === place ? null : place)}
              className={`pill-badge ${selectedPlace === place ? 'pill-badge-active' : ''}`}
            >
              <span>{place}</span>
            </button>
          ))}
        </div>
      ) : null}
      {visible.map((item) => (
        <article key={item.id} className="card article-card flex flex-col gap-4">
          {item.thumbnailUrl ? (
            <div className="card-media">
              <Image
                src={item.thumbnailUrl}
                alt={`${item.title} thumbnail`}
                width={1200}
                height={630}
                className="h-52 w-full object-cover"
                unoptimized
              />
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <p className="article-meta text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
              {getTypeLabel(item.mediaType)}
            </p>
            {item.highlight ? (
              <span className="pill-badge pill-badge-active text-xs">
                ★ {item.highlightNote?.trim() || 'Featured'}
              </span>
            ) : null}
          </div>
          <h2 className="article-title text-xl font-semibold text-[color:var(--color-ink)]">{item.title}</h2>
          {item.publishedAt ? (
            <p className="text-sm text-[color:var(--color-muted)]">Published {formatDate(item.publishedAt)}</p>
          ) : null}
          {item.description ? (
            <p className="text-sm text-[color:var(--color-muted)]">{item.description}</p>
          ) : null}
          <div>
            <CmsLink className="article-cta link-pill link-pill-media" href={item.url}>
              Open media
            </CmsLink>
          </div>
        </article>
      ))}
    </section>
  )
}
