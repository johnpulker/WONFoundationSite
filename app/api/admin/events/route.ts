import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { requireAdminAuth } from '@/lib/adminAuth'

// GET - Fetch all events with registration counts
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const adminClient = createAdminClient()

    // Fetch all events
    const { data: events, error: eventsError } = await adminClient
      .from('event_registrations_events')
      .select('*')
      .order('date', { ascending: false })

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    // Fetch registration counts for each event
    const eventsWithCounts = await Promise.all(
      (events || []).map(async (event) => {
        const { count, error: countError } = await adminClient
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)

        if (countError) {
          console.error(`Error counting registrations for event ${event.id}:`, countError)
        }

        // Also get total tickets sold
        const { data: ticketData } = await adminClient
          .from('event_registrations')
          .select('tickets')
          .eq('event_id', event.id)

        const totalTickets = (ticketData || []).reduce((sum, reg) => sum + (reg.tickets || 1), 0)

        return {
          ...event,
          registration_count: count || 0,
          total_tickets: totalTickets,
        }
      })
    )

    return NextResponse.json({ events: eventsWithCounts })
  } catch (error) {
    console.error('Error in admin events GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new event
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('event_registrations_events')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        date: body.date,
        venue_name: body.venue_name || null,
        venue_address: body.venue_address || null,
        city: body.city || null,
        state: body.state || null,
        postal_code: body.postal_code || null,
        country: body.country || null,
        price_cents: body.price_cents || 0,
        is_active: body.is_active ?? true,
        image_url: body.image_url || null,
        use_external_registration: body.use_external_registration ?? false,
        external_registration_url: body.use_external_registration ? (body.external_registration_url || null) : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ event: data })
  } catch (error) {
    console.error('Error in admin events POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update an existing event
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    if (!body.id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const { data, error } = await adminClient
      .from('event_registrations_events')
      .update({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        date: body.date,
        venue_name: body.venue_name || null,
        venue_address: body.venue_address || null,
        city: body.city || null,
        state: body.state || null,
        postal_code: body.postal_code || null,
        country: body.country || null,
        price_cents: body.price_cents || 0,
        is_active: body.is_active ?? true,
        image_url: body.image_url || null,
        use_external_registration: body.use_external_registration ?? false,
        external_registration_url: body.use_external_registration ? (body.external_registration_url || null) : null,
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ event: data })
  } catch (error) {
    console.error('Error in admin events PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete an event
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // First, delete all registrations for this event (cascade delete)
    const { error: registrationsError } = await adminClient
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)

    if (registrationsError) {
      console.error('Error deleting event registrations:', registrationsError)
      return NextResponse.json({ 
        error: 'Failed to delete event registrations: ' + registrationsError.message 
      }, { status: 500 })
    }

    // Then delete the event
    const { error } = await adminClient
      .from('event_registrations_events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Error deleting event:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin events DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Toggle event active status
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    if (!body.id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const { data, error } = await adminClient
      .from('event_registrations_events')
      .update({ is_active: body.is_active })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling event:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ event: data })
  } catch (error) {
    console.error('Error in admin events PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
