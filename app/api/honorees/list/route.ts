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
    const excludeYear = searchParams.get('exclude_year')

    // If requesting current year, first find the latest year in the database
    if (currentYear) {
      const { data: latestRow, error: latestError } = await supabase
        .from('wonder_women')
        .select('year')
        .order('year', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestError) {
        console.error('Error finding latest year:', latestError)
        return NextResponse.json({ error: 'Failed to fetch honorees' }, { status: 500 })
      }

      if (!latestRow) {
        return NextResponse.json({ honorees: [], currentYear: null })
      }

      const { data: honorees, error } = await supabase
        .from('wonder_women')
        .select('*')
        .eq('year', latestRow.year)
        .order('honoree_order', { ascending: true })

      if (error) {
        console.error('Error fetching current year honorees:', error)
        return NextResponse.json({ error: 'Failed to fetch honorees' }, { status: 500 })
      }

      return NextResponse.json({
        honorees: honorees || [],
        currentYear: latestRow.year,
      })
    }

    // Specific year filter
    if (year) {
      const { data: honorees, error } = await supabase
        .from('wonder_women')
        .select('*')
        .eq('year', parseInt(year))
        .order('honoree_order', { ascending: true })

      if (error) {
        console.error('Error fetching honorees:', error)
        return NextResponse.json({ error: 'Failed to fetch honorees' }, { status: 500 })
      }

      return NextResponse.json({ honorees: honorees || [] })
    }

    // All honorees (optionally excluding a year, for the archive page)
    let query = supabase
      .from('wonder_women')
      .select('*')
      .order('year', { ascending: false })
      .order('honoree_order', { ascending: true })

    if (excludeYear) {
      query = query.neq('year', parseInt(excludeYear))
    }

    const { data: honorees, error } = await query

    if (error) {
      console.error('Error fetching honorees:', error)
      return NextResponse.json({ error: 'Failed to fetch honorees' }, { status: 500 })
    }

    return NextResponse.json({ honorees: honorees || [] })
  } catch (error) {
    console.error('Error in honorees list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
