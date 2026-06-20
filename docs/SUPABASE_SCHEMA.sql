create extension if not exists "pgcrypto";

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  website_url text not null,
  normalized_url text not null,
  status text not null default 'started',
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  scan_id uuid references public.scans(id) on delete set null,
  website_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scan_pages (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  url text not null,
  normalized_url text,
  status text not null default 'pending',
  http_status integer,
  title text,
  meta_description text,
  canonical_url text,
  word_count integer,
  page_type text,
  discovery_source text,
  importance_score integer,
  importance_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.scan_issues (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  page_url text not null,
  issue_type text not null,
  severity text not null,
  message text not null,
  priority integer,
  page_importance integer,
  business_impact text,
  fix_difficulty text,
  confidence text,
  estimated_impact text,
  exact_fix text,
  priority_score integer,
  sort_score integer,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references public.scans(id) on delete set null,
  website_url text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pricing_clicks (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references public.scans(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  website_url text not null,
  email text,
  market text not null,
  plan text not null,
  price text not null,
  created_at timestamptz not null default now()
);

alter table public.scan_pages
add column if not exists normalized_url text,
add column if not exists meta_description text,
add column if not exists canonical_url text,
add column if not exists word_count integer,
add column if not exists page_type text,
add column if not exists discovery_source text,
add column if not exists importance_score integer,
add column if not exists importance_reason text;

alter table public.scan_issues
add column if not exists priority integer,
add column if not exists page_importance integer,
add column if not exists business_impact text,
add column if not exists fix_difficulty text,
add column if not exists confidence text,
add column if not exists estimated_impact text,
add column if not exists exact_fix text,
add column if not exists priority_score integer,
add column if not exists sort_score integer;

create index if not exists scans_created_at_idx on public.scans (created_at desc);
create index if not exists events_event_name_idx on public.events (event_name);
create index if not exists events_scan_id_idx on public.events (scan_id);
create index if not exists scan_pages_scan_id_idx on public.scan_pages (scan_id);
create index if not exists scan_pages_importance_idx on public.scan_pages (importance_score);
create index if not exists scan_issues_scan_id_idx on public.scan_issues (scan_id);
create index if not exists scan_issues_issue_type_idx on public.scan_issues (issue_type);
create index if not exists scan_issues_priority_idx on public.scan_issues (priority);
create index if not exists scan_issues_priority_score_idx on public.scan_issues (priority_score);
create index if not exists scan_issues_scan_priority_score_idx on public.scan_issues (scan_id, priority_score desc);
create index if not exists leads_scan_id_idx on public.leads (scan_id);
create index if not exists leads_email_idx on public.leads (email);
create index if not exists pricing_clicks_scan_id_idx on public.pricing_clicks (scan_id);
create index if not exists pricing_clicks_lead_id_idx on public.pricing_clicks (lead_id);

create table if not exists public.seo_resolutions (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  scan_issue_id uuid not null references public.scan_issues(id) on delete cascade,
  page_url text not null,
  issue_type text not null,
  resolution_type text not null,
  status text not null default 'ready_to_fix',
  priority text not null,
  priority_score integer not null check (priority_score >= 0 and priority_score <= 100),
  difficulty text not null,
  confidence text not null,
  problem_explanation text not null,
  business_impact text not null,
  recommended_action text not null,
  verification_step text not null,
  expected_outcome text not null,
  rule_id text not null,
  reasons jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scan_issue_id)
);

create table if not exists public.seo_resolution_outputs (
  id uuid primary key default gen_random_uuid(),
  resolution_id uuid not null references public.seo_resolutions(id) on delete cascade,
  output_type text not null,
  title text not null,
  body text not null,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resolution_id, output_type)
);

create table if not exists public.seo_resolution_verifications (
  id uuid primary key default gen_random_uuid(),
  resolution_id uuid not null references public.seo_resolutions(id) on delete cascade,
  scan_issue_id uuid not null references public.scan_issues(id) on delete cascade,
  status text not null default 'pending',
  expected_condition jsonb not null,
  actual_result jsonb,
  failure_reason text,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resolution_id)
);

create table if not exists public.seo_resolution_events (
  id uuid primary key default gen_random_uuid(),
  resolution_id uuid references public.seo_resolutions(id) on delete cascade,
  scan_id uuid references public.scans(id) on delete cascade,
  scan_issue_id uuid references public.scan_issues(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists seo_resolutions_scan_id_idx on public.seo_resolutions (scan_id);
create index if not exists seo_resolutions_priority_idx on public.seo_resolutions (priority);
create index if not exists seo_resolutions_priority_score_idx on public.seo_resolutions (priority_score desc);
create index if not exists seo_resolutions_scan_priority_score_idx on public.seo_resolutions (scan_id, priority_score desc);
create index if not exists seo_resolution_outputs_resolution_id_idx on public.seo_resolution_outputs (resolution_id);
create index if not exists seo_resolution_verifications_resolution_id_idx on public.seo_resolution_verifications (resolution_id);
create index if not exists seo_resolution_events_resolution_id_idx on public.seo_resolution_events (resolution_id);
create index if not exists seo_resolution_events_scan_id_idx on public.seo_resolution_events (scan_id);
