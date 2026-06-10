## Running Locally

### Tech Stack
- Next.js 16.2.7
- React 19.2.4
- Prisma 7.8.0
- Supabase Auth (@supabase/ssr 0.10.3)
- Tailwind CSS 4
- shadcn/ui
- Resend 6.12.4

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)
- A Resend account (free tier works)

### Setup

1. Clone the repo
   git clone https://github.com/Harshul2611/bookmarks-app.git
   cd bookmarks-app

2. Install dependencies
   npm install

3. Copy the example env file and fill in your values
   cp .env.local.example .env

4. Fill in `.env`:
   - DATABASE_URL → Supabase → Settings → Database → 
     Session Pooler connection string
   - NEXT_PUBLIC_SUPABASE_URL → Supabase → Settings → API → Project URL
   - NEXT_PUBLIC_ANON_KEY → Supabase → Settings → API → anon public key
   - SUPABASE_SERVICE_ROLE_KEY → Supabase → Settings → API → service_role key
   - RESEND_API_KEY → Resend dashboard → API Keys
   - NEXT_PUBLIC_APP_URL → http://localhost:3000
   - NODE_ENV → development

5. Generate Prisma client
   npx prisma generate

6. Push database schema
   npx prisma db push

7. Start the development server
   npm run dev

8. Open http://localhost:3000

### Notes
- In Supabase → Authentication → Sign In/Providers → Email,
  disable "Confirm email" for local development
- Resend free plan only sends emails to your own verified email address




## Where AI got it wrong

When I asked Claude Code to fix an incorrect line in the Prisma schema 
generator block, it removed all the database models from the file. I 
caught this because the schema looked empty after the edit, and told it 
to restore all models with the correct fix applied. This taught me to 
always specify "only change X, do not modify anything else" in prompts.



## One thing to improve

I would replace the current useState-based bookmark list with TanStack 
Query for proper data fetching, caching, and background sync. Right now 
the dashboard fetches bookmarks once on load and updates state manually 
after each CRUD operation — TanStack Query would handle cache 
invalidation automatically and make the code more maintainable.