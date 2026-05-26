import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

// Public API – no auth required. Returns gallery photos for the public WONder Women gallery page.
export const dynamic = 'force-dynamic'
export const revalidate = 0

const MAX_PHOTOS = 2000 // Support hundreds of photos in one response

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data: photos, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('year', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(MAX_PHOTOS)

    if (error) {
      console.error('Error fetching gallery photos (public):', error)
      return NextResponse.json(
        { error: 'Failed to fetch gallery photos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      photos: photos || [],
    })
  } catch (error) {
    console.error('Error in gallery photos list GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
