import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { requireAdminAuth } from '@/lib/adminAuth'
import { sendRegistrationPaymentConfirmationEmail } from '@/lib/emails'

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
      // Show only pending registrations (abandoned PayPal or awaiting check)
      query = query.eq('payment_status', 'pending')
    } else {
      // Default: Show completed registrations (free or paid) plus pending check payments
      query = query.or('payment_status.in.(free,paid),and(payment_status.eq.pending,payment_provider.eq.check)')
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

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get('id')

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('id', registrationId)

    if (error) {
      console.error('Error deleting registration:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin registrations DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Edit registration (update name or mark as paid)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const body = await request.json()
    const { id, full_name, guest_names, mark_as_paid } = body || {}

    if (!id) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // If marking as paid, verify it's a pending check payment first
    if (mark_as_paid) {
      const { data: existing, error: fetchError } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:event_registrations_events!event_id (
            id,
            name,
            date
          )
        `)
        .eq('id', id)
        .single()

      if (fetchError || !existing) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
      }

      if (existing.payment_status !== 'pending' || existing.payment_provider !== 'check') {
        return NextResponse.json(
          { error: 'Only pending check payments can be marked as paid' },
          { status: 400 }
        )
      }

      const { data: updated, error: updateError } = await supabase
        .from('event_registrations')
        .update({ payment_status: 'paid' })
        .eq('id', id)
        .select()
        .single()

      if (updateError || !updated) {
        console.error('Error marking registration as paid:', updateError)
        return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 })
      }

      // Send confirmation email (non-blocking)
      sendRegistrationPaymentConfirmationEmail({
        email: existing.email,
        fullName: existing.full_name,
        eventName: existing.event?.name || 'Event',
        eventDate: existing.event?.date || '',
        tickets: existing.tickets,
        paymentId: existing.payment_id,
      }).catch((error) => {
        console.error('Error sending registration payment confirmation email:', error)
      })

      return NextResponse.json({ success: true, registration: updated })
    }

    // Otherwise, update name and/or guest names
    const updateFields: Record<string, any> = {}

    if (full_name && full_name.trim() !== '') {
      updateFields.full_name = full_name.trim()
    }

    if (Array.isArray(guest_names)) {
      updateFields.guest_names = guest_names.map((n: string) => n.trim()).filter(Boolean)
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await supabase
      .from('event_registrations')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !updated) {
      console.error('Error updating registration:', updateError)
      return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 })
    }

    return NextResponse.json({ success: true, registration: updated })
  } catch (error) {
    console.error('Error in admin registrations PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

