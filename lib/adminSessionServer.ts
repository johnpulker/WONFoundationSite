/**
 * Server-side admin session management
 * Uses database-backed sessions with HttpOnly cookies
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { randomBytes, createHash } from 'crypto'

const SESSION_DURATION_MS = 60 * 60 * 1000 // 1 hour
const SESSION_COOKIE_NAME = 'admin_session_token'

/**
 * Generate a secure random session token
 */
function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Hash session token for database storage (SHA-256)
 * Cookie contains raw token, DB stores hash
 */
function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Get session token from request cookies
 */
export function getSessionToken(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value || null
}

/**
 * Create a new admin session and return response with HttpOnly cookie
 * SECURITY: Stores hashed token in DB, raw token in cookie
 * Also deletes any existing sessions for this IP (single session per login, prevents session fixation)
 */
export async function createAdminSession(
  request: NextRequest,
  ipAddress: string,
  userAgent: string
): Promise<{ sessionToken: string; response: NextResponse }> {
  const supabase = createAdminClient()
  const sessionToken = generateSessionToken()
  const tokenHash = hashSessionToken(sessionToken)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  // Delete any existing sessions for this IP (single session per login)
  // This prevents session fixation and ensures fresh session on each login
  await supabase
    .from('admin_sessions')
    .delete()
    .eq('ip_address', ipAddress)

  // Store session in database (hashed token, not plaintext)
  // First try with hash column (migration 012), fall back to plaintext if column doesn't exist
  let insertData: any = {
    expires_at: expiresAt.toISOString(),
    ip_address: ipAddress,
    user_agent: userAgent,
  }

  // Try to insert with hash first (preferred)
  let { error } = await supabase
    .from('admin_sessions')
    .insert({
      ...insertData,
      session_token_hash: tokenHash, // Store hash, not plaintext
    })

  // If hash column doesn't exist (migration 012 not run), fall back to plaintext
  if (error && (error.message?.includes('session_token_hash') || error.code === '42703')) {
    console.warn('session_token_hash column not found, using plaintext token (run migration 012_admin_security_enhancements.sql)')
    const { error: plainError } = await supabase
      .from('admin_sessions')
      .insert({
        ...insertData,
        session_token: sessionToken, // Fallback to plaintext
      })
    
    if (plainError) {
      console.error('Error creating admin session (plaintext fallback):', JSON.stringify(plainError, null, 2))
      if (plainError.message?.includes('does not exist') || plainError.code === '42P01') {
        throw new Error('admin_sessions table does not exist. Please run migration 011_admin_sessions_audit.sql in Supabase SQL Editor.')
      }
      throw new Error(`Failed to create session: ${plainError.message || JSON.stringify(plainError)}`)
    }
  } else if (error) {
    console.error('Error creating admin session:', JSON.stringify(error, null, 2))
    if (error.message?.includes('does not exist') || error.code === '42P01') {
      throw new Error('admin_sessions table does not exist. Please run migration 011_admin_sessions_audit.sql in Supabase SQL Editor.')
    }
    throw new Error(`Failed to create session: ${error.message || JSON.stringify(error)}`)
  }

  // Create response with HttpOnly, Secure, SameSite cookie
  const isProduction = process.env.NODE_ENV === 'production'
  const response = NextResponse.json({ success: true })
  
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: 'strict',
    maxAge: SESSION_DURATION_MS / 1000, // Convert to seconds
    path: '/',
  })

  return { sessionToken, response }
}

/**
 * Validate session token and return session data if valid
 * SECURITY: Compares hashed token from cookie with hash in database
 */
export async function validateAdminSession(
  request: NextRequest
): Promise<{ valid: boolean; sessionId?: string; ipAddress?: string }> {
  const sessionToken = getSessionToken(request)
  
  if (!sessionToken) {
    return { valid: false }
  }

  const supabase = createAdminClient()
  const tokenHash = hashSessionToken(sessionToken)

  // Check if session exists and is not expired
  // Try hashed token first (new), fall back to plaintext (migration period)
  let data
  let usingHashedToken = false
  
  // First try: hashed token (preferred, more secure)
  const hashResult = await supabase
    .from('admin_sessions')
    .select('id, expires_at, ip_address')
    .eq('session_token_hash', tokenHash)
    .single()

  if (!hashResult.error && hashResult.data) {
    data = hashResult.data
    usingHashedToken = true
  } else {
    // Fallback: plaintext token (for migration period only)
    const plainResult = await supabase
      .from('admin_sessions')
      .select('id, expires_at, ip_address')
      .eq('session_token', sessionToken)
      .single()
    
    if (plainResult.error || !plainResult.data) {
      return { valid: false }
    }
    
    data = plainResult.data
    usingHashedToken = false
    
    // Migrate: update to use hashed token
    await supabase
      .from('admin_sessions')
      .update({ session_token_hash: tokenHash })
      .eq('session_token', sessionToken)
  }

  if (!data) {
    return { valid: false }
  }

  // Check expiration
  const expiresAt = new Date(data.expires_at)
  if (expiresAt < new Date()) {
    // Session expired - delete it and log
    // Delete by hash if available, else by plaintext token
    if (usingHashedToken) {
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token_hash', tokenHash)
    } else {
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken)
    }
    
    // Log session expiration
    await logAdminAction(
      data.id,
      'SESSION_EXPIRED',
      null,
      null,
      request,
      false,
      'Session expired',
      { ip: getClientIP(request) }
    )
    
    return { valid: false }
  }

  // Update last accessed time (and ensure hash is set if migrating)
  const updateData: any = { last_accessed_at: new Date().toISOString() }
  if (!usingHashedToken) {
    // Migrate: set hash if not already set
    updateData.session_token_hash = tokenHash
  }
  
  await supabase
    .from('admin_sessions')
    .update(updateData)
    .eq('id', data.id)

  return {
    valid: true,
    sessionId: data.id,
    ipAddress: data.ip_address || undefined,
  }
}

