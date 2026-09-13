-- Incremental migration: adds multi-angle face storage.
-- Run once in Supabase SQL editor (Project > SQL Editor > New query).

create table if not exists face_embeddings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  embedding float8[] not null,
  created_at timestamptz not null default now()
);

alter table face_embeddings enable row level security;

create policy "anon full access" on face_embeddings for all using (true) with check (true);
