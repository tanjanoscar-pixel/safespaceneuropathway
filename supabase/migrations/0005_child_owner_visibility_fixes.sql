-- Found by simulating the full priority journey with real RLS impersonation
-- (set role authenticated + request.jwt.claims, matching how PostgREST
-- resolves auth.uid()): a teacher's observation was invisible to the
-- child's own parent, because observations_select_own only covered rows
-- the viewer personally authored, not the child they own. Same bug existed
-- on interventions (support plans) and human_reviews. Parents need to see
-- everything about their own child regardless of who wrote it.

create policy observations_select_child_owner on observations for select
  using (exists (select 1 from children c where c.id = observations.child_id and c.user_id = auth.uid()));

create policy interventions_select_child_owner on interventions for select
  using (exists (select 1 from children c where c.id = interventions.child_id and c.user_id = auth.uid()));

create policy interventions_update_child_owner on interventions for update
  using (exists (select 1 from children c where c.id = interventions.child_id and c.user_id = auth.uid()));

create policy reviews_select_child_owner on human_reviews for select
  using (child_id is not null and exists (select 1 from children c where c.id = human_reviews.child_id and c.user_id = auth.uid()));
