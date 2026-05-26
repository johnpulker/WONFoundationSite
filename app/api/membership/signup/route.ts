import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCompletedMembershipPayPalOrder } from '@/lib/paypal'
import { fulfillMembershipForUser } from '@/lib/membershipFulfillment'
import { createAdminClient } from '@/lib/supabaseAdmin'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

interface SignupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  membershipLevel: 'General' | 'Sustaining' | 'Youth'
  membershipPrice: number
  paypalOrderId: string
  paypalPayerId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()

    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!body.paypalOrderId) {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const normalizedEmail = body.email.trim().toLowerCase()
    const admin = createAdminClient()

    console.log('[membership-signup] verify_start', { orderId: body.paypalOrderId })

    const { data: checkoutRow } = await admin
      .from('membership_paypal_checkouts')
      .select('membership_level')
      .eq('paypal_order_id', body.paypalOrderId)
      .maybeSingle()

    const checkoutLevel = checkoutRow?.membership_level as
      | SignupRequest['membershipLevel']
      | undefined

    // Server-side PayPal verification (captures if APPROVED).
    const verified = await verifyCompletedMembershipPayPalOrder(body.paypalOrderId, {
      fallbackLevel: checkoutLevel ?? body.membershipLevel,
    })

    if (verified.membershipLevel !== body.membershipLevel) {
      return NextResponse.json(
        {
          error: `Membership level mismatch. Paid for ${verified.membershipLevel}, expected ${body.membershipLevel}`,
        },
        { status: 400 }
      )
    }

    console.log('[membership-signup] verify_ok', {
      orderId: verified.orderId,
      level: verified.membershipLevel,
    })

    // Idempotent retry: this PayPal order was already fulfilled.
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('user_id')
      .eq('provider', 'paypal')
      .eq('provider_tx_id', verified.orderId)
      .eq('type', 'membership')
      .maybeSingle()

    if (existingPayment?.user_id) {
      const result = await fulfillMembershipForUser({
        userId: existingPayment.user_id,
        verified,
        firstName: body.firstName,
        lastName: body.lastName,
        email: normalizedEmail,
      })

      await admin
        .from('membership_paypal_checkouts')
        .update({ status: 'completed' })
        .eq('paypal_order_id', verified.orderId)

      return NextResponse.json({
        success: true,
        userId: existingPayment.user_id,
        membershipId: result.membershipId,
        message: 'Payment already processed',
      })
    }

    // Account may exist from a prior attempt where PayPal succeeded but fulfillment failed.
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    let userId: string

    if (existingUser?.id) {
      console.log('[membership-signup] existing_user_fulfill', {
        userId: existingUser.id,
        orderId: verified.orderId,
      })
      userId = existingUser.id
    } else {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: body.password,
        email_confirm: true,
        user_metadata: {
          full_name: `${body.firstName} ${body.lastName}`,
          first_name: body.firstName,
          last_name: body.lastName,
        },
      })

      if (authError) {
        console.error('[membership-signup] auth error:', authError)
        const alreadyRegistered =
          authError.message?.toLowerCase().includes('already') ||
          authError.message?.toLowerCase().includes('registered')

        if (alreadyRegistered) {
          const { data: userByEmail } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', normalizedEmail)
            .maybeSingle()

          if (userByEmail?.id) {
            userId = userByEmail.id
            console.log('[membership-signup] recovered_existing_user_after_auth_error', {
              userId,
              orderId: verified.orderId,
            })
          } else {
            return NextResponse.json(
              {
                error:
                  'Payment was received. An account may already exist for this email — please log in or contact support. Do not pay again.',
              },
              { status: 400 }
            )
          }
        } else {
          return NextResponse.json(
            {
              error:
                'Payment was received but account setup failed. Please contact support with your PayPal confirmation. Do not pay again.',
              details: authError.message,
            },
            { status: 400 }
          )
        }
      } else {
        userId = authData.user.id
      }
    }

    await supabaseAdmin.from('users').upsert({
      id: userId,
      email: normalizedEmail,
      full_name: `${body.firstName} ${body.lastName}`,
      first_name: body.firstName,
      last_name: body.lastName,
      role: 'member',
    })

    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      phone: body.phone,
      address_line1: body.addressLine1,
      address_line2: body.addressLine2 || null,
      city: body.city,
      state: body.state,
      postal_code: body.postalCode,
      show_in_directory: true,
      show_email_public: false,
      show_phone_public: false,
    })

    const result = await fulfillMembershipForUser({
      userId,
      verified,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
    })

    await admin
      .from('membership_paypal_checkouts')
      .update({ status: 'completed' })
      .eq('paypal_order_id', verified.orderId)

    console.log('[membership-signup] fulfillment_ok', {
      userId,
      membershipId: result.membershipId,
    })

    return NextResponse.json({
      success: true,
      userId,
      membershipId: result.membershipId,
      message: 'Account created successfully with active membership',
    })
  } catch (error) {
    console.error('[membership-signup] error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
