import {defineArrayMember, defineField, defineType} from 'sanity'

function validateHref(value: string | undefined) {
  if (!value) {
    return 'URL is required'
  }

  return value.startsWith('/') || value.startsWith('http')
    ? true
    : 'Use an internal path (/support) or full URL (https://...)'
}

export const aboutPriorities = defineType({
  name: 'aboutPriorities',
  title: 'About & Priorities',
  type: 'document',
  groups: [
    {name: 'header', title: 'Header', default: true},
    {name: 'bio', title: 'Bio'},
    {name: 'values', title: 'Values'},
    {name: 'priorities', title: 'Priorities'},
    {name: 'cta', title: 'Calls To Action'},
  ],
  fields: [
    defineField({
      name: 'pageEyebrow',
      title: 'Page Eyebrow',
      type: 'string',
      group: 'header',
      initialValue: 'About & Priorities',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      group: 'header',
      initialValue: 'Who Brad is and what this campaign stands for',
      validation: (Rule) => Rule.required().max(140),
    }),
    defineField({
      name: 'pageIntro',
      title: 'Page Intro',
      type: 'text',
      rows: 3,
      group: 'header',
      validation: (Rule) => Rule.required().max(320),
    }),
    defineField({
      name: 'bioHeading',
      title: 'Bio Heading',
      type: 'string',
      group: 'bio',
      initialValue: 'Candidate bio',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'bioBody',
      title: 'Bio Article Body',
      type: 'array',
      group: 'bio',
      description: 'Long-form bio content with article-style rich text blocks.',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              validation: (Rule) => Rule.max(160),
            }),
          ],
        }),
        defineArrayMember({type: 'htmlEmbed'}),
        defineArrayMember({type: 'videoEmbed'}),
        defineArrayMember({type: 'ctaButton'}),
        defineArrayMember({type: 'pullQuote'}),
        defineArrayMember({type: 'infoBox'}),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'valuesHeading',
      title: 'Values Heading',
      type: 'string',
      group: 'values',
      initialValue: 'Campaign values',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'values',
      title: 'Values List',
      type: 'array',
      group: 'values',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.required().min(1).max(8),
    }),
    defineField({
      name: 'prioritiesHeading',
      title: 'Priorities Heading',
      type: 'string',
      group: 'priorities',
      initialValue: 'Core priorities',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'priorities',
      title: 'Priority Cards',
      type: 'array',
      group: 'priorities',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required().max(100),
            }),
            defineField({
              name: 'slug',
              title: 'Slug',
              type: 'slug',
              options: {source: 'title', maxLength: 96},
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'summary',
              title: 'Summary',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required().max(320),
            }),
            defineField({
              name: 'body',
              title: 'Detail Body',
              type: 'array',
              description: 'Article-style body for the priority drill-down page.',
              of: [
                defineArrayMember({type: 'block'}),
                defineArrayMember({
                  type: 'image',
                  options: {hotspot: true},
                  fields: [
                    defineField({
                      name: 'alt',
                      title: 'Alt text',
                      type: 'string',
                      validation: (Rule) => Rule.max(160),
                    }),
                  ],
                }),
                defineArrayMember({type: 'htmlEmbed'}),
                defineArrayMember({type: 'videoEmbed'}),
                defineArrayMember({type: 'ctaButton'}),
                defineArrayMember({type: 'pullQuote'}),
                defineArrayMember({type: 'infoBox'}),
              ],
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: 'links',
              title: 'Detail Links',
              type: 'array',
              description: 'Link list shown in the drill-down detail view.',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: (Rule) => Rule.required().max(60),
                    }),
                    defineField({
                      name: 'url',
                      title: 'URL',
                      type: 'string',
                      validation: (Rule) => Rule.required().custom(validateHref),
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'label',
                      subtitle: 'url',
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'summary',
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1).max(9),
    }),
    defineField({
      name: 'ctaHeading',
      title: 'CTA Heading',
      type: 'string',
      group: 'cta',
      initialValue: 'Get involved',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'ctaCopy',
      title: 'CTA Copy',
      type: 'text',
      rows: 3,
      group: 'cta',
      validation: (Rule) => Rule.required().max(280),
    }),
    defineField({
      name: 'primaryCtaLabel',
      title: 'Primary CTA Label',
      type: 'string',
      group: 'cta',
      initialValue: 'Volunteer & donate',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'primaryCtaUrl',
      title: 'Primary CTA URL',
      type: 'string',
      group: 'cta',
      initialValue: '/support',
      validation: (Rule) => Rule.required().custom(validateHref),
    }),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'Secondary CTA Label',
      type: 'string',
      group: 'cta',
      initialValue: 'Attend an event',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'secondaryCtaUrl',
      title: 'Secondary CTA URL',
      type: 'string',
      group: 'cta',
      initialValue: '/events',
      validation: (Rule) => Rule.required().custom(validateHref),
    }),
  ],
})
