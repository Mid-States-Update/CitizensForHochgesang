import {defineArrayMember, defineField, defineType} from 'sanity'

export const issueTagOptions = [
  {title: 'Where I stand (position taken)', value: 'stand'},
  {title: "I'm listening (no position yet)", value: 'listening'},
  {title: 'On my radar (verified fact + open question)', value: 'radar'},
]

/**
 * Shared issue card used by county and city pages. The tag encodes the
 * campaign's listening-first rule: "stand" cards may state positions,
 * "listening"/"radar" cards report on-the-record voices only. Every card
 * carries the public sources backing its claims.
 */
export const issueCard = defineType({
  name: 'issueCard',
  title: 'Issue Card',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Issue Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'tag',
      title: 'Tag',
      type: 'string',
      initialValue: 'radar',
      options: {list: issueTagOptions, layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'platformSlug',
      title: 'Related Platform Page Slug',
      type: 'string',
      description: 'Optional. Links the card to /platform/<slug> (e.g. "data-centers").',
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      description: 'Public sources backing every claim in this card.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required().max(120),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'url'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'tag'},
    prepare({title, subtitle}) {
      const tagTitle = issueTagOptions.find((option) => option.value === subtitle)?.title ?? subtitle
      return {title: title || 'Issue Card', subtitle: tagTitle}
    },
  },
})
