import { notFound } from 'next/navigation'
import EventRegistrationWizard from '@/components/events/EventRegistrationWizard'
import ExternalRegistrationRedirect from '@/components/events/ExternalRegistrationRedirect'

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

  // If external registration is enabled, show component that opens link in new tab
  if (event.use_external_registration && event.external_registration_url) {
    return <ExternalRegistrationRedirect url={event.external_registration_url} eventName={event.name} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <EventRegistrationWizard event={event} />
      </div>
    </div>
  )
}

