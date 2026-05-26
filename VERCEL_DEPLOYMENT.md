# Deploying to Vercel - Complete Guide

## Option 1: Deploy via Git (Recommended - Easiest)

Vercel works best when connected to a Git repository (GitHub, GitLab, or Bitbucket).

### Step 1: Push Your Code to GitHub

1. **Create a GitHub account** (if you don't have one): https://github.com

2. **Create a new repository**:
   - Go to GitHub → New Repository
   - Name it (e.g., `won-foundation`)
   - Make it **Public** or **Private** (your choice)
   - Don't initialize with README (you already have files)

3. **Push your code**:
   ```bash
   # In your project directory
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/won-foundation.git
   git push -u origin main
   ```

### Step 2: Connect to Vercel

1. **Sign up for Vercel**: https://vercel.com
   - Click "Sign Up"
   - Use "Continue with GitHub" (easiest)

2. **Import your project**:
   - Click "Add New..." → "Project"
   - Select your GitHub repository (`won-foundation`)
   - Click "Import"

3. **Configure project** (Vercel auto-detects Next.js):
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables**:
   Click "Environment Variables" and add all your variables:
   
   **Public Variables** (NEXT_PUBLIC_*):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

   **Server Variables** (NOT NEXT_PUBLIC_*):
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
   - `ORGANIZER_EMAIL`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_BASE_URL`
   - `PAYPAL_MODE`
   - `ADMIN_PASSWORD`

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live! 🎉

### Step 3: Automatic Deployments

- Every time you push to GitHub, Vercel automatically deploys
- You get a preview URL for each commit
- Production URL is always updated

---

## Option 2: Deploy via Vercel CLI (No Git Required)

If you don't want to use Git, you can deploy directly from your computer.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```
- This opens your browser to authenticate

### Step 3: Deploy

```bash
# In your project directory
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (select your account)
- Link to existing project? **No**
- Project name? (press Enter for default)
- Directory? (press Enter for `./`)
- Override settings? **No**

### Step 4: Add Environment Variables

After first deploy, add environment variables:

```bash
# Add each variable one by one
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
# ... add all your variables
```

Or add them in the Vercel dashboard:
- Go to your project → Settings → Environment Variables
- Add all variables there

### Step 5: Redeploy

```bash
vercel --prod
```

---

## Option 3: Deploy via Zip Upload (Not Recommended)

Vercel doesn't support direct zip uploads like Netlify. You need to use Git or CLI.

---

## What You Need to Remove for Vercel

Since you're switching from Netlify, you can remove:

1. **`netlify.toml`** - Not needed for Vercel
2. **Netlify-specific dependencies** (optional - won't hurt to keep):
   - `@netlify/blobs`
   - `@netlify/functions`
   - `@netlify/ipx`
   - `@netlify/plugin-nextjs`
   - `follow-redirects`

**Note**: You can keep these - they won't cause issues, just won't be used.

---

## Vercel vs Netlify - Key Differences

| Feature | Vercel | Netlify |
|---------|--------|---------|
| Next.js Support | ✅ Native (made by Next.js team) | ⚠️ Plugin required |
| Setup | ✅ Zero config | ⚠️ Needs plugin config |
| Git Integration | ✅ Excellent | ✅ Excellent |
| CLI | ✅ Yes | ✅ Yes |
| Free Tier | ✅ Generous | ✅ Generous |

---

## Quick Start (GitHub Method)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to vercel.com
   - Click "Add New Project"
   - Import from GitHub
   - Add environment variables
   - Deploy!

3. **Done!** Your site is live in ~3 minutes.

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Make sure all environment variables are set
- Verify `package.json` has all dependencies

### Environment Variables Not Working
- Make sure they're set in Vercel dashboard
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### API Routes Not Working
- Verify environment variables are set
- Check Vercel Functions logs
- Make sure `NEXT_PUBLIC_SITE_URL` is set correctly

---

## Next Steps After Deployment

1. **Custom Domain** (optional):
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Monitor Deployments**:
   - Each push to GitHub = new deployment
   - Preview deployments for pull requests

3. **View Logs**:
   - Go to your project → Deployments
   - Click on a deployment → View Function Logs

---

## Summary

**Easiest Method**: Push to GitHub → Connect to Vercel → Add env vars → Deploy!

Vercel will automatically:
- Detect Next.js
- Configure build settings
- Deploy your site
- Set up automatic deployments

No plugins, no complex config - just works! 🚀

