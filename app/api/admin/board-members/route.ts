import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { requireAdminAuth } from '@/lib/adminAuth'

// GET - Fetch all board members
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const adminClient = createAdminClient()

    const { data: members, error } = await adminClient
      .from('board_members')
      .select('*')
      .order('category', { ascending: true })
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching board members:', error)
      return NextResponse.json({ error: 'Failed to fetch board members' }, { status: 500 })
    }

    return NextResponse.json({ members: members || [] })
  } catch (error) {
    console.error('Error in admin board members GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new board member
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    // Get max order for this category
    const { data: existing } = await adminClient
      .from('board_members')
      .select('display_order')
      .eq('category', body.category)
      .order('display_order', { ascending: false })
      .limit(1)

    const maxOrder = existing && existing.length > 0 ? existing[0].display_order : 0

    const { data, error } = await adminClient
      .from('board_members')
      .insert({
        name: body.name,
        role: body.role || null,
        category: body.category,
        profession: body.profession || null,
        bio: body.bio || null,
        bio_url: body.bio_url || null,
        photo_url: body.photo_url || null,
        slug: body.slug || null,
        display_order: body.display_order ?? maxOrder + 1,
        is_vacant: body.is_vacant || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating board member:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member: data })
  } catch (error) {
    console.error('Error in admin board members POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update an existing board member
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    if (!body.id) {
      return NextResponse.json({ error: 'Board member ID is required' }, { status: 400 })
    }

    const { data, error } = await adminClient
      .from('board_members')
      .update({
        name: body.name,
        role: body.role || null,
        category: body.category,
        profession: body.profession || null,
        bio: body.bio || null,
        bio_url: body.bio_url || null,
        photo_url: body.photo_url || null,
        slug: body.slug || null,
        display_order: body.display_order,
        is_vacant: body.is_vacant || false,
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating board member:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member: data })
  } catch (error) {
    console.error('Error in admin board members PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a board member
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Board member ID is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('board_members')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting board member:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin board members DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

