-- Wat: kluslijst_projecten — Kluslijst-projecten gescoopt op huishouden
-- i.p.v. individuele user_id, zodat huishoudleden dezelfde projecten zien
-- en bewerken.
-- Waarom: fase 2 van het huishouden-fundament (0003-0009) — nu de data zelf
-- delen. klusjes blijft bewust een geneste jsonb-kolom (subklusjes, fotos,
-- vereistKlusjeId, geschatteUren, ...) i.p.v. volledige normalisatie: dat
-- zou de client-updater-logica in useHuishoudProjecten.js onnodig
-- verdubbelen voor weinig winst, en de bestaande vorm werkt al.
-- RLS: elk lid van het huishouden mag alles lezen/bewerken — dat is het
-- hele punt van 'samen' — via de bestaande is_huishouden_lid()-functie
-- (0006), NOOIT een nieuwe inline EXISTS op huishouden_leden zelf (dat gaf
-- vandaag een echte RLS-recursie, zie 0006's toelichting).

create table if not exists kluslijst_projecten (
  id uuid primary key default gen_random_uuid(),
  huishouden_id uuid not null references huishoudens(id) on delete cascade,
  naam text not null,
  aantal_maanden integer not null default 3,
  start_maand text not null,
  deadline date,
  klusjes jsonb not null default '[]',
  werkvoorbereiding jsonb not null default '[]',
  aangemaakt_door uuid not null references auth.users(id),
  aangemaakt_op timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table kluslijst_projecten enable row level security;

drop policy if exists "kluslijst_projecten_select_lid" on kluslijst_projecten;
create policy "kluslijst_projecten_select_lid" on kluslijst_projecten
  for select using (is_huishouden_lid(huishouden_id));

drop policy if exists "kluslijst_projecten_insert_lid" on kluslijst_projecten;
create policy "kluslijst_projecten_insert_lid" on kluslijst_projecten
  for insert with check (is_huishouden_lid(huishouden_id));

drop policy if exists "kluslijst_projecten_update_lid" on kluslijst_projecten;
create policy "kluslijst_projecten_update_lid" on kluslijst_projecten
  for update using (is_huishouden_lid(huishouden_id)) with check (is_huishouden_lid(huishouden_id));

drop policy if exists "kluslijst_projecten_delete_lid" on kluslijst_projecten;
create policy "kluslijst_projecten_delete_lid" on kluslijst_projecten
  for delete using (is_huishouden_lid(huishouden_id));

alter publication supabase_realtime add table kluslijst_projecten;
