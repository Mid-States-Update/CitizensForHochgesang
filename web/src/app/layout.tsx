import type { Metadata } from "next";
import { JetBrains_Mono, Newsreader, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteNav } from "@/components/site-nav";
import { ScrollDynamics } from "@/components/scroll-dynamics";
import { getSiteSettings } from "@/lib/cms/repository";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const displayFont = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteTitle,
    url: SITE_URL,
    logo: settings.campaignLogoUrl,
    sameAs: settings.socialLinks.map((item) => item.url),
  };

  return (
    <html lang="en" suppressHydrationWarning style={{ visibility: "hidden" }}>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function () {
  var root = document.documentElement;
  try {
    const key = 'cfh-theme';
    const saved = localStorage.getItem(key);
    const cookieTheme = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cfh-theme='))
      ?.split('=')[1];
    const nextTheme =
      saved === 'light' || saved === 'dark'
        ? saved
        : cookieTheme === 'light' || cookieTheme === 'dark'
          ? cookieTheme
          : 'dark';
    root.setAttribute('data-theme', nextTheme);
    root.style.colorScheme = nextTheme;
    localStorage.setItem(key, nextTheme);
  } catch {
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  }
  root.style.visibility = 'visible';
})();`,
          }}
        />
        <noscript>
          <style>{`html { visibility: visible !important; }`}</style>
        </noscript>
      </head>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} antialiased`}
      >
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Script
          id="organization-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
        <ScrollDynamics />
        <div className="flex min-h-screen flex-col">
          <SiteHeader settings={settings}>
            <SiteNav items={settings.headerNavItems} pageVisibility={settings.pageVisibility} />
          </SiteHeader>
          <Breadcrumbs />
          <div id="main-content" className="flex-1">
            {children}
          </div>
          <SiteFooter settings={settings} />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
