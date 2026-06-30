# ALTerEgo
### Prevention Is the Cure. Small Steps Create Big Change. Find Your Divine.

---

ALTerEgo is a mental health web application built on lived experience. It helps users discover their psychological archetype and build a daily practice of self-awareness through tools that meet them where they are — no toxic positivity, no gamification, no shame.

---

## What It Does (Phase 1)

1. **Archetype Discovery** — A 10-question triage quiz assigns users to one of six archetypes (Warrior, Sage, Empath, Creator, Healer, Anchor) based on their coping style and way of moving through the world.

2. **OneNoir** — An animated AI guide that greets each user with archetype-specific, lived-experience language. Not a chatbot. Not advice. Just presence.

3. **Dashboard** — A personalised space showing the user's archetype identity and a preview of Phase 2 features (Mood Log, Grounding, Affirmations, Crisis Support).

---

## Stack

- **Next.js 15** (App Router, React 19)
- **Supabase** (PostgreSQL + Auth + Row Level Security)
- **Tailwind CSS 3** with custom design tokens
- **Framer Motion 11** (epilepsy-safe animation)
- **TypeScript 5** (strict mode)
- **Vercel** (hosting)

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

Run `supabase/migrations/001_init_phase1.sql` in your Supabase project's SQL Editor.

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for full instructions.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Type check and build

```bash
npm run type-check
npm run build
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [ALTEREGO.md](./ALTEREGO.md) | Master CTO rules — non-negotiables for every PR |
| [DAVID.md](./DAVID.md) | Lived experience framework — language, values, what we never build |
| [TECH.md](./TECH.md) | Technical architecture — stack, patterns, security |
| [SPRINT.md](./SPRINT.md) | 6-month phased roadmap |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Database setup guide |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Pre-launch verification checklist |
| [PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md) | What was built and why |

---

## The Six Archetypes

| Archetype | Core Identity |
|-----------|---------------|
| The Warrior | Strength forged in survival |
| The Sage | Clarity through the chaos |
| The Empath | Depth is your superpower |
| The Creator | Making meaning from pain |
| The Healer | Integration is your path |
| The Anchor | Steady is a kind of strength |

---

## Principles

- No third-party analytics. No tracking. No ads. Ever.
- WCAG 2.1 AA minimum. Epilepsy-safe animations throughout.
- GDPR-ready: users own their data, erasure is one command.
- TypeScript strict mode. RLS on every table. Security headers on every route.
- Nothing that replaces therapy. Nothing that creates shame.

---

## Phase Roadmap

- **Phase 1** ✅ — Authentication, archetype quiz, OneNoir, dashboard
- **Phase 2** — Mood log, grounding techniques, affirmations, profile settings
- **Phase 3** — Crisis support, trusted contacts, peer connection (beta)

---

*Prevention Is the Cure.*
