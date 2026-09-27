-- =========================================================
-- ケース管理デモ用スキーマ
-- Supabase ダッシュボード > SQL Editor に貼り付けて実行してください
-- =========================================================

-- ---------- enum ----------
do $$ begin
  create type user_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type agreement_status as enum ('awaiting_signature', 'signed');
exception when duplicate_object then null; end $$;

-- ---------- tables ----------
create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  firstname  text not null,
  lastname   text not null,
  address    text,
  role       user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists public.templates (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  file       text not null, -- 例: /files/gyomu-keiyakusho.docx（public 配下）またはストレージのパス
  created_at timestamptz not null default now()
);

create table if not exists public.agreements (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  status          agreement_status not null default 'awaiting_signature',
  user_id         uuid not null references public.users(id) on delete cascade,   -- 署名者
  template_id     uuid not null references public.templates(id) on delete cascade,
  file            text,          -- 署名済み PDF のストレージパス（未署名時は null）
  created_user_id uuid not null references public.users(id) on delete cascade,  -- 作成者
  created_at      timestamptz not null default now()
);

-- ---------- RLS（デモ用：anon に全許可） ----------
alter table public.users      enable row level security;
alter table public.templates  enable row level security;
alter table public.agreements enable row level security;

drop policy if exists "demo all users"      on public.users;
drop policy if exists "demo all templates"  on public.templates;
drop policy if exists "demo all agreements" on public.agreements;
create policy "demo all users"      on public.users      for all using (true) with check (true);
create policy "demo all templates"  on public.templates  for all using (true) with check (true);
create policy "demo all agreements" on public.agreements for all using (true) with check (true);

-- ---------- Storage（署名済み PDF 保存用） ----------
insert into storage.buckets (id, name, public)
values ('agreements', 'agreements', true)
on conflict (id) do nothing;

drop policy if exists "demo agreements read"   on storage.objects;
drop policy if exists "demo agreements insert" on storage.objects;
drop policy if exists "demo agreements update" on storage.objects;
create policy "demo agreements read"   on storage.objects for select using (bucket_id = 'agreements');
create policy "demo agreements insert" on storage.objects for insert with check (bucket_id = 'agreements');
create policy "demo agreements update" on storage.objects for update using (bucket_id = 'agreements');

-- =========================================================
-- シードデータ
-- =========================================================
insert into public.users (id, email, firstname, lastname, address, role) values
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com',  '太郎', '管理',   '東京都千代田区丸の内1-1-1', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'tanaka@example.com', '花子', '田中',   '大阪府大阪市北区梅田2-2-2', 'user'),
  ('33333333-3333-3333-3333-333333333333', 'sato@example.com',   '一郎', '佐藤',   '愛知県名古屋市中区栄3-3-3', 'user')
on conflict (email) do nothing;

insert into public.templates (id, title, file) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '業務契約書', '/files/gyomu-keiyakusho.docx')
on conflict (id) do nothing;

insert into public.agreements (title, status, user_id, template_id, created_user_id, created_at) values
  ('業務契約書（田中 花子様）', 'awaiting_signature', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', now() - interval '3 day'),
  ('業務契約書（佐藤 一郎様）', 'awaiting_signature', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', now() - interval '1 day'),
  ('業務契約書（管理 太郎様）', 'awaiting_signature', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', now());
