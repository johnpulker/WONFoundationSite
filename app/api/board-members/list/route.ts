import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const { data: members, error } = await supabase
      .from('board_members')
      .select('*')
      .order('category', { ascending: true })
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching board members:', error)
      return NextResponse.json(
        { error: 'Failed to fetch board members' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      members: members || [],
    })
  } catch (error) {
    console.error('Error in board members list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

