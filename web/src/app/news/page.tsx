import {Suspense} from 'react'

import {NewsFeed} from '@/components/news-feed'
import {PageEffects} from '@/components/page-effects'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
import {assertPageEnabled, getAllPosts, getPageVisualSettings} from '@/lib/cms/repository'

export const metadata = {
  title: 'News',
  description: 'Campaign updates, articles, and announcements from District 48.',
}

export default async function NewsPage() {
  await assertPageEnabled('news')
  const [posts, pageVisualSettings] = await Promise.all([getAllPosts(), getPageVisualSettings('news')])

  return (
    <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
      <PageEffects visuals={pageVisualSettings} />
      <section className="flex flex-col gap-4">
        <p className="eyebrow">News</p>
        <h1 className="section-title">Campaign updates and articles</h1>
        <p className="max-w-3xl text-sm text-[color:var(--color-muted)]">
          Read updates on policy priorities, local events, and campaign progress.
        </p>
      </section>

      <Suspense fallback={null}>
        <NewsFeed posts={posts} />
      </Suspense>
    </main>
  )
}
