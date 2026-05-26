import { NextRequest } from 'next/server'
import { deleteAdminSession, validateAdminSession, logAdminAction } from '@/lib/adminSessionServer'

/**
 * Logout admin and delete session
 */
export async function POST(request: NextRequest) {
  // Get session before deleting (for audit log)
  const auth = await validateAdminSession(request)
  
  // Delete session from database and clear cookie
  const response = await deleteAdminSession(request)
  
  // Log logout
  if (auth.valid && auth.sessionId) {
    await logAdminAction(
      auth.sessionId,
      'LOGOUT',
      null,
      null,
      request,
      true
    )
  }

  return response
}

