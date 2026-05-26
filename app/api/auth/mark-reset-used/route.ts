import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

/**
 * Mark a password reset request as used
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Get the most recent unused reset request first
    const { data: resetRequest, error: findError } = await supabaseAdmin
      .from('password_reset_requests')
      .select('id')
      .eq('email', email.toLowerCase())
      .is('used_at', null)
      .order('requested_at', { ascending: false })
      .limit(1)
      .single()

    if (findError || !resetRequest) {
      console.error('No unused reset request found to mark as used:', findError)
      return NextResponse.json(
        { error: 'No unused reset request found' },
        { status: 404 }
      )
    }

    // Mark THIS SPECIFIC reset request as used (by ID)
    const { error: updateError } = await supabaseAdmin
      .from('password_reset_requests')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetRequest.id)

    if (updateError) {
      console.error('Error marking reset as used:', updateError)
      return NextResponse.json(
        { error: 'Failed to mark reset as used' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in mark-reset-used route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
