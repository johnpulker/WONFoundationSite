import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { requireAdminAuth } from '@/lib/adminAuth'

// GET - Fetch all event videos
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) return auth.response!

    const adminClient = createAdminClient()

    const { data: videos, error } = await adminClient
      .from('event_videos')
      .select('*')
      .order('year', { ascending: false })
      .order('video_order', { ascending: true })

    if (error) {
      console.error('Error fetching event videos:', error)
      return NextResponse.json({ error: 'Failed to fetch event videos' }, { status: 500 })
    }

    return NextResponse.json({ videos: videos || [] })
  } catch (error) {
    console.error('Error in admin event-videos GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new event video
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) return auth.response!

    const body = await request.json()
    const adminClient = createAdminClient()

    if (!body.title || !body.youtube_url) {
      return NextResponse.json({ error: 'Title and YouTube URL are required' }, { status: 400 })
    }

    // Auto-assign video_order as max + 1 within the same year
    const { data: existing } = await adminClient
      .from('event_videos')
      .select('video_order')
      .eq('year', body.year)
      .order('video_order', { ascending: false })
      .limit(1)

    const maxOrder = existing && existing.length > 0 ? existing[0].video_order : 0

    const { data, error } = await adminClient
      .from('event_videos')
      .insert({
        title: body.title,
        description: body.description || null,
        youtube_url: body.youtube_url,
        event_date: body.event_date || null,
        year: body.year || new Date().getFullYear(),
        is_active: body.is_active ?? true,
        video_order: body.video_order ?? maxOrder + 1,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating event video:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ video: data })
  } catch (error) {
    console.error('Error in admin event-videos POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update an existing event video
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) return auth.response!

    const body = await request.json()
    const adminClient = createAdminClient()

    if (!body.id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const { data, error } = await adminClient
      .from('event_videos')
      .update({
        title: body.title,
        description: body.description || null,
        youtube_url: body.youtube_url,
        event_date: body.event_date || null,
        year: body.year,
        is_active: body.is_active ?? true,
        video_order: body.video_order,
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event video:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ video: data })
  } catch (error) {
    console.error('Error in admin event-videos PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Toggle is_active
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) return auth.response!

    const body = await request.json()
    const adminClient = createAdminClient()

    if (!body.id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const { data, error } = await adminClient
      .from('event_videos')
      .update({ is_active: body.is_active })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling event video:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ video: data })
  } catch (error) {
    console.error('Error in admin event-videos PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete an event video
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) return auth.response!

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('event_videos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting event video:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin event-videos DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
