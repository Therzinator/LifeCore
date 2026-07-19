-- Wat: eigen gerechten (recepten) voor de Boodschappen-module — een gerecht
-- heeft drie categorieën ingrediënten (ingredienten/optioneel/kruiden, elk
-- een simpele lijst tekst-regels, geen aparte normalisatie: zelfde
-- afweging als klusjes.klusjes in migratie 0010, de client-logica zou
-- anders onnodig verdubbelen voor weinig winst).
-- Waarom: huishouden-gedeeld, net als de rest van Boodschappen — een
-- maaltijd plan je samen. De meegeleverde curated bibliotheek (zie
-- src/lib/boodschappen/curatedeGerechten.js) is bewust GEEN databaserij:
-- die is statisch en gelijk voor iedereen, dus hoort bij de app-code, niet
-- in de database.
-- RLS: is_huishouden_lid() overal, zelfde patroon als 0010/0011/0014.

create table if not exists gerechten (
  id uuid primary key default gen_random_uuid(),
  huishouden_id uuid not null references huishoudens(id) on delete cascade,
  naam text not null,
  ingredienten jsonb not null default '[]',
  optioneel jsonb not null default '[]',
  kruiden jsonb not null default '[]',
  aangemaakt_door uuid references auth.users(id),
  aangemaakt_op timestamptz not null default now()
);

alter table gerechten enable row level security;

drop policy if exists "gerechten_select_lid" on gerechten;
create policy "gerechten_select_lid" on gerechten
  for select using (is_huishouden_lid(huishouden_id));
drop policy if exists "gerechten_insert_lid" on gerechten;
create policy "gerechten_insert_lid" on gerechten
  for insert with check (is_huishouden_lid(huishouden_id));
drop policy if exists "gerechten_update_lid" on gerechten;
create policy "gerechten_update_lid" on gerechten
  for update using (is_huishouden_lid(huishouden_id)) with check (is_huishouden_lid(huishouden_id));
drop policy if exists "gerechten_delete_lid" on gerechten;
create policy "gerechten_delete_lid" on gerechten
  for delete using (is_huishouden_lid(huishouden_id));

alter publication supabase_realtime add table gerechten;
