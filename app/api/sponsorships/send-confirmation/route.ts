import { NextRequest, NextResponse } from 'next/server'
import {
  sendSponsorshipConfirmationEmail,
  sendAdminSponsorshipNotificationEmail,
} from '@/lib/emails'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { payerName, payerEmail, tierName, amount, transactionId, transactionDate, paymentMethod } = body

    if (!payerEmail || !tierName || !amount || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields: payerEmail, tierName, amount, transactionId' },
        { status: 400 }
      )
    }

    const emailData = {
      payerName: payerName || 'Valued Sponsor',
      payerEmail,
      tierName,
      amount: Number(amount),
      transactionId,
      transactionDate: transactionDate || new Date().toISOString(),
      paymentMethod: paymentMethod || 'paypal',
    }

    // Fire both emails in parallel — don't let one block the other
    await Promise.allSettled([
      sendSponsorshipConfirmationEmail(emailData),
      sendAdminSponsorshipNotificationEmail(emailData),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[api/sponsorships/send-confirmation] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
