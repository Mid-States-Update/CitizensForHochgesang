import {defineField, defineType} from 'sanity'

export const mediaSettings = defineType({
  name: 'mediaSettings',
  title: 'Media & Press',
  type: 'document',
  // Treated as a singleton — only one document of this type is created.
  fields: [
    // ── Page Intro ───────────────────────────────────────────────────────────

    defineField({
      name: 'pageHeading',
      title: 'Page Heading',
      type: 'string',
      description: 'Main H1 on the Media & Press page.',
      placeholder: 'Media coverage and press resources',
    }),
    defineField({
      name: 'pageIntro',
      title: 'Page Introduction',
      type: 'text',
      rows: 3,
      description: 'Short paragraph shown below the page heading.',
      placeholder: 'Watch and share campaign coverage, access official assets, and contact the team for media requests.',
    }),

    // ── Media Contact ─────────────────────────────────────────────────────────

    defineField({
      name: 'contactIntro',
      title: 'Contact Card Description',
      type: 'text',
      rows: 2,
      description: 'Text shown under the "Media contact" card heading.',
      initialValue: 'For interviews, deadlines, and publication requests.',
    }),
    defineField({
      name: 'contactName',
      title: 'Contact Name',
      type: 'string',
      description: 'Name of the campaign media contact person.',
    }),
    defineField({
      name: 'contactTitle',
      title: 'Contact Title / Role',
      type: 'string',
      placeholder: 'Communications Director',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
    }),

    // ── Press Assets ──────────────────────────────────────────────────────────

    defineField({
      name: 'pressAssetLinks',
      title: 'Press Asset Download Links',
      type: 'array',
      description: 'Download links shown in the Press Assets card (short bio, logo usage guide, etc.). The campaign logo download is controlled separately via Site Settings → Campaign Logo.',
      of: [
        {
          type: 'object',
          name: 'pressAssetLink',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              // Long enough for poll labels with full sponsorship attribution.
              validation: (Rule) => Rule.required().max(140),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'string',
              description: 'Absolute URL or relative path (e.g. /press-kit/bio.pdf).',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'url'},
          },
        },
      ],
    }),
  ],
})
