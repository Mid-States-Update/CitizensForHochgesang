import {CmsLink} from '@/components/cms-link'
import {PageEffects} from '@/components/page-effects'
import {VoterActionHub} from '@/components/voter-action-hub'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
import {getFundraisingLinks, getPageVisualSettings, getSiteSettings, assertPageEnabled} from '@/lib/cms/repository'
import Image from 'next/image'
import {FaEnvelope, FaHandsHelping, FaVoteYea} from 'react-icons/fa'

export const metadata = {
  title: 'Support',
  description: 'Volunteer and donation options for supporting the campaign.',
}

export default async function SupportPage() {
  await assertPageEnabled('support')
  const [settings, links, pageVisualSettings] = await Promise.all([
    getSiteSettings(),
    getFundraisingLinks(),
    getPageVisualSettings('support'),
  ])

  return (
    <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
      <PageEffects visuals={pageVisualSettings} />
      <section className="flex flex-col gap-4">
        <p className="eyebrow">Support</p>
        <h1 className="section-title">Volunteer and contribute</h1>
        <p className="max-w-3xl text-sm text-[color:var(--color-muted)]">
          Help us expand outreach, support local organizing, and stay connected to voters.
        </p>
      </section>

      <section className="grid gap-6">
        <h2 className="section-title">Donation links</h2>
        {links.map((link) => (
          <article key={link.id} className="card flex flex-col gap-3">
            {link.imageUrl ? (
              <div className="card-media">
                <Image
                  src={link.imageUrl}
                  alt={`${link.title} image`}
                  width={1200}
                  height={630}
                  className="h-52 w-full object-cover"
                  unoptimized
                />
              </div>
            ) : null}
            <h3 className="text-lg font-semibold text-[color:var(--color-ink)]">{link.title}</h3>
            {link.description ? <p className="text-sm text-[color:var(--color-muted)]">{link.description}</p> : null}
            <div>
              <CmsLink className="btn btn-accent" href={link.url}>
                <FaVoteYea aria-hidden />
                Donate now
              </CmsLink>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">Volunteer</h2>
          <p className="text-sm text-[color:var(--color-muted)]">
            Join canvassing, outreach, and event support efforts across District 48.
          </p>
          {settings.volunteerUrl ? (
            <div>
              <CmsLink
                className="btn btn-primary"
                href={settings.volunteerUrl}
              >
                <FaHandsHelping aria-hidden />
                Sign up to volunteer
              </CmsLink>
            </div>
          ) : null}
        </article>

        <article id="contact-us" className="card flex flex-col gap-4 scroll-mt-28">
          <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">Direct campaign contact</h2>
          <p className="text-sm text-[color:var(--color-muted)]">
            Reach the campaign directly for scheduling, press, or community requests.
          </p>
          {settings.contactEmail ? (
            <a className="text-sm font-semibold text-[color:var(--color-accent)] hover:underline" href={`mailto:${settings.contactEmail}`}>
              <FaEnvelope aria-hidden className="mr-2 inline-block" />
              {settings.contactEmail}
            </a>
          ) : null}
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card flex flex-col gap-4">
          <p className="eyebrow">Voter Registration</p>
          <h2 className="section-title">Registration and ballot assistance</h2>
          <p className="text-sm text-[color:var(--color-muted)]">
            Confirm your registration, verify your district, and prepare for Election Day with official Indiana resources.
          </p>
          <div className="flex flex-wrap gap-3">
            <CmsLink className="btn btn-outline" href="https://indianavoters.in.gov/">
              <FaVoteYea aria-hidden />
              Check registration
            </CmsLink>
            <CmsLink className="btn btn-primary" href="https://www.in.gov/sos/elections/voter-information/">
              <FaVoteYea aria-hidden />
              Voter info guide
            </CmsLink>
          </div>
        </article>

        <article className="card flex flex-col gap-4">
          <p className="eyebrow">Ways To Help</p>
          <h2 className="section-title">How voters can get involved</h2>
          <ul className="grid gap-2 text-sm text-[color:var(--color-muted)]">
            <li className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">Host a house party or neighborhood meet-and-greet</li>
            <li className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">Knock doors or make calls during voter contact drives</li>
            <li className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">Share campaign posts and articles with friends and family</li>
            <li className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">Attend town halls and county council meetings — numbers matter</li>
            <li className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">Help at campaign events — setup, registration, logistics</li>
            <li className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">Donate to fund field operations across all six counties</li>
          </ul>
        </article>
      </section>

      <VoterActionHub />
    </main>
  )
}
