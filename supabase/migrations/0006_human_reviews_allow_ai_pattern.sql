-- human_reviews.reviewable_type was constrained to ('assessment','report',
-- 'alert','ai_run') — none of which covers reviewing an ai_patterns
-- suggestion, which is exactly the human-in-the-loop step the priority
-- journey needs. Adding 'ai_pattern' as an allowed type; not touching the
-- other three or the separate status check constraint.
--
-- Note: human_reviews.status is a pre-existing, separate check constraint
-- (pending / in_review / approved / rejected / needs_edit) that the
-- frontend must use directly — it is not being changed here. The pattern
-- review UI maps the brief's accept/edit/reject/request-more-info actions
-- onto these existing values (edit -> approved + edits_made populated,
-- request more info -> needs_edit) rather than inventing new ones.

alter table human_reviews drop constraint human_reviews_reviewable_type_check;
alter table human_reviews add constraint human_reviews_reviewable_type_check
  check (reviewable_type = any (array['assessment','report','alert','ai_run','ai_pattern']));
