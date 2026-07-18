import {defineField, defineType} from 'sanity'

export const mediaLink = defineType({
  name: 'mediaLink',
  title: 'Media Link',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          {title: 'YouTube', value: 'youtube'},
          {title: 'Facebook', value: 'facebook'},
          {title: 'Audio', value: 'audio'},
          {title: 'Press / News Article', value: 'other'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'One or two sentences shown under the title on the Media page.',
      validation: (Rule) => Rule.max(320),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'highlight',
      title: 'Highlight',
      type: 'boolean',
      initialValue: false,
      description: 'Feature this item with a badge (e.g. widely viewed or milestone coverage).',
    }),
    defineField({
      name: 'highlightNote',
      title: 'Highlight Badge Text',
      type: 'string',
      description: 'Badge label when highlighted, e.g. "Top story" or "25K+ views". Defaults to "Featured".',
      validation: (Rule) => Rule.max(60),
      hidden: ({document}) => !document?.highlight,
    }),
    defineField({
      name: 'geoTags',
      title: 'Counties / Towns',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          'Crawford County',
          'Dubois County',
          'Gibson County',
          'Perry County',
          'Pike County',
          'Spencer County',
          'Cannelton',
          'English',
          'Ferdinand',
          'Huntingburg',
          'Jasper',
          'Oakland City',
          'Petersburg',
          'Princeton',
          'Rockport',
          'Santa Claus',
          'Tell City',
          'Winslow',
        ],
      },
      description:
        'Where this coverage is about or was recorded. Powers the place filter on the Media page (same names as post tags on News).',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'mediaType', media: 'thumbnail', highlight: 'highlight'},
    prepare({title, subtitle, media, highlight}) {
      return {
        title: `${highlight ? '⭐ ' : ''}${title ?? '(untitled)'}`,
        subtitle,
        media,
      }
    },
  },
})
