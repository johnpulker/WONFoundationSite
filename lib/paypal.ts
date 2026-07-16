/**
 * PayPal API helper functions for server-side operations.
 * Handles authentication and order creation/capture.
 */

export interface PayPalWebhookHeaders {
  'paypal-auth-algo': string
  'paypal-cert-url': string
  'paypal-transmission-id': string
  'paypal-transmission-sig': string
  'paypal-transmission-time': string
}

/**
 * Verify a PayPal webhook signature using PayPal's verification API.
 * Returns true if the signature is valid.
 */
export async function verifyPayPalWebhookSignature(
  webhookId: string,
  headers: PayPalWebhookHeaders,
  rawBody: string
): Promise<boolean> {
  const baseUrl = (process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com').trim()

  let accessToken: string
  try {
    accessToken = await getPayPalAccessToken()
  } catch (err) {
    console.error('[paypal-webhook] failed to get access token for verification:', err)
    return false
  }

  let parsedBody: unknown
  try {
    parsedBody = JSON.parse(rawBody)
  } catch {
    console.error('[paypal-webhook] invalid JSON body for verification')
    return false
  }

  const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: parsedBody,
    }),
  })

  if (!response.ok) {
    console.error('[paypal-webhook] verification API error:', response.status, await response.text())
    return false
  }

  const data = await response.json()
  return data.verification_status === 'SUCCESS'
}

interface PayPalAccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface PayPalCreateOrderRequest {
  intent: 'CAPTURE'
  application_context?: {
    shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS'
    brand_name?: string
    landing_page?: 'BILLING' | 'LOGIN' | 'NO_PREFERENCE'
    user_action?: 'CONTINUE' | 'PAY_NOW'
  }
  purchase_units: Array<{
    reference_id?: string
    invoice_id?: string
    custom_id?: string
    description?: string
    soft_descriptor?: string
    amount: {
      currency_code: string
      value: string
      breakdown?: {
        item_total?: {
          currency_code: string
          value: string
        }
      }
    }
    items?: Array<{
      name: string
      description?: string
      unit_amount: {
        currency_code: string
        value: string
      }
      quantity: string
      category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS'
    }>
    shipping?: {
      address?: any
    }
  }>
}

interface PayPalOrderResponse {
  id: string
  status: string
  [key: string]: any
}

/**
 * Get PayPal access token using client credentials
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim()
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim()
  const baseUrl = (process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com').trim()

  if (!clientId || !clientSecret) {
    throw new Error('Missing PayPal credentials. Please ensure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set.')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const errorText = await response.text()
    const invalidClient =
      response.status === 401 &&
      (errorText.includes('invalid_client') || errorText.includes('Client Authentication failed'))

    if (invalidClient && process.env.NODE_ENV === 'development') {
      console.error('[PayPal] OAuth invalid_client (safe debug)', {
        baseUrl,
        clientIdLength: clientId.length,
        secretLength: clientSecret.length,
        clientIdPrefix: `${clientId.slice(0, 8)}…`,
      })
    }

    const hint = invalidClient
      ? ' — Fix: In PayPal Developer Dashboard, open the app that owns this Client ID. Copy the matching REST API Secret for the same mode as PAYPAL_BASE_URL (Live → https://api-m.paypal.com, Sandbox → https://api-m.sandbox.paypal.com). Regenerate Secret if needed, set PAYPAL_CLIENT_SECRET, restart `next dev` (or redeploy).'
      : ''

    throw new Error(`PayPal token request failed: ${response.status} ${errorText}${hint}`)
  }

  const data: PayPalAccessTokenResponse = await response.json()
  return data.access_token
}

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(
  referenceId: string,
  amountCents: number,
  currency: string = 'USD',
  options?: {
    disableShipping?: boolean
    description?: string
    brandName?: string
    invoiceId?: string
    customId?: string
    softDescriptor?: string
    items?: Array<{
      name: string
      description?: string
      unitAmountCents: number
      quantity: number
      category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS'
    }>
  }
): Promise<string> {
  const baseUrl = (process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com').trim()
  const accessToken = await getPayPalAccessToken()

  // Convert cents to dollars (e.g., 1000 cents = 10.00)
  const amountValue = (amountCents / 100).toFixed(2)

  // Build items array if provided
  const items = options?.items?.map(item => ({
    name: item.name,
    description: item.description,
    unit_amount: {
      currency_code: currency,
      value: (item.unitAmountCents / 100).toFixed(2),
    },
    quantity: item.quantity.toString(),
    category: item.category || 'DIGITAL_GOODS',
  }))

  const purchaseUnit: any = {
    reference_id: referenceId,
    amount: {
      currency_code: currency,
      value: amountValue,
    },
  }

  // Add invoice_id if provided
  if (options?.invoiceId) {
    purchaseUnit.invoice_id = options.invoiceId
  }

  // Add custom_id if provided
  if (options?.customId) {
    purchaseUnit.custom_id = options.customId
  }

  // Add description
  if (options?.description) {
    purchaseUnit.description = options.description
  }

  // Add soft_descriptor
  if (options?.softDescriptor) {
    purchaseUnit.soft_descriptor = options.softDescriptor
  } else {
    purchaseUnit.soft_descriptor = 'WON Foundation'
  }

  // Add items and breakdown if items are provided
  if (items && items.length > 0) {
    purchaseUnit.items = items
    purchaseUnit.amount.breakdown = {
      item_total: {
        currency_code: currency,
        value: amountValue,
      },
    }
  }

  const orderData: PayPalCreateOrderRequest = {
    intent: 'CAPTURE',
    purchase_units: [purchaseUnit],
    ...(options?.disableShipping && {
      application_context: {
        shipping_preference: 'NO_SHIPPING',
        brand_name: options.brandName || 'WON Foundation',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
      },
    }),
  }

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'PayPal-Request-Id': referenceId, // Idempotency
    },
    body: JSON.stringify(orderData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`PayPal order creation failed: ${response.status} ${errorText}`)
  }

  const order: PayPalOrderResponse = await response.json()
  return order.id
}

/**
 * Capture a PayPal order
 */
