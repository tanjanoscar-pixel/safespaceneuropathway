-- observations previously only had `created_at` (submission time) and a loose
-- `time_of_day` text field. The brief requires capturing when the observed
-- event actually happened, distinct from when it was recorded.

alter table observations
  add column if not exists observed_at timestamptz not null default now();

create index if not exists observations_child_observed_idx on observations (child_id, observed_at desc);
