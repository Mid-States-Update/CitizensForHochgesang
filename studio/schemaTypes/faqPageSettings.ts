import {defineField, defineType} from 'sanity'

/**
 * FAQ page settings — visual controls for the /faq page.
 */
export const faqPageSettings = defineType({
  name: 'faqPageSettings',
  title: 'FAQ Page',
  type: 'document',
  fields: [
    defineField({
      name: 'pageEyebrow',
      title: 'Page Eyebrow',
      type: 'string',
      description: 'Small label above the page title. Defaults to "FAQ".',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      description: 'Defaults to "Frequently asked questions".',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'pageIntro',
      title: 'Page Intro',
      type: 'text',
      rows: 2,
      description: 'Short line under the title. Defaults to "Quick answers for volunteers, supporters, constituents, and press."',
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: 'visuals',
      title: 'Page Visual Settings',
      type: 'pageVisuals',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'FAQ Page Settings'}
    },
  },
})
