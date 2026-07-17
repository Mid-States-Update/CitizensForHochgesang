import {defineField, defineType} from 'sanity'

/**
 * FAQ entry — question + rich-text answer, rendered on the /faq page.
 * Field names match the pre-existing faq documents in the dataset
 * (title = question, body = answer, orderRank = manual sort key).
 */
export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'body',
      title: 'Answer',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'orderRank',
      title: 'Sort Order',
      type: 'string',
      description: 'FAQs are shown in ascending order of this value (e.g. 10, 20, 30 — leave gaps for inserts).',
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
    select: {title: 'title'},
  },
})
