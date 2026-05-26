import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

/**
 * Check if a password reset request is still valid (within 1 hour)
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
    const EXPIRATION_MS = 60 * 60 * 1000 // 1 hour in milliseconds

    const { data: resetRequest, error: resetRequestError } = await supabaseAdmin
      .from('password_reset_requests')
      .select('*')
      .eq('email', email.toLowerCase())
      .is('used_at', null) // Not already used
      .order('requested_at', { ascending: false })
      .limit(1)
      .single()

    if (resetRequestError || !resetRequest) {
      return NextResponse.json(
        { valid: false, error: 'No valid reset request found' },
        { status: 400 }
      )
    }

    // Parse timestamps - ensure we're working with UTC
    const requestedAt = new Date(resetRequest.requested_at).getTime()
    const now = Date.now()
    
    // Double-check the timestamp is valid
    if (isNaN(requestedAt) || requestedAt <= 0) {
      console.error("Invalid requested_at timestamp:", resetRequest.requested_at)
      return NextResponse.json(
        { valid: false, error: 'Invalid reset request timestamp' },
        { status: 400 }
      )
    }
    
    const age = now - requestedAt

    if (age > EXPIRATION_MS) {
      return NextResponse.json(
        { valid: false, error: 'Reset link has expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      ageMinutes: Math.floor(age / 1000 / 60),
    })
  } catch (error: any) {
    console.error('Error checking reset expiration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
