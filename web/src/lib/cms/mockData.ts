import {
  type AboutPriorities,
  type CampaignEvent,
  type FaqItem,
  type FundraisingLink,
  type HomePageSettings,
  type MediaLink,
  type PostDetail,
  type SiteSettings,
} from './types'

export const mockAboutPriorities: AboutPriorities = {
  pageEyebrow: 'About & Priorities',
  pageTitle: 'Who Brad is and what this campaign stands for',
  pageIntro:
    'A practical, community-first campaign for Indiana State Senate District 48 focused on everyday issues voters feel directly.',
  bioHeading: 'Candidate bio',
  bioBody: [
    {
      _type: 'block',
      children: [
        {
          _type: 'span',
          text: 'Brad Hochgesang is running to bring practical, transparent leadership to District 48. This campaign is built on direct conversations with neighbors, clear public updates, and policy priorities grounded in day-to-day realities for Indiana families.',
        },
      ],
    },
    {
      _type: 'block',
      children: [
        {
          _type: 'span',
          text: 'The focus is simple: listen first, act with accountability, and deliver measurable progress in jobs, education, public safety, and constituent service.',
        },
      ],
    },
  ],
  valuesHeading: 'Campaign values',
  values: [
    'Community-first decision making',
    'Honest communication and transparency',
    'Practical policy over partisan noise',
  ],
  prioritiesHeading: 'Core priorities',
  priorities: [
    {
      title: 'Jobs and local economic growth',
      slug: 'jobs-and-local-economic-growth',
      summary:
        'Support small businesses, strengthen workforce training pipelines, and focus state policy on practical growth for local families.',
      body: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'District 48 needs practical economic policy that helps local employers hire and grow without unnecessary friction.',
            },
          ],
        },
      ],
      links: [
        {label: 'Small business updates', url: '/news'},
      ],
    },
    {
      title: 'Safe communities and responsive services',
      slug: 'safe-communities-and-responsive-services',
      summary:
        'Invest in prevention, emergency readiness, and constituent services that are transparent, fast, and accountable.',
      body: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Public safety works best when prevention, rapid response, and neighborhood trust are designed to work together.',
            },
          ],
        },
      ],
      links: [
        {label: 'Community events', url: '/events'},
      ],
    },
    {
      title: 'Education and opportunity',
      slug: 'education-and-opportunity',
      summary:
        'Back strong schools, career-ready pathways, and family-focused education choices that prepare students for real-world success.',
      body: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Students and families deserve education systems that connect classrooms, career pathways, and local employers.',
            },
          ],
        },
      ],
      links: [
        {label: 'Read education updates', url: '/news'},
      ],
    },
  ],
  ctaHeading: 'Get involved',
  ctaCopy:
    'Want to help shape these priorities and move them forward? Join the campaign, attend events, and share your input directly.',
  primaryCtaLabel: 'Volunteer & donate',
  primaryCtaUrl: '/support',
  secondaryCtaLabel: 'Attend an event',
  secondaryCtaUrl: '/events',
}

export const mockSiteSettings: SiteSettings = {
  siteTitle: 'Citizens For Hochgesang',
  tagline: 'Practical leadership for Indiana State Senate District 48.',
  homeLinkMarkup:
    '<span class="home-link-line">Brad Hochgesang</span><span class="home-link-line">For State Senate</span>',
  campaignLogoAlt: 'Brad Hochgesang for State Senate campaign logo',
  headerNavItems: [
    {label: 'News', href: '/news', icon: 'newspaper'},
    {label: 'Events', href: '/events', icon: 'calendar'},
    {label: 'About & Priorities', href: '/platform', icon: 'user-friends'},
    {label: 'FAQ', href: '/faq', icon: 'question-circle'},
    {label: 'Media & Press', href: '/media', icon: 'video'},
    {label: 'Support', href: '/support', icon: 'hands-helping'},
  ],
  donateUrl: 'https://secure.actblue.com/donate/brad-hochgesang-1',
  volunteerUrl: 'https://www.ngpvan.com/',
  contactEmail: 'team@citizensforhochgesang.com',
  socialLinks: [
    {label: 'Facebook', url: 'https://www.facebook.com/bradhochesangforindianastatesenate'},
    {label: 'YouTube', url: 'https://www.youtube.com/'},
  ],
  pageVisibility: {
    news: false,
    events: false,
    faq: false,
    platform: false,
    media: false,
    support: false,
  },
}

