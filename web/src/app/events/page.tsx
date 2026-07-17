import {EventsFeed} from '@/components/events-feed'
import {PageEffects} from '@/components/page-effects'
import {getPageShellClasses, getPageShellDataAttributes} from '@/lib/cms/page-visuals'
import {assertPageEnabled, getAllEvents, getPageVisualSettings} from '@/lib/cms/repository'

export const metadata = {
  title: 'Events',
  description: 'Upcoming campaign events, town halls, and community meetups.',
}

export default async function EventsPage() {
  await assertPageEnabled('events')
  const [events, pageVisualSettings] = await Promise.all([getAllEvents(), getPageVisualSettings('events')])

  return (
    <main className={getPageShellClasses(pageVisualSettings)} {...getPageShellDataAttributes(pageVisualSettings)}>
      <PageEffects visuals={pageVisualSettings} />
      <section className="flex flex-col gap-4">
        <p className="eyebrow">Events</p>
        <h1 className="section-title">Upcoming campaign events</h1>
        <p className="max-w-3xl text-sm text-[color:var(--color-muted)]">
          Join us at upcoming town halls, listening sessions, and community visits.
        </p>
      </section>

      <EventsFeed events={events} />
    </main>
  )
}
