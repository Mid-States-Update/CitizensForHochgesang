import {defineField, defineType} from 'sanity'
import {iconOptions} from './iconOptions'

/**
 * Home page settings — all content and visual controls for the homepage.
 * Fields migrated from siteSettings; visual settings use the shared pageVisuals object.
 */
export const homePageSettings = defineType({
  name: 'homePageSettings',
  title: 'Home Page',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'whyRunning', title: 'Why Running'},
    {name: 'cards', title: 'Cards & CTA'},
    {name: 'proof', title: 'Proof & Credibility'},
    {name: 'countdown', title: 'Countdown'},
    {name: 'feeds', title: 'Feed Sections'},
    {name: 'visuals', title: 'Visuals'},
  ],
  fields: [
    // ── Hero ──
    defineField({
      name: 'heroLayout',
      title: 'Hero Layout',
      type: 'string',
      group: 'hero',
      initialValue: 'clean-split',
      options: {
        list: [
          {title: 'Clean Split (Text Left, Portrait Right)', value: 'clean-split'},
          {title: 'Portrait Left (Text Right)', value: 'portrait-left'},
          {title: 'Immersive Overlay (Text on Portrait)', value: 'immersive-overlay'},
        ],
        layout: 'radio',
        direction: 'vertical',
      },
      description: 'Controls the visual composition of the homepage hero section.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'candidatePortrait',
      title: 'Candidate Portrait (Hero)',
      type: 'image',
      group: 'hero',
      options: {hotspot: true},
      description: 'Primary homepage portrait image. Recommended portrait orientation (4:5).',
    }),
    defineField({
      name: 'candidatePortraitAlt',
      title: 'Candidate Portrait Alt Text',
      type: 'string',
      group: 'hero',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'candidatePortraitCaption',
      title: 'Candidate Portrait Caption',
      type: 'string',
      group: 'hero',
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: 'districtLabel',
      title: 'District Label',
      type: 'string',
      group: 'hero',
      initialValue: 'Indiana State Senate District 48',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'heroSummary',
      title: 'Hero Summary',
      type: 'text',
      group: 'hero',
      rows: 3,
      description: 'Paragraph shown under the hero title/tagline.',
      validation: (Rule) => Rule.max(280),
    }),
    defineField({
      name: 'heroActions',
      title: 'Hero Action Buttons',
      type: 'array',
      group: 'hero',
      description: 'Buttons near the hero title/photo.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required().max(40),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'string',
              validation: (Rule) =>
                Rule.required().custom((value) => {
                  if (!value) return 'URL is required'
                  return value.startsWith('/') || value.startsWith('http')
                    ? true
                    : 'Use an internal path (/support) or full URL (https://...)'
                }),
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {list: iconOptions, layout: 'dropdown'},
              initialValue: 'vote-yea',
            }),
            defineField({
              name: 'style',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  {title: 'Primary', value: 'primary'},
                  {title: 'Outline', value: 'outline'},
                  {title: 'Accent', value: 'accent'},
                ],
                layout: 'radio',
              },
              initialValue: 'primary',
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'url'}},
        },
      ],
    }),
    defineField({
      name: 'heroBadges',
      title: 'Hero Bubbles',
      type: 'array',
      group: 'hero',
      description: 'Badge-style items that appear by text, near portrait, or in proof strip.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required().max(80),
            }),
            defineField({
              name: 'url',
              title: 'Optional URL',
              type: 'string',
              validation: (Rule) =>
                Rule.custom((value) => {
                  if (!value) return true
                  return value.startsWith('/') || value.startsWith('http')
                    ? true
                    : 'Use an internal path (/support) or full URL (https://...)'
                }),
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {list: iconOptions, layout: 'dropdown'},
            }),
            defineField({
              name: 'placement',
              title: 'Placement',
              type: 'string',
              options: {
                list: [
                  {title: 'Near Text', value: 'text'},
                  {title: 'Near Portrait', value: 'media'},
                  {title: 'Bottom Proof Strip', value: 'proof'},
                ],
                layout: 'radio',
              },
              initialValue: 'proof',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'focusItems',
      title: 'Hero Focus List',
      type: 'array',
      group: 'hero',
      of: [{type: 'string'}],
      description: 'Bullet list shown with the hero text.',
      validation: (Rule) => Rule.max(8),
    }),

    // ── Why I'm Running ──
    defineField({
      name: 'whyRunningHeading',
      title: '"Why I\'m Running" Heading',
      type: 'string',
      group: 'whyRunning',
      initialValue: "Why I'm Running",
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'whyRunningBody',
      title: '"Why I\'m Running" Body',
      type: 'array',
      group: 'whyRunning',
      description: 'Personal narrative section shown below hero. Supports rich text.',
      of: [
        {type: 'block'},
        {type: 'image', options: {hotspot: true}},
        {type: 'htmlEmbed'},
        {type: 'videoEmbed'},
        {type: 'ctaButton'},
        {type: 'pullQuote'},
        {type: 'infoBox'},
        {type: 'mapEmbed'},
      ],
    }),
    defineField({
      name: 'whyRunningImage',
      title: '"Why I\'m Running" Image',
      type: 'image',
      group: 'whyRunning',
      options: {hotspot: true},
      description: 'Optional photo for the Why I\'m Running section.',
    }),

    // ── Cards & CTA ──
    defineField({
      name: 'midCtaHeading',
      title: 'Mid-Page CTA Heading',
      type: 'string',
      group: 'cards',
      initialValue: 'Ready to help?',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'midCtaCopy',
      title: 'Mid-Page CTA Copy',
      type: 'text',
      group: 'cards',
      rows: 2,
      initialValue:
        'This campaign runs on people, not PACs. Every dollar and every door knock makes a difference.',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'sectionCards',
      title: 'Section Cards',
      type: 'array',
      group: 'cards',
      description: 'Large cards below the hero (title, copy, link, icon).',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required().max(80),
            }),
            defineField({
              name: 'copy',
              title: 'Copy',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.required().max(160),
            }),
            defineField({
              name: 'href',
              title: 'Href',
              type: 'string',
              validation: (Rule) =>
                Rule.required().custom((value) => {
                  if (!value) return 'Href is required'
                  return value.startsWith('/') || value.startsWith('http')
                    ? true
                    : 'Use an internal path (/news) or full URL (https://...)'
                }),
            }),
            defineField({
              name: 'ctaLabel',
              title: 'CTA Label',
              type: 'string',
              initialValue: 'View',
              validation: (Rule) => Rule.max(50),
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {list: iconOptions},
              initialValue: 'newspaper',
            }),
          ],
        },
      ],
    }),

    // ── Proof & Credibility ──
    defineField({
      name: 'proofHeading',
      title: 'Proof Section Heading',
      type: 'string',
      group: 'proof',
      initialValue: "I didn't wait to run for office to start fighting for you.",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'proofStats',
      title: 'Proof Stats',
      type: 'array',
      group: 'proof',
      description: 'Up to 4 stat callouts (e.g. "81%" / "of Dubois County voters oppose MSC").',
      validation: (Rule) => Rule.max(4),
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (Rule) => Rule.required().max(16),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required().max(120),
            }),
          ],
          preview: {select: {title: 'value', subtitle: 'label'}},
        },
      ],
    }),
    defineField({
      name: 'proofBody',
      title: 'Proof Supporting Paragraph',
      type: 'text',
      group: 'proof',
      rows: 4,
      description: 'Supporting paragraph below the stats.',
      validation: (Rule) => Rule.max(500),
    }),

    // ── Countdown ──
    defineField({
      name: 'countdownTimers',
      title: 'Countdown Timers',
      type: 'array',
      group: 'countdown',
      description:
        'Add multiple countdown clocks. The nearest non-expired timer displays. Expired timers show the "expired" message.',
      of: [
        {
          type: 'object',
          title: 'Timer',
          fields: [
            defineField({
              name: 'enabled',
              title: 'Enabled',
              type: 'boolean',
              initialValue: true,
              description: 'Disable to hide this timer without deleting it.',
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              validation: (Rule) => Rule.required().max(80),
              description: 'Displayed above the clock (e.g. "Election Day").',
            }),
            defineField({
              name: 'targetDate',
              title: 'Target Date',
              type: 'datetime',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'array',
              description: 'Rich text below the active clock.',
              of: [
                {type: 'block'},
                {type: 'htmlEmbed'},
                {type: 'videoEmbed'},
                {type: 'ctaButton'},
                {type: 'pullQuote'},
                {type: 'infoBox'},
              ],
            }),
            defineField({
              name: 'expiredTitle',
              title: 'All-Done Title',
              type: 'string',
              validation: (Rule) => Rule.max(80),
              description: 'Heading shown after ALL timers have passed.',
            }),
            defineField({
              name: 'expiredBody',
              title: 'All-Done Message',
              type: 'array',
              description: 'Rich text shown after ALL timers have passed.',
              of: [
                {type: 'block'},
                {type: 'htmlEmbed'},
                {type: 'videoEmbed'},
                {type: 'ctaButton'},
                {type: 'pullQuote'},
                {type: 'infoBox'},
              ],
            }),
          ],
          preview: {
            select: {title: 'heading', subtitle: 'targetDate', enabled: 'enabled'},
            prepare({title, subtitle, enabled}) {
              const prefix = enabled === false ? '🚫 ' : ''
              const date = subtitle ? new Date(subtitle).toLocaleDateString() : 'No date'
              return {title: `${prefix}${title || '(untitled)'}`, subtitle: date}
            },
          },
        },
      ],
    }),

    // ── Feed Sections (News / Events / Media strips on the homepage) ──
    defineField({
      name: 'newsSectionEyebrow',
      title: 'News Section Eyebrow',
      type: 'string',
      group: 'feeds',
      description: 'Small label above the news section heading. Defaults to "Recent news".',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'newsSectionHeading',
      title: 'News Section Heading',
      type: 'string',
      group: 'feeds',
      description: 'Defaults to "Latest updates".',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'newsSectionIntro',
      title: 'News Section Intro',
      type: 'text',
      rows: 2,
      group: 'feeds',
      description: 'Short line under the news heading. Defaults to "Read the latest campaign posts and issue-focused announcements."',
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: 'eventsSectionEyebrow',
      title: 'Events Section Eyebrow',
      type: 'string',
      group: 'feeds',
      description: 'Small label above the events section heading. Defaults to "Upcoming events".',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'eventsSectionHeading',
      title: 'Events Section Heading',
      type: 'string',
      group: 'feeds',
      description: 'Defaults to "Meet us in the district". The section only appears when upcoming events exist.',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'eventsSectionCtaLabel',
      title: 'Events Section Button Label',
      type: 'string',
      group: 'feeds',
      description: 'Defaults to "View all events".',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'mediaSectionEyebrow',
      title: 'Media Section Eyebrow',
      type: 'string',
      group: 'feeds',
      description: 'Small label above the media section heading. Defaults to "Recent media".',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'mediaSectionHeading',
      title: 'Media Section Heading',
      type: 'string',
      group: 'feeds',
      description: 'Defaults to "Watch and share".',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'mediaSectionCtaLabel',
      title: 'Media Section Button Label',
      type: 'string',
      group: 'feeds',
      description: 'Defaults to "Browse media".',
      validation: (Rule) => Rule.max(60),
    }),

    // ── Visuals ──
    defineField({
      name: 'visuals',
      title: 'Page Visual Settings',
      type: 'pageVisuals',
      group: 'visuals',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Home Page Settings'}
    },
  },
})
