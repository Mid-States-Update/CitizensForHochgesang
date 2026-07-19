import {CmsLink} from '@/components/cms-link'
import {DEFAULT_NAV_ITEMS, normalizeNavItems} from '@/components/site-nav-items'
import {filterNavByVisibility} from '@/components/site-nav-visibility'
import type {SiteSettings} from '@/lib/cms/types'
import {FaFacebook, FaGlobe, FaInstagram, FaYoutube} from 'react-icons/fa'
import {FaTiktok} from 'react-icons/fa6'

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
      {/* Two columns: identity gets the wider track so the contact email
          fits on one line; socials live in their own full-width row below. */}
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 text-sm text-[color:var(--color-muted)] sm:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0 space-y-2">
          <p className="font-semibold text-[color:var(--color-ink)]">{settings.siteTitle}</p>
          <p>{settings.tagline}</p>
          {settings.contactEmail ? (
            <p className="break-words">
              Contact:{' '}
              <a className="hover:underline" href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>
            </p>
          ) : null}
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

      </div>

      {settings.socialLinks.length > 0 ? (
        <div className="mx-auto w-full max-w-6xl px-6 pb-8">
          <div className="footer-social-row flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
            {/* Gradient definition the Instagram glyph fills itself with */}
            <svg aria-hidden width="0" height="0" className="absolute">
              <defs>
                <radialGradient id="ig-brand-gradient" cx="30%" cy="107%" r="150%">
                  <stop offset="0%" stopColor="#fdf497" />
                  <stop offset="5%" stopColor="#fdf497" />
                  <stop offset="45%" stopColor="#fd5949" />
                  <stop offset="60%" stopColor="#d6249f" />
                  <stop offset="90%" stopColor="#285aeb" />
                </radialGradient>
              </defs>
            </svg>
            <p className="font-semibold text-[color:var(--color-ink)]">Follow us on social media</p>
            <ul className="flex flex-wrap items-center gap-3">
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
      ) : null}

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
    return <FaFacebook aria-hidden className="social-icon-facebook" />
  }

  if (lower.includes('youtube')) {
    return <FaYoutube aria-hidden className="social-icon-youtube" />
  }

  if (lower.includes('instagram')) {
    return <FaInstagram aria-hidden className="social-icon-instagram" />
  }

  if (lower.includes('tiktok')) {
    return <FaTiktok aria-hidden className="social-icon-tiktok" />
  }

  return <FaGlobe aria-hidden />
}
