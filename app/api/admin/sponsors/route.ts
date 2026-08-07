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

    const { data, error } = await adminClient
      .from('payments')
      .select(`
        id,
        created_at,
        amount,
        status,
        provider,
        provider_tx_id,
        membership_level,
        user_id,
        users:user_id (
          email,
          full_name,
          first_name,
          last_name
        )
      `)
      .eq('type', 'sponsorship')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sponsors:', error)
      return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 })
    }

    return NextResponse.json({ sponsors: data || [] })
  } catch (err) {
    console.error('Sponsors route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
