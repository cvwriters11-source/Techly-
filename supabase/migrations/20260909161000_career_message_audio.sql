-- Store recorded / synthesized audio paths for admin playback.
alter table public.career_messages
  add column if not exists audio_path text;

-- Private bucket for career session audio (service role only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'career-audio',
  'career-audio',
  false,
  15728640,
  array['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
