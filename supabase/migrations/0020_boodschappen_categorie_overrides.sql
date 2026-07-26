-- Wat: per-huishouden overschrijving van de automatisch gedetecteerde
-- supermarkt-afdeling (categorieDetectie.js) voor een specifieke
-- productnaam — bv. 'hummus' altijd naar 'Voorraadkast' i.p.v. de
-- trefwoorden-fallback 'Overig'. Genormaliseerde tekst (trim+lowercase) als
-- sleutel, zodat de correctie voor ELK toekomstig item met diezelfde naam
-- geldt, niet alleen het ene item dat op het moment van corrigeren bestond.
-- Waarom: de automatische trefwoorddetectie dekt niet elk product; dit moet
-- blijvend te corrigeren zijn, zodat je in de winkel zelf niet elke keer
-- opnieuw naar een verkeerd ingedeeld item hoeft te zoeken/scrollen.
-- RLS: is_huishouden_lid(), zelfde patroon als 0012/0014.

create table if not exists boodschappen_categorie_overrides (
  id uuid primary key default gen_random_uuid(),
  huishouden_id uuid not null references huishoudens(id) on delete cascade,
  tekst text not null,
  categorie text not null,
  aangemaakt_op timestamptz not null default now(),
  unique (huishouden_id, tekst)
);

alter table boodschappen_categorie_overrides enable row level security;

drop policy if exists "boodschappen_categorie_overrides_select_lid" on boodschappen_categorie_overrides;
create policy "boodschappen_categorie_overrides_select_lid" on boodschappen_categorie_overrides
  for select using (is_huishouden_lid(huishouden_id));
drop policy if exists "boodschappen_categorie_overrides_insert_lid" on boodschappen_categorie_overrides;
create policy "boodschappen_categorie_overrides_insert_lid" on boodschappen_categorie_overrides
  for insert with check (is_huishouden_lid(huishouden_id));
drop policy if exists "boodschappen_categorie_overrides_update_lid" on boodschappen_categorie_overrides;
create policy "boodschappen_categorie_overrides_update_lid" on boodschappen_categorie_overrides
  for update using (is_huishouden_lid(huishouden_id)) with check (is_huishouden_lid(huishouden_id));
drop policy if exists "boodschappen_categorie_overrides_delete_lid" on boodschappen_categorie_overrides;
create policy "boodschappen_categorie_overrides_delete_lid" on boodschappen_categorie_overrides
  for delete using (is_huishouden_lid(huishouden_id));

alter publication supabase_realtime add table boodschappen_categorie_overrides;
