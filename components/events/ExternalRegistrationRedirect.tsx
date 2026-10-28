interface ExternalLinkEvent {
  name: string
  description?: string | null
  date: string
  duration_minutes?: number | null
  event_type?: string | null
  venue_name?: string | null
  venue_address?: string | null
  city?: string | null
  state?: string | null
  image_url?: string | null
}

// WON events are in Michigan; formatting with a fixed time zone keeps the server
// and browser output identical.
const TIME_ZONE = 'America/Detroit'

/**
 * Shown on the event page when "Use External Link" is on.
 * Replaces on-site registration with a button that opens the external site in a new tab.
 */
export default function ExternalRegistrationRedirect({
  event,
  url,
  buttonText,
}: {
  event: ExternalLinkEvent
  url: string
  buttonText?: string | null
}) {
  const start = new Date(event.date)
  const end = new Date(start.getTime() + (event.duration_minutes || 120) * 60 * 1000)
  const dateLabel = start.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: TIME_ZONE,
  })
  const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', timeZone: TIME_ZONE }
  const timeLabel = `${start.toLocaleTimeString('en-US', timeOpts)} – ${end.toLocaleTimeString('en-US', {
    ...timeOpts,
    timeZoneName: 'short',
  })}`

  const isVirtual = event.event_type === 'virtual'
  const location = isVirtual
    ? 'Virtual'
    : [event.venue_name, event.venue_address || [event.city, event.state].filter(Boolean).join(', ')]
        .filter(Boolean)
        .join(' · ')

  const label = buttonText?.trim() || 'Register Now'

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-card border border-neutral-100 shadow-card overflow-hidden">
          {event.image_url && (
            <img src={event.image_url} alt="" className="w-full max-h-80 object-cover" />
          )}
          <div className="p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-heading text-neutral-900 mb-6">{event.name}</h1>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl bg-neutral-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">When</dt>
                <dd className="text-neutral-900 font-semibold">{dateLabel}</dd>
                <dd className="text-sm text-neutral-600">{timeLabel}</dd>
              </div>
              {location && (
                <div className="rounded-xl bg-neutral-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">Where</dt>
                  <dd className="text-neutral-900 font-semibold">{location}</dd>
                </div>
              )}
            </dl>

            {event.description && (
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line mb-8">{event.description}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {label}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a
                href="/programs-events"
                className="inline-flex items-center justify-center px-6 py-4 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all"
              >
                Back to Events
              </a>
            </div>
            <p className="text-xs text-neutral-500 mt-4">This link opens an external site in a new tab.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
