import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { sendUserConfirmationEmail, sendOrganizerNotificationEmail } from '@/lib/emails'
import { getMaxPerOrder, capacityErrorMessage } from '@/lib/eventCapacity'

interface RegisterCheckBody {
  eventId: string
  full_name: string
  email: string
  phone?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  tickets: number
  registration_type?: string
  is_anonymous?: boolean
  public_message?: string
  guest_names?: string[]
  marketing_opt_in?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterCheckBody = await request.json()

    // Validate required fields
    if (!body.eventId || !body.full_name || !body.email || !body.tickets) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate ticket count
    if (!Number.isInteger(body.tickets) || body.tickets < 1) {
      return NextResponse.json(
        { error: 'Ticket count must be at least 1' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify event exists and is paid
    const { data: event, error: eventError } = await supabase
      .from('event_registrations_events')
      .select('*')
      .eq('id', body.eventId)
      .eq('is_active', true)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found or inactive' },
        { status: 404 }
      )
    }

    if (event.price_cents <= 0) {
      return NextResponse.json(
        { error: 'This event is free. Please use the free registration flow.' },
        { status: 400 }
      )
    }

    const checkOrderId = `CHECK-EVT-${Date.now()}`
    const totalCents = event.price_cents * body.tickets

    if (event.use_external_registration) {
      return NextResponse.json(
        { error: 'Registration for this event is handled on an external site.' },
        { status: 400 }
      )
    }

    // Enforce this event's max tickets per purchase
    const maxPerOrder = getMaxPerOrder(event)
    if (body.tickets > maxPerOrder) {
      return NextResponse.json(
        { error: capacityErrorMessage('over_limit', maxPerOrder) },
        { status: 400 }
      )
    }

    // Insert registration (atomic capacity check in the database)
    const { data: rpcResult, error: rpcError } = await supabase.rpc('create_event_registration', {
      p_event_id: body.eventId,
      p_data: {
        full_name: body.full_name,
        email: body.email,
        phone: body.phone || null,
        address_line1: body.address_line1 || null,
        address_line2: body.address_line2 || null,
        city: body.city || null,
        state: body.state || null,
        postal_code: body.postal_code || null,
        country: body.country || null,
        tickets: body.tickets,
        registration_type: body.registration_type || 'individual',
        is_anonymous: body.is_anonymous || false,
        public_message: body.public_message || null,
        guest_names: body.guest_names && body.guest_names.length > 0 ? body.guest_names : null,
        marketing_opt_in: body.marketing_opt_in || false,
        payment_status: 'pending',
        payment_provider: 'check',
        payment_id: checkOrderId,
      },
    })

    if (!rpcError && rpcResult && rpcResult.ok === false) {
      return NextResponse.json(
        { error: capacityErrorMessage(rpcResult.reason, maxPerOrder), reason: rpcResult.reason },
        { status: rpcResult.reason === 'not_found' ? 404 : 409 }
      )
    }

    const registration = rpcResult?.registration
    const regError = rpcError

    if (regError || !registration) {
      console.error('Check registration insert error:', regError)
      return NextResponse.json(
        { error: 'Failed to create registration' },
        { status: 500 }
      )
    }

    // Send emails (non-blocking) — pass check payment method
    Promise.all([
      sendUserConfirmationEmail(registration, event, true, checkOrderId, 'check'),
      sendOrganizerNotificationEmail(registration, event, true, checkOrderId, 'check'),
    ]).catch((error) => {
      console.error('Email sending error:', error)
    })

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
    })
  } catch (error) {
    console.error('Error in register-check:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
