-- Wat: Ontspullen- en Boodschappen-items gescoopt op huishouden.
-- Waarom: zie 0010 (fase 2 van het huishouden-fundament). Zelfde
-- RLS-patroon (is_huishouden_lid()) als 0010/0011.

create table if not exists ontspullen_items (
  id uuid primary key default gen_random_uuid(),
  huishouden_id uuid not null references huishoudens(id) on delete cascade,
  tekst text not null,
  methode text not null check (methode in ('weggeefhoek', 'marktplaats', 'vuil')),
  afgerond boolean not null default false,
  afgerond_op timestamptz,
  aangemaakt_door uuid references auth.users(id),
  aangemaakt_op timestamptz not null default now()
);

create table if not exists boodschappen_items (
  id uuid primary key default gen_random_uuid(),
  huishouden_id uuid not null references huishoudens(id) on delete cascade,
  tekst text not null,
  frequentie text not null check (frequentie in ('week', 'maand')),
  aantal integer not null default 1,
  op_lijst boolean not null default true,
  laatst_gekocht_op timestamptz,
  laatst_gekocht_door uuid references auth.users(id),
  aangemaakt_op timestamptz not null default now()
);

alter table ontspullen_items enable row level security;
alter table boodschappen_items enable row level security;

drop policy if exists "ontspullen_items_select_lid" on ontspullen_items;
create policy "ontspullen_items_select_lid" on ontspullen_items
  for select using (is_huishouden_lid(huishouden_id));
drop policy if exists "ontspullen_items_insert_lid" on ontspullen_items;
create policy "ontspullen_items_insert_lid" on ontspullen_items
  for insert with check (is_huishouden_lid(huishouden_id));
drop policy if exists "ontspullen_items_update_lid" on ontspullen_items;
create policy "ontspullen_items_update_lid" on ontspullen_items
  for update using (is_huishouden_lid(huishouden_id)) with check (is_huishouden_lid(huishouden_id));
drop policy if exists "ontspullen_items_delete_lid" on ontspullen_items;
create policy "ontspullen_items_delete_lid" on ontspullen_items
  for delete using (is_huishouden_lid(huishouden_id));

drop policy if exists "boodschappen_items_select_lid" on boodschappen_items;
create policy "boodschappen_items_select_lid" on boodschappen_items
  for select using (is_huishouden_lid(huishouden_id));
drop policy if exists "boodschappen_items_insert_lid" on boodschappen_items;
create policy "boodschappen_items_insert_lid" on boodschappen_items
  for insert with check (is_huishouden_lid(huishouden_id));
drop policy if exists "boodschappen_items_update_lid" on boodschappen_items;
create policy "boodschappen_items_update_lid" on boodschappen_items
  for update using (is_huishouden_lid(huishouden_id)) with check (is_huishouden_lid(huishouden_id));
drop policy if exists "boodschappen_items_delete_lid" on boodschappen_items;
create policy "boodschappen_items_delete_lid" on boodschappen_items
  for delete using (is_huishouden_lid(huishouden_id));

alter publication supabase_realtime add table ontspullen_items;
alter publication supabase_realtime add table boodschappen_items;
