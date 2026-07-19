'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {useEffect, useMemo, useRef, useState} from 'react'

import {ChipTrack} from '@/components/chip-track'
import {formatDate} from '@/lib/cms/format'
import {getSanityImageUrl} from '@/lib/cms/image-url'
import type {PostSummary} from '@/lib/cms/types'
import {geoTagsIn} from '@/lib/geo-tags'
import {initialSelectedTag, isPlaceTag, postMatchesQuery} from '@/lib/news-filter'

const RATIO_DIMENSIONS: Record<string, {width: number; height: number; className: string}> = {
  '16:9': {width: 1600, height: 900, className: 'aspect-[16/9]'},
  '4:3': {width: 1200, height: 900, className: 'aspect-[4/3]'},
  '3:2': {width: 1500, height: 1000, className: 'aspect-[3/2]'},
  '1:1': {width: 1200, height: 1200, className: 'aspect-square'},
  '4:5': {width: 1200, height: 1500, className: 'aspect-[4/5]'},
  '3:4': {width: 1200, height: 1600, className: 'aspect-[3/4]'},
  '2:3': {width: 1000, height: 1500, className: 'aspect-[2/3]'},
  '9:16': {width: 900, height: 1600, className: 'aspect-[9/16]'},
}

const LAYOUT_CLASSNAMES: Record<string, string> = {
  stacked: 'news-card-layout-stacked',
  'image-left': 'news-card-layout-image-left',
  'image-right': 'news-card-layout-image-right',
  'feature-split': 'news-card-layout-feature-split',
  'no-photo': 'news-card-layout-no-photo',
}

const ANIMATION_CLASSNAMES: Record<string, string> = {
  'fade-up': 'news-card-anim-fade-up',
  'slide-up': 'news-card-anim-slide-up',
  'slide-left': 'news-card-anim-slide-left',
  'slide-right': 'news-card-anim-slide-right',
  none: 'news-card-anim-none',
}

type SortMode = 'newest' | 'oldest' | 'title'

type NewsFeedProps = {
  posts: PostSummary[]
}

function getBodyPreview(post: PostSummary): string | null {
  const text = (post.bodyPreview || post.excerpt || '').trim()
  if (!text) {
    return null
  }

  const defaultLimit = 2000
  const configuredLimit = post.newsBodyPreviewChars && post.newsBodyPreviewChars > 0 ? post.newsBodyPreviewChars : defaultLimit
  const effectiveLimit =
    post.newsCardLayout === 'no-photo'
      ? Math.min(Math.max(configuredLimit, 1400), 3000)
      : Math.min(Math.max(configuredLimit, 280), 1400)

  return text.slice(0, effectiveLimit)
}

