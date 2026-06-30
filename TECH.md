# TECH.md — Technical Architecture
## ALTerEgo Phase 1

---

## Stack Overview

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js (App Router) | ^15.0.0 | RSC, streaming, middleware, edge-ready |
| UI Library | React | ^19.0.0 | Concurrent features, Server Components |
| Language | TypeScript | ^5.6.3 | Strict mode, full type safety |
| Styling | Tailwind CSS | ^3.4.14 | Utility-first, zero runtime CSS |
| Animation | Framer Motion | ^11.3.0 | React 19 compatible, spring physics |
| Backend | Supabase | ^2.45.4 | Auth + PostgreSQL + RLS + real-time |
| Auth Client | @supabase/ssr | ^0.5.2 | Cookie-based sessions, SSR compatible |
| Hosting | Vercel | — | Edge network, automatic HTTPS, CI/CD |

---

## Repository Structure

```
safespaceneuropathway/
├── app/
│   ├── layout.tsx              # Root layout, metadata, dark mode
│   ├── page.tsx                # Landing page (Server Component)
│   ├── globals.css             # CSS custom properties + component classes
│   ├── auth/
│   │   ├── login/page.tsx      # Sign-in form (Client Component)
│   │   ├── register/page.tsx   # Sign-up form (Client Component)
│   │   └── callback/route.ts   # OAuth/email verification handler
│   ├── onboarding/
│   │   └── archetype/page.tsx  # 10-question quiz + reveal (Client Component)
│   └── dashboard/
│       ├── page.tsx            # Data fetching (Server Component)
│       └── DashboardClient.tsx # Interactive UI (Client Component)
├── components/
│   └── OneNoir.tsx             # Animated SVG guide character
├── lib/
│   ├── supabase.ts             # Browser client (createBrowserClient)
│   ├── supabase-server.ts      # Server client (createServerClient + cookies)
│   └── utils.ts                # Archetype meta, scoring, greetings, helpers
├── types/
│   └── database.ts             # Full Database type + Profile + ArchetypeKey
├── supabase/
│   └── migrations/
│       └── 001_init_phase1.sql # Tables, RLS, indexes, triggers, seed data
├── middleware.ts               # Session refresh + route protection
├── next.config.js              # Security headers
├── tailwind.config.js          # Design tokens, archetype colors, animations
├── tsconfig.json               # Strict TypeScript
└── .env.example                # Environment variable template
```

---

## Authentication Architecture

### Flow
```
User → /auth/register → supabase.auth.signUp() → email verification
User → clicks email link → /auth/callback?code=... → exchangeCodeForSession()
                                                     → redirect /dashboard
User → /auth/login → supabase.auth.signInWithPassword() → /dashboard
```

### Session Management
- Sessions stored as HTTP-only cookies via `@supabase/ssr`
- Middleware refreshes session on every request to prevent expiry
- Server Components read session from cookies (never from localStorage)
- Client Components use browser client — no cookie manipulation

### Security
- Passwords: Supabase minimum enforcement (8+ chars)
- Client-side validation: 8+ chars, 1 uppercase, 1 number (before submit)
- Email confirmation required before access
- No plain-text passwords stored anywhere — Supabase handles bcrypt hashing
- JWT expiry: Supabase default (1 hour access token, 1 week refresh token)

---

## Database Architecture

### Tables

**`profiles`** — One row per user, FK to `auth.users`
- `archetype_key` → FK to `archetypes.key`
- `archetype_scores` → JSONB `{ warrior: 3, sage: 1, ... }`
- `trusted_contacts` → JSONB array (Phase 3)
- `preferences` → JSONB (extensible settings)
- Auto-created on signup via `handle_new_user()` trigger (SECURITY DEFINER)
- Auto-updated `updated_at` via trigger

**`archetypes`** — 6 rows, static reference data
- Seeded at migration time
- Public read (no auth required)
- No user writes

**`triage_questions`** — 10 rows, static reference data
- Seeded at migration time
- Public read (no auth required)
- Options stored as JSONB array `[{text, archetype}]`
- Hardcoded in client for Phase 1 (avoids loading state on quiz screen)

**`audit_logs`** — Append-only event log
- Records: `archetype_assigned`, future: `mood_logged`, `contact_added`, etc.
- `record_id` is nullable UUID pointing to the affected row
- `metadata` JSONB for action-specific payload
- RLS: users read/insert own rows only
- No delete policy — intentional for GDPR audit trail

