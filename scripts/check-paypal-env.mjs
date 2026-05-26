/**
 * Verifies PayPal REST credentials (OAuth) without printing secrets.
 * Run: npm run check:paypal
 */

const clientId = (process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '').trim()
const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || '').trim()
const baseUrl = (process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com').trim()
const mode = process.env.PAYPAL_MODE || (baseUrl.includes('sandbox') ? 'sandbox' : 'live')

console.log('PayPal env check')
console.log('  PAYPAL_BASE_URL:', baseUrl)
console.log('  PAYPAL_MODE:', mode)
console.log('  Client ID set:', Boolean(clientId), clientId ? `(length ${clientId.length}, prefix ${clientId.slice(0, 8)}…)` : '')
console.log('  Secret set:', Boolean(clientSecret), clientSecret ? `(length ${clientSecret.length})` : '')

if (!clientId || !clientSecret) {
  console.error('\nFAIL: Missing PAYPAL_CLIENT_ID and/or PAYPAL_CLIENT_SECRET')
  process.exit(1)
}

const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${auth}`,
  },
  body: 'grant_type=client_credentials',
})

const text = await res.text()
if (res.ok) {
  console.log('\nOK: OAuth token obtained successfully.')
  console.log('   Server-side PayPal routes should work with these credentials.')
  process.exit(0)
}

console.error('\nFAIL: OAuth returned', res.status)
try {
  const err = JSON.parse(text)
  console.error('   error:', err.error)
  console.error('   description:', err.error_description)
} catch {
  console.error('   body:', text.slice(0, 200))
}

if (res.status === 401) {
  console.error(`
Next steps:
  1. Open https://developer.paypal.com/dashboard/applications/live (or .../sandbox for sandbox)
  2. Open the app whose Client ID matches your .env (prefix ${clientId.slice(0, 12)}…)
  3. Under "API credentials", show/copy the Secret (or regenerate Secret)
  4. Set PAYPAL_CLIENT_SECRET in .env.local — must be from the SAME app and SAME mode as PAYPAL_BASE_URL
  5. PAYPAL_CLIENT_ID and NEXT_PUBLIC_PAYPAL_CLIENT_ID must be the same Client ID
  6. Live: PAYPAL_BASE_URL=https://api-m.paypal.com
     Sandbox: PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
  7. Restart: npm run dev
`)
}

process.exit(1)
