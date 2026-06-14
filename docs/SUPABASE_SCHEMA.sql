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
  status text not null default 'pending',
  http_status integer,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists public.scan_issues (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  page_url text not null,
  issue_type text not null,
  severity text not null,
  message text not null,
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

create index if not exists scans_created_at_idx on public.scans (created_at desc);
create index if not exists events_event_name_idx on public.events (event_name);
create index if not exists events_scan_id_idx on public.events (scan_id);
create index if not exists scan_pages_scan_id_idx on public.scan_pages (scan_id);
create index if not exists scan_issues_scan_id_idx on public.scan_issues (scan_id);
create index if not exists scan_issues_issue_type_idx on public.scan_issues (issue_type);
create index if not exists leads_scan_id_idx on public.leads (scan_id);
create index if not exists leads_email_idx on public.leads (email);
create index if not exists pricing_clicks_scan_id_idx on public.pricing_clicks (scan_id);
create index if not exists pricing_clicks_lead_id_idx on public.pricing_clicks (lead_id);
