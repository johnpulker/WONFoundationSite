import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { requireAdminAuth } from '@/lib/adminAuth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const { id: eventId } = await params
    const supabase = createAdminClient()

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('event_registrations_events')
      .select('id, name, date, venue_name, city, state')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    // Fetch all completed registrations
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .in('payment_status', ['free', 'paid'])
      .order('created_at', { ascending: true })

    if (regError) {
      return new NextResponse('Failed to fetch registrations', { status: 500 })
    }

    const rows = registrations || []

    // CSV helper — wrap value in quotes and escape internal quotes
    const csvCell = (val: string | number | null | undefined): string => {
      const str = val == null ? '' : String(val)
      return `"${str.replace(/"/g, '""')}"`
    }

    // Build CSV rows — one row per attendee (purchaser + guests)
    const headers = ['#', 'Role', 'First Name', 'Last Name', 'Email', 'Phone', 'Tickets', 'Status', 'Amount', 'Registered Date']

    const dataRows: string[] = []
    rows.forEach((r: any, i: number) => {
      const fullName = r.full_name || ''
      const spaceIndex = fullName.indexOf(' ')
      const firstName = spaceIndex === -1 ? fullName : fullName.slice(0, spaceIndex)
      const lastName = spaceIndex === -1 ? '' : fullName.slice(spaceIndex + 1)

      const tickets = r.ticket_count ?? r.quantity ?? r.tickets ?? 1
      const status = r.payment_status === 'paid' ? 'Paid'
        : r.payment_status === 'free' ? 'Free'
        : r.payment_status || ''
      const amount = r.amount_cents != null
        ? `$${(r.amount_cents / 100).toFixed(2)}`
        : r.payment_status === 'free' ? '$0.00' : ''
      const registeredAt = r.created_at
        ? new Date(r.created_at).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          })
        : ''

      // Purchaser row
      dataRows.push([
        csvCell(i + 1),
        csvCell('Purchaser'),
        csvCell(firstName),
        csvCell(lastName),
        csvCell(r.email),
        csvCell(r.phone),
        csvCell(tickets),
        csvCell(status),
        csvCell(amount),
        csvCell(registeredAt),
      ].join(','))

      // Guest rows
      const guestNames: string[] = Array.isArray(r.guest_names) ? r.guest_names : []
      guestNames.forEach((guestName: string) => {
        if (!guestName || !guestName.trim()) return
        const gSpaceIndex = guestName.indexOf(' ')
        const gFirstName = gSpaceIndex === -1 ? guestName : guestName.slice(0, gSpaceIndex)
        const gLastName = gSpaceIndex === -1 ? '' : guestName.slice(gSpaceIndex + 1)

        dataRows.push([
          csvCell(i + 1),
          csvCell('Guest'),
          csvCell(gFirstName),
          csvCell(gLastName),
          csvCell(''),
          csvCell(''),
          csvCell(''),
          csvCell(''),
          csvCell(''),
          csvCell(registeredAt),
        ].join(','))
      })
    })

    const csvContent = [
      headers.map(csvCell).join(','),
      ...dataRows,
    ].join('\r\n')

    // Build a safe filename from the event name
    const safeEventName = event.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeEventName}-registrants.csv"`,
      },
    })
  } catch (error) {
    console.error('Error generating registrant CSV:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
