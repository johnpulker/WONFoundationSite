import { NextRequest, NextResponse } from 'next/server'
import { sendMembershipConfirmationEmail, sendAdminMembershipNotificationEmail } from '@/lib/emails'

interface EmailRequest {
  firstName: string
  lastName: string
  email: string
  membershipLevel: 'General' | 'Sustaining' | 'Youth'
  membershipPrice: number
  orderId: string
  transactionDate: string
  endDate: string
  paymentMethod?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json()

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.membershipLevel || !body.orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send emails (non-blocking)
    Promise.all([
      sendMembershipConfirmationEmail({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        membershipLevel: body.membershipLevel,
        membershipPrice: body.membershipPrice,
        orderId: body.orderId,
        transactionDate: new Date(body.transactionDate),
        endDate: body.endDate,
        paymentMethod: body.paymentMethod,
      }),
      sendAdminMembershipNotificationEmail({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        membershipLevel: body.membershipLevel,
        membershipPrice: body.membershipPrice,
        orderId: body.orderId,
        transactionDate: new Date(body.transactionDate),
        endDate: body.endDate,
        paymentMethod: body.paymentMethod,
      }),
    ]).catch((error) => {
      console.error('Email sending error:', error)
      // Don't fail the request if emails fail
    })

    return NextResponse.json({
      success: true,
      message: 'Emails queued for sending',
    })
  } catch (error) {
    console.error('Error in send-confirmation-email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
