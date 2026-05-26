import { NextRequest, NextResponse } from 'next/server'
import { sendDonationThankYouEmail } from '@/lib/emails'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.email || !body.name || !body.amount || !body.orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send thank you email (non-blocking)
    sendDonationThankYouEmail({
      email: body.email,
      name: body.name,
      amount: body.amount,
      orderId: body.orderId,
      dedicationType: body.dedicationType || null,
      dedicationName: body.dedicationName || null,
    }).catch((error) => {
      console.error('Email sending error:', error)
      // Don't fail the request if email fails
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you email queued for sending',
    })
  } catch (error) {
    console.error('Error in send-thank-you:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
