import type {MetadataRoute} from 'next'

import {SITE_DESCRIPTION, SITE_NAME} from '@/lib/site'

/**
 * Web app manifest. Colors come from the official brand palette delivered
 * 2026-07-20 — Deep Purple #390d6b is the designated theme color.
 *
 * Maskable icons verified against the Android adaptive-icon safe zone: content
 * spans 66.4% of the canvas, centered, max radius 171px of the 205px allowed at
 * 512px. Full-bleed purple field, so any mask shape crops cleanly.
 */
// Required by `output: "export"` in next.config.ts — metadata routes must be
// statically emitted at build time.
export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'Brad Hochgesang',
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    theme_color: '#390d6b',
    background_color: '#390d6b',
    icons: [
      {src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
      {src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
      {src: '/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable'},
      {src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
    ],
  }
}
