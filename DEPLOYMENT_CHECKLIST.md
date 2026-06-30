# DEPLOYMENT_CHECKLIST.md
## ALTerEgo Phase 1 — Pre-Deployment & Go-Live Checklist

---

## Pre-Deployment (Local)

### Code Quality
- [ ] `npm run type-check` — zero TypeScript errors
- [ ] `npm run lint` — zero ESLint errors
- [ ] `npm run build` — build succeeds with no errors
- [ ] No `console.log` statements left in production code
- [ ] No TODO comments in critical paths
- [ ] All `ArchetypeKey` values used consistently (6 values, no typos)

### Security
- [ ] `.env.local` is NOT committed to git
- [ ] `.gitignore` includes `.env.local`, `.env*.local`, `node_modules/`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NOT referenced in any client file
- [ ] No hardcoded API keys or secrets anywhere in the codebase
- [ ] Security headers verified in `next.config.js`
- [ ] CSP does not use `*` wildcards in production

### Accessibility
- [ ] All interactive elements have visible focus styles
- [ ] All images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] All form fields have associated `<label>` elements
- [ ] ARIA roles/labels are correct (`role="progressbar"`, `aria-pressed`, etc.)
- [ ] Color contrast ≥ 4.5:1 on all text (check with browser DevTools)
- [ ] `prefers-reduced-motion` disables all animations
- [ ] Tested with keyboard navigation only

---

## Supabase Setup

- [ ] Supabase project created (see SUPABASE_SETUP.md)
- [ ] Migration `001_init_phase1.sql` executed successfully
- [ ] 6 archetypes in `archetypes` table
- [ ] 10 questions in `triage_questions` table
- [ ] RLS enabled on all 4 tables
- [ ] All 7 RLS policies present and correct
- [ ] `on_auth_user_created` trigger present on `auth.users`
- [ ] `profiles_updated_at` trigger present on `profiles`
- [ ] Site URL set in Supabase Auth settings
- [ ] Redirect URLs include production domain `/auth/callback`
- [ ] Email confirmation enabled (Supabase default — verify it's on)

---

## Vercel Deployment

### Initial Deploy
- [ ] Repository connected to Vercel project
- [ ] Framework: Next.js (auto-detected)
- [ ] Root directory: `/` (default)
- [ ] Build command: `npm run build` (default)
- [ ] Output directory: `.next` (default)

### Environment Variables (set in Vercel dashboard)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Production + Preview + Development
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Production + Preview + Development
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Production only
- [ ] `NEXT_PUBLIC_APP_URL` — set to `https://your-production-domain.com`

### Domains
- [ ] Production domain configured (e.g. `alterego.app` or Vercel subdomain)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] `www` redirect configured if applicable

---

## Post-Deployment Verification

### Happy Path — Full User Journey

Run through this as a fresh user in an incognito window:

1. **Landing page** (`/`)
   - [ ] OneNoir animation loads and plays
   - [ ] "Find Your Archetype" button visible
   - [ ] "Sign In" button visible
   - [ ] No JavaScript errors in console

2. **Registration** (`/auth/register`)
   - [ ] Form renders correctly
   - [ ] Email validation works (try: invalid email, blank, valid)
   - [ ] Password validation works (try: too short, no uppercase, valid)
   - [ ] Successful registration shows "check your email" state (or redirects if email confirm disabled)
   - [ ] Confirmation email arrives in inbox

3. **Email Confirmation** (`/auth/callback`)
   - [ ] Clicking email link redirects to `/dashboard` successfully
   - [ ] No "callback_failed" error

4. **Onboarding** (`/onboarding/archetype`)
   - [ ] All 10 questions render correctly
   - [ ] Progress bar advances with each answer
   - [ ] Next button disabled until option selected
   - [ ] Animations play between questions (or are disabled for reduced-motion)
   - [ ] Final question button reads "See My Archetype"
   - [ ] Archetype reveal shows OneNoir, archetype name, tagline, traits
   - [ ] "Enter Your Space →" button navigates to dashboard

5. **Dashboard** (`/dashboard`)
   - [ ] OneNoir renders with welcoming state
   - [ ] Greeting uses correct time of day (morning/afternoon/evening)
   - [ ] Display name shown (or "there" if not set)
   - [ ] OneNoir quote renders (archetype-specific)
   - [ ] Archetype card shows correct name, tagline, 3 traits, border color
   - [ ] Stats grid renders: days, archetype count, mood streak placeholder
   - [ ] 4 "Coming Next" feature tiles visible
   - [ ] Sign out button works → redirects to `/`

6. **Auth Guards**
   - [ ] `/dashboard` redirects to `/auth/login` when not signed in
   - [ ] `/onboarding/archetype` redirects to `/auth/login` when not signed in
   - [ ] `/auth/login` redirects to `/dashboard` when already signed in
   - [ ] `/auth/register` redirects to `/dashboard` when already signed in

### Security Checks

- [ ] Check response headers in DevTools → Network (verify X-Frame-Options: DENY, etc.)
- [ ] Verify Supabase anon key is visible in network requests (expected, it's public)
- [ ] Verify service role key is NOT visible anywhere in client-side network requests
- [ ] Try accessing another user's profile via direct SQL (should be blocked by RLS)

### Performance

- [ ] Run Lighthouse in Chrome DevTools on `/` — target ≥ 90 all categories
- [ ] Run Lighthouse on `/dashboard` — target ≥ 90 all categories
- [ ] No cumulative layout shift on page load
- [ ] OneNoir animation does not cause frame drops

---

## Monitoring Setup (Post-Launch)

- [ ] Vercel Analytics enabled (privacy-safe, no third-party)
- [ ] Vercel Speed Insights enabled
- [ ] Error monitoring: Supabase logs reviewed weekly
- [ ] Set up Supabase email alert for high error rates (Authentication → Settings)

---

## Rollback Plan

If a deployment causes issues:

1. Go to Vercel → Deployments
2. Find the last working deployment
3. Click the three-dot menu → Promote to Production
4. Rollback takes ~30 seconds

For database issues:
- Schema changes are additive in Phase 1 (no column drops, no table renames)
- If a migration causes issues, the previous state is the fallback
- Supabase Point-in-Time Recovery available on Pro plan

---

## Launch Communication

- [ ] Inform beta users of go-live date
- [ ] Prepare onboarding comms (non-pressuring — "here when you're ready")
- [ ] Support email set up and checked
- [ ] Privacy Policy live at `/privacy` (Phase 1.1 — required before public launch)
- [ ] Terms of Service live at `/terms` (Phase 1.1)

---

*Prevention Is the Cure. Small steps create big change.*
