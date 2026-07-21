# CitizensForHochgesang — Agent Guide

Campaign site for **Brad Hochgesang for Indiana State Senate, District 48**.
pnpm monorepo: `web/` (Next.js App Router) + `studio/` (Sanity CMS).

## Source of truth — check these BEFORE saying you don't have something

| Where | What lives there |
| --- | --- |
| `Z:\Election\Strategy Files\` | **Campaign source documents.** Not in git, not in Sanity. |
| Sanity (`n2oyijjv` / `production`) | All published site content, images, site settings. |
| This repo | Code, schema, migration scripts. Very little prose. |

`Z:\Election\Strategy Files\` subfolders: `Speeches\`, `Polls\`,
`County Intelligence\`, `Data Centers\`, `Farm Bureau\`, `Unions\`.

Speeches on the share (as of 2026-07-20):

- `County Council - RDA Withdrawl Case.docx` — Feb 23 2026 RDA withdrawal presentation
- `County Council - RDA Withdrawl Vote Sppch.docx`
- `Democratic Convention - Full Speech.docx` — June 6 2026, incl. backstage cheat sheet
- `Hochgesang_SpencerCounty_StumpSpeech.docx` — the personal/origin-story speech

`.docx` extracts without Word: unzip `word/document.xml` and strip tags.

**Keep the share current.** When new research or finalized copy is produced, write it
back to `Z:\Election\Strategy Files\` — don't leave it only in the repo or in chat.

## Content rules

- **Absolute dates only.** "In December 2024," never "last year" or "this fall."
  Site copy must not rot.
- **Exactly two polls exist:** Dubois County (December 2025) and statewide
  (February 2026), both Public Policy Polling. There is **no** Crawford County poll —
  never imply one.
- **Verify before asserting.** Brad's standing rule: seek first-hand voices of the
  people most affected, withhold judgment until they're heard.
- **Never invent biography, quotes, dates, or numbers.** Ask instead. This is a real
  person's public record.
- Purple branding is deliberate — it reads as neither party. Brad doesn't hide being a
  Democrat but doesn't lead with it.

## Commands

```bash
pnpm dev:web          # Next.js dev server
pnpm dev:studio       # Sanity Studio
pnpm test             # vitest (web)
pnpm lint:web
pnpm build:web

pnpm -C web verify:sanity     # validate Sanity connectivity/content
pnpm -C web check:links       # link checker
pnpm -C web check:freshness   # content staleness report
```

Studio migration scripts run via `sanity exec … --with-user-token` — see
`studio/package.json`. Scripts in `studio/scripts/` are one-shot content migrations;
read the header comment before re-running one.

## Gotchas

- `headerLogoSmall` in site settings is currently **null**; the header falls back to
  `campaignLogo`, which is a 1536×1024 *photograph of a printed banner* (visible
  grommets and fabric edge), square-cropped by Sanity and circle-clipped by CSS.
- **Brand palette: see `docs/brand-palette.md`** — official values, implemented in
  `globals.css` 2026-07-20 for both themes. Note the site's variable names predate the
  palette: `--color-accent` is the **purple**, `--color-accent-2` is the **gold**.
- Gold `#e2a413` fails contrast on light backgrounds (2.04:1). It is a fill color
  with dark text on top, never a text color on light.
- `:focus-visible` relies on `outline-offset: 3px` to keep the ring off button fills.
  Removing the offset breaks focus contrast.
- **Known:** inline links aren't underlined until hover, so they fail WCAG 1.4.1
  (Level A) on color alone. Pre-existing; see `docs/brand-palette.md`.
- Icons are installed via Next.js file conventions in `src/app/` plus
  `src/app/manifest.ts`, which needs `export const dynamic = 'force-static'` because
  `next.config.ts` sets `output: "export"`.
- **Icon transparency is deliberate and asymmetric.** Tab icons and `apple-icon.png`
  have clear corners; both `maskable-*.png` must stay **opaque** (Android crops to a
  mask shape). iOS renders apple-touch-icon alpha as black — that black backdrop is
  the intended look, chosen over a purple field. Do not flatten it. See
  `docs/brand-palette.md`.
- `pnpm build:web` fails with a pre-existing Turbopack panic on Next 16.1.6 here.
  `pnpm -C web exec next build --webpack` works.
- Windows: no Inkscape or ImageMagick installed. `convert` on PATH is the Windows
  disk tool, **not** ImageMagick. Pillow and Node are available.
