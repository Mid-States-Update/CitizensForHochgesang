# Brand Palette

Authoritative color reference for the campaign site. Palette delivered 2026-07-20;
revised the same day after an audit found blocking issues (see
[`brand/designer-handoff-2026-07-20.md`](brand/designer-handoff-2026-07-20.md)).

**Status: implemented.** The revised palette is live in `web/src/app/globals.css`.

**Full interactive palette:** [`brand/logo-and-favicons.html`](brand/logo-and-favicons.html)
— swatches, favicon renders at true pixel size, and the `<head>` snippet. Needs an
internet connection (React and Babel from unpkg, fonts from Google) and must stay in
the same folder as `support.js` and `favicons/`.

Source artwork archived in [`brand/`](brand/): `Brad_Circle_logo.svg`,
`Brad_Circle_logo.pdf`, and the full `favicons/` set.

## Theme tokens (implemented)

### Light

| Designer token | Hex | Site CSS variable |
| --- | --- | --- |
| `bg` | `#f1ecfa` | `--color-canvas` |
| `surface` | `#ffffff` | `--color-surface` |
| `surfaceAlt` | `#e3daf3` | `--color-highlight` |
| `border` | `#c9bce3` | `--color-border` |
| `text` | `#261b38` | `--color-ink` |
| `textMuted` | `#675e7a` | `--color-muted` |
| `primary` | `#390d6b` | `--color-accent` |
| `primaryHover` | `#5a1c9a` | `--color-accent-hover` |
| `onPrimary` | `#ffffff` | `--color-accent-contrast` |
| `accent` | `#e2a413` | `--color-accent-2` |
| `accentHover` | `#a67c0a` | `--color-accent-2-hover` |
| `onAccent` | `#1e142e` | `--color-accent-2-contrast` |
| `link` | `#702db9` | `--color-link` |
| `linkHover` | `#390d6b` | `--color-link-hover` |
| `focus` | `#9769dc` | `--color-focus` |

### Dark

| Designer token | Hex | Site CSS variable |
| --- | --- | --- |
| `bg` | `#170b27` | `--color-canvas` |
| `surface` | `#26173f` | `--color-surface` |
| `surfaceAlt` | `#3a2560` | `--color-highlight` |
| `border` | `#4d3873` | `--color-border` |
| `text` | `#f3f0f9` | `--color-ink` |
| `textMuted` | `#b1a9c4` | `--color-muted` |
| `primary` | `#9964e5` | `--color-accent` |
| `primaryHover` | `#b082f7` | `--color-accent-hover` |
| `onPrimary` | `#161229` | `--color-accent-contrast` |
| `accent` | `#e8b543` | `--color-accent-2` |
| `accentHover` | `#fdcd68` | `--color-accent-2-hover` |
| `onAccent` | `#1a1029` | `--color-accent-2-contrast` |
| `link` | `#c9adfd` | `--color-link` |
| `linkHover` | `#e0ceff` | `--color-link-hover` |
| `focus` | `#b6abfc` | `--color-focus` |

The site's variable names predate the palette: `--color-accent` is the **purple**,
`--color-accent-2` is the **gold**. Renaming would touch ~120 call sites, so the
mapping above is the translation layer.

## Core brand colors

Logo, print, and the manifest `theme_color`.

| Name | Hex |
| --- | --- |
| Deep Purple | `#390d6b` |
| Purple 800 | `#492a9e` |
| Purple 600 | `#7351df` |
| Purple 300 | `#b6abfc` |
| Purple 150 | `#dddafb` |
| Gold | `#e2a413` |
| Gold Light | `#fbc95f` |
| Ink | `#161229` |
| Paper | `#f6f6fc` |

## Audit of the implemented palette

Verified 2026-07-20. Text needs 4.5:1, non-text UI and focus indicators 3:1.

**All body text passes in both modes.** Lowest results: light `textMuted` on
`surfaceAlt` 4.51:1; dark `textMuted` on `surfaceAlt` 5.79:1.

**All text-on-fill passes.** Light `onPrimary` on `primary` 14.54:1, `onAccent` on
`accentHover` 4.61:1. Dark `onPrimary` on `primary` 4.61:1 (was 3.96:1 and failing
before the revision), on `primaryHover` 6.40:1.

