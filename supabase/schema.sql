-- ============================================================
-- Béb Eco — Schéma Supabase
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- Profils utilisateurs (pseudo public)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Les profils sont visibles par tous"
  on profiles for select using (true);

create policy "Un utilisateur gère son propre profil"
  on profiles for insert with check (auth.uid() = id);

create policy "Un utilisateur modifie son propre profil"
  on profiles for update using (auth.uid() = id);

-- Annonces
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text not null,
  condition text not null,
  price numeric not null,
  city text not null,
  description text,
  photos text[] default '{}',
  status text default 'active', -- active | sold | archived
  boosted_at timestamptz,
  boosted_until timestamptz,
  created_at timestamptz default now()
);

alter table listings enable row level security;

create policy "Les annonces actives sont visibles par tous"
  on listings for select using (true);

create policy "Un utilisateur crée ses propres annonces"
  on listings for insert with check (auth.uid() = seller_id);

create policy "Un utilisateur modifie ses propres annonces"
  on listings for update using (auth.uid() = seller_id);

create policy "Un utilisateur supprime ses propres annonces"
  on listings for delete using (auth.uid() = seller_id);

-- Messages privés (liés à une annonce)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  recipient_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "Seuls les deux participants voient leurs messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Un utilisateur envoie des messages en son nom"
  on messages for insert
  with check (auth.uid() = sender_id);

-- Favoris
create table if not exists favorites (
  user_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, listing_id)
);

alter table favorites enable row level security;

create policy "Un utilisateur voit ses propres favoris"
  on favorites for select using (auth.uid() = user_id);

create policy "Un utilisateur gère ses propres favoris"
  on favorites for insert with check (auth.uid() = user_id);

create policy "Un utilisateur supprime ses propres favoris"
  on favorites for delete using (auth.uid() = user_id);

-- ============================================================
-- Storage : bucket public pour les photos d'annonces
-- (à créer aussi manuellement dans Storage > New bucket si besoin)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "Photos visibles par tous"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "Un utilisateur connecté peut uploader ses photos"
  on storage.objects for insert
  with check (bucket_id = 'listing-photos' and auth.role() = 'authenticated');

create policy "Un utilisateur supprime ses propres photos"
  on storage.objects for delete
  using (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);
