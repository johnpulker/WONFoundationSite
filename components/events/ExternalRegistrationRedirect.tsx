'use client'

import { useEffect, useRef } from 'react'
import Card from '@/components/ui/Card'

export default function ExternalRegistrationRedirect({ 
  url, 
  eventName 
}: { 
  url: string
  eventName: string 
}) {
  const hasOpened = useRef(false)

  useEffect(() => {
    // Only open once, even if component re-renders
    if (!hasOpened.current) {
      hasOpened.current = true
      // Open the external registration URL in a new tab
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [url])

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 md:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center py-12">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-[#E7C418] mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-heading text-neutral-900 mb-4">
            Redirecting to Registration
          </h1>
          <p className="text-lg text-neutral-600 mb-6">
            You are being redirected to the registration page for <strong>{eventName}</strong>.
          </p>
          <p className="text-sm text-neutral-500 mb-8">
            If the registration page didn&apos;t open automatically,{' '}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#871c1c] hover:underline font-semibold"
            >
              click here to open it
            </a>
            .
          </p>
          <div className="flex justify-center">
            <a
              href="/programs-events"
              className="px-6 py-3 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Back to Events
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
