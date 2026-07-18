-- Wat: contenttabellen voor de mindfulness-audiobibliotheek (thema's, sessies,
-- gebruikslog) plus een Storage-bucket voor de audiobestanden.
-- Waarom: dit is gedeelde app-content (thema's/sessies zijn voor alle
-- gebruikers hetzelfde, niet per-gebruiker data zoals de generieke
-- lifecore_data-tabel), dus dat past niet in het bestaande
-- key-value-syncpatroon. Schaal is bewust simpel gehouden: personal app,
-- max 5 gebruikers, geen CDN/caching-laag, geen CMS-UI — content wordt
-- rechtstreeks via SQL/dashboard beheerd.
-- RLS: thema's/sessies zijn gedeelde, alleen-lezen content voor ingelogde
-- gebruikers (geen insert/update/delete-policy vanuit de client). Gebruikslog
-- volgt het standaard eigenaarpatroon (auth.uid() = user_id), append-only.

create table if not exists mindfulness_themas (
  id text primary key,
  titel text not null,
  volgorde int not null default 0
);

alter table mindfulness_themas enable row level security;

drop policy if exists "mindfulness_themas_select_ingelogd" on mindfulness_themas;
create policy "mindfulness_themas_select_ingelogd" on mindfulness_themas
  for select using (auth.role() = 'authenticated');

insert into mindfulness_themas (id, titel, volgorde) values
  ('stress', 'Stress', 1),
  ('focus', 'Focus', 2),
  ('slaap', 'Slaap', 3),
  ('ochtendactivering', 'Ochtendactivering', 4)
on conflict (id) do update set titel = excluded.titel, volgorde = excluded.volgorde;

create table if not exists mindfulness_sessies (
  id uuid primary key default gen_random_uuid(),
  thema_id text not null references mindfulness_themas(id),
  titel text not null,
  duur_seconden int not null check (duur_seconden > 0),
  audio_source text not null check (audio_source in ('recorded', 'tts')),
  audio_pad text,
  tts_tekst text,
  volgorde int not null default 0,
  actief boolean not null default true,
  created_at timestamptz not null default now(),
  constraint audio_pad_of_tts_tekst check (
    (audio_source = 'recorded' and audio_pad is not null)
    or (audio_source = 'tts' and tts_tekst is not null)
  )
);

alter table mindfulness_sessies enable row level security;

drop policy if exists "mindfulness_sessies_select_ingelogd" on mindfulness_sessies;
create policy "mindfulness_sessies_select_ingelogd" on mindfulness_sessies
  for select using (auth.role() = 'authenticated');

create table if not exists mindfulness_gebruik (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sessie_id uuid not null references mindfulness_sessies(id),
  gestart_op timestamptz not null default now(),
  geluisterd_seconden int not null default 0,
  voltooid boolean not null default false,
  created_at timestamptz not null default now()
);

alter table mindfulness_gebruik enable row level security;

drop policy if exists "mindfulness_gebruik_select_eigen" on mindfulness_gebruik;
create policy "mindfulness_gebruik_select_eigen" on mindfulness_gebruik
  for select using (auth.uid() = user_id);

drop policy if exists "mindfulness_gebruik_insert_eigen" on mindfulness_gebruik;
create policy "mindfulness_gebruik_insert_eigen" on mindfulness_gebruik
  for insert with check (auth.uid() = user_id);

-- Storage-bucket voor audiobestanden (recorded én vooraf gegenereerde tts) —
-- public-read houdt dit simpel (geen signed-URL-beheer nodig); content is
-- niet gevoelig genoeg om dat te rechtvaardigen bij deze schaal.
insert into storage.buckets (id, name, public)
values ('mindfulness-audio', 'mindfulness-audio', true)
on conflict (id) do nothing;

drop policy if exists "mindfulness_audio_publiek_leesbaar" on storage.objects;
create policy "mindfulness_audio_publiek_leesbaar" on storage.objects
  for select using (bucket_id = 'mindfulness-audio');