export const mockHomePageSettings: HomePageSettings = {
  heroLayout: 'clean-split',
  districtLabel: 'Indiana State Senate District 48',
  heroSummary: 'Practical leadership for Indiana State Senate District 48.',
  candidatePortraitCaption: 'Listening to neighbors and building practical solutions for District 48.',
  heroActions: [
    {label: 'Volunteer', url: '/support', icon: 'hands-helping', style: 'primary'},
    {label: 'Donate', url: 'https://secure.actblue.com/donate/brad-hochgesang-1', icon: 'vote-yea', style: 'outline'},
  ],
  heroBadges: [
    {label: 'Community-first platform', icon: 'bullhorn', placement: 'text'},
    {label: 'Transparent updates', icon: 'newspaper', placement: 'text'},
    {label: 'District listening sessions', placement: 'proof'},
    {label: 'Neighborhood town halls', placement: 'proof'},
    {label: 'Volunteer-powered outreach', placement: 'proof'},
  ],
  focusItems: [
    'Strengthening local jobs, small businesses, and workforce training.',
    'Supporting safe communities through partnerships and smart policy.',
    'Protecting quality education and practical pathways for families.',
  ],
  sectionCards: [
    {
      title: 'News & Updates',
      copy: 'Campaign announcements and policy updates.',
      href: '/news',
      icon: 'newspaper',
      ctaLabel: 'View News & Updates',
    },
    {
      title: 'Events',
      copy: 'Town halls, meetups, and district listening sessions.',
      href: '/events',
      icon: 'calendar',
      ctaLabel: 'View Events',
    },
    {
      title: 'Media',
      copy: 'Video, interviews, and social coverage in one feed.',
      href: '/media',
      icon: 'video',
      ctaLabel: 'View Media',
    },
  ],
  whyRunningHeading: "Why I'm Running",
  whyRunningBody: [],
  whyRunningImageUrl: undefined,
  proofHeading: "I didn't wait to run for office to start fighting for you.",
  proofStats: [],
  proofBody: '',
  midCtaHeading: 'Ready to help?',
  midCtaCopy:
    'This campaign runs on people, not PACs. Every dollar and every door knock makes a difference.',
  countdownTimers: [],
  newsSectionEyebrow: 'Recent news',
  newsSectionHeading: 'Latest updates',
  newsSectionIntro: 'Read the latest campaign posts and issue-focused announcements.',
  eventsSectionEyebrow: 'Upcoming events',
  eventsSectionHeading: 'Meet us in the district',
  eventsSectionCtaLabel: 'View all events',
  mediaSectionEyebrow: 'Recent media',
  mediaSectionHeading: 'Watch and share',
  mediaSectionCtaLabel: 'Browse media',
}

