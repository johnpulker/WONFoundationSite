import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      transactionId,
      tierName,
      amount,
      payerName,
      payerEmail,
      userId,
      status: paymentStatus,
      provider: paymentProvider,
    } = body

    // Validate required fields
    if (!transactionId || !tierName || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: transactionId, tierName, amount' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check for duplicate transaction (idempotency)
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('provider_tx_id', transactionId)
      .eq('type', 'sponsorship')
      .maybeSingle()

    if (existing) {
      // Already recorded — return success without inserting again
      return NextResponse.json({ success: true, duplicate: true })
    }

    const { error: dbError } = await supabase.from('payments').insert({
      user_id: userId || null,
      amount,
      status: paymentStatus || 'completed',
      provider: paymentProvider || 'paypal',
      provider_tx_id: transactionId,
      type: 'sponsorship',
      membership_level: tierName,
      payer_name: payerName || null,
      payer_email: payerEmail || null,
    })

    if (dbError) {
      console.error('[api/sponsorships/record-payment] DB insert error:', dbError)
      return NextResponse.json(
        { error: 'Failed to record sponsorship payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[api/sponsorships/record-payment] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
