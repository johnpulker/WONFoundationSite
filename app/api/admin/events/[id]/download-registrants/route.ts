import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { requireAdminAuth } from '@/lib/adminAuth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate admin session
    const auth = await requireAdminAuth(request)
    if (!auth.valid) {
      return auth.response!
    }

    const { id: eventId } = await params

    const supabase = createAdminClient()

    // Fetch the event details
    const { data: event, error: eventError } = await supabase
      .from('event_registrations_events')
      .select('id, name, date, venue_name, city, state')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    // Fetch all completed registrations for this event
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

    // Format event date
    const eventDate = event.date
      ? new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : 'Date TBD'

    const venue = [event.venue_name, event.city, event.state]
      .filter(Boolean)
      .join(', ') || 'Venue TBD'

    const generatedAt = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

    // Build table rows HTML
    const tableRows = rows
      .map((r: any, i: number) => {
        const name = [r.first_name, r.last_name].filter(Boolean).join(' ') || '—'
        const email = r.email || '—'
        const phone = r.phone || '—'
        const tickets = r.ticket_count ?? r.quantity ?? 1
        const status = r.payment_status === 'paid'
          ? 'Paid'
          : r.payment_status === 'free'
          ? 'Free'
          : r.payment_status || '—'
        const amount = r.amount_cents != null
          ? `$${(r.amount_cents / 100).toFixed(2)}`
          : r.payment_status === 'free' ? '$0.00' : '—'
        const registeredAt = r.created_at
          ? new Date(r.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '—'
        const rowBg = i % 2 === 0 ? '#ffffff' : '#f8f8f8'

        return `
          <tr style="background:${rowBg}">
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${i + 1}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(name)}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(email)}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(phone)}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${tickets}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${escapeHtml(status)}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">${amount}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${registeredAt}</td>
          </tr>`
      })
      .join('')

    // Total collected
    const totalCents = rows.reduce((sum: number, r: any) => sum + (r.amount_cents || 0), 0)
    const totalTickets = rows.reduce((sum: number, r: any) => sum + (r.ticket_count ?? r.quantity ?? 1), 0)

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registrants — ${escapeHtml(event.name)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #111;
      background: #fff;
      padding: 32px 40px;
    }

    .header {
      border-bottom: 2px solid #871c1c;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .org-name {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #871c1c;
      margin-bottom: 6px;
    }

    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #111;
      margin-bottom: 6px;
    }

    .meta {
      font-size: 12px;
      color: #555;
      line-height: 1.6;
    }

    .stats {
      display: flex;
      gap: 32px;
      margin: 20px 0 28px;
      padding: 16px 20px;
      background: #f9f9f9;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
    }

    .stat-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #888;
      margin-bottom: 2px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #111;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    thead tr {
      background: #871c1c;
      color: #fff;
    }

    thead th {
      padding: 9px 10px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    thead th.right { text-align: right; }
    thead th.center { text-align: center; }

    .footer {
      margin-top: 24px;
      font-size: 11px;
      color: #999;
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #888;
      font-style: italic;
    }

    @media print {
      body { padding: 16px 20px; }
      @page { margin: 0.75in; size: letter landscape; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="org-name">WON — Women's Organization Network</div>
    <h1>${escapeHtml(event.name)}</h1>
    <div class="meta">
      <strong>Date:</strong> ${eventDate}<br/>
      <strong>Venue:</strong> ${escapeHtml(venue)}<br/>
      <strong>Report generated:</strong> ${generatedAt}
    </div>
  </div>

  <div class="stats">
    <div>
      <div class="stat-label">Total Registrants</div>
      <div class="stat-value">${rows.length}</div>
    </div>
    <div>
      <div class="stat-label">Total Tickets</div>
      <div class="stat-value">${totalTickets}</div>
    </div>
    <div>
      <div class="stat-label">Total Revenue</div>
      <div class="stat-value">$${(totalCents / 100).toFixed(2)}</div>
    </div>
  </div>

  ${rows.length === 0 ? '<p class="no-data">No completed registrations found for this event.</p>' : `
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th class="center">Tickets</th>
        <th class="center">Status</th>
        <th class="right">Amount</th>
        <th>Registered</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>`}

  <div class="footer">
    Confidential — WON Admin Report &nbsp;|&nbsp; ${rows.length} registrant(s) &nbsp;|&nbsp; Generated ${generatedAt}
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating registrant report:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
