# 🚀 CredDev Deployment Guide

Quick reference for deploying your CredDev landing page to production.

## ✅ Pre-Deployment Checklist

- [ ] Supabase database table created
- [ ] Environment variables configured locally
- [ ] All sections rendering correctly
- [ ] Waitlist form tested and working
- [ ] Code committed to GitHub
- [ ] No sensitive data in commits

## 🌐 Deploy to Vercel (Recommended)

### Step 1: Push to GitHub

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - CredDev landing page"

# Add remote (create repo on GitHub first)
git remote add origin https://github.com/yourusername/cred-dev.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your `cred-dev` repository
4. **IMPORTANT**: Don't click Deploy yet!

### Step 3: Add Supabase Integration

**Before deploying:**

1. In project configuration, click **"Add Integration"**
2. Search for **"Supabase"**
3. Click **"Add Integration"**
4. Authenticate with your Supabase account
5. Select your Supabase project
6. Click **"Connect"**

Vercel will automatically add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin)

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Your site is live! 🎉

### Step 5: Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for DNS propagation (5-60 minutes)

## 🔧 Manual Environment Setup (Alternative)

If not using Supabase integration:

### In Vercel Dashboard:

1. Go to **Settings → Environment Variables**
2. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Check all environments: **Production**, **Preview**, **Development**
4. Click **Save**
5. Go to **Deployments** → Click **"Redeploy"**

## 🧪 Testing Production

After deployment:

1. Visit your Vercel URL (e.g., `cred-dev.vercel.app`)
2. Test the waitlist form
3. Check Supabase Table Editor for new entry
4. Verify all animations work
5. Test on mobile devices
6. Check browser console for errors

## 📊 Add Analytics (Recommended)

### Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

Commit and push - analytics will appear in Vercel dashboard.

## 🔍 SEO Setup

### Add to `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://creddev.com'), // Your domain
  title: "CredDev - The Credibility Layer for Developers",
  description: "Verify skills. Build trust. Get discovered. Join the waitlist for early access.",
  keywords: ["developer", "credibility", "skills", "github", "leetcode", "hiring"],
  authors: [{ name: "CredDev Team" }],
  openGraph: {
    title: "CredDev - The Credibility Layer for Developers",
    description: "Verify skills. Build trust. Get discovered.",
    type: "website",
    images: [
      {
        url: '/og-image.png', // Create this
        width: 1200,
        height: 630,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "CredDev - The Credibility Layer for Developers",
    description: "Verify skills. Build trust. Get discovered.",
    images: ['/og-image.png'],
  },
}
```

### Create OpenGraph Image

Create `public/og-image.png` (1200x630px) with:
- CredDev logo
- Tagline
- Visual elements from landing page

## 📧 Post-Deployment

### 1. Monitor Signups

Go to Supabase → Table Editor → `waitlist` to see signups in real-time.

### 2. Export Data

```sql
-- In Supabase SQL Editor
SELECT * FROM waitlist ORDER BY created_at DESC;
```

Download as CSV from Table Editor.

### 3. Set Up Notifications (Optional)

Use Supabase Database Webhooks:

1. Go to **Database → Webhooks**
2. Create new webhook
3. Trigger: `INSERT on waitlist`
4. Endpoint: Your email service (e.g., Resend, SendGrid)

## 🔒 Security Checklist

- [x] `.env.local` in `.gitignore`
- [x] Row Level Security enabled on Supabase
- [x] Using `anon` key (not `service_role`)
- [x] HTTPS enabled (automatic on Vercel)
- [x] No API keys in client code

## 🚨 Troubleshooting

### Form Not Submitting in Production

1. Check browser console for errors
2. Verify environment variables in Vercel
3. Check Supabase RLS policies
4. Test API connectivity

### Animations Not Working

1. Clear Vercel build cache
2. Redeploy from Vercel dashboard
3. Check for console errors

### 404 on Vercel

1. Ensure `app/page.tsx` exists
2. Check `next.config.ts` is correct
3. Redeploy

## 📈 Next Steps

1. **Monitor signups** for 1-2 weeks
2. **Analyze data**: Developer vs Recruiter ratio
3. **Conduct interviews** with early signups
4. **Refine messaging** based on feedback
5. **Start MVP development** if validation successful

## 🎯 Success Metrics

Track these in first 30 days:

- **Waitlist signups**: Target 500+
- **Developer/Recruiter split**: Aim for 70/30
- **GitHub connection rate**: Target 40%+
- **Email open rate**: When sending updates

## 🆘 Need Help?

Common issues:

- **Vercel deployment fails**: Check build logs
- **Environment variables not working**: Redeploy after adding
- **Database connection fails**: Verify Supabase credentials
- **Styling broken**: Check Tailwind CSS compilation

---

**Your CredDev landing page is now live! 🎉**

Share it with:
- LinkedIn
- Twitter/X
- Reddit (r/webdev, r/reactjs)
- Product Hunt (when ready)
- Dev.to
- Indie Hackers

Good luck! 🚀
