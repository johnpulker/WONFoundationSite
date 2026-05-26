import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { requireAdminAuth } from '@/lib/adminAuth'

// GET - Fetch all honorees
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const adminClient = createAdminClient()
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')

    let query = adminClient
      .from('wonder_women')
      .select('*')
      .order('year', { ascending: false })
      .order('honoree_order', { ascending: true })

    if (year) {
      query = query.eq('year', parseInt(year))
    }

    const { data: honorees, error } = await query

    if (error) {
      console.error('Error fetching honorees:', error)
      return NextResponse.json({ error: 'Failed to fetch honorees' }, { status: 500 })
    }

    return NextResponse.json({ honorees: honorees || [] })
  } catch (error) {
    console.error('Error in admin honorees GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new honoree
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    // Get max order for this year
    const { data: existing } = await adminClient
      .from('wonder_women')
      .select('honoree_order')
      .eq('year', body.year)
      .order('honoree_order', { ascending: false })
      .limit(1)

    const maxOrder = existing && existing.length > 0 ? existing[0].honoree_order : 0

    const { data, error } = await adminClient
      .from('wonder_women')
      .insert({
        name: body.name,
        title: body.title || null,
        bio: body.bio || null,
        photo_url: body.photo_url || null,
        year: body.year,
        honoree_order: body.honoree_order ?? maxOrder + 1,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating honoree:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ honoree: data })
  } catch (error) {
    console.error('Error in admin honorees POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update an existing honoree
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    if (!body.id) {
      return NextResponse.json({ error: 'Honoree ID is required' }, { status: 400 })
    }

    const { data, error } = await adminClient
      .from('wonder_women')
      .update({
        name: body.name,
        title: body.title || null,
        bio: body.bio || null,
        photo_url: body.photo_url || null,
        year: body.year,
        honoree_order: body.honoree_order,
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating honoree:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ honoree: data })
  } catch (error) {
    console.error('Error in admin honorees PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete an honoree
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Honoree ID is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('wonder_women')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting honoree:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin honorees DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

