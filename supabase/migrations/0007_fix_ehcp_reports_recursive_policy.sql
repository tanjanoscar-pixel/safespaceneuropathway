-- ehcp_reports_child_read unnecessarily self-joined ehcp_reports inside its
-- own USING clause ("select 1 from ehcp_reports er join children c ... where
-- er.id = ehcp_reports.id ..."), which triggers "infinite recursion
-- detected in policy for relation ehcp_reports" the moment it's evaluated —
-- found by simulating the priority journey end-to-end with RLS
-- impersonation. This table's own child_id column is enough; no
-- self-reference to ehcp_reports is needed.

drop policy if exists ehcp_reports_child_read on ehcp_reports;
create policy ehcp_reports_child_read on ehcp_reports for select
  using (exists (select 1 from children c where c.id = ehcp_reports.child_id and c.user_id = auth.uid()));
