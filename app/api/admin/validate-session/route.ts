import { NextRequest, NextResponse } from 'next/server'
import { validateAdminSession } from '@/lib/adminSessionServer'

/**
 * Validate admin session from HttpOnly cookie
 * Called by frontend to check if session is still valid
 */
export async function GET(request: NextRequest) {
  const auth = await validateAdminSession(request)
  
  if (!auth.valid) {
    return NextResponse.json(
      { valid: false },
      { status: 401 }
    )
  }

  return NextResponse.json({ valid: true })
}

