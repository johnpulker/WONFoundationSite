'use client'

import { useState, useEffect } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Event {
  id: string
  slug: string
  name: string
  description?: string | null
  date: string
  venue_name?: string | null
  venue_address?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
  latitude?: number | null
  longitude?: number | null
  price_cents: number
  currency: string
  max_per_order: number
  is_active: boolean
}

interface FormData {
  tickets: number
  registration_type: 'individual' | 'business'
  firstName: string
  lastName: string
  email: string
  phone: string
  phoneExt: string
  phoneType: 'work' | 'mobile' | 'home'
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  isAnonymous: boolean
  publicMessage: string
  marketingOptIn: boolean
}

export default function EventRegistrationWizard({ event }: { event: Event }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    tickets: 0,
    registration_type: 'individual',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneExt: '',
    phoneType: 'mobile',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isAnonymous: false,
    publicMessage: '',
    marketingOptIn: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionTime, setSessionTime] = useState(20 * 60) // 20 minutes in seconds
  const [isSuccess, setIsSuccess] = useState(false)
  const [paypalError, setPaypalError] = useState<string | null>(null)

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime((prev) => {
        if (prev <= 1) {
          // Session expired - show warning and prevent further actions
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Handle session expiration
  const isSessionExpired = sessionTime === 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
      endTime: new Date(date.getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
    }
  }

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'FREE'
    return `$${(cents / 100).toFixed(2)}`
  }

  const getGoogleMapsLink = () => {
    if (event.latitude && event.longitude) {
      return `https://www.google.com/maps?q=${event.latitude},${event.longitude}`
    }
    const address = [event.venue_address, event.city, event.state, event.postal_code].filter(Boolean).join(', ')
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (formData.tickets < 1) {
      newErrors.tickets = 'Please select a ticket.'
    }
    if (formData.tickets > 1) {
      newErrors.tickets = 'Maximum 1 ticket per registration.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2)
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleFreeRegistration = async () => {
    setIsSubmitting(true)
    setPaypalError(null)

    try {
      const response = await fetch('/api/register-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone || null,
          address_line1: formData.addressLine1 || null,
          address_line2: formData.addressLine2 || null,
          city: formData.city || null,
          state: formData.state || null,
          postal_code: formData.postalCode || null,
          country: formData.country || null,
          tickets: formData.tickets,
          registration_type: formData.registration_type,
          is_anonymous: formData.isAnonymous,
          public_message: formData.publicMessage || null,
          marketing_opt_in: formData.marketingOptIn,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setIsSuccess(true)
    } catch (error) {
      setPaypalError(error instanceof Error ? error.message : 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const dateInfo = formatDate(event.date)
  const isPaid = event.price_cents > 0
  const totalCents = event.price_cents * formData.tickets

  if (isSuccess) {
    return (
      <Card className="text-center py-12">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Registration Successful!</h2>
          <p className="text-neutral-600">
            You&apos;ve successfully registered for {event.name}. A confirmation email has been sent to {formData.email}.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 flex-1">
          {[
            { num: 1, label: 'Select Registration' },
            { num: 2, label: 'Contact Info' },
            { num: 3, label: 'Checkout' },
          ].map((s) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step > s.num
                      ? 'bg-black text-white'
                      : step === s.num
                      ? 'bg-black text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {step > s.num ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:block ${
                    step >= s.num ? 'text-neutral-900' : 'text-neutral-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {s.num < 3 && (
                <div
                  className={`h-0.5 flex-1 mx-4 ${
                    step > s.num ? 'bg-black' : 'bg-neutral-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        {/* Session Timer */}
        <div className={`ml-8 px-4 py-2 rounded-lg ${isSessionExpired ? 'bg-red-100' : 'bg-neutral-100'}`}>
          <div className={`text-lg font-semibold ${isSessionExpired ? 'text-red-700' : 'text-neutral-900'}`}>
            {formatTime(sessionTime)}
          </div>
          <div className={`text-xs flex items-center ${isSessionExpired ? 'text-red-600' : 'text-neutral-600'}`}>
            {isSessionExpired ? 'Session expired. Please refresh the page.' : 'Until your session expires.'}
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Step 1: Ticket Selection */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Event Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900 mb-1">{dateInfo.date}</div>
                <div className="text-sm text-neutral-600 mb-4">{dateInfo.weekday}</div>
                <div className="text-sm text-neutral-700">{dateInfo.time}</div>
                <div className="text-xs text-neutral-500">Ends {dateInfo.endTime}</div>
              </div>
            </Card>
            <Card>
              <div className="space-y-1">
                <div className="font-semibold text-neutral-900">{event.venue_name}</div>
                <div className="text-sm text-neutral-700">{event.venue_address}</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="mb-2">
                  <svg className="w-12 h-12 mx-auto text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <a
                  href={getGoogleMapsLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center"
                >
                  View on Google Maps
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </Card>
          </div>

          {/* Ticket Selection Card */}
          <Card>
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Ticket</h2>
            <div className="space-y-4">
              <div className="text-2xl font-bold text-neutral-900">{formatPrice(event.price_cents)}</div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setFormData({ ...formData, tickets: Math.max(0, formData.tickets - 1) })}
                  className="w-10 h-10 rounded-full border-2 border-neutral-300 flex items-center justify-center hover:border-neutral-400 transition-colors"
                  disabled={formData.tickets === 0}
                >
                  <span className="text-neutral-600">-</span>
                </button>
                <input
                  type="number"
                  min="0"
                  max="1"
                  value={formData.tickets}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0
                    setFormData({ ...formData, tickets: Math.min(1, Math.max(0, val)) })
                  }}
                  className="w-20 text-center text-lg font-semibold border-2 border-neutral-300 rounded-lg py-2"
                />
                <button
                  onClick={() => setFormData({ ...formData, tickets: Math.min(1, formData.tickets + 1) })}
                  className="w-10 h-10 rounded-full border-2 border-neutral-300 flex items-center justify-center hover:border-neutral-400 transition-colors"
                  disabled={formData.tickets >= 1}
                >
                  <span className="text-neutral-600">+</span>
                </button>
              </div>
              <div className="text-sm text-neutral-600">Maximum 1 ticket per registration</div>
              {errors.tickets && <div className="text-sm text-red-600">{errors.tickets}</div>}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleNext}
                className="bg-black text-white hover:bg-neutral-800"
                disabled={formData.tickets < 1 || isSessionExpired}
              >
                Continue
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 2: Contact Info */}
      {step === 2 && (
        <Card>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Contact Info</h2>
          <div className="space-y-6">
            {/* Registration Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Registration Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="registration_type"
                    value="individual"
                    checked={formData.registration_type === 'individual'}
                    onChange={(e) => setFormData({ ...formData, registration_type: e.target.value as 'individual' | 'business' })}
                    className="mr-2"
                  />
                  <span className="text-neutral-700">Individual</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="registration_type"
                    value="business"
                    checked={formData.registration_type === 'business'}
                    onChange={(e) => setFormData({ ...formData, registration_type: e.target.value as 'individual' | 'business' })}
                    className="mr-2"
                  />
                  <span className="text-neutral-700">Business</span>
                </label>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  First Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                {errors.firstName && <div className="text-sm text-red-600 mt-1">{errors.firstName}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Last Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                {errors.lastName && <div className="text-sm text-red-600 mt-1">{errors.lastName}</div>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
              {errors.email && <div className="text-sm text-red-600 mt-1">{errors.email}</div>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
              <div className="flex space-x-2">
                <select
                  value="+1"
                  onChange={() => {}} // Read-only for now (US only)
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-neutral-50"
                  disabled
                >
                  <option value="+1">🇺🇸 +1</option>
                </select>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone"
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <input
                  type="text"
                  value={formData.phoneExt}
                  onChange={(e) => setFormData({ ...formData, phoneExt: e.target.value })}
                  placeholder="Ext"
                  className="w-20 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2 mt-2">
                {(['work', 'mobile', 'home'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, phoneType: type })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.phoneType === type
                        ? 'bg-black text-white'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">State/Province</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4 pt-4 border-t border-neutral-200">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-neutral-700">
                    Make this activity anonymous
                    <svg className="w-4 h-4 inline ml-1 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Public Message of Support</label>
                <textarea
                  value={formData.publicMessage}
                  onChange={(e) => setFormData({ ...formData, publicMessage: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-neutral-200">
              <button
                onClick={handleBack}
                className="text-neutral-700 hover:text-neutral-900 flex items-center"
                disabled={isSessionExpired}
              >
                ← Go Back
              </button>
              <Button
                onClick={handleNext}
                className="bg-black text-white hover:bg-neutral-800"
                disabled={isSessionExpired}
              >
                Continue
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Checkout */}
      {step === 3 && (
        <Card>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Checkout</h2>
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-neutral-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-neutral-700">Event:</span>
                <span className="font-semibold text-neutral-900">{event.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-700">Tickets:</span>
                <span className="font-semibold text-neutral-900">{formData.tickets}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-4 border-t border-neutral-200">
                <span>Total:</span>
                <span>{formatPrice(totalCents)}</span>
              </div>
            </div>

            {isSessionExpired && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <div className="font-semibold mb-1">Session Expired</div>
                <div className="text-sm">Your registration session has expired. Please refresh the page to start over.</div>
              </div>
            )}

            {paypalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {paypalError}
              </div>
            )}

            {/* Free Event */}
            {!isPaid && (
              <div>
                {isSessionExpired && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    Your session has expired. Please refresh the page to start over.
                  </div>
                )}
                <Button
                  onClick={handleFreeRegistration}
                  disabled={isSubmitting || isSessionExpired}
                  className="w-full bg-black text-white hover:bg-neutral-800"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Registration'}
                </Button>
              </div>
            )}

            {/* Paid Event - PayPal */}
            {isPaid && process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && (
              <div>
                {isSessionExpired && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="font-semibold mb-1">Session Expired</div>
                    <div className="text-sm">Your registration session has expired. Please refresh the page to start over.</div>
                  </div>
                )}
                <div style={{ pointerEvents: isSessionExpired ? 'none' : 'auto', opacity: isSessionExpired ? 0.5 : 1 }}>
                  <PayPalScriptProvider
                  options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                    currency: event.currency,
                    enableFunding: "card,venmo,paylater",
                  }}
                  key={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID} // Force re-render if Client ID changes
                >
                  <PayPalButtons
                    createOrder={async () => {
                      try {
                        const response = await fetch('/api/paypal/create-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            eventId: event.id,
                            full_name: `${formData.firstName} ${formData.lastName}`,
                            email: formData.email,
                            phone: formData.phone || null,
                            address_line1: formData.addressLine1 || null,
                            address_line2: formData.addressLine2 || null,
                            city: formData.city || null,
                            state: formData.state || null,
                            postal_code: formData.postalCode || null,
                            country: formData.country || null,
                            tickets: formData.tickets,
                            registration_type: formData.registration_type,
                            is_anonymous: formData.isAnonymous,
                            public_message: formData.publicMessage || null,
                            marketing_opt_in: formData.marketingOptIn,
                          }),
                        })

                        const data = await response.json()

                        if (!response.ok) {
                          throw new Error(data.error || 'Failed to create order')
                        }

                        return data.orderID
                      } catch (error) {
                        setPaypalError(error instanceof Error ? error.message : 'Failed to create order')
                        throw error
                      }
                    }}
                    onApprove={async (data) => {
                      try {
                        const response = await fetch('/api/paypal/capture-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orderID: data.orderID }),
                        })

                        const result = await response.json()

                        if (!response.ok) {
                          throw new Error(result.error || 'Payment failed')
                        }

                        setIsSuccess(true)
                      } catch (error) {
                        setPaypalError(error instanceof Error ? error.message : 'Payment failed')
                      }
                    }}
                    onError={(err) => {
                      setPaypalError('An error occurred with PayPal. Please try again or contact support if the issue persists.')
                      console.error('PayPal error:', err)
                    }}
                  />
                </PayPalScriptProvider>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-neutral-200">
              <button
                onClick={handleBack}
                className="text-neutral-700 hover:text-neutral-900 flex items-center"
              >
                ← Go Back
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

