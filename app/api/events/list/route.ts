import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const includePast = searchParams.get('include_past') === 'true'
    const onlyPast = searchParams.get('only_past') === 'true'

    if (onlyPast) {
      // Only past events - include both active and inactive
      // Don't filter by is_active at all - we want all past events
      const { data: events, error } = await supabase
        .from('event_registrations_events')
        .select('*')
        .lt('date', new Date().toISOString())
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching past events:', error)
        return NextResponse.json(
          { error: 'Failed to fetch events' },
          { status: 500 }
        )
      }

      // Debug logging
      console.log(`[Events API] Past events: found ${events?.length || 0} total`)
      if (events && events.length > 0) {
        const activeCount = events.filter((e: any) => e.is_active).length
        const inactiveCount = events.filter((e: any) => !e.is_active).length
        console.log(`[Events API] Active: ${activeCount}, Inactive: ${inactiveCount}`)
      }

      return NextResponse.json({
        events: events || [],
      })
    }

    // For upcoming or all events, build query normally
    let query = supabase
      .from('event_registrations_events')
      .select('*')

    if (includePast) {
      // All events - include both active and inactive
      query = query.order('date', { ascending: false })
    } else {
      // Only upcoming events (default) - only show active ones
      const now = new Date().toISOString()
      console.log(`[Events API] Fetching upcoming events - filtering for is_active=true and date >= ${now}`)
      query = query.eq('is_active', true)
        .gte('date', now)
        .order('date', { ascending: true })
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    console.log(`[Events API] Upcoming events: found ${events?.length || 0} events`)
    if (events && events.length > 0) {
      console.log(`[Events API] Event details:`, events.map((e: any) => ({
        id: e.id,
        name: e.name,
        date: e.date,
        is_active: e.is_active
      })))
    }

    return NextResponse.json({
      events: events || [],
    })
  } catch (error) {
    console.error('Error in events list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
