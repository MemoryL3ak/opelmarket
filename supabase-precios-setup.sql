-- ============================================================
--  Setup para /precios-helados  (correr una sola vez en Supabase)
--  Supabase Dashboard → SQL Editor → pegar y ejecutar
-- ============================================================

-- 1) Tabla de listados de precios
create table if not exists public.precios_listas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  pdf_url     text not null,
  pdf_path    text not null,
  activo      boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.precios_listas enable row level security;

-- Lectura pública (la página /precios-helados usa la anon key)
create policy "precios_listas lectura publica"
  on public.precios_listas for select
  using (true);

-- Escritura solo para usuarios autenticados (panel admin)
create policy "precios_listas insert autenticado"
  on public.precios_listas for insert
  to authenticated with check (true);

create policy "precios_listas update autenticado"
  on public.precios_listas for update
  to authenticated using (true) with check (true);

create policy "precios_listas delete autenticado"
  on public.precios_listas for delete
  to authenticated using (true);


-- 2) Bucket de Storage para los PDFs (público para lectura)
insert into storage.buckets (id, name, public)
values ('precios-helados', 'precios-helados', true)
on conflict (id) do update set public = true;

-- Lectura pública de los archivos del bucket
create policy "precios-helados lectura publica"
  on storage.objects for select
  using (bucket_id = 'precios-helados');

-- Subir / actualizar / borrar solo autenticados
create policy "precios-helados insert autenticado"
  on storage.objects for insert
  to authenticated with check (bucket_id = 'precios-helados');

create policy "precios-helados update autenticado"
  on storage.objects for update
  to authenticated using (bucket_id = 'precios-helados');

create policy "precios-helados delete autenticado"
  on storage.objects for delete
  to authenticated using (bucket_id = 'precios-helados');