### Row Level Security

All tables have RLS enabled. Default-deny.

| Table | Policy | Rule |
|-------|--------|------|
| `profiles` | SELECT | `auth.uid() = id` |
| `profiles` | INSERT | `auth.uid() = id` |
| `profiles` | UPDATE | `auth.uid() = id` |
| `audit_logs` | SELECT | `auth.uid() = user_id` |
| `audit_logs` | INSERT | `auth.uid() = user_id` |
| `archetypes` | SELECT | `true` (public) |
| `triage_questions` | SELECT | `true` (public) |

No UPDATE/DELETE policies on `audit_logs` — immutable by design.

---

## Component Architecture

### Server vs Client Split

```
app/page.tsx            → Server Component (static, no auth needed)
app/auth/login/         → Client Component (form interactivity)
app/auth/register/      → Client Component (form interactivity)
app/auth/callback/      → Route Handler (server-side code exchange)
app/onboarding/archetype/ → Client Component (stateful quiz)
app/dashboard/page.tsx  → Server Component (auth check + data fetch)
app/dashboard/DashboardClient.tsx → Client Component (sign-out + animations)
components/OneNoir.tsx  → Client Component (Framer Motion animations)
```

### OneNoir Animation System

OneNoir has 4 states, each with distinct animation parameters:

| State | Neural Opacity | Duration | Eye Glow | Body Breathe |
|-------|---------------|----------|----------|-------------|
| `intro` | 0.05–0.3 | 6s | dim | slow (7s) |
| `calm` | 0.1–0.45 | 4s | medium | medium (5s) |
| `alert` | 0.2–0.7 | 2s | bright | fast (3s) |
| `welcoming` | 0.15–0.55 | 3s | archetype tint | calm (6s) |

Eye inner glow color is archetype-keyed in `welcoming` state.
All durations are epilepsy-safe (no animation faster than 2s cycle).

---

## Security Headers

Applied to all routes in `next.config.js`:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 1; mode=block
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 
  'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;
  font-src 'self'; connect-src 'self' *.supabase.co; frame-ancestors 'none'
```

`'unsafe-eval'` and `'unsafe-inline'` are required by Next.js + Framer Motion for dev mode.
Phase 2: implement nonce-based CSP to remove `unsafe-eval` in production.

---

## Environment Variables

| Variable | Used In | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Public anon key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin key — NEVER in client bundle |
| `NEXT_PUBLIC_APP_URL` | Server only | Full app URL for email redirects |

The service role key bypasses RLS. It must only be used in Route Handlers, Server Actions, or migration scripts — never in any component file.

---

## Archetype Scoring Algorithm

```typescript
function calculateArchetype(answers: ArchetypeKey[]) {
  const scores: Record<ArchetypeKey, number> = { warrior:0, sage:0, empath:0, creator:0, healer:0, anchor:0 }
  answers.forEach(a => scores[a]++)
  const key = (Object.entries(scores) as [ArchetypeKey, number][])
    .sort(([,a],[,b]) => b - a)[0][0]
  return { key, scores }
}
```

Each answer maps 1:1 to an archetype. Highest tally wins. Ties broken by insertion order (stable sort). No weighting in Phase 1.

Phase 2 consideration: weight later questions more heavily (recency bias research suggests final answers are more deliberate).

---

## Performance

### Bundle Strategy
- Server Components render HTML with no JS sent to client
- Client Components code-split automatically by Next.js
- Framer Motion tree-shaken (only import what is used)
- Tailwind purges unused classes at build time

### Image Optimization
- OneNoir is an inline SVG — no image requests
- Phase 2 user avatars: `next/image` with `sizes` attribute

### Caching
- Static pages (`/`, `/auth/login`, `/auth/register`): ISR/static at build time
- Dashboard: dynamic (user-specific), no cache
- Middleware runs on every request (lightweight session refresh only)

---

## Phase 2 Technical Additions

- Mood logging table + charting (recharts)
- Edge Functions for server-side AI calls (affirmations personalisation)
- Push notifications (service worker + Supabase Realtime)
- Dark/light mode toggle (currently dark-only)
- Nonce-based CSP to remove `unsafe-eval`
- E2E tests (Playwright)

---

*Prevention Is the Cure.*
