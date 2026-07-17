export type SocialLink = {
  label: string
  url: string
}

export type PageVisibilityKey = 'news' | 'events' | 'faq' | 'platform' | 'media' | 'support'

export type PageVisibility = {
  [K in PageVisibilityKey]?: boolean
}

/**
 * Returns true when a page is explicitly enabled.
 * Falls back to `false` when visibility settings are missing or unset so
 * non-home pages stay disabled by default until configured in Studio.
 */
export function isPageEnabled(visibility: PageVisibility | undefined, key: PageVisibilityKey): boolean {
  if (!visibility) return false
  const value = visibility[key]
  return value === undefined ? false : value
}

export type IconName =
  | 'balance-scale'
  | 'bicycle'
  | 'book'
  | 'book-open'
  | 'briefcase'
  | 'bullhorn'
  | 'bullseye'
  | 'bus'
  | 'calendar'
  | 'calendar-check'
  | 'camera'
  | 'chart-bar'
  | 'chart-line'
  | 'chart-pie'
  | 'check-circle'
  | 'chalkboard-teacher'
  | 'clipboard-check'
  | 'clock'
  | 'cloud-sun'
  | 'coins'
  | 'comment-dots'
  | 'comments'
  | 'dollar-sign'
  | 'donate'
  | 'envelope'
  | 'exclamation-triangle'
  | 'file-alt'
  | 'flag'
  | 'gavel'
  | 'globe-americas'
  | 'graduation-cap'
  | 'hammer'
  | 'hand-holding-heart'
  | 'hands-helping'
  | 'handshake'
  | 'hard-hat'
  | 'heartbeat'
  | 'home'
  | 'hospital'
  | 'image'
  | 'info-circle'
  | 'landmark'
  | 'laptop'
  | 'leaf'
  | 'lightbulb'
  | 'map-marker-alt'
  | 'map-marked-alt'
  | 'microphone'
  | 'newspaper'
  | 'paw'
  | 'phone'
  | 'piggy-bank'
  | 'play-circle'
  | 'podcast'
  | 'question-circle'
  | 'receipt'
  | 'recycle'
  | 'reg-newspaper'
  | 'road'
  | 'route'
  | 'school'
  | 'shield-alt'
  | 'solar-panel'
  | 'store'
  | 'tools'
  | 'tree'
  | 'video'
  | 'vote-yea'
  | 'walking'
  | 'water'
  | 'wifi'
  | 'wrench'
  | 'user-friends'
  | 'user-graduate'
  | 'users'

