import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { validateAdminSession } from '@/lib/adminSessionServer'
import { categoryIdFromLabel } from '@/lib/gallery'

// Same auth pattern as the other gallery admin routes
async function checkAdminAuth(request: NextRequest): Promise<{ valid: boolean }> {
  const sessionAuth = await validateAdminSession(request)
  if (sessionAuth.valid) {
    return { valid: true }
  }
  const password = request.headers.get('x-admin-password')
  const adminPassword = process.env.ADMIN_PASSWORD
  return { valid: !!(adminPassword && password === adminPassword) }
}

const forbidden = () => NextResponse.json({ error: 'Forbidden' }, { status: 403 })

// GET - All categories in display order, with how many photos each has
export async function GET(request: NextRequest) {
  try {
    if (!(await checkAdminAuth(request)).valid) return forbidden()

    const supabase = createAdminClient()
    const { data: categories, error } = await supabase
      .from('gallery_categories')
      .select('id, label, sort_order')
      .order('sort_order', { ascending: true })
      .order('label', { ascending: true })

    if (error) {
      console.error('Error fetching gallery categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories. Has migration 030 been run?' }, { status: 500 })
    }

    const withCounts = await Promise.all(
      (categories || []).map(async (c) => {
        const { count } = await supabase
          .from('gallery_photos')
          .select('id', { count: 'exact', head: true })
          .eq('category', c.id)
        return { ...c, photo_count: count || 0 }
      })
    )

    return NextResponse.json({ categories: withCounts })
  } catch (error) {
    console.error('Error in gallery categories GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a category. New categories go to the top of the list.
export async function POST(request: NextRequest) {
  try {
    if (!(await checkAdminAuth(request)).valid) return forbidden()

    const body = await request.json()
    const label = String(body.label || '').trim().slice(0, 40)
    const id = categoryIdFromLabel(label)
    if (!label || !id) {
      return NextResponse.json({ error: 'Please enter a category name.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('gallery_categories')
      .select('id, label')
      .eq('id', id)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: `A category like "${existing.label}" already exists.` }, { status: 409 })
    }

    const { data: first } = await supabase
      .from('gallery_categories')
      .select('sort_order')
      .order('sort_order', { ascending: true })
      .limit(1)
    const sortOrder = first && first.length > 0 ? first[0].sort_order - 10 : 10

    const { data, error } = await supabase
      .from('gallery_categories')
      .insert({ id, label, sort_order: sortOrder })
      .select('id, label, sort_order')
      .single()

    if (error) {
      console.error('Error creating gallery category:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ category: { ...data, photo_count: 0 } })
  } catch (error) {
    console.error('Error in gallery categories POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Rename a category ({ id, label }) or save a new order ({ order: [id, id, ...] })
export async function PUT(request: NextRequest) {
  try {
    if (!(await checkAdminAuth(request)).valid) return forbidden()

    const body = await request.json()
    const supabase = createAdminClient()

    if (Array.isArray(body.order)) {
      const ids: string[] = body.order.filter((x: unknown) => typeof x === 'string')
      for (let i = 0; i < ids.length; i++) {
        const { error } = await supabase
          .from('gallery_categories')
          .update({ sort_order: (i + 1) * 10 })
          .eq('id', ids[i])
        if (error) {
          console.error('Error reordering gallery categories:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }
      return NextResponse.json({ success: true })
    }

    const id = String(body.id || '')
    const label = String(body.label || '').trim().slice(0, 40)
    if (!id || !label) {
      return NextResponse.json({ error: 'Category and new name are required.' }, { status: 400 })
    }

    // Only the visible name changes; photos keep pointing at the same category
    const { data, error } = await supabase
      .from('gallery_categories')
      .update({ label })
      .eq('id', id)
      .select('id, label, sort_order')
      .single()

    if (error) {
      console.error('Error renaming gallery category:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ category: data })
  } catch (error) {
    console.error('Error in gallery categories PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove a category (only when no photos use it)
export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAdminAuth(request)).valid) return forbidden()

    const id = new URL(request.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { count } = await supabase
      .from('gallery_photos')
      .select('id', { count: 'exact', head: true })
      .eq('category', id)
    if ((count || 0) > 0) {
      return NextResponse.json(
        { error: `This category still has ${count} photo${count === 1 ? '' : 's'}. Move or delete them first.` },
        { status: 409 }
      )
    }

    const { error } = await supabase.from('gallery_categories').delete().eq('id', id)
    if (error) {
      console.error('Error deleting gallery category:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in gallery categories DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
