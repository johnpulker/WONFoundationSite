# Setup Guide

## Quick Start

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the migration
5. Copy your project URL and anon key to `.env.local`

### 3. PayPal Setup

1. Create a PayPal Developer account at [developer.paypal.com](https://developer.paypal.com)
2. Create a new app in the sandbox
3. Copy the Client ID to `.env.local`
4. For production, create a live app and update `PAYPAL_MODE=live`

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Schema

The database includes the following tables:

- **users** - User accounts (extends auth.users)
- **profiles** - Extended user profiles
- **memberships** - Membership records
- **events** - Event listings
- **wonder_women** - WONder Women honorees
- **payments** - Payment records

All tables have Row Level Security (RLS) enabled with appropriate policies.

## Authentication

- Users sign up with email/password
- Sessions are managed via httpOnly cookies
- Protected routes: `/portal`, `/admin`
- Admin role required for `/admin`

## Payment Flow

1. User selects membership level or donation amount
2. PayPal Checkout handles payment
3. On success, payment record is created in database
4. For memberships, membership record is created/updated
5. User is redirected to portal

## Security (Supabase)

- **HaveIBeenPwned:** In Supabase Dashboard go to **Authentication → Settings → Security** and enable **"Check passwords against HaveIBeenPwned"** so signup and password reset reject known-compromised passwords.
- After running migrations, review **Security Advisor** (project **Settings** or email) and fix any remaining findings.

## Admin Access

To create an admin user:

1. Sign up normally
2. In Supabase dashboard, go to Authentication > Users
3. Find your user and note the UUID
4. In SQL Editor, run:
   ```sql
   UPDATE public.users SET role = 'admin' WHERE id = 'your-user-uuid';
   ```

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

The site will automatically deploy on every push to main.

## Troubleshooting

### PayPal not working
- Check that `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set
- Verify PayPal mode (sandbox vs live)
- Check browser console for errors

### Supabase connection issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is active
- Verify RLS policies are set correctly

### Authentication not working
- Check middleware is running
- Verify Supabase auth is enabled
- Check browser cookies are enabled

