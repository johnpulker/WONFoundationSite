import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = createAdminClient()
    const { slug } = await params

    const { data: member, error } = await supabase
      .from('board_members')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { error: 'Board member not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching board member:', error)
      return NextResponse.json(
        { error: 'Failed to fetch board member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      member: member,
    })
  } catch (error) {
    console.error('Error in board member slug:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

