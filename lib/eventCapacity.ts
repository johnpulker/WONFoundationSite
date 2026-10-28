import { createAdminClient } from '@/lib/supabaseAdmin'

type AdminClient = ReturnType<typeof createAdminClient>

export const MAX_TICKETS_PER_PURCHASE_CEILING = 10

/** Max tickets one person can buy for this event (1-10). */
export function getMaxPerOrder(event: { max_per_order?: number | null }): number {
  const raw = Number(event.max_per_order)
  if (!Number.isFinite(raw) || raw < 1) return MAX_TICKETS_PER_PURCHASE_CEILING
  return Math.min(Math.floor(raw), MAX_TICKETS_PER_PURCHASE_CEILING)
}

/** Total capacity, or null when unlimited (blank) or the event is virtual. */
export function getCapacity(event: { ticket_capacity?: number | null; event_type?: string | null }): number | null {
  if (event.event_type === 'virtual') return null
  const raw = event.ticket_capacity
  if (raw === null || raw === undefined) return null
  const n = Number(raw)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : null
}

/**
 * Tickets sold = free + paid + pending check + PayPal payments being captured.
 * Abandoned PayPal checkouts are not counted.
 */
export async function getTicketsSold(supabase: AdminClient, eventId: string): Promise<number> {
  const { data, error } = await supabase.rpc('event_tickets_sold', { p_event_id: eventId })
  if (error) {
    console.error('event_tickets_sold error:', error)
    throw new Error('Unable to check ticket availability')
  }
  return Number(data) || 0
}

/** Remaining tickets, or null when unlimited. */
export async function getTicketsRemaining(
  supabase: AdminClient,
  event: { id: string; ticket_capacity?: number | null; event_type?: string | null }
): Promise<number | null> {
  const capacity = getCapacity(event)
  if (capacity === null) return null
  const sold = await getTicketsSold(supabase, event.id)
  return Math.max(0, capacity - sold)
}

/** Friendly message for a capacity / limit failure reason returned by the database. */
export function capacityErrorMessage(reason: string | undefined, maxPerOrder?: number): string {
  switch (reason) {
    case 'sold_out':
      return 'Sorry, this event is sold out.'
    case 'not_enough':
      return 'There are not enough tickets left for that quantity. Please choose fewer tickets.'
    case 'over_limit':
      return `Maximum ${maxPerOrder ?? MAX_TICKETS_PER_PURCHASE_CEILING} ${maxPerOrder === 1 ? 'ticket' : 'tickets'} per purchase.`
    case 'not_found':
      return 'Event not found or inactive'
    default:
      return 'Unable to complete registration. Please try again.'
  }
}
