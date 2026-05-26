import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { verifyCompletedMembershipPayPalOrder } from '@/lib/paypal'
import { fulfillMembershipForUser } from '@/lib/membershipFulfillment'

/**
 * Server-authoritative membership fulfillment after PayPal approval.
 * Verifies capture with PayPal API, then updates payment + membership + emails.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : ''

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const supabaseAuth = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log('[complete-paypal] verify_start', { orderId, userId: user.id })

    const supabase = createAdminClient()
    const { data: checkoutRow } = await supabase
      .from('membership_paypal_checkouts')
      .select('membership_level')
      .eq('paypal_order_id', orderId)
      .maybeSingle()

    const membershipLevelHint = body.membershipLevel as string | undefined
    const checkoutLevel = checkoutRow?.membership_level

    const verified = await verifyCompletedMembershipPayPalOrder(orderId, {
      fallbackLevel:
        (checkoutLevel as 'General' | 'Sustaining' | 'Youth' | undefined) ||
        (membershipLevelHint === 'General' ||
        membershipLevelHint === 'Sustaining' ||
        membershipLevelHint === 'Youth'
          ? membershipLevelHint
          : undefined),
    })
    console.log('[complete-paypal] verify_ok', {
      orderId,
      level: verified.membershipLevel,
      amount: verified.amountPaid,
    })

    const { data: userRow } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .maybeSingle()

    const firstName =
      userRow?.first_name || user.user_metadata?.first_name || ''
    const lastName =
      userRow?.last_name || user.user_metadata?.last_name || ''
    const email = userRow?.email || user.email || ''

    const result = await fulfillMembershipForUser({
      userId: user.id,
      verified,
      firstName,
      lastName,
      email,
    })

    try {
      await supabase
        .from('membership_paypal_checkouts')
        .update({ status: 'completed' })
        .eq('paypal_order_id', orderId)
    } catch {
      // Optional tracking table; fulfillment already succeeded
    }

    console.log('[complete-paypal] fulfillment_ok', {
      orderId,
      membershipId: result.membershipId,
      alreadyProcessed: result.alreadyProcessed,
      repaired: result.repaired,
    })

    return NextResponse.json({
      success: true,
      membershipId: result.membershipId,
      endDate: result.endDate,
      message: result.alreadyProcessed
        ? result.repaired
          ? 'Payment already processed; membership was repaired'
          : 'Payment already processed'
        : 'Membership activated',
    })
  } catch (error) {
    console.error('[complete-paypal] error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to complete membership payment',
      },
      { status: 500 }
    )
  }
}
