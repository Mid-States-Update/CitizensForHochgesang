import type {StructureResolver} from 'sanity/structure'

import {VisualQuickGuide} from './components/visual-quick-guide'

/**
 * Helper: singleton document list item — creates one document of `typeName`
 * with a fixed documentId equal to the type name.
 */
function singletonItem(S: Parameters<StructureResolver>[0], typeName: string, title: string) {
  return S.listItem()
    .title(title)
    .child(S.document().schemaType(typeName).documentId(typeName))
}

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('Campaign Content')
    .items([
      singletonItem(S, 'siteSettings', 'Site Settings'),
      singletonItem(S, 'aboutPriorities', 'About & Priorities'),
      S.divider(),
      // ── Page Settings (per-page content & visuals) ──
      S.listItem()
        .title('Page Settings')
        .child(
          S.list()
            .title('Page Settings')
            .items([
              singletonItem(S, 'homePageSettings', 'Home'),
              singletonItem(S, 'newsPageSettings', 'News'),
              singletonItem(S, 'eventsPageSettings', 'Events'),
              singletonItem(S, 'platformPageSettings', 'Platform'),
              singletonItem(S, 'mediaPageSettings', 'Media'),
              singletonItem(S, 'supportPageSettings', 'Support'),
              singletonItem(S, 'faqPageSettings', 'FAQ'),
            ]),
        ),
      S.divider(),
      S.listItem().title('Posts').child(S.documentTypeList('post')),
      S.listItem().title('Events').child(S.documentTypeList('event')),
      S.listItem()
        .title('FAQs')
        .child(S.documentTypeList('faq').defaultOrdering([{field: 'orderRank', direction: 'asc'}])),
      S.listItem()
        .title('County Pages')
        .child(
          S.documentTypeList('countyPage').defaultOrdering([{field: 'orderRank', direction: 'asc'}]),
        ),
      S.listItem()
        .title('City Pages')
        .child(
          S.documentTypeList('cityPage').defaultOrdering([
            {field: 'countySlug', direction: 'asc'},
            {field: 'orderRank', direction: 'asc'},
          ]),
        ),
      S.listItem()
        .title('Media & Press')
        .child(
          S.list()
            .title('Media & Press')
            .items([
              S.listItem()
                .title('Page Settings')
                .child(S.document().schemaType('mediaSettings').documentId('mediaSettings')),
              S.divider(),
              S.listItem()
                .title('Media Links')
                .child(S.documentTypeList('mediaLink')),
            ]),
        ),
      S.listItem().title('Fundraising Links').child(S.documentTypeList('fundraisingLink')),
      S.listItem().title('Interactive Maps').child(S.documentTypeList('interactiveMap')),
      S.divider(),
      S.listItem()
        .title('Visual Preset Quick Guide')
        .child(S.component(VisualQuickGuide).title('Visual Preset Quick Guide')),
    ])
