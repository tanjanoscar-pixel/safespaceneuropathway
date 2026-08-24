-- NeuroPathway: priority user journey — additive fixes to the existing schema
--
-- This project already has an extensively built schema for this platform
-- (11 prior migrations: safe space youth tables, behaviour pattern flags,
-- questionnaires, knowledge base RAG, etc). Nothing here recreates or
-- replaces existing tables. It only:
--
--   1. Closes two real RLS gaps found on audit:
--      - ai_patterns_insert had `with_check: true` — any authenticated user
--        could write a fabricated "pattern" against ANY child, not just
--        ones they're connected to.
--      - ehcp_reports_insert_own let a user insert a report row for any
--        child_id as long as they set user_id = themselves, bypassing the
--        child-ownership check the other ehcp_reports policies enforce.
--      - audit_logs_insert let a caller attribute an entry to any user_id.
--   2. Grants authorised professionals (via professional_child_links, which
--      already existed but was only wired into ehcp_reports) the same
--      read/write reach parents already had via child ownership. Without
--      this, a teacher or SENCO linked to a child could not see or record
--      anything about them — the priority journey requires they can.
--   3. Adds columns the brief's observation/support-plan/evidence-summary
--      fields need that aren't on the existing tables yet, and one new
--      table (intervention_reviews) for the continue/change/stop outcome
--      cycle on support plans. All additive — no drops, no data at risk
--      (every affected table currently has 0 rows).

-- ---------------------------------------------------------------------------
-- 1. Security fixes on existing policies
-- ---------------------------------------------------------------------------

drop policy if exists patterns_insert on ai_patterns;
drop policy if exists ehcp_reports_insert_own on ehcp_reports;
drop policy if exists ehcp_reports_admin_linked_rw on ehcp_reports;
drop policy if exists audit_logs_insert on audit_logs;

create policy audit_logs_insert on audit_logs for insert
  with check (user_id is null or user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. Professional access via professional_child_links (already existed;
--    only used by ehcp_reports before this migration)
-- ---------------------------------------------------------------------------

create policy children_select_professional on children for select
  using (is_professional_for_child(id));

create policy observations_select_professional on observations for select
  using (is_professional_for_child(child_id));
create policy observations_insert_professional on observations for insert
  with check (is_professional_for_child(child_id) and user_id = auth.uid());

create policy patterns_select_professional on ai_patterns for select
  using (is_professional_for_child(child_id));
-- Replaces the removed `patterns_insert` (was `with_check: true`).
create policy patterns_insert_authorised on ai_patterns for insert
  with check (
    is_admin()
    or is_professional_for_child(child_id)
    or exists (select 1 from children c where c.id = ai_patterns.child_id and c.user_id = auth.uid())
  );

create policy interventions_select_professional on interventions for select
  using (is_professional_for_child(child_id));
create policy interventions_insert_professional on interventions for insert
  with check (is_professional_for_child(child_id) and user_id = auth.uid());
create policy interventions_update_professional on interventions for update
  using (is_professional_for_child(child_id));

create policy reviews_select_professional on human_reviews for select
  using (child_id is not null and is_professional_for_child(child_id));
-- Replaces the removed unconditional `reviews_insert` (was `with_check: true`).
drop policy if exists reviews_insert on human_reviews;
create policy reviews_insert_authorised on human_reviews for insert
  with check (
    user_id = auth.uid()
    and (
      is_admin()
      or (child_id is not null and is_professional_for_child(child_id))
      or exists (select 1 from children c where c.id = human_reviews.child_id and c.user_id = auth.uid())
    )
  );

create policy ehcp_reports_insert_authorised on ehcp_reports for insert
  with check (
    user_id = auth.uid()
    and (
      is_admin()
      or is_professional_for_child(child_id)
      or exists (select 1 from children c where c.id = ehcp_reports.child_id and c.user_id = auth.uid())
    )
  );
create policy ehcp_reports_update_professional on ehcp_reports for update
  using (is_professional_for_child(child_id))
  with check (is_professional_for_child(child_id));

-- ---------------------------------------------------------------------------
-- 3. Additive columns for brief-required fields
-- ---------------------------------------------------------------------------

alter table observations
  add column if not exists child_response text,
  add column if not exists what_helped text,
  add column if not exists what_did_not_help text,
  add column if not exists strengths text,
  add column if not exists child_words text,
  add column if not exists duration_minutes integer,
  add column if not exists frequency text,
  add column if not exists environmental_factors text,
  add column if not exists follow_up_action text,
  add column if not exists edit_history jsonb not null default '[]'::jsonb;

alter table ai_patterns
  add column if not exists supporting_observation_ids uuid[] not null default '{}';

alter table interventions
  add column if not exists desired_outcome text,
  add column if not exists child_view text,
  add column if not exists responsible_person uuid references profiles (id),
  add column if not exists review_date date,
  add column if not exists frequency text,
  add column if not exists status text not null default 'active';

alter table interventions
  drop constraint if exists interventions_status_check;
alter table interventions
  add constraint interventions_status_check check (status in ('active', 'changed', 'stopped'));

create table if not exists intervention_reviews (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references interventions (id) on delete cascade,
  evidence_of_delivery text,
  outcome text,
  child_family_feedback text,
  decision text not null check (decision in ('continue', 'change', 'stop')),
  reviewed_by uuid not null references profiles (id),
  reviewed_at timestamptz not null default now()
);

alter table intervention_reviews enable row level security;

create policy intervention_reviews_select on intervention_reviews for select
  using (exists (
    select 1 from interventions i
    where i.id = intervention_reviews.intervention_id
      and (i.user_id = auth.uid() or is_professional_for_child(i.child_id) or is_admin())
  ));
create policy intervention_reviews_insert on intervention_reviews for insert
  with check (
    reviewed_by = auth.uid()
    and exists (
      select 1 from interventions i
      where i.id = intervention_reviews.intervention_id
        and (i.user_id = auth.uid() or is_professional_for_child(i.child_id) or is_admin())
    )
  );

alter table ehcp_reports
  add column if not exists version integer not null default 1,
  add column if not exists status text not null default 'draft',
  add column if not exists approved_by uuid references profiles (id),
  add column if not exists approved_at timestamptz;

alter table ehcp_reports
  drop constraint if exists ehcp_reports_status_check;
alter table ehcp_reports
  add constraint ehcp_reports_status_check check (status in ('draft', 'approved'));
