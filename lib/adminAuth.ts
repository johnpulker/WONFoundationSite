/**
 * Shared admin authentication helper
 * All admin routes should use this for consistent server-side session validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateAdminSession, logAdminAction } from './adminSessionServer'

export interface AdminAuthResult {
  valid: boolean
  sessionId?: string
  response?: NextResponse
}

/**
 * Validate admin session on any admin API route
 * Returns auth result and optional 403 response
 */
export async function requireAdminAuth(
  request: NextRequest
): Promise<AdminAuthResult> {
  const auth = await validateAdminSession(request)
  
  if (!auth.valid) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Forbidden - Invalid or expired session' },
        { status: 403 }
      ),
    }
  }

  return {
    valid: true,
    sessionId: auth.sessionId,
  }
}

/**
 * Log admin action with automatic session context
 */
export async function logAdminActionWithSession(
  sessionId: string | undefined,
  action: string,
  resourceType: string | null,
  resourceId: string | null,
  request: NextRequest,
  success: boolean = true,
  errorMessage?: string,
  details?: Record<string, any>
): Promise<void> {
  await logAdminAction(
    sessionId,
    action,
    resourceType,
    resourceId,
    request,
    success,
    errorMessage,
    details
  )
}

