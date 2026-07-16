import { createAdminClient } from '@/lib/supabaseAdmin'
import {
  sendMembershipConfirmationEmail,
  sendAdminMembershipNotificationEmail,
} from '@/lib/emails'
import type { PayPalMembershipLevel, VerifiedMembershipPayPalOrder } from '@/lib/paypal'

const log = (step: string, meta?: Record<string, unknown>) => {
  console.log('[membership-fulfillment]', step, meta ?? '')
}

/**
 * Calculate membership end date based on registration date
 * - Always expires on June 30th of the following year, regardless of signup month
 */
export function calculateMembershipEndDate(startDate: Date): Date {
  const endDate = new Date(startDate)
  endDate.setHours(0, 0, 0, 0)
  // Always expire June 30th of the next year
  endDate.setDate(1) // Set to 1st first to avoid month rollover issues
  endDate.setFullYear(startDate.getFullYear() + 1)
  endDate.setMonth(5) // June (0-indexed)
  endDate.setDate(30)
  return endDate
}

export async function getRenewalStartDate(userId: string): Promise<Date> {
  const supabase = createAdminClient()
  const { data: existingMembership } = await supabase
    .from('memberships')
    .select('end_date')
    .eq('user_id', userId)
    .order('end_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (existingMembership?.end_date) {
    const existingEndDate = new Date(existingMembership.end_date)
    existingEndDate.setHours(0, 0, 0, 0)
    if (existingEndDate >= today) {
      return existingEndDate
    }
  }

  return today
}

export interface FulfillMembershipParams {
  userId: string
  verified: VerifiedMembershipPayPalOrder
  firstName: string
  lastName: string
  email: string
  sendEmails?: boolean
}

export interface FulfillMembershipResult {
  membershipId: string
  endDate: string
  startDate: string
  alreadyProcessed: boolean
  repaired: boolean
}

/**
 * Idempotent server-side fulfillment: payment row + active membership + emails.
 * Backend is source of truth after PayPal verification.
 */
export async function fulfillMembershipForUser(
  params: FulfillMembershipParams
): Promise<FulfillMembershipResult> {
  const supabase = createAdminClient()
  const { userId, verified, firstName, lastName, email } = params
  const sendEmails = params.sendEmails !== false
  const level = verified.membershipLevel
  const orderId = verified.orderId

  log('start', { orderId, userId, level })

  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id, user_id')
    .eq('provider', 'paypal')
    .eq('provider_tx_id', orderId)
    .eq('type', 'membership')
    .maybeSingle()

  const today = new Date().toISOString().split('T')[0]

  const ensureActiveMembership = async (): Promise<{
    membershipId: string
    startDate: string
    endDate: string
    repaired: boolean
  }> => {
    const { data: existingMembership } = await supabase
      .from('memberships')
      .select('id, end_date, start_date')
      .eq('user_id', userId)
      .eq('level', level)
      .in('status', ['active', 'pending'])
      .gte('end_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingMembership?.id) {
      return {
        membershipId: existingMembership.id,
        startDate: existingMembership.start_date,
        endDate: existingMembership.end_date,
        repaired: false,
      }
    }

    const startDate = await getRenewalStartDate(userId)
    const endDate = calculateMembershipEndDate(startDate)

    const { data: repaired, error: repairError } = await supabase
      .from('memberships')
      .insert({
        user_id: userId,
        level,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
        auto_renew: false,
        is_complimentary: false,
      })
      .select('id')
      .single()

    if (repairError) {
      throw new Error(`Membership repair failed: ${repairError.message}`)
    }

    log('membership_repaired', { membershipId: repaired.id, orderId })
    return {
      membershipId: repaired.id,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      repaired: true,
    }
  }

  if (existingPayment?.user_id) {
    log('payment_exists', { orderId })
    const membership = await ensureActiveMembership()
    if (sendEmails) {
      queueMembershipEmails({
        firstName,
        lastName,
        email,
        level,
        price: verified.amountPaid,
        orderId,
        endDate: membership.endDate,
      })
    }
    return {
      membershipId: membership.membershipId,
      endDate: membership.endDate,
      startDate: membership.startDate,
      alreadyProcessed: true,
      repaired: membership.repaired,
    }
  }

  const startDate = await getRenewalStartDate(userId)
  const endDate = calculateMembershipEndDate(startDate)
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  const { error: paymentError } = await supabase.from('payments').insert({
    user_id: userId,
    amount: verified.amountPaid,
    status: 'completed',
    provider: 'paypal',
    provider_tx_id: orderId,
    type: 'membership',
    membership_level: level,
    is_complimentary: false,
  })

  if (paymentError) {
    if ((paymentError as { code?: string }).code === '23505') {
      log('payment_duplicate_race', { orderId })
      const membership = await ensureActiveMembership()
      if (sendEmails) {
        queueMembershipEmails({
          firstName,
          lastName,
          email,
          level,
          price: verified.amountPaid,
          orderId,
          endDate: membership.endDate,
        })
      }
      return {
        membershipId: membership.membershipId,
        endDate: membership.endDate,
        startDate: membership.startDate,
        alreadyProcessed: true,
        repaired: membership.repaired,
      }
    }
    throw new Error(`Payment record failed: ${paymentError.message}`)
  }

  log('payment_inserted', { orderId })

  const { data: membershipData, error: membershipError } = await supabase
    .from('memberships')
    .insert({
      user_id: userId,
      level,
      start_date: startDateStr,
      end_date: endDateStr,
      status: 'active',
      auto_renew: false,
      is_complimentary: false,
    })
    .select('id')
    .single()

  if (membershipError || !membershipData) {
    throw new Error(
      `Membership creation failed: ${membershipError?.message ?? 'no data'}`
    )
  }

  log('membership_created', { membershipId: membershipData.id, orderId })

  if (sendEmails) {
    queueMembershipEmails({
      firstName,
      lastName,
      email,
      level,
      price: verified.amountPaid,
      orderId,
      endDate: endDateStr,
    })
  }

  return {
    membershipId: membershipData.id,
    endDate: endDateStr,
    startDate: startDateStr,
    alreadyProcessed: false,
    repaired: false,
  }
}

function queueMembershipEmails(args: {
  firstName: string
  lastName: string
  email: string
  level: PayPalMembershipLevel
  price: number
  orderId: string
  endDate: string
}) {
  const transactionDate = new Date()
  const payload = {
    firstName: args.firstName,
    lastName: args.lastName,
    email: args.email,
    membershipLevel: args.level,
    membershipPrice: args.price,
    orderId: args.orderId,
    transactionDate,
    endDate: args.endDate,
  }

  Promise.all([
    sendMembershipConfirmationEmail(payload),
    sendAdminMembershipNotificationEmail(payload),
  ])
    .then(() => log('emails_sent', { orderId: args.orderId }))
    .catch((err) => log('emails_failed', { orderId: args.orderId, error: String(err) }))
}
