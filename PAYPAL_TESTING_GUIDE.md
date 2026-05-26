# PayPal Testing Guide

## How to Test Paid Events Without Using Real Money

PayPal provides **Sandbox** accounts for testing. You can create test accounts and use test credit cards without any real transactions.

## Step 1: Create PayPal Sandbox Accounts

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in with your PayPal account (or create one - it's free)
3. Navigate to **Dashboard** → **Sandbox** → **Accounts**
4. Click **"Create Account"** or use the default test accounts

### Default Test Accounts

PayPal provides default test accounts you can use:

**Personal Account (Buyer):**
- Email: `sb-1234567890@personal.example.com` (you'll get a real one)
- Password: (set when creating)
- Use this to "buy" tickets in your app

**Business Account (Seller):**
- Email: `sb-1234567890@business.example.com` (you'll get a real one)
- Password: (set when creating)
- This receives the payments

## Step 2: Create a PayPal App

1. In PayPal Developer Dashboard, go to **Dashboard** → **My Apps & Credentials**
2. Click **"Create App"**
3. Name it (e.g., "WON Event Registration")
4. Select **Sandbox** environment
5. Click **"Create App"**
6. Copy the **Client ID** and **Secret**

## Step 3: Configure Your Environment

Add these to your `.env.local`:

```env
# PayPal Sandbox Configuration (for testing)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_secret_here
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
```

**Important:** Make sure `PAYPAL_BASE_URL` is set to `https://api-m.sandbox.paypal.com` (not the production URL)

## Step 4: Test the Flow

1. **Start your dev server**: `npm run dev`
2. **Go to a paid event**: `http://localhost:3000/events/test-paid-event`
3. **Fill out the registration form**
4. **Click the PayPal button**
5. **Log in with your Sandbox Personal Account** (the buyer account)
6. **Use a test credit card** (PayPal provides these):
   - Card Number: `4032031082844974`
   - Expiry: Any future date (e.g., `12/2025`)
   - CVV: Any 3 digits (e.g., `123`)
   - Or use PayPal balance if you add funds to the sandbox account

## PayPal Sandbox Test Cards

PayPal provides these test card numbers:

| Card Number | Type | Result |
|------------|------|--------|
| 4032031082844974 | Visa | Success |
| 5424180279791732 | Mastercard | Success |
| 4000000000000002 | Visa | Declined |
| 4000000000009995 | Visa | Insufficient Funds |

**Note:** Use any future expiry date and any 3-digit CVV.

## Step 5: Verify in Admin Panel

After completing a test payment:

1. Go to `/admin/registrations`
2. You should see the registration with `payment_status = 'paid'`
3. The PayPal order ID will be shown in the Payment ID column

## Switching to Production

When you're ready to go live:

1. Create a **Live** app in PayPal Developer Dashboard
2. Get the **Live Client ID** and **Secret**
3. Update your `.env.local`:
   ```env
   PAYPAL_BASE_URL=https://api-m.paypal.com
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
   PAYPAL_CLIENT_ID=your_live_client_id
   PAYPAL_CLIENT_SECRET=your_live_secret
   ```

## Troubleshooting

**"PayPal is not configured" error:**
- Make sure both `PAYPAL_CLIENT_ID` and `NEXT_PUBLIC_PAYPAL_CLIENT_ID` are set
- Make sure `PAYPAL_CLIENT_SECRET` is set
- Restart your dev server after adding env variables

**Payment not completing:**
- Check browser console for errors
- Verify you're using sandbox credentials (not live)
- Make sure `PAYPAL_BASE_URL` is set to sandbox URL

**Can't log into PayPal:**
- Make sure you're using the Sandbox Personal Account credentials
- You can reset the password in PayPal Developer Dashboard

