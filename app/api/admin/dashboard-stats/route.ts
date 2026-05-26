import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { requireAdminAuth } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const adminClient = createAdminClient()

    // Get current month start and end dates
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    // Fetch all stats in parallel
    const [
      membersResult,
      paymentsThisMonthResult,
      upcomingEventsResult,
      honoreesResult,
      totalRevenueResult,
      complimentaryMembershipsResult,
      activeMembersResult,
    ] = await Promise.all([
      // Total members
      adminClient
        .from('users')
        .select('id', { count: 'exact', head: true }),

      // Payments this month
      adminClient
        .from('payments')
        .select('amount, status, is_complimentary')
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd),

      // Upcoming events (active and future dates)
      adminClient
        .from('event_registrations_events')
        .select('id')
        .eq('is_active', true)
        .gte('date', now.toISOString()),

      // Total honorees
      adminClient
        .from('wonder_women')
        .select('id', { count: 'exact', head: true }),

      // Total revenue (all completed payments, excluding complimentary memberships)
      adminClient
        .from('payments')
        .select('amount, is_complimentary, status')
        .eq('status', 'completed'),
      
      // Note: is_complimentary is now stored directly on payments, so we don't need to fetch memberships
      // Keeping this for backwards compatibility but it won't be used
      adminClient
        .from('memberships')
        .select('id', { count: 'exact', head: true })
        .limit(0),

      // Active memberships
      adminClient
        .from('memberships')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
    ])

    // Calculate stats
    const totalMembers = membersResult.count || 0
    const activeMembers = activeMembersResult.count || 0
    
    const paymentsThisMonth = (paymentsThisMonthResult.data || []).filter(
      p => p.status === 'completed'
    ).length
    
    const upcomingEvents = upcomingEventsResult.data?.length || 0
    const totalHonorees = honoreesResult.count || 0

    // Helper function to check if a payment is complimentary (stored directly on payment record)
    const isComplimentaryPayment = (payment: any) => {
      return payment.is_complimentary === true
    }

    // Calculate revenue, excluding payments for complimentary memberships
    const totalRevenue = (totalRevenueResult.data || [])
      .filter(p => !p.is_complimentary)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const revenueThisMonth = (paymentsThisMonthResult.data || [])
      .filter(p => p.status === 'completed' && !p.is_complimentary)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    return NextResponse.json({
      stats: {
        totalMembers,
        activeMembers,
        paymentsThisMonth,
        upcomingEvents,
        totalHonorees,
        totalRevenue,
        revenueThisMonth,
      },
    })
  } catch (error) {
    console.error('Error in dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

