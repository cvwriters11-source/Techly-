create table if not exists public.career_profiles (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null unique,
  name text not null,
  email text not null,
  phone text not null default '',
  target_role text not null default '',
  focus text not null default 'interview' check (
    focus in ('interview', 'job_hunt', 'career_growth')
  ),
  preferred_voice text not null default 'woman' check (
    preferred_voice in ('man', 'woman')
  ),
  preferred_duration integer not null default 30 check (
    preferred_duration in (20, 30, 60)
  )
);

create table if not exists public.career_sessions (
  id text primary key,
  created_at timestamptz not null default now(),
  profile_id text not null references public.career_profiles (id) on delete cascade,
  voice text not null check (voice in ('man', 'woman')),
  duration_minutes integer not null check (duration_minutes in (20, 30, 60)),
  focus text not null default 'interview' check (
    focus in ('interview', 'job_hunt', 'career_growth')
  ),
  target_role text not null default '',
  status text not null default 'queued' check (
    status in ('queued', 'active', 'completed', 'abandoned')
  ),
  started_at timestamptz,
  ends_at timestamptz,
  summary text not null default ''
);

create table if not exists public.career_messages (
  id text primary key,
  created_at timestamptz not null default now(),
  session_id text not null references public.career_sessions (id) on delete cascade,
  role text not null check (role in ('coach', 'candidate')),
  text text not null
);

create index if not exists career_sessions_profile_idx
  on public.career_sessions (profile_id, created_at desc);

create index if not exists career_messages_session_idx
  on public.career_messages (session_id, created_at asc);

alter table public.career_profiles enable row level security;
alter table public.career_sessions enable row level security;
alter table public.career_messages enable row level security;

revoke all on table public.career_profiles from anon, authenticated;
revoke all on table public.career_sessions from anon, authenticated;
revoke all on table public.career_messages from anon, authenticated;

grant all on table public.career_profiles to service_role;
grant all on table public.career_sessions to service_role;
grant all on table public.career_messages to service_role;

insert into public.site_settings (key, value)
values ('career_public_enabled', 'true'::jsonb)
on conflict (key) do nothing;
