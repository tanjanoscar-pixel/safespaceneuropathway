# ALTEREGO.md — Master CTO Rules
## ALTerEgo Phase 1 · Prevention Is the Cure.

---

## Non-Negotiables

These rules apply to every line of code, every PR, every deployment.

### 1. Safety First, Always
- No feature ships if it risks user harm — emotional, physical, or digital.
- Crisis pathways (Phase 3) are reviewed by a clinical advisor before merge.
- No gamification of mental health metrics (no streaks that shame, no scores that rank).
- Mood data is never surfaced in ways that trigger comparison or competition.

### 2. Privacy Is the Product
- No third-party analytics. No Meta Pixel. No Google Analytics. Nothing.
- No tracking cookies beyond session management.
- User data never leaves Supabase. No third-party data processors without explicit consent and DPA.
- GDPR Article 17 (right to erasure) must be implementable in one DB command.
- Audit logs are append-only; no mutations to existing rows.

### 3. Accessibility Is Not Optional
- WCAG 2.1 AA minimum. Target AAA where possible.
- All interactive elements: minimum 44×44px touch target.
- Focus-visible styles on every focusable element — no `outline: none` without replacement.
- `prefers-reduced-motion` respected throughout — animations must degrade gracefully.
- Epilepsy safety: no flashing content, no animations faster than 3Hz, all transitions ≥ 0.3s.
- Screen reader testing before every release.

### 4. TypeScript Strict Mode
- `strict: true` in tsconfig. No exceptions.
- No `any` types. Use `unknown` with type guards where needed.
- No `@ts-ignore` or `@ts-expect-error` without a comment explaining why.
- `noEmit: true` — type-check is separate from build.

### 5. No Client-Side Secrets
- `SUPABASE_SERVICE_ROLE_KEY` never in client bundle. Server-only.
- No API keys in client components. If it matters, it's server-side.
- `.env.local` is gitignored. No exceptions. Ever.

### 6. Performance Budget
- Lighthouse score ≥ 90 on mobile before any feature ships.
- No bundle over 200KB gzipped for initial route.
- Images: next/image with sizes, loading lazy below fold.
- Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1.

### 7. Database Hygiene
- All tables have RLS enabled. No table ships without RLS.
- All policies are least-privilege. Default deny.
- Every migration is idempotent (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`).
- No cascading deletes on user-owned data without a recovery window.
- Indexes on every FK and every column used in WHERE clauses.

### 8. Commit Discipline
- Atomic commits. One concern per commit.
- Commit messages: imperative mood, present tense. "Add archetype scoring" not "Added scoring".
- No `git push --force` to main. Protected branch.
- Feature branches only. PRs require review before merge.

---

## Architecture Decisions

### Stack
- **Framework**: Next.js 15 App Router (React 19)
- **Auth + DB**: Supabase (PostgreSQL 15, Auth, RLS)
- **Styling**: Tailwind CSS 3 with custom design tokens
- **Animation**: Framer Motion 11 (epilepsy-safe configuration)
- **Language**: TypeScript 5 strict
- **Hosting**: Vercel (edge network, automatic HTTPS)

### Routing
- Server Components for data fetching (dashboard, profile loads)
- Client Components for interactivity (quiz, auth forms)
- Middleware for session refresh + route protection

### State Management
- Server state: Supabase queries in Server Components
- Minimal client state: `useState` in Client Components
- No global state management in Phase 1 (Zustand available but unused — add when needed)

### Error Handling
- Auth errors: user-friendly messages, no raw Supabase error codes exposed
- DB errors in onboarding: non-blocking — show result regardless, retry in background
- 404/500: Next.js default error boundaries (Phase 2: custom error UI)

---

## What We Do Not Build

- Nothing that replaces therapy or clinical care
- No AI diagnosis of any kind
- No crisis intervention beyond signposting (Phase 3 adds real escalation)
- No social features that enable comparison
- No notifications that create anxiety or urgency
- No dark patterns — no fake timers, no manipulative copy
- No ads. Ever.

---

*Prevention Is the Cure. Small steps create big change.*
