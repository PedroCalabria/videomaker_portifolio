-- Portfólio Flávio Calábria · estrutura do banco no Supabase
-- Rode uma vez em: Supabase → SQL Editor → New query → colar → Run.

-- ── Projetos ─────────────────────────────────────────────────────────────
-- Cada projeto é um documento JSON (mesmo formato usado pelo site e pela área do dono).
create table if not exists public.projects (
  id          text primary key,
  sort        integer not null default 999,
  doc         jsonb   not null,
  updated_at  timestamptz not null default now()
);
create index if not exists projects_sort_idx on public.projects (sort);
-- acelera a checagem "este vídeo do Bunny está publicado?" feita pela rota /api/videos/embed
create index if not exists projects_media_idx on public.projects using gin ((doc -> 'media') jsonb_path_ops);

-- ── Quem pode editar ─────────────────────────────────────────────────────
-- Só usuários listados aqui gravam projetos e capas.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- ── Regras de acesso (RLS) ───────────────────────────────────────────────
alter table public.projects enable row level security;
alter table public.admins   enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "projetos: leitura pública" on public.projects;
create policy "projetos: leitura pública" on public.projects
  for select using (true);

drop policy if exists "projetos: só admins gravam" on public.projects;
create policy "projetos: só admins gravam" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins: cada um vê a si" on public.admins;
create policy "admins: cada um vê a si" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ── Capas (Storage) ──────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('posters', 'posters', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "capas: admins enviam" on storage.objects;
create policy "capas: admins enviam" on storage.objects
  for insert to authenticated with check (bucket_id = 'posters' and public.is_admin());

drop policy if exists "capas: admins atualizam" on storage.objects;
create policy "capas: admins atualizam" on storage.objects
  for update to authenticated using (bucket_id = 'posters' and public.is_admin());

drop policy if exists "capas: admins removem" on storage.objects;
create policy "capas: admins removem" on storage.objects
  for delete to authenticated using (bucket_id = 'posters' and public.is_admin());

-- ── Depois de criar o usuário do Flávio (Authentication → Users → Add user) ──
-- troque o e-mail e rode:
-- insert into public.admins (user_id) select id from auth.users where email = 'flavio@exemplo.com';
