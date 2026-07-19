-- Wat: huishoudens (gedeelde groepen) + lidmaatschap + uitnodigingen.
-- Waarom: fundament om Kluslijst/Huishouden-data straks met een partner te
-- kunnen delen. Alle bestaande data (lifecore_data) is single-owner
-- (user_id), geschikt voor sync tussen iemands eigen apparaten maar niet
-- deelbaar met een ander account. Dit is BEWUST alleen het
-- lidmaatschaps-fundament (huishouden aanmaken, uitnodigen via een
-- deelbare link, accepteren, leden zien/verwijderen) — het migreren van
-- Kluslijst-projecten/huishoudklussen naar huishouden-gescoopte tabellen
-- is een aparte, latere stap, nog niet hier.
-- Uitnodigen gebeurt via een deelbare link met token (geen edge function/
-- e-mailservice in dit project), niet via een automatisch verstuurde e-mail.
-- RLS: het 'eigenaar OF rol-uitzondering'-patroon uit CLAUDE.md, hier
-- 'lid-van-hetzelfde-huishouden via subquery' — leden zien elkaar, een
-- uitnodiging accepteren mag alleen op je eigen (JWT-)e-mailadres.

create table if not exists huishoudens (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  aangemaakt_door uuid not null references auth.users(id) on delete cascade,
  aangemaakt_op timestamptz not null default now()
);

create table if not exists huishouden_leden (
  id uuid primary key default gen_random_uuid(),
  huishouden_id uuid not null references huishoudens(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rol text not null default 'lid' check (rol in ('eigenaar', 'lid')),
  toegevoegd_op timestamptz not null default now(),
  unique (huishouden_id, user_id)
);

create table if not exists huishouden_uitnodigingen (
  id uuid primary key default gen_random_uuid(),
  huishouden_id uuid not null references huishoudens(id) on delete cascade,
  token uuid not null default gen_random_uuid() unique,
  uitgenodigd_email text not null,
  aangemaakt_door uuid not null references auth.users(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'geaccepteerd', 'ingetrokken')),
  aangemaakt_op timestamptz not null default now(),
  verlopen_op timestamptz not null default (now() + interval '14 days')
);

alter table huishoudens enable row level security;
alter table huishouden_leden enable row level security;
alter table huishouden_uitnodigingen enable row level security;

-- huishoudens
drop policy if exists "huishoudens_select_lid" on huishoudens;
create policy "huishoudens_select_lid" on huishoudens
  for select using (
    exists (select 1 from huishouden_leden where huishouden_id = huishoudens.id and user_id = auth.uid())
  );

drop policy if exists "huishoudens_insert_eigen" on huishoudens;
create policy "huishoudens_insert_eigen" on huishoudens
  for insert with check (aangemaakt_door = auth.uid());

drop policy if exists "huishoudens_update_eigenaar" on huishoudens;
create policy "huishoudens_update_eigenaar" on huishoudens
  for update using (
    exists (select 1 from huishouden_leden where huishouden_id = huishoudens.id and user_id = auth.uid() and rol = 'eigenaar')
  );

drop policy if exists "huishoudens_delete_eigenaar" on huishoudens;
create policy "huishoudens_delete_eigenaar" on huishoudens
  for delete using (
    exists (select 1 from huishouden_leden where huishouden_id = huishoudens.id and user_id = auth.uid() and rol = 'eigenaar')
  );

-- huishouden_leden
drop policy if exists "huishouden_leden_select_lid" on huishouden_leden;
create policy "huishouden_leden_select_lid" on huishouden_leden
  for select using (
    exists (
      select 1 from huishouden_leden hl2
      where hl2.huishouden_id = huishouden_leden.huishouden_id and hl2.user_id = auth.uid()
    )
  );

-- Jezelf toevoegen mag alleen met een geldige, open, niet-verlopen
-- uitnodiging op je eigen e-mailadres (de acceptatie-stap) — of de
-- eigenaar voegt een lid rechtstreeks toe.
drop policy if exists "huishouden_leden_insert_uitnodiging_of_eigenaar" on huishouden_leden;
create policy "huishouden_leden_insert_uitnodiging_of_eigenaar" on huishouden_leden
  for insert with check (
    (
      user_id = auth.uid()
      and exists (
        select 1 from huishouden_uitnodigingen
        where huishouden_id = huishouden_leden.huishouden_id
          and status = 'open'
          and verlopen_op > now()
          and lower(uitgenodigd_email) = lower(auth.jwt() ->> 'email')
      )
    )
    or exists (
      select 1 from huishouden_leden hl2
      where hl2.huishouden_id = huishouden_leden.huishouden_id and hl2.user_id = auth.uid() and hl2.rol = 'eigenaar'
    )
  );

-- Zelf verlaten, of de eigenaar verwijdert een ander lid.
drop policy if exists "huishouden_leden_delete_zelf_of_eigenaar" on huishouden_leden;
create policy "huishouden_leden_delete_zelf_of_eigenaar" on huishouden_leden
  for delete using (
    user_id = auth.uid()
    or exists (
      select 1 from huishouden_leden hl2
      where hl2.huishouden_id = huishouden_leden.huishouden_id and hl2.user_id = auth.uid() and hl2.rol = 'eigenaar'
    )
  );

-- huishouden_uitnodigingen
drop policy if exists "huishouden_uitnodigingen_select_lid_of_genodigde" on huishouden_uitnodigingen;
create policy "huishouden_uitnodigingen_select_lid_of_genodigde" on huishouden_uitnodigingen
  for select using (
    exists (select 1 from huishouden_leden where huishouden_id = huishouden_uitnodigingen.huishouden_id and user_id = auth.uid())
    or lower(uitgenodigd_email) = lower(auth.jwt() ->> 'email')
  );

drop policy if exists "huishouden_uitnodigingen_insert_lid" on huishouden_uitnodigingen;
create policy "huishouden_uitnodigingen_insert_lid" on huishouden_uitnodigingen
  for insert with check (
    aangemaakt_door = auth.uid()
    and exists (select 1 from huishouden_leden where huishouden_id = huishouden_uitnodigingen.huishouden_id and user_id = auth.uid())
  );

-- Bijwerken (status naar geaccepteerd/ingetrokken) door een huishoudlid of
-- door de uitgenodigde zelf (accepteren vóórdat hij lid is).
drop policy if exists "huishouden_uitnodigingen_update_lid_of_genodigde" on huishouden_uitnodigingen;
create policy "huishouden_uitnodigingen_update_lid_of_genodigde" on huishouden_uitnodigingen
  for update using (
    exists (select 1 from huishouden_leden where huishouden_id = huishouden_uitnodigingen.huishouden_id and user_id = auth.uid())
    or lower(uitgenodigd_email) = lower(auth.jwt() ->> 'email')
  );
