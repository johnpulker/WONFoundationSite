import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { validateAdminSession } from '@/lib/adminSessionServer'

// Configure route to handle large file uploads (up to 2GB)
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for large uploads

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

    // Validate file size (max 2GB for gallery photos - allows for high-res photos and archives)
    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2GB. Please compress or split the file.' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `gallery-${timestamp}-${sanitizedName}`

    // Upload to Supabase Storage (using 'gallery-photos' bucket)
    // Note: Make sure this bucket exists in your Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('gallery-photos')
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
      .from('gallery-photos')
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
