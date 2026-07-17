import {defineArrayMember, defineField, defineType} from 'sanity'

const COUNTY_SLUGS = [
  'crawford-county',
  'dubois-county',
  'gibson-county',
  'perry-county',
  'pike-county',
  'spencer-county',
]

/**
 * City/town page — the third tier of District → County → City
 * (/district/<county>/<city>). Same issue-card model as county pages,
 * scoped to one municipality. countySlug ties the page under its county;
 * the city page only renders when its parent county page is published.
 */
export const cityPage = defineType({
  name: 'cityPage',
  title: 'City Page',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'metadata', title: 'Metadata'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'City / Town Name',
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
      name: 'countySlug',
      title: 'County',
      type: 'string',
      group: 'metadata',
      options: {list: COUNTY_SLUGS},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      description: 'Ideally a photo of Brad in this town. Optional; the page works without one.',
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
      of: [defineArrayMember({type: 'issueCard'})],
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
      description: 'Cities are listed within their county in ascending order of this value.',
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderRankAsc',
      by: [
        {field: 'countySlug', direction: 'asc'},
        {field: 'orderRank', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'title', subtitle: 'countySlug', media: 'heroImage'},
  },
})
