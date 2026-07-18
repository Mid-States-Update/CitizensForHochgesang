import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import {ArticleContent} from '@/components/article-content'
import {ArticleSceneObserver} from '@/components/article-scene-observer'
import {PageEffects} from '@/components/page-effects'
import {formatDate} from '@/lib/cms/format'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
import {assertPageEnabled, getAllPosts, getPageVisualSettings, getPostBySlug, getSiteSettings} from '@/lib/cms/repository'
import {isPageEnabled} from '@/lib/cms/types'

type PostPageProps = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({slug: post.slug}))
}

export async function generateMetadata({params}: PostPageProps): Promise<Metadata> {
  const {pageVisibility} = await getSiteSettings()
  if (!isPageEnabled(pageVisibility, 'news')) {
    // Keep metadata generation aligned with static export gating when the
    // section is disabled before page rendering runs.
    return {title: 'News unavailable'}
  }
  const {slug} = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Article not found',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function PostPage({params}: PostPageProps) {
  await assertPageEnabled('news')
  const {slug} = await params
  const [post, pageVisualSettings] = await Promise.all([
    getPostBySlug(slug),
    getPageVisualSettings('news-detail'),
  ])

  if (!post) {
    notFound()
  }

  const storyExperience = Array.isArray(post.storyTimeline) ? post.storyTimeline : []

  return (
    <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
      <PageEffects visuals={pageVisualSettings} />
      <article className="card mx-auto w-full max-w-4xl">
        <div className="flex flex-col gap-5">
          <Link className="text-sm font-semibold text-[color:var(--color-accent)] hover:underline" href="/news">
            ← Back to News
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            {formatDate(post.publishedAt)}
          </p>
          <h1 className="hero-title">{post.title}</h1>
          {post.coverImageUrl ? (
            <div className="card-media">
              <Image
                src={post.coverImageUrl}
                alt={`${post.title} cover image`}
                width={1600}
                height={900}
                className="h-auto w-full object-cover"
                unoptimized
              />
            </div>
          ) : null}
          {post.excerpt ? <p className="text-base text-[color:var(--color-muted)]">{post.excerpt}</p> : null}
          {post.tags.length > 0 ? (
            <ul className="chip-track">
              {post.tags.map((tag) => (
                <li key={`${post.slug}-${tag}`}>
                  <Link
                    href={`/news?tag=${encodeURIComponent(tag)}`}
                    className="pill-badge"
                    aria-label={`See all articles tagged ${tag}`}
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <ArticleContent body={post.body} />
          {storyExperience.length > 0 ? (
            <section className="grid gap-3">
              <p className="eyebrow">Reading Experience</p>
              <ArticleContent body={storyExperience} />
            </section>
          ) : null}
        </div>
      </article>
      <ArticleSceneObserver />
    </main>
  )
}
