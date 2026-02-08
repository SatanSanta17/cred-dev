# 🚀 CredDev - The Credibility Layer for Developers

A futuristic, unicorn-level landing page for CredDev - the platform that verifies developer skills and builds trust between developers and recruiters.

![CredDev](https://img.shields.io/badge/Status-Pre--Launch-purple)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## 🎯 What is CredDev?

CredDev aggregates signals from **GitHub**, **LeetCode**, and **LinkedIn** to create a unified developer credibility score. Think of it as the "credit score" for developers.

### For Developers
- ✅ Prove real skills beyond resumes
- 📊 Get verified rankings (Top X%)
- 🎯 Role-fit analysis (Backend/Frontend/ML)
- 🔗 Shareable credibility profile
- 📈 Track growth over time

### For Recruiters
- ⚡ 90% faster candidate screening
- 🎯 Filter by verified skill scores
- ✅ 100% verified developer profiles
- 📊 Deep skill insights
- 🚀 Better hiring decisions

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Form Validation**: React Hook Form + Zod

## 📁 Project Structure

```
cred-dev/
├── app/
│   ├── page.tsx              # Main landing page
│   ├── layout.tsx            # Root layout with fonts
│   └── globals.css           # Global styles + animations
├── components/
│   ├── sections/
│   │   ├── hero.tsx          # Hero with animated gradient
│   │   ├── problem.tsx       # Problem statement
│   │   ├── how-it-works.tsx  # 3-step process
│   │   ├── sample-output.tsx # Mock dashboard preview
│   │   ├── for-developers.tsx
│   │   ├── for-recruiters.tsx
│   │   ├── waitlist-form.tsx # Supabase-connected form
│   │   └── footer.tsx
│   ├── shared/
│   │   ├── gradient-text.tsx
│   │   └── floating-card.tsx
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Vercel account (for deployment)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd cred-dev
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
create table waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  user_type text not null check (user_type in ('developer', 'recruiter')),
  github_profile text,
  organization text,
  willing_to_connect boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table waitlist enable row level security;

create policy "Anyone can insert to waitlist" 
on waitlist for insert 
with check (true);

create policy "Service role can read waitlist" 
on waitlist for select 
using (true);
```

3. Get your credentials from **Settings → API**

### 3. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🌐 Deploy to Vercel

### Option 1: With Supabase Integration (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add Supabase integration:
   - Go to `https://vercel.com/integrations/supabase`
   - Connect your Supabase project
   - Environment variables auto-sync ✨
4. Deploy!

### Option 2: Manual Deployment

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard under **Settings → Environment Variables**.

## 🎨 Design Features

### Visual Elements
- 🌈 Animated gradient backgrounds
- ✨ Glassmorphism effects
- 🎭 3D floating cards with tilt
- 🌊 Smooth scroll animations
- 💫 Particle effects background
- 🎯 Interactive hover states

### Animations
- Framer Motion for smooth transitions
- CountUp for animated numbers
- Blob animations for background orbs
- Scroll-triggered reveals
- Micro-interactions on all interactive elements

### Color Palette
- **Primary**: Purple (#a855f7) → Blue (#3b82f6) → Cyan (#06b6d4)
- **Background**: Black → Slate-900
- **Accents**: Green (success), Red (errors)

## 📊 Supabase Database Schema

```typescript
type WaitlistEntry = {
  id: string                    // UUID
  email: string                 // Unique email
  user_type: 'developer' | 'recruiter'
  github_profile: string | null // Optional GitHub URL
  organization: string | null   // College/Company
  willing_to_connect: boolean   // GitHub connection consent
  created_at: string           // Timestamp
}
```

## 🔧 Customization

### Change Colors

Edit `app/globals.css` - search for gradient classes:
```css
from-purple-500 to-blue-500  /* Change these */
```

### Modify Sections

Each section is in `components/sections/` - fully modular and independent.

### Update Copy

Search for text in section files and update as needed.

## 📈 Analytics (Optional)

Add Vercel Analytics:

```bash
npm install @vercel/analytics
```

In `app/layout.tsx`:
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

## 🐛 Troubleshooting

### "Supabase URL is not defined"
- Check `.env.local` exists and has correct values
- Restart dev server after adding env variables
- Verify env variable names start with `NEXT_PUBLIC_`

### Waitlist form not submitting
- Check Supabase table was created correctly
- Verify Row Level Security policies are set
- Check browser console for errors

### Animations not working
- Ensure `framer-motion` is installed: `npm install framer-motion`
- Check browser console for React errors

## 🚦 Development Checklist

- [x] Next.js setup with TypeScript
- [x] Tailwind CSS v4 configuration
- [x] shadcn/ui components installed
- [x] Supabase client configured
- [x] Hero section with animations
- [x] Problem statement section
- [x] How It Works (3-step process)
- [x] Sample Output preview
- [x] For Developers benefits
- [x] For Recruiters benefits
- [x] Waitlist form with validation
- [x] Footer with CTA
- [x] Responsive design
- [x] Smooth scroll navigation
- [x] Toast notifications
- [ ] Add custom domain
- [ ] Add analytics
- [ ] Add SEO metadata
- [ ] Create OpenGraph images
- [ ] Setup email notifications

## 📝 Next Steps (Post-Launch)

1. **Build MVP**: Implement GitHub/LeetCode/LinkedIn analysis
2. **Create Dashboard**: Developer credibility dashboard
3. **Recruiter Portal**: Search and filter verified developers
4. **Email System**: Automated waitlist notifications
5. **Analytics Dashboard**: Track signups and engagement
6. **Blog**: Content marketing for SEO

## 🤝 Contributing

This is a pre-launch project. For suggestions or issues, reach out to the team.

## 📄 License

Private project - All rights reserved.

## 🙏 Credits

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Database by [Supabase](https://supabase.com/)

---

**Made with 💜 by the CredDev team**

*Verify skills. Build trust. Get discovered.*
