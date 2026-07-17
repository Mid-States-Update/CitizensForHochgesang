import {describe, expect, it} from 'vitest'

import {splitLeadImage} from './portable-split'

function imageBlock(key: string, url: string, alt?: string) {
  return {_type: 'image', _key: key, alt, asset: {url}}
}

function textBlock(key: string, text: string) {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    children: [{_type: 'span', _key: `${key}-span`, text, marks: []}],
    markDefs: [],
  }
}

describe('splitLeadImage', () => {
  it('extracts a leading image block and returns the remaining blocks', () => {
    const body = [imageBlock('img', 'https://cdn.example/portrait.jpg', 'Brad'), textBlock('b1', 'Hello')]

    const {leadImage, rest} = splitLeadImage(body)

    expect(leadImage).toEqual({url: 'https://cdn.example/portrait.jpg', alt: 'Brad'})
    expect(rest).toHaveLength(1)
    expect(rest[0]._key).toBe('b1')
  })

  it('returns no lead image when the body starts with text', () => {
    const body = [textBlock('b1', 'Hello'), imageBlock('img', 'https://cdn.example/mid.jpg')]

    const {leadImage, rest} = splitLeadImage(body)

    expect(leadImage).toBeUndefined()
    expect(rest).toHaveLength(2)
  })

  it('drops trailing blocks that contain only empty text', () => {
    const body = [imageBlock('img', 'https://cdn.example/p.jpg'), textBlock('b1', 'Hello'), textBlock('b2', '')]

    const {rest} = splitLeadImage(body)

    expect(rest.map((block) => block._key)).toEqual(['b1'])
  })

  it('handles an empty or missing body', () => {
    expect(splitLeadImage([])).toEqual({leadImage: undefined, rest: []})
    expect(splitLeadImage(undefined)).toEqual({leadImage: undefined, rest: []})
  })

  it('falls back to empty alt when the image block has none', () => {
    const {leadImage} = splitLeadImage([imageBlock('img', 'https://cdn.example/p.jpg')])

    expect(leadImage).toEqual({url: 'https://cdn.example/p.jpg', alt: ''})
  })
})
