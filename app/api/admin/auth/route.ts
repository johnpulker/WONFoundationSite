import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { checkRateLimitWithIP } from '@/lib/rateLimit'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { 
  createAdminSession, 
  getClientIP, 
  logAdminAction 
} from '@/lib/adminSessionServer'

interface AdminAuthBody {
  password: string
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next()
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    // Rate limiting: 
    // - 5 attempts per IP per 15 minutes
    // - 20 attempts globally per 15 minutes (prevents distributed attacks)
    // Uses real client IP (handles proxies/CDN correctly)
    const rateLimit = checkRateLimitWithIP(
      clientIP,
      'admin-login',
      5, // per IP
      15 * 60 * 1000, // 15 minutes
      20 // global limit
    )
    
    if (!rateLimit.allowed) {
      // Log failed login attempt (rate limited)
      await logAdminAction(
        undefined,
        'LOGIN_ATTEMPT',
        null,
        null,
        request,
        false,
        `Rate limited: ${rateLimit.reason}`,
        { ip: clientIP, reason: rateLimit.reason }
      )

      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      const retryAfterMinutes = Math.ceil(retryAfter / 60)
      return NextResponse.json(
        { 
          error: `Too many login attempts. Please try again in ${retryAfterMinutes} minute${retryAfterMinutes !== 1 ? 's' : ''}.`,
          retryAfter: retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      )
    }

    const body: AdminAuthBody = await request.json()

    // Validate password
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set!')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const passwordValid = body.password === adminPassword

    if (!passwordValid) {
      // Log failed login attempt
      await logAdminAction(
        undefined,
        'LOGIN_FAIL',
        null,
        null,
        request,
        false,
        'Invalid password',
        { ip: clientIP }
      )

      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Password valid - create server-side session with HttpOnly cookie
    let sessionToken: string
    let sessionResponse: NextResponse
    
    try {
      const sessionResult = await createAdminSession(
        request,
        clientIP,
        userAgent
      )
      sessionToken = sessionResult.sessionToken
      sessionResponse = sessionResult.response
    } catch (error) {
      console.error('Error creating admin session:', error)
      await logAdminAction(
        undefined,
        'LOGIN_ATTEMPT',
        null,
        null,
        request,
        false,
        `Session creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { ip: clientIP }
      )
      return NextResponse.json(
        { error: 'Failed to create session. Please check database migration.' },
        { status: 500 }
      )
    }

    // Get session ID for audit log (query by hash, not plaintext)
    let sessionId: string | undefined
    try {
      const supabase = createAdminClient()
      const tokenHash = createHash('sha256').update(sessionToken).digest('hex')
      const { data: sessionData, error: sessionQueryError } = await supabase
        .from('admin_sessions')
        .select('id')
        .eq('session_token_hash', tokenHash)
        .single()

      if (sessionQueryError) {
        console.warn('Could not find session for audit log (non-critical):', sessionQueryError.message)
      } else {
        sessionId = sessionData?.id
      }
    } catch (error) {
      console.warn('Error querying session for audit log (non-critical):', error)
      // Continue without session ID - audit log will still work
    }

    // Log successful login (don't fail if audit log fails)
    try {
      await logAdminAction(
        sessionId,
        'LOGIN_SUCCESS',
        null,
        null,
        request,
        true,
        undefined,
        { ip: clientIP }
      )
    } catch (error) {
      console.error('Error logging admin action (non-critical):', error)
      // Don't fail the login if audit logging fails
    }

    // Return success with session cookie set
    return sessionResponse
  } catch (error) {
    console.error('Error in admin auth:', error)
    
    // Log error (don't await - if it fails, we still want to return error)
    logAdminAction(
      undefined,
      'LOGIN_ATTEMPT',
      null,
      null,
      request,
      false,
      error instanceof Error ? error.message : 'Unknown error',
      { ip: clientIP }
    ).catch(err => {
      console.error('Failed to log error:', err)
    })

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

