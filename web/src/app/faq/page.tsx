import type {Metadata} from 'next'
import {FaqAccordion} from '@/components/faq-accordion'
import {PageEffects} from '@/components/page-effects'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
import {assertPageEnabled, getFaqPageSettings, getFaqs, getPageVisualSettings} from '@/lib/cms/repository'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about the Mid-States Corridor, the campaign, and how to participate.',
}

export default async function FaqPage() {
  await assertPageEnabled('faq')
  const [pageVisualSettings, faqItems, pageSettings] = await Promise.all([
    getPageVisualSettings('faq'),
    getFaqs(),
    getFaqPageSettings(),
  ])

  return (
    <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
      <PageEffects visuals={pageVisualSettings} />
      <section className="reveal flex flex-col gap-4">
        <p className="eyebrow">{pageSettings.pageEyebrow}</p>
        <h1 className="section-title">{pageSettings.pageTitle}</h1>
        {pageSettings.pageIntro ? (
          <p className="max-w-3xl text-sm text-[color:var(--color-muted)]">{pageSettings.pageIntro}</p>
        ) : null}
      </section>

      {faqItems.length > 0 ? (
        <FaqAccordion items={faqItems} />
      ) : (
        <p className="text-sm text-[color:var(--color-muted)]">
          No FAQs have been published yet. Check back soon.
        </p>
      )}
    </main>
  )
}
