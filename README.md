# WON Foundation Website

Modern, premium nonprofit platform for the Women Officials Network Foundation.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth + Postgres DB + API)
- **Payments**: PayPal Checkout / PayPal REST API
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- PayPal Developer account (for payments)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase and PayPal credentials.

4. Set up Supabase:
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Copy your project URL and anon key to `.env.local`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── about/             # About page with sections
│   ├── programs-events/    # Programs & Events page
│   ├── membership/        # Membership page
│   ├── wonder-women/      # WONder Women page
│   ├── donate/            # Donate page
│   ├── contact/           # Contact page
│   ├── portal/            # Member portal (protected)
│   └── admin/             # Admin console (protected)
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── sections/         # Home page sections
│   ├── pages/            # Page-specific components
│   ├── portal/           # Portal components
│   ├── admin/            # Admin components
│   └── paypal/           # PayPal integration
├── lib/                  # Utilities and helpers
│   └── supabase/         # Supabase client setup
└── supabase/             # Database migrations
    └── migrations/       # SQL migration files
```

## Features

- **Section-Based Architecture**: Flat navigation with smooth scroll sections
- **Authentication**: Email/password auth via Supabase
- **Membership Management**: Join, renew, and manage memberships
- **Event Registration**: Register for events with PayPal payments
- **WONder Women**: Browse past and current honorees
- **Member Portal**: Profile, membership status, payment history
- **Admin Console**: Manage members, events, honorees, and payments

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

Key tables:
- `users` - User accounts
- `profiles` - Extended user profiles
- `memberships` - Membership records
- `events` - Event listings
- `wonder_women` - WONder Women honorees
- `payments` - Payment records

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admins have elevated permissions
- PayPal handles all card processing (PCI compliant)
- httpOnly secure session tokens

## Deployment

1. Push to your Git repository
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## License

Copyright © Women Officials Network Foundation. All rights reserved.





# WONFoundationSite
# WONFoundationSite
