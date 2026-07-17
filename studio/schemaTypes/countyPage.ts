import {defineArrayMember, defineField, defineType} from 'sanity'

const issueTagOptions = [
  {title: 'Where I stand (position taken)', value: 'stand'},
  {title: "I'm listening (no position yet)", value: 'listening'},
  {title: 'On my radar (verified fact + open question)', value: 'radar'},
]

/**
 * County page — one per District 48 county (/district/<slug>).
 * Leads with the county's defining local issue, then tagged issue cards.
 * Tags encode the campaign's listening-first rule: "stand" cards may state
 * positions, "listening"/"radar" cards report on-the-record voices only.
 */
export const countyPage = defineType({
  name: 'countyPage',
  title: 'County Page',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'metadata', title: 'Metadata'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'County Name',
      type: 'string',
      group: ['content', 'metadata'],
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'metadata',
      options: {source: 'title', maxLength: 60},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'townsLine',
      title: 'Towns Line',
      type: 'string',
      group: 'content',
      description: 'Shown under the county name, e.g. "Petersburg · Winslow · Otwell · Spurgeon · Stendal".',
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      description: 'Ideally a photo of Brad in this county. Optional; the page works without one.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) => Rule.max(160),
        }),
      ],
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      group: ['content', 'metadata'],
      rows: 3,
      description: 'One or two sentences framing the page. Also used as the meta description.',
      validation: (Rule) => Rule.required().max(320),
    }),
    defineField({
      name: 'ledeTitle',
      title: 'Lead Issue Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'ledeBody',
      title: 'Lead Issue Body',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'block'})],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'issueCards',
      title: 'Issue Cards',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
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
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'listeningPrompt',
      title: 'Listening Prompt',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'The "What am I missing?" closer that invites residents to write in.',
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'localOutlets',
      title: 'Local News Outlets',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required().max(80),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {select: {title: 'name', subtitle: 'url'}},
        }),
      ],
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'date',
      group: 'metadata',
      description: 'Shown on the page. Update whenever the content is refreshed.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'orderRank',
      title: 'Sort Order',
      type: 'string',
      group: 'metadata',
      description: 'Counties are listed in ascending order of this value (e.g. 10, 20, 30).',
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderRankAsc',
      by: [{field: 'orderRank', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'title', subtitle: 'townsLine', media: 'heroImage'},
  },
})
