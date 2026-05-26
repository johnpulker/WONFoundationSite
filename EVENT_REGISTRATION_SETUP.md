# Event Registration System Setup Guide

This guide will help you set up the production-ready event registration system.

## Prerequisites

- Node.js 18+
- Supabase account and project
- PayPal Developer account (for paid events)
- Resend account (for transactional emails)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `env.example` to `.env.local`
   - Fill in all required values (see below)

3. **Run database migrations:**
   - In your Supabase dashboard, go to SQL Editor
   - Run the migration file: `supabase/migrations/002_event_registration_schema.sql`
   - This creates the `event_registrations_events` and `event_registrations` tables with proper RLS policies

## Environment Variables

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PayPal (for paid events)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com  # Use https://api-m.paypal.com for production

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=events@yourdomain.com
ORGANIZER_EMAIL=organizer@yourdomain.com

# Admin
ADMIN_PASSWORD=your_secure_password
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password  # Same as above (client-side check)

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Use your production URL in production
```

### Optional Variables

```env
```

## Creating Events

Events are stored in the `event_registrations_events` table. You can create events via:

1. **Supabase Dashboard:**
   - Go to Table Editor → `event_registrations_events`
   - Insert a new row with the following fields:
     - `slug`: URL-friendly identifier (e.g., "winter-gala-2025")
     - `name`: Event name
     - `description`: Optional description
     - `date`: Event date/time (timestamptz)
     - `venue_name`: Venue name
     - `venue_address`: Street address
     - `city`, `state`, `postal_code`, `country`: Location details
     - `latitude`, `longitude`: Optional coordinates for map
     - `price_cents`: Price in cents (0 for free events, e.g., 1000 = $10.00)
     - `currency`: Currency code (default: "USD")
     - `max_per_order`: Maximum tickets per order (default: 10)
     - `is_active`: Set to `true` to make event visible

2. **Example SQL:**
   ```sql
   INSERT INTO public.event_registrations_events (
     slug, name, description, date, venue_name, venue_address,
     city, state, postal_code, country, price_cents, max_per_order, is_active
   ) VALUES (
     'winter-gala-2025',
     'Winter Gala 2025',
     'Join us for an evening of celebration',
     '2025-12-20 19:00:00+00',
     'Grand Ballroom',
     '123 Main Street',
     'New York',
     'NY',
     '10001',
     'United States',
     5000,  -- $50.00
     5,
     true
   );
   ```

## Accessing Events

Once an event is created, users can access it at:
```
/events/[slug]
```

For example: `/events/winter-gala-2025`

## Registration Flow

### Free Events (price_cents = 0)
1. User selects ticket quantity
2. User fills out contact information
3. User confirms registration
4. Registration is immediately saved with `payment_status = 'free'`
5. Confirmation emails are sent

### Paid Events (price_cents > 0)
1. User selects ticket quantity
2. User fills out contact information
3. User proceeds to checkout
4. PayPal button appears
5. User completes PayPal payment
6. On successful payment capture:
   - Registration is updated to `payment_status = 'paid'`
   - Confirmation emails are sent

## Admin Panel

Access the admin panel at:
```
/admin/registrations
```

The admin panel allows you to:
- View all registrations
- Filter by event ID
- Export registrations as CSV
- See payment status for each registration

**Security Note:** The current implementation uses a simple password check. For production, consider implementing proper authentication (e.g., Supabase Auth with admin role).

## Email Notifications

The system sends two emails for each registration:

1. **User Confirmation Email:**
   - Sent to the registrant
   - Includes event details, ticket count, and payment info (if paid)

2. **Organizer Notification Email:**
   - Sent to the organizer email (FROM_EMAIL env var)
   - Includes registration details for review

## PayPal Integration

### Sandbox Testing
- Use `PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com`
- Create test accounts at https://developer.paypal.com
- Use sandbox client ID and secret

### Production
- Switch to `PAYPAL_BASE_URL=https://api-m.paypal.com`
- Use production client ID and secret from PayPal dashboard
- Ensure your PayPal app is approved for production use

## Database Schema

### event_registrations_events
- Stores event information
- Public can read active events
- Service role can manage all events

### event_registrations
- Stores registration data
- Only service role can access (RLS enabled)
- Payment status: 'free' | 'pending' | 'paid' | 'failed'

## Security Features

1. **Row Level Security (RLS):**
   - Registrations table is protected by RLS
   - Only service role can insert/select/update
   - No direct client-side access to registrations

2. **Server-Side Processing:**
   - All sensitive operations use service role key
   - PayPal client secret never exposed to client
   - Email API keys only used on server

3. **Input Validation:**
   - All API routes validate input
   - Email format validation
   - Ticket quantity limits enforced

## Troubleshooting

### Events not showing
- Check that `is_active = true` in the database
- Verify the slug matches the URL

### PayPal not working
- Check that `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set
- Verify PayPal credentials are correct
- Check browser console for errors
- Ensure PayPal base URL matches environment (sandbox vs production)

### Emails not sending
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for delivery status
- Ensure `FROM_EMAIL` and `ORGANIZER_EMAIL` are valid

### Admin page not accessible
- Verify `ADMIN_PASSWORD` and `NEXT_PUBLIC_ADMIN_PASSWORD` match
- Check that password is set in environment variables

## Production Checklist

Before going live:

- [ ] Switch PayPal to production (`PAYPAL_BASE_URL`)
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Set up proper admin authentication (replace password check)
- [ ] Verify all environment variables are set
- [ ] Test registration flow for both free and paid events
- [ ] Verify email delivery
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Review and test RLS policies
- [ ] Set up database backups

## Support

For issues or questions, check:
- Supabase logs in dashboard
- Next.js server logs
- Browser console for client-side errors
- PayPal developer dashboard for payment issues

