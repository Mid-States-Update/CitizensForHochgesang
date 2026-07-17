import type {CSSProperties} from 'react'
import Image from 'next/image'
import {PortableText, type PortableTextComponents} from '@portabletext/react'

import {CmsLink} from '@/components/cms-link'
import {mapEmbedBlockType} from '@/components/map-embed-block-type'
import {sharedBlockTypes} from '@/components/portable-block-types'
import type {PostBodyNode, StatCalloutItem, StorySceneAnimation, StorySceneLayout} from '@/lib/cms/types'

type ArticleContentProps = {
  body: PostBodyNode[]
  /**
   * 'grid' (default) stacks blocks with a fixed gap. 'flow' renders normal
   * block flow so prose can wrap around a floated image placed beside it.
   */
  layout?: 'grid' | 'flow'
}

function clamp(value: number | undefined, min: number, max: number, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }

  return Math.min(max, Math.max(min, value))
}

function sceneStyle(delayMs?: number, durationMs?: number): CSSProperties {
  return {
    ['--scene-delay' as string]: `${clamp(delayMs, 0, 900, 0)}ms`,
    ['--scene-duration' as string]: `${clamp(durationMs, 300, 1600, 760)}ms`,
  }
}

function sceneAnimationClass(value: StorySceneAnimation | undefined): string {
  switch (value) {
    case 'none':
      return 'scene-anim-none'
    case 'slide-left':
      return 'scene-anim-slide-left'
    case 'slide-right':
      return 'scene-anim-slide-right'
    case 'zoom-soft':
      return 'scene-anim-zoom-soft'
    case 'fade-up':
    default:
      return 'scene-anim-fade-up'
  }
}

function sceneLayoutClass(value: StorySceneLayout | undefined): string {
  switch (value) {
    case 'split-left':
      return 'scene-layout-split-left'
    case 'split-right':
      return 'scene-layout-split-right'
    case 'highlight':
      return 'scene-layout-highlight'
    case 'text':
    default:
      return 'scene-layout-text'
  }
}

const sceneBodyComponents: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="text-sm leading-7 text-[color:var(--color-ink)]">{children}</p>,
    h3: ({children}) => <h3 className="text-xl font-semibold text-[color:var(--color-ink)]">{children}</h3>,
  },
  marks: {
    link: ({children, value}) => {
      const href = typeof value?.href === 'string' ? value.href : '#'
      return (
        <CmsLink className="link-soft" href={href}>
          {children}
        </CmsLink>
      )
    },
  },
  types: {
    ...sharedBlockTypes,
    ...mapEmbedBlockType,
    htmlEmbed: ({value}: {value: {html?: string}}) => {
      if (!value?.html) return null
      return <div className="portable-html-embed" dangerouslySetInnerHTML={{__html: value.html}} />
    },
  },
}

const articleComponents: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="text-base leading-8 text-[color:var(--color-ink)]">{children}</p>,
    h2: ({children}) => <h2 className="mt-8 text-2xl font-semibold text-[color:var(--color-ink)]">{children}</h2>,
    h3: ({children}) => <h3 className="mt-6 text-xl font-semibold text-[color:var(--color-ink)]">{children}</h3>,
    blockquote: ({children}) => (
      <blockquote className="rounded-2xl border-l-4 border-[color:var(--color-accent)] bg-[color:var(--color-highlight)]/35 px-5 py-4 text-[color:var(--color-ink)]">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({children, value}) => {
      const href = typeof value?.href === 'string' ? value.href : '#'
      return (
        <CmsLink className="link-soft" href={href}>
          {children}
        </CmsLink>
      )
    },
  },
  types: {
    ...sharedBlockTypes,
    ...mapEmbedBlockType,
    htmlEmbed: ({value}: {value: {html?: string}}) => {
      if (!value?.html) return null
      return <div className="portable-html-embed" dangerouslySetInnerHTML={{__html: value.html}} />
    },
    image: ({value}) => {
      const imageUrl = typeof value?.asset?.url === 'string' ? value.asset.url : undefined
      if (!imageUrl) {
        return null
      }

      const alt = typeof value?.alt === 'string' && value.alt.trim().length > 0 ? value.alt : 'Article image'

      return (
        <figure className="story-image">
          <Image
            src={imageUrl}
            alt={alt}
            width={1600}
            height={900}
            className="h-auto w-full object-cover"
            unoptimized
          />
        </figure>
      )
    },
    storyScene: ({value}) => {
      const layoutClass = sceneLayoutClass(value?.layout)
      const animationClass = sceneAnimationClass(value?.animationPreset)
      const mediaUrl = typeof value?.mediaUrl === 'string' ? value.mediaUrl : undefined
      const mediaAlt = typeof value?.mediaAlt === 'string' && value.mediaAlt.trim().length > 0 ? value.mediaAlt : 'Scene media'

      return (
        <section
          data-story-scene="true"
          className={`story-scene ${layoutClass} ${animationClass}`}
          style={sceneStyle(value?.animationDelayMs, value?.animationDurationMs)}
        >
          <div className="story-scene-content">
            {value?.sceneTitle ? <h3 className="story-scene-title">{value.sceneTitle}</h3> : null}
            <div className="grid gap-4">
              <PortableText value={Array.isArray(value?.body) ? value.body : []} components={sceneBodyComponents} />
            </div>
          </div>
          {mediaUrl ? (
            <div className="story-scene-media">
              <Image
                src={mediaUrl}
                alt={mediaAlt}
                width={1200}
                height={800}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
          ) : null}
        </section>
      )
    },
    statCallout: ({value}) => {
      const animationClass = sceneAnimationClass(value?.animationPreset)
      const items: StatCalloutItem[] = Array.isArray(value?.items) ? (value.items as StatCalloutItem[]) : []

      if (!value?.headline || items.length === 0) {
        return null
      }

      return (
        <section
          data-story-scene="true"
          className={`story-scene story-stat ${animationClass}`}
          style={sceneStyle(value?.animationDelayMs, value?.animationDurationMs)}
        >
          <h3 className="story-scene-title">{value.headline}</h3>
          <div className="story-stat-grid">
            {items.map((item) => (
              <article key={item._key ?? `${item.value}-${item.label}`} className="story-stat-item">
                <p className="story-stat-value">{item.value}</p>
                <p className="story-stat-label">{item.label}</p>
                {item.note ? <p className="story-stat-note">{item.note}</p> : null}
              </article>
            ))}
          </div>
        </section>
      )
    },
  },
}

export function ArticleContent({body, layout = 'grid'}: ArticleContentProps) {
  const layoutClasses =
    layout === 'flow'
      ? 'article-experience article-experience-flow text-[color:var(--color-ink)]'
      : 'article-experience grid gap-5 text-[color:var(--color-ink)]'

  return (
    <div className={layoutClasses}>
      <PortableText value={body} components={articleComponents} />
    </div>
  )
}
