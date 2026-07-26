-- Wat: (1) een lijst met supermarktketens waar een huishouden boodschappen
-- doet (bv. Lidl, Albert Heijn, Dirk), en (2) een optionele voorkeur-
-- supermarkt per boodschap-item — voor als je de aanbieding al kent of om
-- kwaliteitsredenen ergens specifiek wilt halen. Handmatig deel van de
-- 'aanbieding check'-notitie; de automatische aanbieding-matching zelf
-- (tegen een externe prijzen-API) is een latere, aparte stap.
-- RLS: is_huishouden_lid(), zelfde patroon als de rest van boodschappen_*.

create table if not exists boodschappen_ketens (
  id uuid primary key default gen_random_uuid(),
  huishouden_id uuid not null references huishoudens(id) on delete cascade,
  naam text not null,
  aangemaakt_op timestamptz not null default now(),
  unique (huishouden_id, naam)
);

alter table boodschappen_ketens enable row level security;

drop policy if exists "boodschappen_ketens_select_lid" on boodschappen_ketens;
create policy "boodschappen_ketens_select_lid" on boodschappen_ketens
  for select using (is_huishouden_lid(huishouden_id));
drop policy if exists "boodschappen_ketens_insert_lid" on boodschappen_ketens;
create policy "boodschappen_ketens_insert_lid" on boodschappen_ketens
  for insert with check (is_huishouden_lid(huishouden_id));
drop policy if exists "boodschappen_ketens_delete_lid" on boodschappen_ketens;
create policy "boodschappen_ketens_delete_lid" on boodschappen_ketens
  for delete using (is_huishouden_lid(huishouden_id));

alter publication supabase_realtime add table boodschappen_ketens;

alter table boodschappen_items add column if not exists voorkeur_supermarkt text;
