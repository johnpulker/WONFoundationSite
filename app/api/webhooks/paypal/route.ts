import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import {
  verifyPayPalWebhookSignature,
  verifyCompletedMembershipPayPalOrder,
  type PayPalWebhookHeaders,
  type PayPalMembershipLevel,
} from '@/lib/paypal'
import { fulfillMembershipForUser } from '@/lib/membershipFulfillment'
import { sendAdminOrphanedPaymentAlertEmail } from '@/lib/emails'

const log = (step: string, meta?: Record<string, unknown>) =>
  console.log('[paypal-webhook]', step, meta ?? '')

// Tell Next.js not to parse the body — we need the raw bytes for signature verification
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Read raw body first (required for signature verification)
  const rawBody = await request.text()

  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.error('[paypal-webhook] PAYPAL_WEBHOOK_ID env var is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  // Verify PayPal signature
  const webhookHeaders: PayPalWebhookHeaders = {
    'paypal-auth-algo': request.headers.get('paypal-auth-algo') ?? '',
    'paypal-cert-url': request.headers.get('paypal-cert-url') ?? '',
    'paypal-transmission-id': request.headers.get('paypal-transmission-id') ?? '',
    'paypal-transmission-sig': request.headers.get('paypal-transmission-sig') ?? '',
    'paypal-transmission-time': request.headers.get('paypal-transmission-time') ?? '',
  }

  const isValid = await verifyPayPalWebhookSignature(webhookId, webhookHeaders, rawBody)
  if (!isValid) {
    log('invalid_signature', { transmissionId: webhookHeaders['paypal-transmission-id'] })
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType: string = event.event_type ?? ''
  const eventId: string = event.id ?? ''
  log('received', { eventType, eventId })

  // --- CHECKOUT.ORDER.APPROVED ---
  // Fires when the buyer approves payment in PayPal. This is the primary safety net:
  // if the browser drops after approval but before our server captures + fulfills,
  // this webhook will capture and fulfill instead.
  if (eventType === 'CHECKOUT.ORDER.APPROVED') {
    const orderId: string = event.resource?.id ?? ''
    if (orderId) {
      // Process async — return 200 immediately so PayPal doesn't retry
      handleOrderApproved(orderId).catch((err) =>
        log('handleOrderApproved_error', { orderId, error: String(err) })
      )
    }
  }

  // --- PAYMENT.CAPTURE.COMPLETED ---
  // Secondary safety net: fires when a capture succeeds. Covers edge cases where
  // CHECKOUT.ORDER.APPROVED wasn't received or the capture happened externally.
  if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const orderId: string =
      event.resource?.supplementary_data?.related_ids?.order_id ?? ''
    if (orderId) {
      handleOrderApproved(orderId).catch((err) =>
        log('handleCaptureCompleted_error', { orderId, error: String(err) })
      )
    } else {
      log('capture_completed_missing_order_id', { eventId })
    }
  }

  // Always return 200 so PayPal doesn't keep retrying
  return NextResponse.json({ received: true })
}

/**
 * Core handler: given a PayPal order ID, check if fulfillment is needed and run it.
 * Safe to call multiple times — idempotent via payment record check.
 */
async function handleOrderApproved(orderId: string): Promise<void> {
  const supabase = createAdminClient()

  // Check if already fulfilled
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('provider', 'paypal')
    .eq('provider_tx_id', orderId)
    .eq('type', 'membership')
    .maybeSingle()

  if (existingPayment) {
    log('already_fulfilled_skipping', { orderId })
    return
  }

  // Look up the checkout record to get user_id / guest_email / level
  const { data: checkout } = await supabase
    .from('membership_paypal_checkouts')
    .select('user_id, guest_email, membership_level, status')
    .eq('paypal_order_id', orderId)
    .maybeSingle()

  if (!checkout) {
    // Order not from this app (e.g. a donation) — ignore silently
    log('no_checkout_record', { orderId })
    return
  }

  if (checkout.status === 'completed') {
    log('checkout_already_completed', { orderId })
    return
  }

  if (checkout.user_id) {
    // Existing member renewing — fully auto-fulfill
    await fulfillExistingMember(orderId, checkout.user_id, checkout.membership_level, supabase)
  } else if (checkout.guest_email) {
    // New member signup — can't auto-create account (no password available)
    // Alert the admin to handle it manually
    await handleOrphanedGuestPayment(orderId, checkout.guest_email, checkout.membership_level)
  }
}

/**
 * Capture + fulfill a membership for an existing logged-in member.
 */
async function fulfillExistingMember(
  orderId: string,
  userId: string,
  membershipLevel: string,
  supabase: ReturnType<typeof createAdminClient>
): Promise<void> {
  log('fulfilling_existing_member', { orderId, userId, membershipLevel })

  const { data: userRow } = await supabase
    .from('users')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .maybeSingle()

  // verifyCompletedMembershipPayPalOrder will capture the order if it's
  // still in APPROVED status, or confirm it if already COMPLETED
  const verified = await verifyCompletedMembershipPayPalOrder(orderId, {
    fallbackLevel: membershipLevel as PayPalMembershipLevel,
  })

  await fulfillMembershipForUser({
    userId,
    verified,
    firstName: userRow?.first_name ?? '',
    lastName: userRow?.last_name ?? '',
    email: userRow?.email ?? '',
  })

  log('existing_member_fulfilled', { orderId, userId })
}

/**
 * When a new member's payment was captured but their browser dropped before
 * account creation, alert the admin to set up the account manually.
 */
async function handleOrphanedGuestPayment(
  orderId: string,
  guestEmail: string,
  membershipLevel: string
): Promise<void> {
  log('orphaned_guest_payment', { orderId, guestEmail, membershipLevel })

  // Capture + verify the payment so we know the amount and confirm it's real
  let amountPaid = 0
  try {
    const verified = await verifyCompletedMembershipPayPalOrder(orderId, {
      fallbackLevel: membershipLevel as PayPalMembershipLevel,
    })
    amountPaid = verified.amountPaid
  } catch (err) {
    log('orphaned_verify_error', { orderId, error: String(err) })
    // Still send the alert even if verification fails — admin can check PayPal directly
  }

  await sendAdminOrphanedPaymentAlertEmail({
    paypalOrderId: orderId,
    guestEmail,
    membershipLevel,
    amountPaid,
  })

  log('orphaned_alert_sent', { orderId, guestEmail })
}
