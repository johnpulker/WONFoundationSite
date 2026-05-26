# Supabase Storage Setup for Gallery Photos

## Bucket Configuration

### Bucket Name
**`gallery-photos`** - This bucket stores all gallery photos including large files from past Wonder Woman banquets.

## Step-by-Step Setup Instructions

### 1. Create the Bucket in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"** or **"Create bucket"**
5. Configure the bucket:
   - **Name**: `gallery-photos` (must match exactly)
   - **Public bucket**: ✅ **YES** (check this box - needed for public URLs)
   - **File size limit**: Set to **2147483648** (2GB in bytes) or leave blank for no limit
   - **Allowed MIME types**: Leave empty (allows all image types) OR specify:
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`
     - `image/gif`

### 2. Configure Storage Policies (RLS)

After creating the bucket, you need to set up Row Level Security policies:

1. Click on the **`gallery-photos`** bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**

#### Policy 1: Allow Public Read Access
- **Policy name**: `Public can view gallery photos`
- **Allowed operation**: `SELECT` (for reading/downloading)
- **Policy definition**:
  ```sql
  (bucket_id = 'gallery-photos')
  ```
- **Target roles**: `public`

#### Policy 2: Allow Service Role Upload (for admin)
- **Policy name**: `Service role can upload gallery photos`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  (bucket_id = 'gallery-photos')
  ```
- **Target roles**: `service_role`

#### Policy 3: Allow Service Role Delete (for admin)
- **Policy name**: `Service role can delete gallery photos`
- **Allowed operation**: `DELETE`
- **Policy definition**:
  ```sql
  (bucket_id = 'gallery-photos')
  ```
- **Target roles**: `service_role`

### 3. Increase File Size Limit (if needed)

If you need files larger than 2GB:

1. Go to **Storage** → **Settings**
2. Look for **"File size limit"** or **"Max file size"**
3. Set to your desired limit (e.g., 5GB = `5368709120` bytes)
4. Note: Very large files may require plan upgrades

### 4. Verify Configuration

Test the setup:
1. Try uploading a large photo through the admin panel
2. Check that the file appears in the `gallery-photos` bucket
3. Verify the public URL works

## Current Configuration in Code

- **Bucket name**: `gallery-photos`
- **Max file size**: 2GB (2,147,483,648 bytes)
- **Allowed types**: JPEG, JPG, PNG, WebP
- **Public access**: Enabled (for displaying photos)

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket name is exactly `gallery-photos` (lowercase, with hyphen)
- Verify the bucket exists in your Supabase project

### "File too large" error
- Check the bucket's file size limit in Supabase Dashboard
- Verify your Supabase plan supports the file size you're trying to upload
- Check the code limit in `app/api/admin/upload-gallery-photo/route.ts`

### "Permission denied" error
- Verify RLS policies are set up correctly
- Make sure `service_role` has INSERT permissions
- Check that the bucket is marked as public if you need public URLs

### Upload timeout
- Very large files (GBs) may take several minutes to upload
- Consider implementing chunked uploads for files > 500MB
- Check your hosting provider's timeout limits (Vercel, Netlify, etc.)

### Hosting Provider Limits

**Vercel:**
- API routes have a 4.5MB body size limit on Hobby plan
- Pro plan: 4.5MB limit (can be increased with configuration)
- For files > 4.5MB, you'll need to:
  - Upgrade to Pro/Enterprise plan, OR
  - Use direct client-side upload to Supabase (bypassing Next.js API route)

**Netlify:**
- Function payload limit: 6MB on Starter, 10MB on Pro
- For larger files, use direct client-side upload to Supabase

**Solution for Large Files:**
If your hosting provider limits are too small, consider implementing direct client-side uploads to Supabase Storage, bypassing the Next.js API route entirely. This allows files of any size (up to Supabase's limits).

## Alternative: Using Existing Bucket

If you already have a `gallery-photos` bucket:
1. Go to Storage → `gallery-photos` → Settings
2. Update the file size limit to 2GB or higher
3. Verify the policies are set correctly (see Step 2 above)

