import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { createPayPalOrder, getPayPalCheckoutOrderStatus } from '@/lib/paypal'
import type { SupabaseClient } from '@supabase/supabase-js'

async function hasCheckoutTrackingTable(supabase: SupabaseClient): Promise<boolean> {
  const { error } = await supabase.from('membership_paypal_checkouts').select('id').limit(1)
  if (!error) return true
  if (error.code === '42P01' || error.message.includes('does not exist')) return false
  return true
}

const LEVEL_PRICES: Record<string, number> = {
  General: 35,
  Sustaining: 100,
  Youth: 10,
}

const LEVEL_NAMES: Record<string, string> = {
  General: 'General Membership',
  Sustaining: 'Sustaining Membership',
  Youth: 'Youth Membership',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const membershipLevel = body.membershipLevel as string
    const guestEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null

    if (!membershipLevel || !(membershipLevel in LEVEL_PRICES)) {
      return NextResponse.json({ error: 'Invalid membership level' }, { status: 400 })
    }

    const priceCents = LEVEL_PRICES[membershipLevel] * 100
    const supabaseAuth = await createClient()
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()

    const supabase = createAdminClient()
    const reuseCutoff = new Date(Date.now() - 45 * 60 * 1000).toISOString()
    const checkoutsAvailable = await hasCheckoutTrackingTable(supabase)

    // Reuse a recent pending server order when PayPal checkout is still open.
    if (checkoutsAvailable && user?.id) {
      const { data: pending } = await supabase
        .from('membership_paypal_checkouts')
        .select('paypal_order_id')
        .eq('user_id', user.id)
        .eq('membership_level', membershipLevel)
        .eq('status', 'pending')
        .gte('expires_at', new Date().toISOString())
        .gte('created_at', reuseCutoff)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (pending?.paypal_order_id) {
        try {
          const status = await getPayPalCheckoutOrderStatus(pending.paypal_order_id)
          if (status === 'CREATED' || status === 'APPROVED') {
            console.log('[membership-paypal] reusing pending order', pending.paypal_order_id)
            return NextResponse.json({ orderID: pending.paypal_order_id, reused: true })
          }
          await supabase
            .from('membership_paypal_checkouts')
            .update({ status: 'expired' })
            .eq('paypal_order_id', pending.paypal_order_id)
        } catch {
          // Fall through to create a new order
        }
      }
    } else if (checkoutsAvailable && guestEmail) {
      const { data: pending } = await supabase
        .from('membership_paypal_checkouts')
        .select('paypal_order_id')
        .eq('guest_email', guestEmail)
        .eq('membership_level', membershipLevel)
        .eq('status', 'pending')
        .gte('expires_at', new Date().toISOString())
        .gte('created_at', reuseCutoff)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (pending?.paypal_order_id) {
        try {
          const status = await getPayPalCheckoutOrderStatus(pending.paypal_order_id)
          if (status === 'CREATED' || status === 'APPROVED') {
            return NextResponse.json({ orderID: pending.paypal_order_id, reused: true })
          }
          await supabase
            .from('membership_paypal_checkouts')
            .update({ status: 'expired' })
            .eq('paypal_order_id', pending.paypal_order_id)
        } catch {
          // Fall through
        }
      }
    }

    const referenceId = `mem-${user?.id ?? guestEmail ?? 'guest'}-${membershipLevel}-${Date.now()}`
    const invoiceId = `MEM-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    const levelName = LEVEL_NAMES[membershipLevel]

    const orderId = await createPayPalOrder(referenceId, priceCents, 'USD', {
      disableShipping: true,
      brandName: 'WON Foundation',
      invoiceId,
      customId: `membership-${membershipLevel.toLowerCase()}`,
      softDescriptor: 'WON Foundation',
      description: `WON Foundation Annual Membership - ${levelName}`,
      items: [
        {
          name: `${levelName} - Annual Membership`,
          description: `${levelName} (${membershipLevel} Level) - Annual WON membership`,
          unitAmountCents: priceCents,
          quantity: 1,
          category: 'DIGITAL_GOODS',
        },
      ],
    })

    if (checkoutsAvailable) {
      const { error: checkoutError } = await supabase.from('membership_paypal_checkouts').insert({
        paypal_order_id: orderId,
        user_id: user?.id ?? null,
        guest_email: user ? null : guestEmail,
        membership_level: membershipLevel,
        status: 'pending',
      })

      if (checkoutError) {
        console.warn('[membership-paypal] checkout tracking insert failed:', checkoutError.message)
      }
    }

    console.log('[membership-paypal] order_created', { orderId, membershipLevel })
    return NextResponse.json({ orderID: orderId, reused: false })
  } catch (error) {
    console.error('[membership-paypal] create-order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
}
