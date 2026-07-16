import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMembershipConfirmationEmail, sendAdminMembershipNotificationEmail } from '@/lib/emails'

// Use service role key for admin operations
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

interface SignupCheckRequest {
  // User info
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
  // Membership info
  membershipLevel: 'General' | 'Sustaining' | 'Youth'
  membershipPrice: number
}

/**
 * Calculate membership end date based on registration date
 * - Always expires on June 30th of the following year, regardless of signup month
 */
function calculateMembershipEndDate(startDate: Date): Date {
  const endDate = new Date(startDate);

  // Set time to midnight to avoid timezone issues
  endDate.setHours(0, 0, 0, 0);

  // Always expire June 30th of the next year
  endDate.setDate(1); // Set to 1st first to avoid month rollover issues
  endDate.setFullYear(startDate.getFullYear() + 1);
  endDate.setMonth(5); // June (0-indexed)
  endDate.setDate(30);

  return endDate;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupCheckRequest = await request.json()

    // Validate required fields
    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate membership level and price (must match frontend prices)
    const validLevels: Record<string, number> = {
      General: 35,
      Sustaining: 100,
      Youth: 10,
    }

    if (!validLevels[body.membershipLevel] || validLevels[body.membershipLevel] !== body.membershipPrice) {
      return NextResponse.json(
        { error: `Invalid membership level or price. Expected ${validLevels[body.membershipLevel] || 'unknown'}, got ${body.membershipPrice}` },
        { status: 400 }
      )
    }

    // Step 1: Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: `${body.firstName} ${body.lastName}`,
        first_name: body.firstName,
        last_name: body.lastName,
      },
    })

    if (authError) {
      console.error('Auth error (check signup):', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const userId = authData.user.id

    // Step 2: Create/update user record
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email: body.email,
        full_name: `${body.firstName} ${body.lastName}`,
        first_name: body.firstName,
        last_name: body.lastName,
        role: 'member',
      })

    if (userError) {
      console.error('User record error (check signup):', userError)
      // Continue anyway - the trigger might have created it
    }

    // Step 3: Create/update profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
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

    if (profileError) {
      console.error('Profile error (check signup):', profileError)
    }

    // Step 4: Create payment record (pending, provider=admin)
    const checkOrderId = `CHECK-MEM-${Date.now()}`
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        amount: body.membershipPrice,
        status: 'pending',
        provider: 'admin',
        provider_tx_id: checkOrderId,
        type: 'membership',
        membership_level: body.membershipLevel,
        is_complimentary: false, // Paid memberships are never complimentary
      })

    if (paymentError) {
      console.error('Payment record error (check signup):', paymentError)
      // Don't fail the whole request, but log it
    }

    // Step 5: Create membership record (pending until check received)
    const startDate = new Date()
    const endDate = calculateMembershipEndDate(startDate)

    const { error: membershipError, data: membershipData } = await supabaseAdmin
      .from('memberships')
      .insert({
        user_id: userId,
        level: body.membershipLevel,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'pending',
        auto_renew: false,
        is_complimentary: false, // Paid memberships are never complimentary
      })
      .select()

    if (membershipError) {
      console.error('Membership error (check signup):', membershipError)
      return NextResponse.json(
        { 
          error: 'Failed to create membership record',
          details: membershipError.message 
        },
        { status: 500 }
      )
    }

    if (!membershipData || membershipData.length === 0) {
      console.error('Membership was not created - no data returned (check signup)')
      return NextResponse.json(
        { error: 'Membership creation failed - no data returned' },
        { status: 500 }
      )
    }

    // Step 6: Send confirmation emails (non-blocking)
    const transactionDate = new Date()
    Promise.all([
      sendMembershipConfirmationEmail({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        membershipLevel: body.membershipLevel,
        membershipPrice: body.membershipPrice,
        orderId: checkOrderId,
        transactionDate: transactionDate,
        endDate: endDate.toISOString().split('T')[0],
        paymentMethod: 'Check (mail-in)',
      }),
      sendAdminMembershipNotificationEmail({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        membershipLevel: body.membershipLevel,
        membershipPrice: body.membershipPrice,
        orderId: checkOrderId,
        transactionDate: transactionDate,
        endDate: endDate.toISOString().split('T')[0],
        paymentMethod: 'Check (mail-in)',
      }),
    ]).catch((error) => {
      console.error('Email sending error (check signup):', error)
      // Don't fail the request if emails fail
    })

    return NextResponse.json({
      success: true,
      userId,
      membershipId: membershipData[0].id,
      message: 'Account created successfully with pending membership awaiting check payment',
    })

  } catch (error) {
    console.error('Signup-check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

