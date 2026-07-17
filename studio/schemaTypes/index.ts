import {aboutPriorities} from './aboutPriorities'
import {cityPage} from './cityPage'
import {countyPage} from './countyPage'
import {ctaButton} from './ctaButton'
import {issueCard} from './issueCard'
import {event} from './event'
import {eventsPageSettings} from './eventsPageSettings'
import {faq} from './faq'
import {faqPageSettings} from './faqPageSettings'
import {fundraisingLink} from './fundraisingLink'
import {homePageSettings} from './homePageSettings'
import {htmlEmbed} from './htmlEmbed'
import {infoBox} from './infoBox'
import {interactiveMap} from './interactiveMap'
import {mapEmbed} from './mapEmbed'
import {mapRegionPopup} from './mapRegionPopup'
import {mediaLink} from './mediaLink'
import {mediaPageSettings} from './mediaPageSettings'
import {mediaSettings} from './mediaSettings'
import {newsPageSettings} from './newsPageSettings'
import {pageVisuals} from './pageVisuals'
import {pageVisualSettings} from './pageVisualSettings'
import {platformPageSettings} from './platformPageSettings'
import {post} from './post'
import {pullQuote} from './pullQuote'
import {siteSettings} from './siteSettings'
import {supportPageSettings} from './supportPageSettings'
import {videoEmbed} from './videoEmbed'

export const schemaTypes = [
  // Shared object types
  pageVisuals,
  issueCard,
  // Singletons
  siteSettings,
  aboutPriorities,
  homePageSettings,
  newsPageSettings,
  eventsPageSettings,
  platformPageSettings,
  mediaPageSettings,
  supportPageSettings,
  faqPageSettings,
  // Legacy (kept for backward compat — no desk item)
  pageVisualSettings,
  // Document types
  post,
  event,
  faq,
  countyPage,
  cityPage,
  interactiveMap,
  mapRegionPopup,
  mediaLink,
  mediaSettings,
  fundraisingLink,
  // Portable Text types
  mapEmbed,
  htmlEmbed,
  videoEmbed,
  ctaButton,
  pullQuote,
  infoBox,
]
