-- Wat: Boodschappen-'beurten' (winkelrondes) — elke afvink-actie op een dag
-- wordt gegroepeerd tot één beurt, met een tekst-snapshot van de gekochte
-- items (bewust GEEN foreign key naar het levende boodschappen-item, want
-- die overleeft hernoemen/verwijderen van het item niet — de geschiedenis
-- moet blijven staan ook als het actieve item later verandert).
-- Waarom: basis voor de zelflerende favorieten-detectie
-- (detecteerFavorieten in boodschappenLeren.js) — zonder deze geschiedenis
-- kan de app geen koopinterval per item berekenen en dus geen wekelijks/
-- maandelijks patroon leren.
-- RLS: is_huishouden_lid() overal, zelfde patroon als 0010/0011.

create table if not exists boodschappen_beurten (
  id uuid primary key default gen_random_uuid(),
  huishouden_id uuid not null references huishoudens(id) on delete cascade,
  datum date not null,
  aangemaakt_door uuid references auth.users(id),
  aangemaakt_op timestamptz not null default now(),
  unique (huishouden_id, datum)
);

create table if not exists boodschappen_beurt_items (
  id uuid primary key default gen_random_uuid(),
  beurt_id uuid not null references boodschappen_beurten(id) on delete cascade,
  tekst text not null,
  aantal integer not null default 1,
  aangemaakt_op timestamptz not null default now()
);

alter table boodschappen_beurten enable row level security;
alter table boodschappen_beurt_items enable row level security;

drop policy if exists "boodschappen_beurten_select_lid" on boodschappen_beurten;
create policy "boodschappen_beurten_select_lid" on boodschappen_beurten
  for select using (is_huishouden_lid(huishouden_id));
drop policy if exists "boodschappen_beurten_insert_lid" on boodschappen_beurten;
create policy "boodschappen_beurten_insert_lid" on boodschappen_beurten
  for insert with check (is_huishouden_lid(huishouden_id));
drop policy if exists "boodschappen_beurten_update_lid" on boodschappen_beurten;
create policy "boodschappen_beurten_update_lid" on boodschappen_beurten
  for update using (is_huishouden_lid(huishouden_id)) with check (is_huishouden_lid(huishouden_id));
drop policy if exists "boodschappen_beurten_delete_lid" on boodschappen_beurten;
create policy "boodschappen_beurten_delete_lid" on boodschappen_beurten
  for delete using (is_huishouden_lid(huishouden_id));

-- boodschappen_beurt_items heeft geen eigen huishouden_id-kolom — de policy
-- gaat via een subquery naar boodschappen_beurten, zelfde patroon als
-- huishoud_taken_log in migratie 0011 (geen recursiegevaar: twee VERSCHILLENDE
-- tabellen, niet elkaar via EXISTS checken).
drop policy if exists "boodschappen_beurt_items_select_lid" on boodschappen_beurt_items;
create policy "boodschappen_beurt_items_select_lid" on boodschappen_beurt_items
  for select using (
    exists (select 1 from boodschappen_beurten b where b.id = boodschappen_beurt_items.beurt_id and is_huishouden_lid(b.huishouden_id))
  );
drop policy if exists "boodschappen_beurt_items_insert_lid" on boodschappen_beurt_items;
create policy "boodschappen_beurt_items_insert_lid" on boodschappen_beurt_items
  for insert with check (
    exists (select 1 from boodschappen_beurten b where b.id = boodschappen_beurt_items.beurt_id and is_huishouden_lid(b.huishouden_id))
  );

alter publication supabase_realtime add table boodschappen_beurten;
alter publication supabase_realtime add table boodschappen_beurt_items;
