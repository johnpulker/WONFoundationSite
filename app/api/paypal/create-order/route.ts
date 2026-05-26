import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { createPayPalOrder } from '@/lib/paypal'

interface CreateOrderBody {
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
    const body: CreateOrderBody = await request.json()

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

    // Fetch event
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

    // Calculate total
    const totalCents = event.price_cents * body.tickets

    if (totalCents <= 0) {
      return NextResponse.json(
        { error: 'This is a free event. Please use the free registration endpoint.' },
        { status: 400 }
      )
    }

    // Create registration with pending status
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
        payment_status: 'pending',
        payment_provider: 'paypal',
        payment_id: null, // Will be set after order creation
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

    // Create PayPal order with detailed information
    let orderId: string
    try {
      const invoiceId = `EVT-${registration.id.substring(0, 8).toUpperCase()}`
      const eventDate = event.date ? new Date(event.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : 'TBD'
      
      orderId = await createPayPalOrder(
        registration.id,
        totalCents,
        event.currency || 'USD',
        {
          disableShipping: true,
          brandName: 'WON Foundation',
          invoiceId: invoiceId,
          customId: `event-${body.eventId}`,
          softDescriptor: 'WON Foundation',
          description: `Event Registration: ${event.name} - ${eventDate}`,
          items: [
            {
              name: `${event.name} - Event Ticket`,
              description: `Registration for ${event.name}${event.date ? ` on ${eventDate}` : ''}${event.venue_name ? ` at ${event.venue_name}` : ''}. ${event.description ? event.description.substring(0, 100) : 'Join us for this special event.'}`,
              unitAmountCents: event.price_cents,
              quantity: body.tickets,
              category: 'DIGITAL_GOODS',
            },
          ],
        }
      )
    } catch (error) {
      // If PayPal credentials are missing, provide helpful error
      if (error instanceof Error && error.message.includes('Missing PayPal credentials')) {
        return NextResponse.json(
          { error: 'PayPal is not configured. Please contact the event organizer.' },
          { status: 503 }
        )
      }
      throw error
    }

    // Update registration with PayPal order ID
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({ payment_id: orderId })
      .eq('id', registration.id)

    if (updateError) {
      console.error('Failed to update registration with order ID:', updateError)
      // Order was created but we couldn't save it - this is problematic
      // In production, you might want to handle this more gracefully
    }

    return NextResponse.json({
      orderID: orderId,
    })
  } catch (error) {
    console.error('Error in create-order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

