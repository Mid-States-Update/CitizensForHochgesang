'use client'

import {useMemo, useState, type ReactNode} from 'react'
import {PortableText, type PortableTextComponents} from '@portabletext/react'
import {FaChevronDown, FaChevronUp, FaSearch, FaShieldAlt, FaUsers} from 'react-icons/fa'

import type {FaqCategory, FaqItem} from '@/lib/cms/types'
import {sharedBlockTypes} from '@/components/portable-block-types'

type FaqAccordionProps = {
  items: FaqItem[]
}

const answerPTComponents: PortableTextComponents = {
  types: {...sharedBlockTypes},
}

const categories: Array<FaqCategory | 'All'> = ['All', 'Support', 'Events', 'Press', 'Trust']

const categoryIcon: Record<FaqCategory | 'All', ReactNode> = {
  All: <FaUsers aria-hidden />,
  Support: <FaUsers aria-hidden />,
  Events: <FaUsers aria-hidden />,
  Press: <FaShieldAlt aria-hidden />,
  Trust: <FaShieldAlt aria-hidden />,
}

export function FaqAccordion({items}: FaqAccordionProps) {
  const [activeCategory, setActiveCategory] = useState<FaqCategory | 'All'>('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  // Category filter pills only make sense when the content actually uses categories
  const hasCategories = useMemo(() => items.some((item) => item.category), [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory
      const query = searchTerm.trim().toLowerCase()

      if (!query) {
        return matchesCategory
      }

      return (
        matchesCategory &&
        (item.question.toLowerCase().includes(query) || item.answerText.toLowerCase().includes(query))
      )
    })
  }, [activeCategory, items, searchTerm])

  const allOpen = filteredItems.length > 0 && filteredItems.every((item) => openItems[item.question])

  const toggleAll = () => {
    const nextValue = !allOpen
    const nextState: Record<string, boolean> = {...openItems}

    filteredItems.forEach((item) => {
      nextState[item.question] = nextValue
    })

    setOpenItems(nextState)
  }

  return (
    <section className="grid gap-4">
      <div className="card flex flex-col gap-4">
        {hasCategories ? (
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`pill-badge ${activeCategory === category ? 'pill-badge-active' : ''}`}
              >
                {categoryIcon[category]}
                <span>{category}</span>
              </button>
            ))}
          </div>
        ) : null}
        <label className="search-field" htmlFor="faq-search">
          <FaSearch aria-hidden />
          <span className="sr-only">Search FAQs</span>
          <input
            id="faq-search"
            name="faq-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search questions..."
            className="min-w-0 flex-1 bg-transparent text-sm text-[color:var(--color-ink)] outline-none placeholder:text-[color:var(--color-muted)]"
          />
        </label>
        <div>
          <button type="button" className="btn btn-outline" onClick={toggleAll}>
            {allOpen ? <FaChevronUp aria-hidden /> : <FaChevronDown aria-hidden />}
            <span>{allOpen ? 'Collapse all' : 'Expand all'}</span>
          </button>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        filteredItems.map((item) => {
          const isOpen = Boolean(openItems[item.question])

          return (
            <article key={item.question} className="card reveal">
              <button
                type="button"
                onClick={() => setOpenItems((previous) => ({...previous, [item.question]: !isOpen}))}
                className="flex w-full items-center justify-between gap-4 text-left"
                aria-expanded={isOpen}
              >
                <h2 className="text-lg font-semibold text-[color:var(--color-ink)]">{item.question}</h2>
                {isOpen ? <FaChevronUp aria-hidden /> : <FaChevronDown aria-hidden />}
              </button>
              {isOpen ? (
                item.answerBody?.length ? (
                  <div className="faq-answer mt-3 text-sm text-[color:var(--color-muted)]">
                    <PortableText value={item.answerBody as never} components={answerPTComponents} />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[color:var(--color-muted)]">{item.answerText}</p>
                )
              ) : null}
            </article>
          )
        })
      ) : (
        <article className="card text-sm text-[color:var(--color-muted)]">
          No matching FAQs found. Try a different filter or search phrase.
        </article>
      )}
    </section>
  )
}