**Focus ring** passes against page and card surfaces — light 3.37:1 / 3.91:1, dark
9.18:1 / 8.00:1. It measures below 3:1 against *filled* buttons, which is fine here:
`:focus-visible` uses `outline-offset: 3px`, so the ring is drawn outside the element
on the background, never on the fill. **Do not remove that offset** without
re-checking.

**Perceptual (CIEDE2000).** The revision resolved every proximity problem. The two
`IDENTICAL` pairs (dark `focus`/`accent` at ΔE 0.00) and both `TOO CLOSE` pairs are
gone. Closest remaining are light `bg`/`surfaceAlt` at ΔE 5.79 and dark `bg`/`surface`
at ΔE 6.00 — both acceptable.

## Known issue: links are not underlined

Inline links carry `text-decoration: none` with `background-size: 0%`; the underline
animates in only on hover. So in body copy a link is distinguished by **color alone**.

| Mode | link vs body text | Required |
| --- | --- | --- |
| Light | 2.13:1 | 3:1 |
| Dark | 1.71:1 | 3:1 |

This fails **WCAG 1.4.1 Use of Color (Level A)**. It is **pre-existing** — the palette
change neither caused nor worsened it, since `link` and `text` were unchanged in the
revision.

The fix is a persistent underline for prose links: set the default `background-size`
to `100% var(--text-link-thickness)` in the global `a:not(...)` rule. That is a visible
design change, and the `.text-links-subtle` / `.text-links-sweep` / `.text-links-none`
variants suggest the hover-only reveal was deliberate — so it needs a decision, not a
silent patch.

## Icon set

| File | Source | Notes |
| --- | --- | --- |
| `web/src/app/favicon.ico` | `favicon.ico` | 16/32/48 |
| `web/src/app/icon.svg` | `favicon.svg` | scalable, 1067×1067 |
| `web/src/app/icon.png` | `favicon-512.png` | 512 fallback |
| `web/src/app/apple-icon.png` | `apple-touch-icon.png` | 180, iOS |
| `web/public/icon-192.png` · `icon-512.png` | — | PWA, `purpose: any` |
| `web/public/maskable-192.png` · `maskable-512.png` | — | PWA, `purpose: maskable` |

Manifest generated by `web/src/app/manifest.ts` (not the delivered `site.webmanifest`,
whose `/favicons/` paths don't match this app's layout).

**Size hinting:** the 16px is a dedicated simplified mark — gold stars over a blocky
"BRAD" — embedded in `favicon.ico` and byte-identical to `favicons/favicon-16.png`.
The full lockup was illegible at that size. `favicons/favicon-16.svg` is its source.

**Maskable verified** against the Android adaptive-icon safe zone: content spans 66.4%
of canvas, centered, max radius 171px against the 205px limit at 512px. Full-bleed
purple field, so any mask shape crops cleanly.

### Transparency rules — do not "fix" these to match each other

The 2026-07-20 revision added transparent corners so the mark reads as a circle. That
is correct for *most* of the set, but two categories must stay **opaque**:

| Icon | Alpha | Why |
| --- | --- | --- |
| `icon.png`, `icon-192/512`, `favicon-32/48/512` | ~32% clear | reads as a circle in browser tabs |
| `favicon-16` | opaque | simplified square "BRAD" mark |
| `maskable-192/512` | **opaque** | Android masks crop to a shape; a transparent maskable produces a clipped ring |
| `apple-icon.png` | ~31% clear | **intentional** — see below |

**`apple-icon.png` transparency is a deliberate design decision, not an oversight.**
iOS does not support alpha in apple-touch-icon and composites transparent pixels to
**black**. Brad and the designer evaluated both and chose the black result: the logo's
field is Deep Purple `#390d6b`, so flattening onto that same purple makes the circle's
interior merge into the background, leaving only the thin gold ring to define the
shape. Black keeps the mark reading as a distinct circle.

**Do not flatten this file.** If a future pass "fixes" the transparency, it will
regress the iOS home-screen icon.

Delivered but not wired in: `favicons/favicon-badge.svg`.

## Domain

`bradh.org` is a vanity shortcut, **not** a migration. Verified 2026-07-20: it,
`www.bradh.org`, and both http/https all 301 to `https://citizensforhochgesang.org/`.
