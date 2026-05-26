import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { capturePayPalOrder } from '@/lib/paypal'
import { sendUserConfirmationEmail, sendOrganizerNotificationEmail } from '@/lib/emails'

interface CaptureOrderBody {
  orderID: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CaptureOrderBody = await request.json()

    if (!body.orderID) {
      return NextResponse.json(
        { error: 'Missing orderID' },
        { status: 400 }
      )
    }

    // Capture the PayPal order
    const captureResult = await capturePayPalOrder(body.orderID)

    if (captureResult.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${captureResult.status}` },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Find registration by payment_id
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('payment_id', body.orderID)
      .single()

    if (regError || !registration) {
      console.error('Registration lookup error:', regError)
      return NextResponse.json(
        { error: 'Registration not found for this order' },
        { status: 404 }
      )
    }

    // Update registration status to paid
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({ payment_status: 'paid' })
      .eq('id', registration.id)

    if (updateError) {
      console.error('Failed to update registration status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update registration' },
        { status: 500 }
      )
    }

    // Fetch event details to get the price
    const { data: event, error: eventError } = await supabase
      .from('event_registrations_events')
      .select('*')
      .eq('id', registration.event_id)
      .single()

    if (eventError || !event) {
      console.error('Event lookup error:', eventError)
      // Registration is updated, but we can't send emails
      return NextResponse.json({
        success: true,
        registrationId: registration.id,
        warning: 'Payment successful but event details not found',
      })
    }

    // Create payment record for admin tracking
    const ticketAmount = (event.price_cents * registration.tickets) / 100 // Convert cents to dollars
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: null, // Event registrations may not have a user account
        event_id: null, // event_registrations uses a different events table, so we skip this FK
        amount: ticketAmount,
        status: 'completed',
        provider: 'paypal',
        provider_tx_id: body.orderID,
        type: 'ticket',
      })

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError)
      // Don't fail the request - registration is already updated
    } else {
      console.log('Payment record created for ticket purchase:', ticketAmount)
    }

    // Send emails (non-blocking)
    Promise.all([
      sendUserConfirmationEmail(registration, event, true, body.orderID),
      sendOrganizerNotificationEmail(registration, event, true, body.orderID),
    ]).catch((error) => {
      console.error('Email sending error:', error)
      // Don't fail the request if emails fail
    })

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      orderID: body.orderID,
    })
  } catch (error) {
    console.error('Error in capture-order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

