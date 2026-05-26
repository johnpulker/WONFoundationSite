import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { validateAdminSession } from '@/lib/adminSessionServer'

// Allow longer execution time for large photo operations
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

// GET - Fetch all gallery photos with pagination support
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.valid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100') // Default 100, max 500
    const maxLimit = Math.min(limit, 500)
    const offset = (page - 1) * maxLimit

    const adminClient = createAdminClient()

    // Get total count for pagination info
    const { count, error: countError } = await adminClient
      .from('gallery_photos')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error counting gallery photos:', countError)
    }

    // Fetch photos with pagination
    const { data: photos, error } = await adminClient
      .from('gallery_photos')
      .select('*')
      .order('year', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + maxLimit - 1)

    if (error) {
      console.error('Error fetching gallery photos:', error)
      return NextResponse.json({ error: 'Failed to fetch gallery photos' }, { status: 500 })
    }

    return NextResponse.json({ 
      photos: photos || [],
      pagination: {
        page,
        limit: maxLimit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / maxLimit)
      }
    })
  } catch (error) {
    console.error('Error in gallery photos GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new gallery photo
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.valid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    // Get max order
    const { data: existing } = await adminClient
      .from('gallery_photos')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)

    const maxOrder = existing && existing.length > 0 ? existing[0].display_order : 0

    const { data, error } = await adminClient
      .from('gallery_photos')
      .insert({
        image_url: body.image_url,
        caption: body.caption,
        year: body.year,
        category: body.category || '2025-ww',
        aspect_ratio: body.aspect_ratio || 'landscape',
        display_order: body.display_order ?? maxOrder + 1,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating gallery photo:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ photo: data })
  } catch (error) {
    console.error('Error in gallery photos POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a gallery photo
export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.valid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('gallery_photos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating gallery photo:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ photo: data })
  } catch (error) {
    console.error('Error in gallery photos PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a gallery photo
export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.valid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('gallery_photos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting gallery photo:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in gallery photos DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