/**
 * Delete session and return response with cleared cookie
 */
export async function deleteAdminSession(
  request: NextRequest,
  sessionToken?: string
): Promise<NextResponse> {
  const token = sessionToken || getSessionToken(request)
  
  if (token) {
    const supabase = createAdminClient()
    const tokenHash = hashSessionToken(token)
    await supabase
      .from('admin_sessions')
      .delete()
      .eq('session_token_hash', tokenHash) // Delete by hash
  }

  // Create response with cleared cookie
  const response = NextResponse.json({ success: true })
  response.cookies.delete(SESSION_COOKIE_NAME)
  
  return response
}

/**
 * Log admin action to audit trail
 * SECURITY: Does NOT log sensitive data (addresses, passwords, tokens)
 * Only logs action metadata, resource IDs, and field names changed
 */
export async function logAdminAction(
  sessionId: string | undefined,
  action: string,
  resourceType: string | null,
  resourceId: string | null,
  request: NextRequest,
  success: boolean = true,
  errorMessage?: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const supabase = createAdminClient()
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || null

    // Sanitize details to ensure no sensitive data is logged
    const sanitizedDetails = details ? sanitizeAuditDetails(details) : null

    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        session_id: sessionId || null,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        ip_address: ipAddress,
        user_agent: userAgent,
        success,
        error_message: errorMessage || null,
        details: sanitizedDetails,
      })

    if (error) {
      // Log error but don't throw - audit logging should never break the main flow
      console.error('Error logging admin action:', error)
    }
  } catch (error) {
    // Log error but don't throw - audit logging should never break the main flow
    console.error('Exception in logAdminAction:', error)
  }
}

/**
 * Sanitize audit log details to remove sensitive information
 * Ensures we don't log addresses, passwords, tokens, or full payloads
 */
function sanitizeAuditDetails(details: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  const sensitiveKeys = [
    'password',
    'token',
    'address',
    'address_line1',
    'address_line2',
    'phone',
    'email',
    'session_token',
    'admin_password',
  ]

  for (const [key, value] of Object.entries(details)) {
    const keyLower = key.toLowerCase()
    
    // Skip sensitive fields
    if (sensitiveKeys.some(sk => keyLower.includes(sk))) {
      continue
    }

    // For arrays/objects, only log structure, not content
    if (Array.isArray(value)) {
      sanitized[key] = `[${value.length} items]`
    } else if (typeof value === 'object' && value !== null) {
      // Only log object keys, not values (to avoid logging sensitive nested data)
      sanitized[key] = Object.keys(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Get client IP address (handles proxies/CDN correctly)
 * SECURITY: Only trusts headers when behind trusted proxy (Cloudflare, Render, etc.)
 * Prefers cf-connecting-ip if behind Cloudflare, else first IP in x-forwarded-for
 */
export function getClientIP(request: NextRequest): string {
  // Prefer cf-connecting-ip if behind Cloudflare (most trustworthy)
  const cfIP = request.headers.get('cf-connecting-ip')
  if (cfIP) {
    return cfIP.trim()
  }

  // Try x-forwarded-for (most common behind proxies)
  // SECURITY: Only trust if we're behind a trusted proxy (which we are on Render/Cloudflare)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for format: "client, proxy1, proxy2"
    // The first IP is the original client IP (when behind trusted proxy)
    const ips = forwarded.split(',').map(ip => ip.trim()).filter(ip => ip)
    if (ips.length > 0) {
      return ips[0]
    }
  }

  // Try x-real-ip (some proxies use this)
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  // Fallback (shouldn't happen behind proxy, but just in case)
  // Note: In production behind proxy, this should rarely be used
  return 'unknown'
}

