-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  roll text,
  class text,
  section text,
  photo_url text,
  face_descriptor float8[] not null,
  enrolled_at timestamptz not null default now()
);

-- One row per enrolled photo/angle (front, left profile, right profile, ...).
-- A student can have several; recognition matches against every one of them
-- and takes the best score, so a side-on camera angle can still match a
-- profile shot instead of being averaged into a blurry "mean face".
create table if not exists face_embeddings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  embedding float8[] not null,
  created_at timestamptz not null default now()
);

create table if not exists attendance_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  name text not null,
  class text,
  roll text,
  confidence numeric,
  status text not null,       -- 'Verified' | 'Unknown Face'
  logged_by text not null default 'Camera',
  created_at timestamptz not null default now()
);

-- ponytail: no auth exists yet, so RLS is wide open to the anon key.
-- Tighten these to per-user policies once real auth is added.
alter table students enable row level security;
alter table face_embeddings enable row level security;
alter table attendance_logs enable row level security;

create policy "anon full access" on students for all using (true) with check (true);
create policy "anon full access" on face_embeddings for all using (true) with check (true);
create policy "anon full access" on attendance_logs for all using (true) with check (true);

-- Storage bucket for enrollment photos, plus a policy so the anon key can upload/read.
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', true)
on conflict (id) do nothing;

create policy "anon full access to student-photos"
  on storage.objects for all
  using (bucket_id = 'student-photos')
  with check (bucket_id = 'student-photos');
