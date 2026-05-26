'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Registration {
  id: string
  event_id: string
  full_name: string
  email: string
  phone: string | null
  tickets: number
  payment_status: string
  payment_id: string | null
  created_at: string
  event?: {
    id: string
    slug: string
    name: string
  }
}

function AdminRegistrationsContent() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [events, setEvents] = useState<Array<{ id: string; slug: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eventFilter, setEventFilter] = useState<string>('')
  const [showPending, setShowPending] = useState(false)

  useEffect(() => {
    // Check if session is valid by making a server-side validation request
    // Server validates the HttpOnly cookie
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/validate-session", {
          method: "GET",
          credentials: "include", // Include cookies
        })

        if (response.ok) {
          setIsAuthenticated(true)
          // Fetch registrations immediately
          fetchRegistrations()
        } else {
          setIsAuthenticated(false)
        }
      } catch (err) {
        setIsAuthenticated(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchRegistrations = async () => {
    setLoading(true)
    setError(null)

    try {
      const requestBody: any = { showPending }
      
      // Determine if filter is slug or name
      if (eventFilter && eventFilter.trim() !== '') {
        // Check if it looks like a slug (lowercase, hyphens, no spaces)
        if (/^[a-z0-9-]+$/.test(eventFilter.trim())) {
          requestBody.eventSlug = eventFilter.trim()
        } else {
          requestBody.eventName = eventFilter.trim()
        }
      }

      const response = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include HttpOnly cookie for session validation
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Session expired - redirect to admin login
          setIsAuthenticated(false)
          router.push('/admin')
          return
        }
        const data = await response.json()
        const errorMessage = data.error || 'Failed to fetch registrations'
        setError(errorMessage)
        // Don't throw for validation errors, just show the message
        if (response.status === 400 || response.status === 404) {
          return
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setRegistrations(data.registrations || [])
      if (data.events) {
        setEvents(data.events)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch registrations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only refetch when eventFilter or showPending changes (user is already authenticated)
    if (isAuthenticated) {
      fetchRegistrations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventFilter, showPending])

  const exportCSV = () => {
    const headers = ['Date', 'Event', 'Name', 'Email', 'Phone', 'Tickets', 'Payment Status', 'Payment ID']
    const rows = registrations.map((reg) => [
      new Date(reg.created_at).toLocaleString(),
      reg.event?.name || 'N/A',
      reg.full_name,
      reg.email,
      reg.phone || '',
      reg.tickets.toString(),
      reg.payment_status,
      reg.payment_id || '',
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="text-neutral-600">Checking authentication...</div>
      </div>
    )
  }

  // If not authenticated, show a message with link to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-neutral-900 mb-4">Access Denied</h1>
          <p className="text-neutral-600 mb-6">Please login through the admin panel first.</p>
          <Link href="/admin">
            <Button className="bg-black text-white hover:bg-neutral-800">
              Go to Admin Login
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-neutral-900">Event Registrations</h1>
            <Link href="/admin">
              <Button className="bg-neutral-700 text-white hover:bg-neutral-600">
                ← Back to Admin Console
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 flex-wrap gap-y-2">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  placeholder="Filter by event slug or name (optional)"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                {events.length > 0 && (
                  <div className="text-xs text-neutral-500 mt-1">
                    Available events: {events.map(e => e.slug).join(', ')}
                  </div>
                )}
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPending}
                  onChange={(e) => setShowPending(e.target.checked)}
                  className="w-4 h-4 text-black border-neutral-300 rounded focus:ring-black"
                />
                <span className="text-sm text-neutral-700">Show only abandoned (pending)</span>
              </label>
              <Button onClick={fetchRegistrations} disabled={loading} className="bg-black text-white hover:bg-neutral-800">
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button onClick={exportCSV} className="bg-neutral-700 text-white hover:bg-neutral-600">
                Export CSV
              </Button>
            </div>
            <div className="text-sm text-neutral-600">
              {showPending 
                ? 'Showing only abandoned (pending) registrations. Uncheck to see completed registrations.' 
                : 'Showing only completed registrations (free/paid). Check "Show only abandoned" to see pending forms.'}
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <div className="text-red-700">{error}</div>
          </Card>
        )}

        <Card>
          {loading ? (
            <div className="text-center py-12 text-neutral-600">Loading registrations...</div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 text-neutral-600">No registrations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Event (Slug)</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Tickets</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Payment Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Payment ID</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 text-sm text-neutral-700">
                        {new Date(reg.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-700">
                        {reg.event?.name || 'N/A'}
                        {reg.event?.slug && (
                          <span className="text-xs text-neutral-500 ml-2">({reg.event.slug})</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-900 font-medium">{reg.full_name}</td>
                      <td className="py-3 px-4 text-sm text-neutral-700">{reg.email}</td>
                      <td className="py-3 px-4 text-sm text-neutral-700">{reg.phone || '-'}</td>
                      <td className="py-3 px-4 text-sm text-neutral-700">{reg.tickets}</td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reg.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : reg.payment_status === 'pending'
                              ? 'bg-[#F0D43A]/30 text-[#C9A814]'
                              : reg.payment_status === 'free'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {reg.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-700 font-mono text-xs">
                        {reg.payment_id || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function AdminRegistrationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
      </div>
    }>
      <AdminRegistrationsContent />
    </Suspense>
  )
}
