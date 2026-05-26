import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { validateAdminSession } from '@/lib/adminSessionServer'

// Configure route to handle file uploads
export const runtime = 'nodejs'
export const maxDuration = 60 // 1 minute

// Helper to check admin auth
async function checkAdminAuth(request: NextRequest): Promise<{ valid: boolean }> {
  // Try session-based auth first (preferred)
  const sessionAuth = await validateAdminSession(request)
  if (sessionAuth.valid) {
    return { valid: true }
  }
  
  // Fallback to password-based auth for backward compatibility
  const password = request.headers.get('x-admin-password')
  const adminPassword = process.env.ADMIN_PASSWORD
  return { valid: !!(adminPassword && password === adminPassword) }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.valid) {
      return NextResponse.json({ error: 'Forbidden - Invalid or expired session' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const eventId = formData.get('eventId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = eventId 
      ? `event-${eventId}-${timestamp}-${sanitizedName}`
      : `event-${timestamp}-${sanitizedName}`

    // Upload to Supabase Storage (using 'event-photos' bucket)
    // Note: Make sure this bucket exists in your Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('event-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('event-photos')
      .getPublicUrl(fileName)

    return NextResponse.json({
      url: publicUrl,
      fileName: fileName,
    })
  } catch (error) {
    console.error('Error in upload:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

