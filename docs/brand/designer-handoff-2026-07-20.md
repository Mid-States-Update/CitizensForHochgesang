# Palette Review — Findings Before Implementation

**Re:** light/dark token sets delivered 2026-07-20
**Site:** citizensforhochgesang.org (Next.js, both themes shipping)

Thanks for the two-mode token set — the structure is exactly what we needed, and it
closed all six gaps we flagged in the first round. Before wiring it into the site we
ran every token pair through an automated audit. Most of it passes comfortably. Nine
items need your decision, three of which we consider blocking.

## How we tested

- **Contrast:** WCAG 2.1 relative luminance. Body text needs **4.5:1**; non-text UI
  and focus indicators need **3:1**.
- **Perceptual distance:** CIEDE2000 (ΔE). Rule of thumb — **ΔE < 1** is
  indistinguishable, **< 3** is too close for colors doing different jobs, **< 6** is
  tight.

Every pair below was measured, not eyeballed.

---

## Blocking — accessibility failures

### 1. Dark `onPrimary` fails on both primary states

| Pair | Ratio | Required |
| --- | --- | --- |
| `#ffffff` on `primary` `#9964e5` | **3.96:1** | 4.5:1 |
| `#ffffff` on `primaryHover` `#b082f7` | **2.84:1** | 4.5:1 |

`#9964e5` is a light purple; white text doesn't hold on it, and hover makes it worse.
Any dark foreground fixes it:

| Candidate | on `primary` | on `primaryHover` |
| --- | --- | --- |
| `#170b27` (your dark `bg`) | 4.77:1 | 6.63:1 |
| `#1a1029` (your `onAccent`) | 4.62:1 | 6.42:1 |

**Ask:** either set dark `onPrimary` to a dark value, or darken `primary` /
`primaryHover` enough to carry white.

### 2. Dark `focus` is identical to dark `accent`

Both are `#e8b543` — **ΔE 0.00, contrast 1.00:1**. A keyboard focus ring on any gold
CTA is completely invisible. This is the most serious item in the set.

**Ask:** a dedicated dark focus color that is distinct from `accent`. It also needs
**3:1 against whatever it outlines**, which the current value does not have against
`primary` (2.09:1).

### 3. Dark focus ring against primary buttons

`focus #e8b543` on `primary #9964e5` is **2.09:1**, below the 3:1 required for focus
indicators. Survivable only if the ring is always drawn on the page background
(9.99:1) and never inside the button.

**Ask:** confirm the intended ring placement, or supply a focus color that clears 3:1
against both `bg` and `primary`.

---

## Significant — hierarchy and feedback

### 4. Light `bg` and `surfaceAlt` are too close

`#fbf9fe` vs `#f5f2fb` — **ΔE 2.41**. Subtle fills will be close to invisible against
the page. `bg` vs `surface` is also tight at **ΔE 3.13**, so cards barely read as
raised.

**Ask:** open up the light surface ramp. Even a couple more points of separation
between `bg`, `surface`, and `surfaceAlt` would restore the hierarchy.

### 5. Dark `linkHover` and `accentHover` are near-identical

`#fbc95f` vs `#fdcd68` — **ΔE 1.15**. Two different roles, effectively the same gold.

**Ask:** either differentiate them, or confirm they're meant to be one value.

### 6. Weak gold hover feedback in light mode

`accent #e2a413` vs `accentHover #cc9804` — **ΔE 4.69**. Perceptible but faint; users
may not register the state change.

### 7. Dark `surface` / `surfaceAlt` are tight

**ΔE 4.52.** Workable, but worth a look alongside item 4.

---

## Please confirm — probably intentional

### 8. Light `linkHover` is identical to `primary`

Both `#390d6b`, ΔE 0.00. Reads as deliberate (links darken to brand on hover) — just
confirming.

### 9. Near-duplicate values that could collapse

- Light `onAccent #1e142e` vs `text #261b38` — ΔE 2.49
- Dark `onAccent #1a1029` vs `bg #170b27` — ΔE 1.20

Not defects; they never appear adjacent. But if they're meant to be the same value,
saying so reduces the token count we maintain.

---

## Noted, no action needed

- ~~**Links vs body text:** light 2.13:1, dark 1.71:1. WCAG 1.4.1 wants 3:1 when color
  alone marks a link — our links are underlined, so we're compliant.~~
  **CORRECTION (2026-07-20):** this was wrong on our side. Inline links use
  `text-decoration: none` with the underline animating in only on hover, so color
  **is** the only cue and both modes fall below 3:1. This is a pre-existing WCAG 1.4.1
  (Level A) failure on our end, not a palette defect — the fix is ours to make. No
  action needed from you.
- **Borders below 3:1** in both modes (light 1.30:1, dark 1.75:1 against `bg`). Normal
  for decorative dividers. We won't use a border as the only marker of a control.
- **Everything else passes.** Light mode is clean throughout — lowest text result is
  `textMuted` on `surfaceAlt` at 5.49:1. Dark `text`, `textMuted`, `link`, `accent`,
  and both `onAccent` pairings all pass comfortably.

---

## What we need back

A revised token set addressing items 1–3 at minimum, ideally 4–7, plus a yes/no on
8–9. Same 15-token-per-mode format is perfect. We'll re-run the full audit on the
revision and implement once it's clean.

One separate item, unrelated to color: the icon set still has **no maskable variant**.
The gold ring runs nearly to the canvas edge, and Android's adaptive-icon mask crops
to the central 80%, so it would be clipped on home screens. That needs the lockup
scaled down inside a larger purple field.