export type SanityImageSource = {
  _type?: 'image'
  asset?: {
    _ref: string
    _type?: 'reference'
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
}

export type CountdownTimer = {
  enabled?: boolean
  heading?: string
  targetDate?: string | null
  body?: PostBodyNode[]
  expiredTitle?: string
  expiredBody?: PostBodyNode[]
}

export type SiteSettings = {
  siteTitle: string
  tagline: string
  homeLinkMarkup?: string
  campaignLogo?: SanityImageSource
  headerLogoSmall?: SanityImageSource
  campaignLogoUrl?: string
  headerLogoSmallUrl?: string
  campaignLogoAlt?: string
  headerNavItems: Array<{
    label: string
    href: string
    icon?: IconName
  }>
  pressUpdatedAt?: string
  donateUrl?: string
  volunteerUrl?: string
  contactEmail?: string
  socialLinks: SocialLink[]
  pageVisibility?: PageVisibility
}

/** Home page content — migrated from siteSettings. */
export type HomePageSettings = {
  heroLayout?: 'clean-split' | 'portrait-left' | 'immersive-overlay'
  candidatePortraitUrl?: string
  candidatePortraitAlt?: string
  candidatePortraitCaption?: string
  districtLabel?: string
  heroSummary?: string
  heroActions: Array<{
    label: string
    url: string
    icon?: IconName
    style?: 'primary' | 'outline' | 'accent'
  }>
  heroBadges: Array<{
    label: string
    url?: string
    icon?: IconName
    placement?: 'text' | 'media' | 'proof'
  }>
  focusItems: string[]
  whyRunningHeading?: string
  whyRunningBody?: PostBodyNode[]
  whyRunningImageUrl?: string
  proofHeading?: string
  proofStats?: Array<{ value: string; label: string }>
  proofBody?: string
  midCtaHeading?: string
  midCtaCopy?: string
  sectionCards: Array<{
    title: string
    copy: string
    href: string
    icon?: IconName
    ctaLabel?: string
  }>
  countdownTimers: CountdownTimer[]
  newsSectionEyebrow?: string
  newsSectionHeading?: string
  newsSectionIntro?: string
  eventsSectionEyebrow?: string
  eventsSectionHeading?: string
  eventsSectionCtaLabel?: string
  mediaSectionEyebrow?: string
  mediaSectionHeading?: string
  mediaSectionCtaLabel?: string
  visuals?: PageVisualSettings
}

export type MediaSettings = {
  pageHeading?: string
  pageIntro?: string
  contactIntro?: string
  contactName?: string
  contactTitle?: string
  contactPhone?: string
  pressAssetLinks: Array<{label: string; url: string}>
}

export type PageVisualPageKey =
  | 'home'
  | 'news'
  | 'news-detail'
  | 'events'
  | 'events-detail'
  | 'faq'
  | 'platform'
  | 'platform-detail'
  | 'media'
  | 'press'
  | 'support'

export type AboutPriorities = {
  pageEyebrow: string
  pageTitle: string
  pageIntro: string
  bioHeading: string
  bioBody: PostBodyNode[]
  valuesHeading: string
  values: string[]
  prioritiesHeading: string
  priorities: Array<{
    title: string
    slug: string
    summary: string
    body: PostBodyNode[]
    links: Array<{
      label: string
      url: string
    }>
  }>
  ctaHeading: string
  ctaCopy: string
  primaryCtaLabel: string
  primaryCtaUrl: string
  secondaryCtaLabel: string
  secondaryCtaUrl: string
}

export type PageVisualSettings = {
  pageKey: PageVisualPageKey
  backgroundVariant: 'stately-gradient' | 'civic-fabric' | 'diagonal-wash' | 'signal-grid' | 'topo-lines'
  containerVariant: 'standard' | 'narrow' | 'wide'
  toneVariant: 'default' | 'news' | 'events' | 'media' | 'support'
  motionPreset: 'still' | 'calm' | 'balanced' | 'lively' | 'energetic'
  textLinkAnimation: 'none' | 'subtle' | 'sweep' | 'glint'
  pageBackgroundAnimation: 'none' | 'drift' | 'tracers' | 'drift-tracers' | 'pulse'
  scrollRevealAnimation: 'none' | 'soft' | 'dynamic' | 'cascade'
  scrollProgressBar?: boolean
  magneticButtons?: boolean
}

export type PostSummary = {
  title: string
  slug: string
  excerpt?: string
  bodyPreview?: string
  coverImage?: SanityImageSource
  publishedAt: string
  coverImageUrl?: string
  newsCardLayout?: 'stacked' | 'image-left' | 'image-right' | 'feature-split' | 'no-photo'
  newsImageOrientation?: 'landscape' | 'portrait'
  newsImageAspectRatio?: '3:2' | '4:3' | '16:9' | '1:1' | '4:5' | '3:4' | '2:3' | '9:16'
  newsCardAnimation?: 'fade-up' | 'slide-up' | 'slide-left' | 'slide-right' | 'none'
  newsBodyPreviewChars?: number
  tags: string[]
}

export type PortableSpan = {
  _type: 'span'
  _key?: string
  text: string
  marks?: string[]
}

export type PortableLinkMarkDef = {
  _key: string
  _type: 'link'
  href: string
}

export type PortableBlock = {
  _type: 'block'
  _key?: string
  style?: string
  children: PortableSpan[]
  markDefs?: PortableLinkMarkDef[]
}

export type StorySceneLayout = 'text' | 'split-left' | 'split-right' | 'highlight'

export type StorySceneAnimation = 'none' | 'fade-up' | 'slide-left' | 'slide-right' | 'zoom-soft'

export type StorySceneBody = {
  _type: 'storyScene'
  _key?: string
  sceneTitle?: string
  layout?: StorySceneLayout
  animationPreset?: StorySceneAnimation
  animationDelayMs?: number
  animationDurationMs?: number
  body: PortableBlock[]
  mediaUrl?: string
  mediaAlt?: string
}

export type StatCalloutItem = {
  _key?: string
  value: string
  label: string
  note?: string
}

export type StatCalloutBody = {
  _type: 'statCallout'
  _key?: string
  headline: string
  animationPreset?: StorySceneAnimation
  animationDelayMs?: number
  animationDurationMs?: number
  items: StatCalloutItem[]
}

export type ImageBody = {
  _type: 'image'
  _key?: string
  alt?: string
  asset?: {
    url?: string
  }
}

export type PostBodyNode = PortableBlock | StorySceneBody | StatCalloutBody | ImageBody

export type PostDetail = PostSummary & {
  body: PostBodyNode[]
  storyTimeline?: Array<StorySceneBody | StatCalloutBody>
}

export type CampaignEvent = {
  id: string
  title: string
  slug: string
  startDate: string
  endDate?: string
  location: string
  description?: string
  detailBody?: PostBodyNode[]
  detailLinks?: Array<{
    label: string
    url: string
  }>
  scheduleImage?: SanityImageSource
  rsvpLink?: string
  scheduleImageUrl?: string
  eventCardLayout?: 'stacked' | 'image-left' | 'image-right' | 'feature-split' | 'no-photo'
  eventImageOrientation?: 'landscape' | 'portrait'
  eventImageAspectRatio?: '3:2' | '4:3' | '16:9' | '1:1' | '4:5' | '3:4' | '2:3' | '9:16'
  eventCardAnimation?: 'fade-up' | 'slide-up' | 'slide-left' | 'slide-right' | 'none'
  eventDescriptionPreviewChars?: number
  tags: string[]
}

export type MediaType = 'youtube' | 'facebook' | 'audio' | 'other'

export type MediaLink = {
  id: string
  title: string
  mediaType: MediaType
  url: string
  description?: string
  publishedAt?: string
  thumbnailUrl?: string
  highlight?: boolean
  highlightNote?: string
}

export type FundraisingLink = {
  id: string
  title: string
  url: string
  description?: string
  imageUrl?: string
  priority: number
}

export type FaqCategory = 'Support' | 'Events' | 'Press' | 'Trust'

export type FaqItem = {
  question: string
  /** Plain-text answer used for search filtering (and rendering when answerBody is absent). */
  answerText: string
  /** Portable Text answer blocks — preserves bold/links when present. */
  answerBody?: unknown[]
  category?: FaqCategory
}

// ── Interactive Map types ──

export type MapProjection = {
  originLon: number
  originLat: number
  scaleX: number
  scaleY: number
  offsetX: number
  offsetY: number
}

export type MapViewport = {
  x: number
  y: number
  width: number
  height: number
}

export type MapRegionData = {
  _key?: string
  name: string
  regionKey?: string
  coordinatesJson: string
  centroid?: string
  fillColor?: string
  strokeColor?: string
  strokeWidth?: number
  strokeStyle?: 'solid' | 'dashed' | 'dotted'
  popupTitle?: string
  popupBody?: PostBodyNode[]
  popupLinkLabel?: string
  popupLinkUrl?: string
}

export type MapLayerData = {
  _key?: string
  label: string
  layerId: string
  visible?: boolean
  minZoomWidth?: number
  defaultFillColor?: string
  defaultStrokeColor?: string
  defaultStrokeWidth?: number
  defaultStrokeStyle?: 'solid' | 'dashed' | 'dotted'
  regions?: MapRegionData[]
}

export type MapOverlayData = {
  _key?: string
  label: string
  coordinatesJson: string
  strokeColor?: string
  strokeWidth?: number
  strokeStyle?: 'solid' | 'dashed' | 'dotted'
  opacity?: number
  popupTitle?: string
  popupBody?: PostBodyNode[]
  popupLinkLabel?: string
  popupLinkUrl?: string
}

export type MapPinData = {
  _key?: string
  label: string
  longitude: number
  latitude: number
  color?: string
  size?: 'sm' | 'md' | 'lg'
  popupTitle?: string
  popupBody?: PostBodyNode[]
  popupLinkLabel?: string
  popupLinkUrl?: string
}

export type InteractiveMapData = {
  _id: string
  title: string
  slug: string
  description?: string
  projection?: MapProjection
  defaultViewport?: MapViewport
  layers?: MapLayerData[]
  overlays?: MapOverlayData[]
  pins?: MapPinData[]
  height?: number
  accentColor?: string
  enableZoom?: boolean
  enableAnimation?: boolean
  animationPreset?: 'none' | 'district48' | 'fadeIn' | 'drawOutline'
}

export type MapEmbedData = {
  _key?: string
  _type: 'mapEmbed'
  map?: InteractiveMapData
  caption?: string
  heightOverride?: number
}
