import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { requireAdminAuth } from '@/lib/adminAuth'
import { sendMemberActivationEmail } from '@/lib/emails'

// GET - Fetch all payments with user and registration info
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const adminClient = createAdminClient()

    // Fetch all payments
    const { data: paymentsData, error: paymentsError } = await adminClient
      .from('payments')
      .select(`
        *,
        users:user_id (
          email,
          full_name,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })

    // is_complimentary is now stored directly on the payment record, so we can read it directly

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    // For ticket payments, get registrant info from event_registrations
    const ticketPayments = (paymentsData || []).filter((p: any) => p.type === 'ticket' && p.provider_tx_id)
    const registrantMap: Record<string, { name: string; email: string; eventName: string }> = {}
    
    if (ticketPayments.length > 0) {
      const orderIds = ticketPayments.map((p: any) => p.provider_tx_id).filter(Boolean)
      
      if (orderIds.length > 0) {
        // Get all registrations with their event_ids
        const { data: registrations, error: regError } = await adminClient
          .from('event_registrations')
          .select('payment_id, full_name, email, event_id')
          .in('payment_id', orderIds)
        
        if (regError) {
          console.error('Error fetching registrations:', regError)
        } else if (registrations && registrations.length > 0) {
          // Get unique event IDs
          const eventIds = [...new Set(registrations.map((r: any) => r.event_id).filter(Boolean))]
          
          // Fetch event names separately
          const eventMap: Record<string, string> = {}
          if (eventIds.length > 0) {
            const { data: events } = await adminClient
              .from('event_registrations_events')
              .select('id, name')
              .in('id', eventIds)
            
            ;(events || []).forEach((event: any) => {
              eventMap[event.id] = event.name
            })
          }
          
          // Build the registrant map
          ;(registrations || []).forEach((reg: any) => {
            if (reg.payment_id && reg.full_name) {
              registrantMap[reg.payment_id] = {
                name: reg.full_name,
                email: reg.email || 'Guest',
                eventName: eventMap[reg.event_id] || 'Event',
              }
            }
          })
        }
      }
    }

    // Fetch profiles separately for better reliability
    const userIds = [...new Set((paymentsData || [])
      .filter((p: any) => p.user_id)
      .map((p: any) => p.user_id))]
    
    const profilesMap: Record<string, { first_name: string | null; last_name: string | null }> = {}
    
    if (userIds.length > 0) {
      const { data: profilesData } = await adminClient
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds)
      
      ;(profilesData || []).forEach((profile: any) => {
        profilesMap[profile.id] = {
          first_name: profile.first_name,
          last_name: profile.last_name,
        }
      })
    }

    // Transform data to include user info
    const transformedPayments = (paymentsData || []).map((p: any) => {
      const registrantInfo = p.provider_tx_id ? registrantMap[p.provider_tx_id] : null
      const profile = p.user_id ? profilesMap[p.user_id] : null
      
      // Determine user name with priority:
      // 1. Registration name (for tickets) - highest priority
      // 2. User's full_name
      // 3. User's first_name + last_name
      // 4. Profile's first_name + last_name
      // 5. Fallback to "Guest"
      let userName = 'Guest'
      if (registrantInfo?.name && registrantInfo.name.trim()) {
        // Use registration name for ticket payments
        userName = registrantInfo.name.trim()
      } else if (p.users?.full_name && p.users.full_name.trim()) {
        userName = p.users.full_name.trim()
      } else if (p.users?.first_name || p.users?.last_name) {
        const name = `${p.users.first_name || ''} ${p.users.last_name || ''}`.trim()
        if (name) userName = name
      } else if (profile?.first_name || profile?.last_name) {
        const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        if (name) userName = name
      }
      
      // If we still have "Guest" and there's an email, use email as fallback
      if (userName === 'Guest' && (registrantInfo?.email || p.users?.email)) {
        userName = registrantInfo?.email || p.users?.email || 'Guest'
      }
      
      // Check if this payment is for a complimentary membership (stored directly on payment record)
      const isComplimentary = p.is_complimentary === true

      return {
        ...p,
        user_email: registrantInfo?.email || p.users?.email || 'Guest',
        user_name: userName,
        event_name: registrantInfo?.eventName || null,
        is_complimentary: isComplimentary,
        // Store original amount for display, but set amount to 0 for complimentary
        original_amount: isComplimentary ? p.amount : undefined,
        amount: isComplimentary ? 0 : p.amount,
      }
    })

    return NextResponse.json({ payments: transformedPayments })
  } catch (error) {
    console.error('Error in admin payments GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Mark a pending check membership payment as completed and activate membership
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.valid) {
      return auth.response!;
    }

    const body = await request.json();
    const { paymentId } = body || {};

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Update the payment to completed (only for admin membership payments)
    const { data: updatedPayment, error: paymentError } = await adminClient
      .from("payments")
      .update({ status: "completed" })
      .eq("id", paymentId)
      .eq("type", "membership")
      .eq("provider", "admin")
      .select("*")
      .single();

    if (paymentError || !updatedPayment) {
      console.error("Error updating payment status:", paymentError);
      return NextResponse.json(
        { error: paymentError?.message || "Failed to update payment status" },
        { status: 500 }
      );
    }

    const membershipLevel = updatedPayment.membership_level as string | null;
    const membershipUserId = updatedPayment.user_id as string | null;

    if (membershipLevel && membershipUserId) {
      // Activate the most recent pending membership for this user & level
      const { error: membershipError } = await adminClient
        .from("memberships")
        .update({ status: "active" })
        .eq("user_id", membershipUserId)
        .eq("level", membershipLevel)
        .eq("status", "pending");

      if (membershipError) {
        console.error("Error activating membership:", membershipError);
        // Don't fail the whole request – payment status is already updated
      }

      // Send activation email to the member (non-blocking)
      // Look up user profile for name info
      const { data: profile } = await adminClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', membershipUserId)
        .single()

      const { data: user } = await adminClient
        .from('users')
        .select('email')
        .eq('id', membershipUserId)
        .single()

      if (user?.email) {
        sendMemberActivationEmail({
          email: user.email,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          membershipLevel: membershipLevel,
        }).catch((error) => {
          console.error('Error sending member activation email:', error)
        })
      }
    }

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Error in admin payments POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}