export function NewsFeed({posts}: NewsFeedProps) {
  const searchParams = useSearchParams()
  // ?place= (from the district map) and ?tag= (from article tag chips)
  // preselect a filter. Sort stays on the default, newest first.
  const [selectedTag, setSelectedTag] = useState<string | null>(() =>
    initialSelectedTag(
      searchParams.get('place'),
      searchParams.get('tag'),
      posts.flatMap((post) => post.tags)
    )
  )
  const [tagQuery, setTagQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [visibleCount, setVisibleCount] = useState(6)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const applyTagFilter = (tag: string | null) => {
    setSelectedTag(tag)
    setVisibleCount(6)
  }

  const applySortMode = (mode: SortMode) => {
    setSortMode(mode)
    setVisibleCount(6)
  }

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of posts) {
      for (const tag of post.tags) {
        const normalized = tag.trim()
        if (!normalized) {
          continue
        }

        counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1]
        }

        return a[0].localeCompare(b[0])
      })
      .map(([tag, count]) => ({tag, count}))
  }, [posts])

  // The tags row shows topics only; places live in the Filter-by-place row.
  const filteredTagCounts = useMemo(() => {
    const topicCounts = tagCounts.filter(({tag}) => !isPlaceTag(tag))
    const query = tagQuery.trim().toLowerCase()
    if (!query) {
      return topicCounts
    }

    return topicCounts.filter(({tag}) => tag.toLowerCase().includes(query))
  }, [tagCounts, tagQuery])

  const geoFilters = useMemo(
    () => geoTagsIn(posts.flatMap((post) => post.tags)),
    [posts]
  )
  const hasGeoFilters = geoFilters.counties.length > 0 || geoFilters.cities.length > 0

  const preparedPosts = useMemo(
    () =>
      posts.map((post) => {
        const ratio = RATIO_DIMENSIONS[post.newsImageAspectRatio ?? '3:2'] ?? RATIO_DIMENSIONS['3:2']
        const layout = post.newsCardLayout ?? 'stacked'
        const animation = post.newsCardAnimation ?? 'fade-up'
        const coverImageUrl = getSanityImageUrl(post.coverImage, {width: ratio.width, height: ratio.height}) ?? post.coverImageUrl

        return {
          ...post,
          ratio,
          layout,
          animation,
          coverImageUrl,
          isWidescreen: (post.newsImageAspectRatio ?? '3:2') === '16:9',
          isTallPortrait: (post.newsImageAspectRatio ?? '3:2') === '9:16',
          previewText: getBodyPreview(post),
        }
      }),
    [posts]
  )

  const filteredAndSortedPosts = useMemo(() => {
    const byTag = selectedTag
      ? preparedPosts.filter((post) => post.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()))
      : preparedPosts
    const filtered = byTag.filter((post) => postMatchesQuery(post, tagQuery))

    const sorted = [...filtered]
    if (sortMode === 'newest') {
      sorted.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    } else if (sortMode === 'oldest') {
      sorted.sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    }

    return sorted
  }, [preparedPosts, selectedTag, sortMode, tagQuery])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }

    if (visibleCount >= filteredAndSortedPosts.length) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + 4, filteredAndSortedPosts.length))
        }
      },
      {rootMargin: '240px 0px'}
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [filteredAndSortedPosts.length, visibleCount])

  const visiblePosts = filteredAndSortedPosts.slice(0, visibleCount)

  return (
    <section className="grid gap-6">
      {/* Controls row on top, chips on their own full-width line: the chip
          track can never again be squeezed out by the search + sort widgets. */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/70 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">Filter tags</span>
          <label className="tag-search-shell min-w-32 flex-1" aria-label="Search articles and tags">
            <input
              type="search"
              value={tagQuery}
              onChange={(event) => setTagQuery(event.target.value)}
              placeholder="Search articles"
              className="tag-search-input w-full"
            />
          </label>
          {selectedTag ? (
            <button
              type="button"
              onClick={() => applyTagFilter(null)}
              className="pill-badge pill-badge-active shrink-0"
              aria-label={`Clear the ${selectedTag} filter`}
            >
              <span>{selectedTag}</span>
              <span aria-hidden>✕</span>
            </button>
          ) : null}
          <label className="ml-auto flex shrink-0 items-center gap-2 text-sm text-[color:var(--color-muted)]">
            <span>Sort</span>
            <select
              className="w-28 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-sm text-[color:var(--color-ink)] sm:w-36"
              value={sortMode}
              onChange={(event) => applySortMode(event.target.value as SortMode)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A-Z</option>
            </select>
          </label>
        </div>

        <ChipTrack ariaLabel="News tags sorted by number of posts">
          <button
            type="button"
            onClick={() => applyTagFilter(null)}
            className={`pill-badge ${selectedTag === null ? 'pill-badge-active' : ''}`}
          >
            <span>All</span>
            {posts.length >= 2 ? <span className="pill-badge-count">{posts.length}</span> : null}
          </button>
          {filteredTagCounts.map(({tag, count}) => (
            <button
              key={tag}
              type="button"
              onClick={() => applyTagFilter(selectedTag === tag ? null : tag)}
              className={`pill-badge ${selectedTag === tag ? 'pill-badge-active' : ''}`}
            >
              <span>{tag}</span>
              {count >= 2 ? <span className="pill-badge-count">{count}</span> : null}
            </button>
          ))}
        </ChipTrack>
      </div>

      {hasGeoFilters ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/70 p-4">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
            Filter by place
          </span>
          <ChipTrack ariaLabel="Filter news by county or town">
            {[...geoFilters.counties, ...geoFilters.cities].map((place) => (
              <button
                key={place}
                type="button"
                onClick={() => applyTagFilter(selectedTag === place ? null : place)}
                className={`pill-badge ${selectedTag === place ? 'pill-badge-active' : ''}`}
              >
                <span>{place}</span>
              </button>
            ))}
          </ChipTrack>
        </div>
      ) : null}

      {visiblePosts.map((post) => {
        const layoutClass = LAYOUT_CLASSNAMES[post.layout] ?? LAYOUT_CLASSNAMES.stacked
        const animationClass = ANIMATION_CLASSNAMES[post.animation] ?? ANIMATION_CLASSNAMES['fade-up']
        const showMedia = post.layout !== 'no-photo' && !!post.coverImageUrl

        return (
          <article key={post.slug} className={`card article-card news-card ${layoutClass} ${animationClass}`}>
            <div className="news-card-content-wrap">
              {showMedia ? (
                <Link
                  href={`/news/${post.slug}`}
                  className={`card-media news-card-media ${post.ratio.className} ${post.isWidescreen ? 'news-card-media-widescreen' : ''} ${post.isTallPortrait ? 'news-card-media-tall-portrait' : ''}`}
                  aria-label={`Read ${post.title}`}
                >
                  <Image
                    src={post.coverImageUrl!}
                    alt={`${post.title} cover image`}
                    width={post.ratio.width}
                    height={post.ratio.height}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </Link>
              ) : null}

              <div className="news-card-copy">
                <p className="article-meta text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                  {formatDate(post.publishedAt)}
                </p>
                <h2 className="article-title text-2xl font-semibold text-[color:var(--color-ink)]">
                  <Link href={`/news/${post.slug}`} className="article-title-link" aria-label={`Read ${post.title}`}>
                    {post.title}
                  </Link>
                </h2>

                {post.previewText ? (
                  <Link href={`/news/${post.slug}`} className="news-excerpt-link" aria-label={`Read ${post.title}`}>
                    <p className="news-excerpt text-sm text-[color:var(--color-muted)]">{post.previewText}</p>
                  </Link>
                ) : null}

                <p className="article-inline-cta text-sm font-semibold">
                  <Link href={`/news/${post.slug}`} className="article-inline-link" aria-label={`Read ${post.title}`}>
                    Read article →
                  </Link>
                </p>

                {post.tags.length > 0 ? (
                  <ChipTrack ariaLabel={`Tags for ${post.title}`}>
                    {post.tags.map((tag) => (
                      <button
                        key={`${post.slug}-${tag}`}
                        type="button"
                        onClick={() => applyTagFilter(selectedTag === tag ? null : tag)}
                        className={`pill-badge ${selectedTag === tag ? 'pill-badge-active' : ''}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </ChipTrack>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}

      {visibleCount < filteredAndSortedPosts.length ? (
        <div ref={sentinelRef} className="h-10 w-full" aria-hidden="true" />
      ) : null}
    </section>
  )
}
