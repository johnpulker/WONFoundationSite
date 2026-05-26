import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { requireAdminAuth } from '@/lib/adminAuth'

interface AdminRegistrationsBody {
  eventSlug?: string | null
  eventName?: string | null
  showPending?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin session
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const body: AdminRegistrationsBody = await request.json()

    const supabase = createAdminClient()

    // Build query - only show completed registrations by default (free or paid)
    let query = supabase
      .from('event_registrations')
      .select(`
        *,
        event:event_registrations_events!event_id (
          id,
          slug,
          name
        )
      `)
      .order('created_at', { ascending: false })

    // Filter by payment status
    if (body.showPending) {
      // Show only pending (abandoned) registrations
      query = query.eq('payment_status', 'pending')
    } else {
      // Default: Show only completed registrations (free or paid)
      query = query.in('payment_status', ['free', 'paid'])
    }

    // Filter by event slug or name if provided
    if (body.eventSlug && body.eventSlug.trim() !== '') {
      // First, find the event by slug
      const { data: event, error: eventError } = await supabase
        .from('event_registrations_events')
        .select('id')
        .eq('slug', body.eventSlug.trim())
        .single()

      if (eventError || !event) {
        return NextResponse.json(
          { error: `Event with slug "${body.eventSlug}" not found.` },
          { status: 404 }
        )
      }

      query = query.eq('event_id', event.id)
    } else if (body.eventName && body.eventName.trim() !== '') {
      // Find event by name (partial match)
      const { data: events, error: eventError } = await supabase
        .from('event_registrations_events')
        .select('id')
        .ilike('name', `%${body.eventName.trim()}%`)

      if (eventError || !events || events.length === 0) {
        return NextResponse.json(
          { error: `No events found matching "${body.eventName}".` },
          { status: 404 }
        )
      }

      const eventIds = events.map(e => e.id)
      query = query.in('event_id', eventIds)
    }

    const { data: registrations, error } = await query

    if (error) {
      console.error('Error fetching registrations:', error)
      return NextResponse.json(
        { error: `Failed to fetch registrations: ${error.message}` },
        { status: 500 }
      )
    }

    // Also return list of events for the filter dropdown
    const { data: events, error: eventsError } = await supabase
      .from('event_registrations_events')
      .select('id, slug, name')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
    }

    console.log(`Found ${registrations?.length || 0} registrations, ${events?.length || 0} events`)

    return NextResponse.json({
      registrations: registrations || [],
      events: events || [],
    })
  } catch (error) {
    console.error('Error in admin registrations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

