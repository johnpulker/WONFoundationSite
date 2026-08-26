import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export const revalidate = 60 // cache for 60 seconds

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('payments')
      .select('id, payer_name, payer_email, membership_level, amount, created_at')
      .eq('type', 'sponsorship')
      .eq('status', 'completed')
      .order('amount', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[api/sponsors/list] Error fetching sponsors:', error)
      return NextResponse.json({ sponsors: [] })
    }

    // Map to public-safe shape (no emails, no internal IDs)
    const sponsors = (data || []).map((s) => ({
      name: s.payer_name || 'Anonymous Sponsor',
      tier: s.membership_level || 'Sponsor',
      amount: s.amount,
    }))

    return NextResponse.json({ sponsors })
  } catch (err) {
    console.error('[api/sponsors/list] Error:', err)
    return NextResponse.json({ sponsors: [] })
  }
}
