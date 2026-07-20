import { describe, it, expect } from 'vitest'
import manifest, { dynamic } from './manifest'

/**
 * These lock in three things that were verified by hand and are easy to
 * regress silently, because nothing renders them during a normal page view:
 *
 *  - `force-static`, without which the build fails under `output: "export"`
 *  - the maskable icon declarations, without which Android crops the artwork
 *  - the brand theme color
 */
describe('web app manifest', () => {
  const result = manifest()

  it('is statically rendered, as output: "export" requires', () => {
    expect(dynamic).toBe('force-static')
  })

  it('uses the brand Deep Purple for theme and background', () => {
    expect(result.theme_color).toBe('#390d6b')
    expect(result.background_color).toBe('#390d6b')
  })

  it('declares both standard PWA icon sizes', () => {
    const any = (result.icons ?? []).filter((icon) => icon.purpose === 'any')
    expect(any.map((icon) => icon.sizes).sort()).toEqual(['192x192', '512x512'])
  })

  it('declares maskable icons at both sizes, pointing at the padded artwork', () => {
    const maskable = (result.icons ?? []).filter((icon) => icon.purpose === 'maskable')
    expect(maskable.map((icon) => icon.sizes).sort()).toEqual(['192x192', '512x512'])
    for (const icon of maskable) {
      expect(icon.src).toMatch(/^\/maskable-\d+\.png$/)
    }
  })

  it('never points a maskable entry at the unpadded icon', () => {
    const maskable = (result.icons ?? []).filter((icon) => icon.purpose === 'maskable')
    for (const icon of maskable) {
      expect(icon.src).not.toMatch(/^\/icon-/)
    }
  })

  it('is installable — needs a name, start_url and standalone display', () => {
    expect(result.name).toBeTruthy()
    expect(result.short_name).toBeTruthy()
    expect(result.start_url).toBe('/')
    expect(result.display).toBe('standalone')
  })
})
