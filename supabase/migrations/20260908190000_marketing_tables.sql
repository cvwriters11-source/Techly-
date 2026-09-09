create table if not exists public.marketing_profiles (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null unique,
  company text not null,
  contact_name text not null default '',
  email text not null,
  phone text not null default '',
  website text not null default '',
  services text not null default '',
  timezone text not null default 'Africa/Johannesburg',
  posts_per_period integer not null default 1,
  period text not null default 'day' check (period in ('day', 'week')),
  active boolean not null default false,
  setup_complete boolean not null default false,
  provider_profile_key text not null default ''
);

create table if not exists public.marketing_socials (
  id text primary key,
  created_at timestamptz not null default now(),
  profile_id text not null references public.marketing_profiles (id) on delete cascade,
  platform text not null check (
    platform in ('facebook', 'instagram', 'linkedin', 'x', 'whatsapp', 'tiktok')
  ),
  profile_url text not null default '',
  connected boolean not null default false,
  provider_platform_id text not null default '',
  unique (profile_id, platform)
);

create table if not exists public.marketing_posts (
  id text primary key,
  created_at timestamptz not null default now(),
  profile_id text not null references public.marketing_profiles (id) on delete cascade,
  body text not null,
  scheduled_for timestamptz not null,
  status text not null default 'queued' check (status in ('queued', 'posted', 'failed', 'cancelled')),
  platform_results jsonb not null default '{}'::jsonb,
  error text not null default ''
);

create index if not exists marketing_posts_due_idx
  on public.marketing_posts (status, scheduled_for);

create index if not exists marketing_posts_profile_idx
  on public.marketing_posts (profile_id, scheduled_for desc);

alter table public.marketing_profiles enable row level security;
alter table public.marketing_socials enable row level security;
alter table public.marketing_posts enable row level security;

revoke all on table public.marketing_profiles from anon, authenticated;
revoke all on table public.marketing_socials from anon, authenticated;
revoke all on table public.marketing_posts from anon, authenticated;

grant all on table public.marketing_profiles to service_role;
grant all on table public.marketing_socials to service_role;
grant all on table public.marketing_posts to service_role;
