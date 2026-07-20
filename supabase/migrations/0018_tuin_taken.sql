-- Wat: tuinklussen + hun afvink-log, zelfde vorm als huishoud_taken/
-- huishoud_taken_log (zie 0011 + 0017) maar als eigen tabellenpaar i.p.v.
-- een categorie-kolom op huishoud_taken.
-- Waarom: Tuinieren is in de UI een apart tabblad naast Huishouden binnen
-- de Thuis-module (zie ThuisPagina.jsx) met zijn eigen takenlijst — geen
-- weekschema/dag-toewijzing zoals huishoud_taken heeft, dat is bewust niet
-- meegenomen omdat daar niet om gevraagd is.
-- RLS: is_huishouden_lid() overal, zelfde patroon als 0011.

create table if not exists tuin_taken (
  id uuid primary key default gen_random_uuid(),
  huishouden_id uuid not null references huishoudens(id) on delete cascade,
  tekst text not null,
  frequentie text not null check (frequentie in ('week', 'maand', 'aangepast')),
  interval_dagen integer,
  geschatte_uren numeric not null default 0.5,
  aangemaakt_op timestamptz not null default now()
);

create table if not exists tuin_taken_log (
  id uuid primary key default gen_random_uuid(),
  taak_id uuid not null references tuin_taken(id) on delete cascade,
  periode text not null,
  afgerond_door uuid references auth.users(id),
  afgerond_op timestamptz not null default now(),
  unique (taak_id, periode)
);

alter table tuin_taken enable row level security;
alter table tuin_taken_log enable row level security;

drop policy if exists "tuin_taken_select_lid" on tuin_taken;
create policy "tuin_taken_select_lid" on tuin_taken
  for select using (is_huishouden_lid(huishouden_id));
drop policy if exists "tuin_taken_insert_lid" on tuin_taken;
create policy "tuin_taken_insert_lid" on tuin_taken
  for insert with check (is_huishouden_lid(huishouden_id));
drop policy if exists "tuin_taken_update_lid" on tuin_taken;
create policy "tuin_taken_update_lid" on tuin_taken
  for update using (is_huishouden_lid(huishouden_id)) with check (is_huishouden_lid(huishouden_id));
drop policy if exists "tuin_taken_delete_lid" on tuin_taken;
create policy "tuin_taken_delete_lid" on tuin_taken
  for delete using (is_huishouden_lid(huishouden_id));

-- tuin_taken_log heeft geen eigen huishouden_id-kolom — zelfde subquery-
-- patroon naar de ouder-tabel als huishoud_taken_log in 0011.
drop policy if exists "tuin_taken_log_select_lid" on tuin_taken_log;
create policy "tuin_taken_log_select_lid" on tuin_taken_log
  for select using (
    exists (select 1 from tuin_taken t where t.id = tuin_taken_log.taak_id and is_huishouden_lid(t.huishouden_id))
  );
drop policy if exists "tuin_taken_log_insert_lid" on tuin_taken_log;
create policy "tuin_taken_log_insert_lid" on tuin_taken_log
  for insert with check (
    exists (select 1 from tuin_taken t where t.id = tuin_taken_log.taak_id and is_huishouden_lid(t.huishouden_id))
  );
drop policy if exists "tuin_taken_log_delete_lid" on tuin_taken_log;
create policy "tuin_taken_log_delete_lid" on tuin_taken_log
  for delete using (
    exists (select 1 from tuin_taken t where t.id = tuin_taken_log.taak_id and is_huishouden_lid(t.huishouden_id))
  );

alter publication supabase_realtime add table tuin_taken;
alter publication supabase_realtime add table tuin_taken_log;
