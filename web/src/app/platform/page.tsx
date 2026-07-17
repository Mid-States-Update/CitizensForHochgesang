import Image from 'next/image'

import {CmsLink} from '@/components/cms-link'
import {ArticleContent} from '@/components/article-content'
import {PageEffects} from '@/components/page-effects'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
import {splitLeadImage} from '@/lib/cms/portable-split'
import {assertPageEnabled, getAboutPriorities, getPageVisualSettings} from '@/lib/cms/repository'

export const metadata = {
  title: 'About & Priorities',
  description:
    'Background, campaign priorities, and practical commitments for Indiana State Senate District 48.',
}

function ValueChip({value}: {value: string}) {
  const [lead, ...tail] = value.split(' — ')
  const detail = tail.join(' — ')

  return (
    <li className="value-chip">
      <span className="value-chip-lead">{lead}</span>
      {detail ? <span className="value-chip-detail">{detail}</span> : null}
    </li>
  )
}

export default async function PlatformPage() {
  await assertPageEnabled('platform')
  const [about, pageVisualSettings] = await Promise.all([getAboutPriorities(), getPageVisualSettings('platform')])
  const {leadImage, rest: bioBody} = splitLeadImage(about.bioBody)

  return (
    <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
      <PageEffects visuals={pageVisualSettings} />
      <section className="flex flex-col gap-4">
        <p className="eyebrow">{about.pageEyebrow}</p>
        <h1 className="section-title">{about.pageTitle}</h1>
        <p className="max-w-3xl text-sm text-[color:var(--color-muted)]">
          {about.pageIntro}
        </p>
      </section>

      <section className="card article-card about-feature">
        {leadImage ? (
          <figure className="about-feature-media">
            <Image
              src={leadImage.url}
              alt={leadImage.alt}
              width={800}
              height={800}
              className="about-feature-photo"
              unoptimized
              priority
            />
          </figure>
        ) : null}
        <div className="about-feature-body flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">{about.bioHeading}</h2>
          <ArticleContent body={bioBody} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">{about.valuesHeading}</h2>
        <ul className="values-band">
          {about.values.map((value) => (
            <ValueChip key={value} value={value} />
          ))}
        </ul>
      </section>

      <section className="grid gap-6">
        <h2 className="section-title">{about.prioritiesHeading}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {about.priorities.map((priority) => (
            <article key={priority.title} className="card article-card flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-[color:var(--color-ink)]">{priority.title}</h3>
              <p className="text-sm text-[color:var(--color-muted)]">{priority.summary}</p>
              <p className="article-inline-cta text-sm font-semibold">
                <CmsLink className="article-inline-link" href={`/platform/${priority.slug}`}>
                  Learn more →
                </CmsLink>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="card article-card flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">{about.ctaHeading}</h2>
        <p className="text-sm text-[color:var(--color-muted)]">
          {about.ctaCopy}
        </p>
        <div className="flex flex-wrap gap-3">
          <CmsLink className="btn btn-primary" href={about.primaryCtaUrl}>
            {about.primaryCtaLabel}
          </CmsLink>
          <CmsLink className="btn btn-outline" href={about.secondaryCtaUrl}>
            {about.secondaryCtaLabel}
          </CmsLink>
        </div>
      </section>
    </main>
  )
}
