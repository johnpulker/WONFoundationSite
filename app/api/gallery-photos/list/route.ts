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

    // Filter buttons: categories in the admin's order. Falls back to the
    // categories found on photos if migration 030 hasn't been run yet.
    let categories: { id: string; label: string }[] = []
    const { data: categoryRows, error: categoryError } = await supabase
      .from('gallery_categories')
      .select('id, label')
      .order('sort_order', { ascending: true })
      .order('label', { ascending: true })

    if (!categoryError && categoryRows) {
      categories = categoryRows
    } else {
      const seen = new Set<string>()
      for (const photo of photos || []) {
        if (photo.category && !seen.has(photo.category)) {
          seen.add(photo.category)
          categories.push({ id: photo.category, label: photo.category })
        }
      }
    }

    return NextResponse.json({
      photos: photos || [],
      categories,
    })
  } catch (error) {
    console.error('Error in gallery photos list GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
