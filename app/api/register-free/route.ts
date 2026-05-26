import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { sendUserConfirmationEmail, sendOrganizerNotificationEmail } from '@/lib/emails'

interface RegisterFreeBody {
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
  marketing_opt_in?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterFreeBody = await request.json()

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
    if (body.tickets < 1) {
      return NextResponse.json(
        { error: 'Ticket count must be at least 1' },
        { status: 400 }
      )
    }

    // Enforce maximum 1 ticket per registration
    if (body.tickets > 1) {
      return NextResponse.json(
        { error: 'Maximum 1 ticket per registration' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify event exists and is free
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

    if (event.price_cents > 0) {
      return NextResponse.json(
        { error: 'This event requires payment. Please use the payment flow.' },
        { status: 400 }
      )
    }

    // Insert registration
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: body.eventId,
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
        marketing_opt_in: body.marketing_opt_in || false,
        payment_status: 'free',
        payment_provider: null,
        payment_id: null,
      })
      .select()
      .single()

    if (regError || !registration) {
      console.error('Registration insert error:', regError)
      return NextResponse.json(
        { error: 'Failed to create registration' },
        { status: 500 }
      )
    }

    // Send emails (non-blocking)
    Promise.all([
      sendUserConfirmationEmail(registration, event, false),
      sendOrganizerNotificationEmail(registration, event, false),
    ]).catch((error) => {
      console.error('Email sending error:', error)
      // Don't fail the request if emails fail
    })

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
    })
  } catch (error) {
    console.error('Error in register-free:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

