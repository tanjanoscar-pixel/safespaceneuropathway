# SUPABASE_SETUP.md — Database Setup Guide
## ALTerEgo Phase 1

---

## Prerequisites

- A Supabase account (free tier is sufficient for Phase 1)
- A new Supabase project created at https://supabase.com/dashboard

---

## Step 1 — Create a Supabase Project

1. Go to https://supabase.com/dashboard → New Project
2. Choose your organisation
3. Set a name: `alterego-production` (or `alterego-dev` for development)
4. Set a strong database password — store it somewhere safe, you will not need it often
5. Select a region closest to your users (EU West for UK-based users)
6. Click Create New Project and wait ~2 minutes for provisioning

---

## Step 2 — Get Your API Keys

1. In your project dashboard → Settings → API
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY` (keep this private)

3. Create your local `.env.local` file (never commit this):

```bash
cp .env.example .env.local
```

Then fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**SECURITY**: The service role key bypasses Row Level Security. Never expose it in client code, environment variables prefixed with `NEXT_PUBLIC_`, or Git.

---

## Step 3 — Run the Migration

The migration file at `supabase/migrations/001_init_phase1.sql` creates all tables, indexes, triggers, RLS policies, and seeds all reference data.

### Option A — Supabase Dashboard (Recommended for first setup)

1. Go to your project dashboard → SQL Editor
2. Click "New query"
3. Open `supabase/migrations/001_init_phase1.sql` from this repository
4. Paste the entire contents into the SQL editor
5. Click "Run" (or Ctrl+Enter / Cmd+Enter)
6. You should see: "Success. No rows returned."

### Option B — Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push migration
supabase db push
```

---

## Step 4 — Verify Setup

After running the migration, verify in the Supabase dashboard:

### Table Editor → Check Tables Exist
- [ ] `archetypes` — should have 6 rows
- [ ] `triage_questions` — should have 10 rows
- [ ] `profiles` — empty (populated on user signup)
- [ ] `audit_logs` — empty (populated on archetype assignment)

### Authentication → Settings
1. Go to Authentication → URL Configuration
2. Set **Site URL**: `https://your-production-domain.com` (or `http://localhost:3000` for dev)
3. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback`

### Authentication → Email Templates (Optional)
Customise the confirmation email to match ALTerEgo's tone:
- Subject: "Welcome to ALTerEgo — confirm your email"
- Body: Use the ALTerEgo voice (see DAVID.md for language guidelines)

---

## Step 5 — Verify RLS Policies

In the Supabase dashboard → Authentication → Policies, verify:

| Table | Policies |
|-------|---------|
| `profiles` | profiles_select_own, profiles_insert_own, profiles_update_own |
| `audit_logs` | audit_logs_select_own, audit_logs_insert_own |
| `archetypes` | archetypes_public_read |
| `triage_questions` | triage_questions_public_read |

If any policy is missing, re-run the relevant section of the migration SQL.

---

## Step 6 — Verify Triggers

In the SQL Editor, run:

```sql
SELECT trigger_name, event_manipulation, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
   OR trigger_schema = 'auth'
ORDER BY event_object_table;
```

You should see:
- `on_auth_user_created` on `auth.users` — creates profile on signup
- `profiles_updated_at` on `public.profiles` — updates updated_at on change

---

## Vercel Environment Variables

When deploying to Vercel:

1. Go to your Vercel project → Settings → Environment Variables
2. Add each variable for Production, Preview, and Development environments:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Production only — never expose in Preview builds if you have sensitive data)
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel production URL)

3. After adding variables, redeploy for them to take effect.

---

## Troubleshooting

### "new row violates row-level security policy"
The user is not authenticated when the insert is happening, or the JWT is expired. Check middleware is running and session is being refreshed.

### Profile not created on signup
The `handle_new_user()` trigger must exist on `auth.users`. Run the migration again or check the Triggers section in the SQL Editor.

### Email confirmation not arriving
Check spam. For development, go to Supabase Dashboard → Authentication → Users and manually confirm the email by clicking the user and pressing "Confirm email".

### "relation auth.users does not exist" during migration
You are running the migration against a local PostgreSQL instance that does not have the Supabase `auth` schema. The migration must run against your Supabase project — either via the dashboard SQL editor or the Supabase CLI.

---

## Security Notes

- Rotate your `service_role` key immediately if it is ever exposed
- Enable Supabase's "Leaked Password Protection" in Authentication settings
- Enable 2FA on your Supabase account
- For production: set up Supabase Point-in-Time Recovery (available on Pro plan)

---

*Prevention Is the Cure.*
