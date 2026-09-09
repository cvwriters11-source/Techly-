create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

revoke all on table public.site_settings from anon, authenticated;
grant all on table public.site_settings to service_role;

insert into public.site_settings (key, value)
values ('marketing_public_enabled', 'true'::jsonb)
on conflict (key) do nothing;
