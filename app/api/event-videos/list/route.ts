import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient()
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')

    let query = adminClient
      .from('event_videos')
      .select('id, title, description, youtube_url, event_date, year, video_order')
      .eq('is_active', true)
      .order('year', { ascending: false })
      .order('video_order', { ascending: true })

    if (year) {
      query = query.eq('year', parseInt(year))
    }

    const { data: videos, error } = await query

    if (error) {
      console.error('Error fetching event videos:', error)
      return NextResponse.json({ error: 'Failed to fetch event videos' }, { status: 500 })
    }

    return NextResponse.json({ videos: videos || [] })
  } catch (error) {
    console.error('Error in event-videos list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
