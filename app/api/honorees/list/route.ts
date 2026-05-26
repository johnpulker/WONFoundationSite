import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const currentYear = searchParams.get('current_year') === 'true'

    let query = supabase
      .from('wonder_women')
      .select('*')
      .order('honoree_order', { ascending: true })

    if (year) {
      query = query.eq('year', parseInt(year))
    } else if (currentYear) {
      // Show all honorees, ordered by year (newest first) then display order - so whatever you add in admin appears
      query = query.order('year', { ascending: false }).order('honoree_order', { ascending: true })
    }

    const { data: honorees, error } = await query

    if (error) {
      console.error('Error fetching honorees:', error)
      return NextResponse.json(
        { error: 'Failed to fetch honorees' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      honorees: honorees || [],
    })
  } catch (error) {
    console.error('Error in honorees list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

