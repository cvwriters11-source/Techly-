create table if not exists public.site_messages (
  id text primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('promotion', 'warning')),
  title text not null,
  body text not null,
  active boolean not null default false,
  sort_order integer not null default 0
);

alter table public.site_messages enable row level security;

revoke all on table public.site_messages from anon, authenticated;
grant all on table public.site_messages to service_role;