export const mockPosts: PostDetail[] = [
  {
    title: 'Launching an AI-First Campaign for District 48',
    slug: 'launching-an-ai-first-campaign',
    excerpt:
      'How we are using practical automation to communicate clearly, respond faster, and stay focused on local priorities.',
    publishedAt: '2026-02-10T12:00:00.000Z',
    coverImageUrl: '/news-samples/landscape-16x9.svg',
    bodyPreview:
      'This campaign is built on direct community engagement and modern tools. We use AI to accelerate drafting, content operations, and issue research while keeping people in control of every public message. Residents can quickly review where we stand, what we are hearing, and what policy actions we are prioritizing next.',
    newsCardLayout: 'feature-split',
    newsImageOrientation: 'landscape',
    newsImageAspectRatio: '16:9',
    newsCardAnimation: 'fade-up',
    newsBodyPreviewChars: 460,
    tags: ['campaign', 'technology'],
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'This campaign is built on direct community engagement and modern tools.',
          },
        ],
      },
    ],
    storyTimeline: [
      {
        _type: 'storyScene',
        sceneTitle: 'Technology in service of people',
        layout: 'highlight',
        animationPreset: 'fade-up',
        animationDelayMs: 0,
        animationDurationMs: 760,
        body: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'We use AI to accelerate drafting, content operations, and issue research while keeping people in control of every public message.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Public Safety and Infrastructure Listening Tour',
    slug: 'public-safety-and-infrastructure-listening-tour',
    excerpt:
      'A district-wide effort to gather local concerns about roads, emergency response, and neighborhood safety.',
    publishedAt: '2026-02-08T16:00:00.000Z',
    coverImageUrl: '/news-samples/portrait-4x5.svg',
    bodyPreview:
      'Residents have shared practical ideas on traffic flow, road maintenance, and response times. We are collecting neighborhood-level feedback, identifying recurring safety themes, and publishing clear next-step priorities after each stop so supporters and undecided voters alike can follow progress without guesswork.',
    newsCardLayout: 'image-left',
    newsImageOrientation: 'portrait',
    newsImageAspectRatio: '4:5',
    newsCardAnimation: 'slide-left',
    newsBodyPreviewChars: 420,
    tags: ['public safety', 'infrastructure'],
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Residents have shared practical ideas on traffic flow, road maintenance, and response times.',
          },
        ],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'These comments are shaping our legislative priorities.',
          },
        ],
      },
    ],
  },
  {
    title: 'Economic Growth Through Small Business Support',
    slug: 'economic-growth-through-small-business-support',
    excerpt:
      'Policy priorities to reduce red tape, support local employers, and keep investment in District 48.',
    publishedAt: '2026-02-05T18:00:00.000Z',
    coverImageUrl: '/news-samples/landscape-3x2.svg',
    bodyPreview:
      'Small businesses are the engine of local growth. Our plan focuses on permitting improvements, workforce partnerships, and predictable state policy. We are also gathering concrete examples from district employers to prioritize legislation that reduces delays while improving hiring pathways for students and workers.',
    newsCardLayout: 'image-right',
    newsImageOrientation: 'landscape',
    newsImageAspectRatio: '3:2',
    newsCardAnimation: 'slide-right',
    newsBodyPreviewChars: 440,
    tags: ['economy', 'small business'],
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Small businesses are the engine of local growth.',
          },
        ],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Our plan focuses on permitting improvements, workforce partnerships, and predictable state policy.',
          },
        ],
      },
    ],
  },
  {
    title: 'Education Roundtable Highlights from District Families',
    slug: 'education-roundtable-highlights',
    excerpt:
      'Parents, teachers, and students shared practical priorities around classroom focus, career pathways, and school support resources.',
    publishedAt: '2026-02-04T17:00:00.000Z',
    coverImageUrl: '/news-samples/portrait-9x16.svg',
    bodyPreview:
      'Family conversations highlighted a consistent theme: schools need stronger support systems and clearer career pathways. Participants requested practical collaboration between classrooms, local employers, and technical programs so graduates can move confidently into college or skilled work opportunities.',
    newsCardLayout: 'stacked',
    newsImageOrientation: 'portrait',
    newsImageAspectRatio: '9:16',
    newsCardAnimation: 'slide-up',
    newsBodyPreviewChars: 420,
    tags: ['education', 'families'],
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Family conversations highlighted a consistent theme: schools need stronger support systems and clearer career pathways.',
          },
        ],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Participants requested practical collaboration between classrooms, local employers, and technical programs.',
          },
        ],
      },
    ],
  },
  {
    title: 'Volunteer Spotlight: Neighborhood Outreach Weekend',
    slug: 'volunteer-spotlight-neighborhood-outreach',
    excerpt:
      'Supporters coordinated canvassing, voter check-ins, and event signups across key neighborhoods in District 48.',
    publishedAt: '2026-02-03T19:00:00.000Z',
    coverImageUrl: '/news-samples/square-1x1.svg',
    bodyPreview:
      'Volunteer teams helped deliver campaign materials, shared event details, and answered questions from new voters. The outreach weekend reinforced that consistent neighborhood conversations are the best way to align campaign priorities with day-to-day concerns across Jeffersonville and surrounding communities.',
    newsCardLayout: 'image-left',
    newsImageOrientation: 'landscape',
    newsImageAspectRatio: '1:1',
    newsCardAnimation: 'none',
    newsBodyPreviewChars: 430,
    tags: ['volunteer', 'community'],
    body: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Volunteer teams helped deliver campaign materials, shared event details, and answered questions from new voters.',
          },
        ],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The outreach weekend reinforced that consistent neighborhood conversations are the best way to align campaign priorities with day-to-day concerns.',
          },
        ],
      },
    ],
  },
]