export async function capturePayPalOrder(orderId: string): Promise<PayPalOrderResponse> {
  const baseUrl = (process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com').trim()
  const accessToken = await getPayPalAccessToken()

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`PayPal order capture failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  
  // Check if capture was successful
  if (data.status !== 'COMPLETED') {
    throw new Error(`PayPal order capture not completed. Status: ${data.status}`)
  }

  return data
}

export type PayPalMembershipLevel = 'General' | 'Sustaining' | 'Youth'

export interface VerifiedMembershipPayPalOrder {
  orderId: string
  membershipLevel: PayPalMembershipLevel
  amountPaid: number
  currencyCode: string
}

const MEMBERSHIP_LEVEL_PRICES: Record<PayPalMembershipLevel, number> = {
  General: 35,
  Sustaining: 100,
  Youth: 10,
}

function parseMembershipCustomId(customId: string | undefined): PayPalMembershipLevel | null {
  if (!customId) return null
  const m = customId.toLowerCase().match(/^membership-(general|sustaining|youth)$/)
  if (!m) return null
  const key = m[1].charAt(0).toUpperCase() + m[1].slice(1) as PayPalMembershipLevel
  return key in MEMBERSHIP_LEVEL_PRICES ? key : null
}

function inferMembershipLevelFromAmount(amount: number): PayPalMembershipLevel | null {
  for (const [level, price] of Object.entries(MEMBERSHIP_LEVEL_PRICES)) {
    if (Math.abs(amount - price) < 0.01) {
      return level as PayPalMembershipLevel
    }
  }
  return null
}

function inferMembershipLevelFromPurchaseUnit(pu: {
  description?: string
  items?: Array<{ name?: string; description?: string }>
}): PayPalMembershipLevel | null {
  const text = [
    pu.description ?? '',
    ...(pu.items ?? []).flatMap((i) => [i.name ?? '', i.description ?? '']),
  ]
    .join(' ')
    .toLowerCase()

  if (text.includes('sustaining')) return 'Sustaining'
  if (text.includes('youth')) return 'Youth'
  if (text.includes('general')) return 'General'
  return null
}

function resolveMembershipLevel(
  pu: {
    custom_id?: string
    description?: string
    amount?: { value?: string }
    items?: Array<{ name?: string; description?: string }>
  },
  options?: { fallbackLevel?: PayPalMembershipLevel }
): PayPalMembershipLevel {
  const fromCustom = parseMembershipCustomId(pu.custom_id)
  if (fromCustom) return fromCustom

  if (options?.fallbackLevel) {
    console.warn('[paypal] custom_id missing; using checkout fallback level', options.fallbackLevel)
    return options.fallbackLevel
  }

  const amount = parseFloat(String(pu.amount?.value ?? '0'))
  const fromAmount = Number.isFinite(amount) ? inferMembershipLevelFromAmount(amount) : null
  if (fromAmount) {
    console.warn('[paypal] custom_id missing; inferred level from amount', fromAmount)
    return fromAmount
  }

  const fromText = inferMembershipLevelFromPurchaseUnit(pu)
  if (fromText) {
    console.warn('[paypal] custom_id missing; inferred level from line items', fromText)
    return fromText
  }

  throw new Error(
    'We received your PayPal payment but could not link it to a membership type. Please contact support with your PayPal confirmation — do not pay again.'
  )
}

async function fetchPayPalOrderJson(
  orderId: string,
  accessToken: string,
  baseUrl: string
): Promise<any> {
  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`PayPal get order failed: ${response.status} ${errorText}`)
  }
  return response.json()
}

/** Lightweight status check for reuse of in-flight checkout orders. */
export async function getPayPalCheckoutOrderStatus(orderId: string): Promise<string> {
  const baseUrl = (process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com').trim()
  const accessToken = await getPayPalAccessToken()
  const order = await fetchPayPalOrderJson(orderId, accessToken, baseUrl)
  return String(order.status ?? '')
}

/**
 * Ensure the PayPal checkout order is captured and completed, then validate
 * membership custom_id and amount against known WON membership prices.
 * This is the server-side source of truth for whether payment succeeded.
 */
export async function verifyCompletedMembershipPayPalOrder(
  orderId: string,
  options?: { fallbackLevel?: PayPalMembershipLevel }
): Promise<VerifiedMembershipPayPalOrder> {
  const baseUrl = (process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com').trim()
  const accessToken = await getPayPalAccessToken()

  let order = await fetchPayPalOrderJson(orderId, accessToken, baseUrl)

  if (order.status === 'APPROVED') {
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const captureText = await captureResponse.text()
    if (!captureResponse.ok) {
      // Order may already be captured (e.g. client captured earlier); re-fetch.
      if (captureResponse.status === 422 || captureResponse.status === 400) {
        order = await fetchPayPalOrderJson(orderId, accessToken, baseUrl)
      } else {
        throw new Error(`PayPal capture failed: ${captureResponse.status} ${captureText}`)
      }
    } else {
      // Always re-fetch after capture via GET so that purchase_units[0].amount
      // is present at the top level. The capture response body omits amount from
      // purchase_units and only nests it under payments.captures[0].amount,
      // which causes the amount verification below to read 0.
      order = await fetchPayPalOrderJson(orderId, accessToken, baseUrl)
    }
  }

  if (order.status !== 'COMPLETED') {
    throw new Error(`PayPal order not completed. Status: ${order.status}`)
  }

  const pu = order.purchase_units?.[0]
  if (!pu) {
    throw new Error('PayPal order missing purchase_units')
  }

  const level = resolveMembershipLevel(pu, options)

  // After a GET request, amount is at pu.amount.value.
  // As a defensive fallback, also check pu.payments.captures[0].amount.value
  // which is where the amount lives in the raw capture response body.
  const captureAmount = pu.payments?.captures?.[0]?.amount?.value
  const value = parseFloat(String(pu.amount?.value ?? captureAmount ?? '0'))
  const expected = MEMBERSHIP_LEVEL_PRICES[level]
  if (!Number.isFinite(value) || Math.abs(value - expected) > 0.01) {
    throw new Error(`PayPal amount ${value} does not match expected ${expected} for ${level}`)
  }

  const captures = pu.payments?.captures || []
  if (captures.length > 0) {
    const hasCompletedCapture = captures.some((c: { status?: string }) => c.status === 'COMPLETED')
    if (!hasCompletedCapture) {
      throw new Error('PayPal order has no completed capture')
    }
  }

  return {
    orderId: order.id,
    membershipLevel: level,
    amountPaid: value,
    currencyCode: pu.amount?.currency_code ?? pu.payments?.captures?.[0]?.amount?.currency_code ?? 'USD',
  }
}

