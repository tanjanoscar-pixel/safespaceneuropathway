-- professional_child_links previously had only one policy: a professional
-- could see links naming themselves. There was no way for anyone — parent,
-- admin, or otherwise — to actually create a link, and a parent couldn't
-- even see who was authorised for their own child. That silently blocked
-- the priority journey: a teacher/SENCO cannot be authorised for a child at
-- all without this.

create policy pcl_select_child_owner on professional_child_links for select
  using (exists (select 1 from children c where c.id = professional_child_links.child_id and c.user_id = auth.uid()));

create policy pcl_insert_child_owner_or_admin on professional_child_links for insert
  with check (
    granted_by = auth.uid()
    and (
      is_admin()
      or exists (select 1 from children c where c.id = professional_child_links.child_id and c.user_id = auth.uid())
    )
  );

create policy pcl_update_child_owner_or_admin on professional_child_links for update
  using (
    is_admin()
    or exists (select 1 from children c where c.id = professional_child_links.child_id and c.user_id = auth.uid())
  );
