# Admin Session Migration Guide

## Quick Fix: Run Database Migrations

The admin login requires two database migrations to be run in Supabase. Follow these steps:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run Migration 011 (Creates admin_sessions table)

1. Open the file: `supabase/migrations/011_admin_sessions_audit.sql`
2. Copy the entire contents
3. Paste into the SQL Editor in Supabase
4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

### Step 3: Run Migration 012 (Adds hashed token support)

1. Open the file: `supabase/migrations/012_admin_security_enhancements.sql`
2. Copy the entire contents
3. Paste into the SQL Editor in Supabase
4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

### Step 4: Verify Tables Exist

In Supabase SQL Editor, run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_sessions', 'admin_audit_log');
```

You should see both tables listed.

### Step 5: Try Login Again

1. Restart your dev server (if running)
2. Go to `/admin` page
3. Enter your password
4. Login should work now!

## Troubleshooting

### Error: "relation admin_sessions does not exist"
- **Solution**: Run migration `011_admin_sessions_audit.sql` first

### Error: "column session_token_hash does not exist"
- **Solution**: Run migration `012_admin_security_enhancements.sql` after 011

### Error: "permission denied"
- **Solution**: Make sure you're using the SQL Editor (not Table Editor) and have proper permissions

### Still having issues?
- Check the browser console for detailed error messages
- Check your server logs (terminal where `npm run dev` is running)
- Verify your `.env.local` has `ADMIN_PASSWORD` set correctly

## Migration Order

Always run migrations in this order:
1. `011_admin_sessions_audit.sql` (creates tables)
2. `012_admin_security_enhancements.sql` (adds security features)

## What These Migrations Do

### Migration 011
- Creates `admin_sessions` table (stores session tokens)
- Creates `admin_audit_log` table (stores audit trail)
- Sets up Row Level Security (RLS) policies

### Migration 012
- Adds `session_token_hash` column (for secure token storage)
- Adds indexes for performance
- Adds cleanup function for old audit logs

