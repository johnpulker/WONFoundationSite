# Troubleshooting Guide

## Email Logins Disabled

If users see the message "Email logins are disabled" when trying to log in, this means email/password authentication is disabled in your Supabase project settings.

### How to Enable Email Authentication in Supabase

**IMPORTANT:** Check ALL of these settings - email auth can be disabled in multiple places:

1. **Go to your Supabase Dashboard**
   - Navigate to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Check Authentication Providers (Primary Setting)**
   - Click on **Authentication** in the left sidebar
   - Click on **Providers** in the submenu
   - Find **Email** in the list of providers
   - **Toggle it to ENABLED** (this is the main setting)
   - Make sure **Confirm email** is set according to your preference:
     - **Enabled**: Users must verify their email before logging in (recommended for production)
     - **Disabled**: Users can log in immediately after signup (useful for testing)
   - **Click "Save"** at the bottom of the page

3. **Check Authentication Settings (Additional Check)**
   - Still in **Authentication** section
   - Click on **Settings** (not Providers)
   - Look for any settings related to "Email" or "Password" authentication
   - Make sure there are no restrictions or disabled flags

4. **Check Project Settings**
   - Go to **Settings** (gear icon) in the left sidebar
   - Click on **API** or **General**
   - Verify your project is active and not paused
   - Check if there are any authentication-related restrictions

5. **Verify Email Configuration**
   - Go to **Authentication → Email Templates**
   - Make sure email templates are configured (even if you're not using email confirmation)
   - Check **Authentication → Settings → Email Auth** for any additional settings

6. **Test Login**
   - Wait a minute for changes to propagate
   - Try logging in again with a user account
   - The "Email logins are disabled" message should no longer appear

### Common Issues

- **"I enabled it but it still says disabled"**: Wait 1-2 minutes for Supabase to propagate the changes, then try again
- **"Email provider shows enabled but login still fails"**: Check the "Confirm email" setting - if it's enabled, users must verify their email first
- **"Users created via admin API can't log in"**: Make sure `email_confirm: true` is set when creating users via the admin API

### Additional Notes

- If you have existing users who signed up before email auth was disabled, they should be able to log in once you re-enable it
- If you're using email confirmation, make sure your email templates are configured correctly in **Authentication → Email Templates**
- For production, it's recommended to enable email confirmation to prevent spam accounts
- If you're creating users programmatically (like in the membership signup flow), make sure `email_confirm: true` is set in the user creation call

## Card Payments Not Working in PayPal

If users can only pay with PayPal accounts and not with credit/debit cards directly, this has been fixed in the code by enabling card funding sources.

### What Was Fixed

The PayPal integration has been updated to explicitly enable card payments by adding `enableFunding: "card,venmo,paylater"` to the PayPal configuration. This allows users to:

- Pay with credit/debit cards without a PayPal account
- Use PayPal account if they have one
- Use other payment methods like Venmo and Pay Later (if available)

### Verification

After deploying the updated code, users should see:
- A "Debit or Credit Card" option in the PayPal payment interface
- Ability to enter card details directly without logging into PayPal
- All payment methods working correctly

### If Card Payments Still Don't Work

1. **Check PayPal Account Settings**
   - Log into your PayPal Developer Dashboard
   - Go to your app settings
   - Make sure card payments are enabled for your app
   - Some PayPal accounts may need to be approved for card payments

2. **Verify Environment**
   - Make sure you're using **Live** credentials (not Sandbox) for production
   - Sandbox may have different card payment behavior

3. **Check Browser Console**
   - Open browser developer tools (F12)
   - Look for any PayPal-related errors
   - Check if the PayPal SDK is loading correctly

4. **PayPal Account Requirements**
   - Some PayPal business accounts need to be verified before card payments are enabled
   - Contact PayPal support if card payments are still not available after verification

## Common Issues

### "PayPal is not configured" Error

- Make sure `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set in your environment variables
- Restart your development server after adding environment variables
- For production, make sure environment variables are set in your hosting platform (Vercel, Render, etc.)

### Users Can't Reset Passwords

- Check that email provider is enabled (see above)
- Verify email templates are configured in Supabase
- Make sure `RESEND_API_KEY` or your email service is properly configured
- Check Supabase project settings for email rate limits

### Payment Completes But Membership Not Created

- Check browser console for errors
- Verify database connection and permissions
- Check that the payment webhook/callback is working correctly
- Review server logs for any errors during payment processing

## Forgot Password Not Sending Emails

If password reset emails are not being sent, check the following:

### 1. Check Environment Variables

Make sure these are set in your `.env.local` (development) or hosting platform (production):

```env
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=your-verified-email@yourdomain.com
```

**Important:**
- `RESEND_API_KEY` must be a valid Resend API key
- `FROM_EMAIL` must be a verified domain/email in your Resend account
- `FROM_EMAIL` cannot be the default placeholder `events@mydomain.com`

### 2. Verify Resend Account Setup

1. **Go to [Resend Dashboard](https://resend.com)**
2. **Verify your domain** (or use a verified email address)
3. **Get your API key** from Settings → API Keys
4. **Make sure the FROM_EMAIL matches** a verified domain/email in Resend

### 3. Check Server Logs

When a password reset is requested, check your server logs for:
- `"RESEND_API_KEY not set"` - API key is missing
- `"FROM_EMAIL not properly configured"` - FROM_EMAIL is missing or invalid
- `"Resend API returned an error"` - API call failed (check the error details)

### 4. Common Issues

**"Email service is not configured"**
- `RESEND_API_KEY` is not set in environment variables
- Restart your server after adding the environment variable

**"FROM_EMAIL is missing or invalid"**
- `FROM_EMAIL` is not set or is still the default placeholder
- The email address must be verified in your Resend account
- For production, use a domain you own (e.g., `noreply@yourdomain.com`)

**Emails go to spam**
- Check Resend dashboard for delivery status
- Verify your domain's SPF/DKIM records are set up correctly
- Check spam folder - emails might be delivered but filtered

**Rate limiting**
- Resend has rate limits on free plans
- Check Resend dashboard for any rate limit warnings
- Upgrade plan if needed for higher volume

### 5. Testing

To test if email is working:
1. Request a password reset
2. Check server logs for any errors
3. Check Resend dashboard → Emails to see if email was sent
4. Check spam folder if email doesn't arrive

### 6. Alternative: Use Supabase Email Templates

If Resend is not working, you can configure Supabase to send password reset emails directly:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Configure the "Reset Password" template
3. Update the forgot password route to use Supabase's built-in email instead of Resend
