import { notFound } from 'next/navigation'
import EventRegistrationWizard from '@/components/events/EventRegistrationWizard'
import ExternalRegistrationRedirect from '@/components/events/ExternalRegistrationRedirect'
import { getTicketsRemaining } from '@/lib/eventCapacity'

// Always render fresh so "Sold Out" shows as soon as the last ticket goes
export const dynamic = 'force-dynamic'

async function getEvent(slug: string) {
  try {
    // Use server-side Supabase client directly instead of API call
    const { createAdminClient } = await import('@/lib/supabaseAdmin')
    const supabase = createAdminClient()

    const { data: event, error } = await supabase
      .from('event_registrations_events')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !event) {
      return null
    }

    return event
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // Remove any leading "events/" prefix if present (fix for incorrectly stored slugs)
  const cleanSlug = slug.replace(/^events\//, '')
  const event = await getEvent(cleanSlug)

  if (!event) {
    notFound()
  }

  // External link: show the event with a button that opens the link in a new tab
  if (event.use_external_registration && event.external_registration_url) {
    return (
      <ExternalRegistrationRedirect
        event={event}
        url={event.external_registration_url}
        buttonText={event.external_link_button_text}
      />
    )
  }

  // Remaining tickets for in-person events with a capacity (null = unlimited)
  let ticketsRemaining: number | null = null
  try {
    const { createAdminClient } = await import('@/lib/supabaseAdmin')
    ticketsRemaining = await getTicketsRemaining(createAdminClient(), event)
  } catch (error) {
    console.error('Error checking tickets remaining:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <EventRegistrationWizard event={event} ticketsRemaining={ticketsRemaining} />
      </div>
    </div>
  )
}

