# ⛳ GolfGive

A full-stack web platform where golfers can subscribe, enter their scores, support charities, and participate in monthly prize draws. Built this to combine two things I like — web dev and doing something useful.

**Live demo:** [your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)

---

## What it does

- Users sign up and choose a subscription plan (monthly/yearly)
- A portion of every subscription goes to a charity of their choice
- Players log their last 5 Stableford golf scores
- Every month there's a prize draw — better scores = more entries
- Prize pool splits: 40% jackpot (5 matches), 35% second (4), 25% third (3)
- Built-in AI chatbot that answers questions about the platform

---

## Tech stack

| Area | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database + Auth | Supabase (PostgreSQL + Row Level Security) |
| Styling | Tailwind CSS |
| AI Chatbot | Groq API (Llama 3.1 8B) |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## Features I'm proud of

**AI chatbot** — floating widget on every page, answers questions about subscriptions, scores, donations. Uses Groq's free Llama 3.1 model. Chat history saved per user in Supabase.

**Auth + protected routes** — Supabase handles signup/login. Dashboard redirects if you're not subscribed yet.

**Score system** — keeps only your last 5 scores, auto-removes oldest when you add a new one.

**RLS policies** — database rows are locked to the user who owns them, even if someone hits the API directly.

---

## Running locally

```bash
git clone https://github.com/yourusername/golf-charity-platform
cd golf-charity-platform
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
```

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database setup

Run the SQL files in `supabase/migrations/` in your Supabase SQL editor, in order. Creates tables for `profiles`, `scores`, `charities`, `chat_history` with proper RLS.

---

## Folder structure

```
app/
├── api/
│   └── chat/          # AI chatbot API route
├── auth/              # Login + signup pages
├── components/        # ChatWidget
├── dashboard/         # Main user dashboard
├── charities/         # Charity listing
├── subscribe/         # Subscription flow
└── lib/
    └── supabase.js    # Supabase client
```

---

## Things I'd add with more time

- Stripe integration for actual payments
- Admin dashboard to manage draws and winners
- Email notifications when draw results are announced
- Mobile app (React Native maybe)

---

## Why I built this

Started as a side project idea — most charity platforms feel boring and disconnected. Wanted to make giving feel more engaging by tying it to something competitive. Golf was a good fit since it already has a scoring system built in.
