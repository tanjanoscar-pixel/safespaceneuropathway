# SPRINT.md — 6-Month Roadmap
## ALTerEgo · Prevention Is the Cure.

---

## Phase 1 — Foundation (Months 1–2) ✅ COMPLETE

> Build the bedrock. Authentication, archetype discovery, and the core identity system.

### Deliverables
- [x] Next.js 15 App Router project (TypeScript strict)
- [x] Supabase backend: auth, profiles, archetypes, audit logs
- [x] Row Level Security on all tables
- [x] Email/password registration + login
- [x] Email verification flow
- [x] 10-question archetype triage quiz
- [x] 6 archetypes with scoring algorithm
- [x] Archetype reveal screen
- [x] OneNoir animated guide (4 states, archetype-aware)
- [x] Post-onboarding dashboard
- [x] Epilepsy-safe animation system
- [x] Security headers
- [x] GDPR-ready audit logging
- [x] WCAG 2.1 AA accessibility
- [x] Governing documents (ALTEREGO.md, DAVID.md, TECH.md, SPRINT.md)
- [x] Deployment documentation

### Done When
A user can register, complete the archetype quiz, receive their archetype, and see a personalised dashboard with their archetype identity. OneNoir greets them correctly.

---

## Phase 2 — Daily Practice (Months 2–4)

> Add the tools that turn a one-time discovery into a daily practice.

### 2.1 Mood Log
- Daily 30-second mood check-in (emoji scale + optional note)
- Mood history chart (30-day rolling, recharts)
- Archetype-specific prompts ("Warrior: What did you push through today?")
- Streak tracking (non-shaming: streaks reward showing up, not perfection)
- Missed day message: "We're here when you're ready." Never "You broke your streak."

### 2.2 Grounding Techniques
- 6 techniques, each mapped to an archetype's regulation style
  - Warrior: Cold water face immersion, progressive muscle relaxation
  - Sage: Cognitive reframing walk-through, 4-7-8 breathing with rationale
  - Empath: Safe place visualisation, co-regulation audio
  - Creator: Expressive writing prompt, body map exercise
  - Healer: Loving-kindness meditation, gratitude anchoring
  - Anchor: 5-4-3-2-1 grounding, routine reset protocol
- Timer option (30s / 1min / 5min)
- Completion logged to audit_logs

### 2.3 Affirmations
- 120+ affirmations (David-approved — no toxic positivity)
- Archetype-filtered by default (user can browse all)
- Save favourites
- Daily notification option (user opt-in, not default on)
- Notification copy: simple, non-pressuring ("A thought for today" not "Don't forget your affirmation!")

### 2.4 Profile Enhancements
- Optional avatar (emoji or simple colour selection — no photo upload in Phase 2)
- Retake archetype quiz (framed as growth, not correction)
- Preferences: notification time, display name edit
- Data export (GDPR Article 20 — download your data as JSON)

### 2.5 Technical
- Edge Function for affirmation personalisation (Claude API, no data sent beyond archetype key)
- Push notifications via service worker + Supabase Realtime
- Nonce-based CSP (remove `unsafe-eval` in production)
- E2E test suite (Playwright, golden path + critical flows)
- Lighthouse CI gate (≥ 90 all metrics before merge)

---

## Phase 3 — Safety & Connection (Months 4–6)

> Build the safety net. Crisis support, trusted contacts, and community foundations.

### 3.1 Crisis Support — Safe Words System
- User sets 1–3 "safe words" (private, encrypted at rest)
- Saying a safe word in the mood log triggers a soft prompt ("Are you okay? Here are some resources.")
- No automatic notifications to anyone — user agency first
- Resources: Samaritans, Crisis Text Line, local hotlines (geo-detected, fallback to UK/AU)
- Clinical review required before any crisis-adjacent feature ships

### 3.2 Trusted Contacts
- Add up to 3 trusted contacts (name + phone/email)
- Optional: "Notify my trusted contact when I log a red mood 3 days in a row"
- Contact receives a simple message: "[Display name] asked me to check in on them today."
- No clinical language in notifications
- User can revoke at any time — contacts are not notified of revocation
- All contact data encrypted, never shared, never used for marketing

### 3.3 Peer Connection (Beta)
- Opt-in archetype-matched peer groups (async, text-based)
- Moderation: community guidelines + human review of flagged content
- No real-time chat in Phase 3 (async reduces anxiety, enables moderation)
- Peer supporters trained in lived-experience framework (not clinical)
- Phase 4: consider structured peer support with trained volunteers

### 3.4 Progress Insights
- Monthly "Reflection" — generated summary of mood patterns (no AI inference on clinical state)
- Archetype evolution indicator ("Your Anchor tendencies have grown this month")
- Milestone acknowledgements: "3 months with ALTerEgo" — simple, no confetti

### 3.5 Technical
- Supabase Vault for trusted contact encryption
- Moderation queue (Supabase Edge Function + human review dashboard)
- HIPAA review (if US market — Phase 4 consideration)
- Penetration testing (third-party, before Phase 3 ships)
- SOC 2 Type I planning

---

## Principles for All Phases

1. **Ship small, ship safe.** No big-bang releases. Each feature gets its own release and monitoring period.
2. **Community before scale.** Phase 1–2 is invite-only or small cohort. Feedback loops before growth.
3. **Clinical review for anything crisis-adjacent.** No Phase 3 feature ships without sign-off.
4. **No engagement metrics as success.** Success = user wellbeing outcomes, not DAU/retention.
5. **Revenue model that aligns with mission.** Freemium: Phase 1–2 free. Optional supporter tier funds the platform without compromising the free tier.

---

## What We Will Not Build

- Social feeds or public profiles
- Leaderboards, rankings, or comparisons between users
- AI therapy or diagnosis of any kind
- Advertising or data monetisation
- Anything that creates urgency, FOMO, or shame

---

*Prevention Is the Cure. Small steps create big change. Find your divine.*