export const mockEvents: CampaignEvent[] = [
  {
    id: 'event-town-hall-1',
    slug: 'district-48-community-town-hall',
    title: 'District 48 Community Town Hall',
    startDate: '2026-02-20T23:00:00.000Z',
    endDate: '2026-02-21T01:00:00.000Z',
    location: 'Jeffersonville Public Library',
    description:
      'Open Q&A focused on local transportation, schools, and small business policy. Residents can share priorities directly with the campaign team and receive updates on how feedback shapes policy plans.',
    rsvpLink: '/support',
    scheduleImageUrl: '/news-samples/landscape-16x9.svg',
    eventCardLayout: 'feature-split',
    eventImageOrientation: 'landscape',
    eventImageAspectRatio: '16:9',
    eventCardAnimation: 'fade-up',
    eventDescriptionPreviewChars: 420,
    detailBody: [
      {
        _type: 'block',
        children: [{_type: 'span', text: 'Join this open forum to share district priorities and hear campaign policy updates.'}],
      },
      {
        _type: 'block',
        children: [{_type: 'span', text: 'Topics include transportation, school funding, neighborhood safety, and constituent services.'}],
      },
    ],
    detailLinks: [
      {label: 'Volunteer opportunities', url: '/support'},
      {label: 'Latest campaign news', url: '/news'},
    ],
    tags: ['town hall', 'transportation', 'education'],
  },
  {
    id: 'event-meet-and-greet-1',
    slug: 'coffee-and-conversation',
    title: 'Coffee and Conversation',
    startDate: '2026-02-24T14:30:00.000Z',
    endDate: '2026-02-24T16:00:00.000Z',
    location: 'Charlestown Civic Center',
    description:
      'Informal meet-and-greet with campaign volunteers and supporters. This session emphasizes neighborhood concerns, local service priorities, and direct constituent engagement.',
    scheduleImageUrl: '/news-samples/portrait-4x5.svg',
    eventCardLayout: 'image-left',
    eventImageOrientation: 'portrait',
    eventImageAspectRatio: '4:5',
    eventCardAnimation: 'slide-left',
    eventDescriptionPreviewChars: 420,
    detailBody: [
      {
        _type: 'block',
        children: [{_type: 'span', text: 'An informal neighborhood event designed for one-on-one conversation with voters.'}],
      },
    ],
    detailLinks: [{label: 'Campaign support', url: '/support'}],
    tags: ['community', 'meet-and-greet'],
  },
  {
    id: 'event-workforce-listening-session',
    slug: 'workforce-listening-session',
    title: 'Workforce Listening Session',
    startDate: '2026-03-01T22:00:00.000Z',
    endDate: '2026-03-01T23:30:00.000Z',
    location: 'Clarksville Workforce Center',
    description:
      'Conversation with local employers, job seekers, and educators about workforce training, credential pathways, and practical state support for small and mid-sized businesses.',
    eventCardLayout: 'no-photo',
    eventImageOrientation: 'landscape',
    eventImageAspectRatio: '3:2',
    eventCardAnimation: 'none',
    eventDescriptionPreviewChars: 1600,
    detailBody: [
      {
        _type: 'block',
        children: [{_type: 'span', text: 'This session focuses on workforce pipelines, practical credentialing pathways, and job access barriers.'}],
      },
    ],
    detailLinks: [{label: 'Economic priorities', url: '/platform/jobs-and-local-economic-growth'}],
    tags: ['jobs', 'small business', 'training'],
  },
]

export const mockMediaLinks: MediaLink[] = [
  {
    id: 'media-youtube-1',
    title: 'Campaign Kickoff Address',
    mediaType: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    publishedAt: '2026-02-09T19:00:00.000Z',
  },
  {
    id: 'media-facebook-1',
    title: 'Volunteer Update on Facebook',
    mediaType: 'facebook',
    url: 'https://www.facebook.com/',
    publishedAt: '2026-02-07T20:00:00.000Z',
  },
]

export const mockFaqs: FaqItem[] = [
  {
    question: 'How can I volunteer?',
    answerText:
      'Visit the Support page and use the volunteer sign-up link to join campaign outreach and event support.',
    category: 'Support',
  },
  {
    question: 'Where can I find upcoming events?',
    answerText: 'The Events page lists upcoming public events, locations, and RSVP links.',
    category: 'Events',
  },
  {
    question: 'Where can press access campaign resources?',
    answerText: 'The Press page includes media contact details, logo assets, and recent public updates.',
    category: 'Press',
  },
  {
    question: 'How can I verify information posted on the website?',
    answerText:
      'The campaign maintains source-oriented documentation in repository markdown files and updates content through Sanity Studio.',
    category: 'Trust',
  },
  {
    question: 'How do I verify or update my voter registration?',
    answerText:
      'Use the Indiana voter portal linked from the Support page to check registration status, find polling locations, and confirm district information.',
    category: 'Support',
  },
  {
    question: 'How can I find district boundary information?',
    answerText:
      'Visit the Support page for an embedded district map and official district lookup tools from Indiana resources.',
    category: 'Events',
  },
]

export const mockFundraisingLinks: FundraisingLink[] = [
  {
    id: 'fund-actblue-main',
    title: 'Donate with ActBlue',
    url: 'https://secure.actblue.com/donate/brad-hochgesang-1',
    description: 'Secure online contribution for campaign operations and voter outreach.',
    priority: 100,
  },
]
