import {CmsLink} from '@/components/cms-link'
import {DEFAULT_NAV_ITEMS, normalizeNavItems} from '@/components/site-nav-items'
import {filterNavByVisibility} from '@/components/site-nav-visibility'
import type {SiteSettings} from '@/lib/cms/types'
import {FaDonate, FaFacebook, FaGlobe, FaHandsHelping, FaYoutube} from 'react-icons/fa'

type SiteFooterProps = {
  settings: SiteSettings
}

export function SiteFooter({settings}: SiteFooterProps) {
  const contactHref = settings.contactEmail ? `mailto:${settings.contactEmail}` : '/support'
  // Same source + normalize pipeline as the header menu, so Explore always
  // matches what the window's menu shows.
  const sourceItems =
    settings.headerNavItems && settings.headerNavItems.length > 0
      ? settings.headerNavItems
      : DEFAULT_NAV_ITEMS
  const exploreItems = filterNavByVisibility(normalizeNavItems(sourceItems), settings.pageVisibility)

  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 text-sm text-[color:var(--color-muted)] sm:grid-cols-3">
        <div className="space-y-2">
          <p className="font-semibold text-[color:var(--color-ink)]">{settings.siteTitle}</p>
          <p>{settings.tagline}</p>
          {settings.contactEmail ? <p>Contact: {settings.contactEmail}</p> : null}
          <div className="flex flex-wrap gap-3 pt-2">
            {settings.donateUrl ? (
              <CmsLink className="btn btn-accent btn-sm" href={settings.donateUrl}>
                <FaDonate aria-hidden />
                Donate
              </CmsLink>
            ) : null}
            {settings.volunteerUrl ? (
              <CmsLink className="btn btn-primary btn-sm" href={settings.volunteerUrl}>
                <FaHandsHelping aria-hidden />
                Volunteer
              </CmsLink>
            ) : null}
          </div>
        </div>

        {exploreItems.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-[color:var(--color-ink)]">Explore</p>
            <ul className="space-y-1">
              {exploreItems.map((item) => (
                <li key={item.href}>
                  <CmsLink className="link-soft" href={item.href}>
                    {item.label}
                  </CmsLink>
                </li>
              ))}
              <li>
                <CmsLink className="link-soft" href={contactHref}>
                  Contact Us
                </CmsLink>
              </li>
            </ul>
          </div>
        )}

        <div className="space-y-2 sm:justify-self-end sm:text-right">
          <p className="font-semibold text-[color:var(--color-ink)]">Follow</p>
          <ul className="space-y-1">
            {settings.socialLinks.map((item) => (
              <li key={`${item.label}-${item.url}`}>
                <CmsLink className="link-pill link-pill-support" href={item.url}>
                  <SocialIcon label={item.label} />
                  {item.label}
                </CmsLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Legal disclaimer — required by Indiana campaign finance law */}
      <div className="border-t border-[color:var(--color-border)] py-4 text-center text-xs text-[color:var(--color-muted)]">
        Paid for by Citizens For Hochgesang
      </div>
    </footer>
  )
}

function SocialIcon({label}: {label: string}) {
  const lower = label.toLowerCase()

  if (lower.includes('facebook')) {
    return <FaFacebook aria-hidden />
  }

  if (lower.includes('youtube')) {
    return <FaYoutube aria-hidden />
  }

  return <FaGlobe aria-hidden />
}
