-- Wat: huishoudtaken + hun afvink-log + het weekschema, gescoopt op
-- huishouden i.p.v. individuele user_id.
-- Waarom: zie 0010 (zelfde reden, fase 2 van het huishouden-fundament).
-- Het afvink-log is een aparte tabel (i.p.v. een jsonb-log-kolom): een
-- 'afvinken' wordt dan een simpele insert/delete op één rij i.p.v. een
-- JSON-object bewerken, en afgerond_door registreert meteen wélk lid iets
-- deed — nuttig voor een gedeeld huishouden, niet zinvol solo.
-- RLS: is_huishouden_lid() overal, zelfde patroon als 0010.

create table if not exists huishoud_taken (
  id uuid primary key default gen_random_uuid(),
  huishouden_id uuid not null references huishoudens(id) on delete cascade,
  tekst text not null,
  frequentie text not null check (frequentie in ('week', 'maand', 'aangepast')),
  interval_dagen integer,
  aangemaakt_op timestamptz not null default now()
);

create table if not exists huishoud_taken_log (
  id uuid primary key default gen_random_uuid(),
  taak_id uuid not null references huishoud_taken(id) on delete cascade,
  periode text not null,
  afgerond_door uuid references auth.users(id),
  afgerond_op timestamptz not null default now(),
  unique (taak_id, periode)
);

create table if not exists huishoud_weekschema (
  id uuid primary key default gen_random_uuid(),
  huishouden_id uuid not null references huishoudens(id) on delete cascade,
  week_maandag text not null,
  toewijzing jsonb not null default '{}',
  unique (huishouden_id, week_maandag)
);

alter table huishoud_taken enable row level security;
alter table huishoud_taken_log enable row level security;
alter table huishoud_weekschema enable row level security;

drop policy if exists "huishoud_taken_select_lid" on huishoud_taken;
create policy "huishoud_taken_select_lid" on huishoud_taken
  for select using (is_huishouden_lid(huishouden_id));
drop policy if exists "huishoud_taken_insert_lid" on huishoud_taken;
create policy "huishoud_taken_insert_lid" on huishoud_taken
  for insert with check (is_huishouden_lid(huishouden_id));
drop policy if exists "huishoud_taken_update_lid" on huishoud_taken;
create policy "huishoud_taken_update_lid" on huishoud_taken
  for update using (is_huishouden_lid(huishouden_id)) with check (is_huishouden_lid(huishouden_id));
drop policy if exists "huishoud_taken_delete_lid" on huishoud_taken;
create policy "huishoud_taken_delete_lid" on huishoud_taken
  for delete using (is_huishouden_lid(huishouden_id));

-- huishoud_taken_log heeft geen eigen huishouden_id-kolom — de policy gaat
-- via een subquery naar huishoud_taken (een gewone tabel-RLS-check op een
-- ANDERE tabel dan degene met de is_huishouden_lid-check zelf, dus geen
-- recursiegevaar zoals bij 0006: dat ontstond specifiek doordat twee
-- tabellen ELKAAR via EXISTS checkten binnen dezelfde embedded query).
drop policy if exists "huishoud_taken_log_select_lid" on huishoud_taken_log;
create policy "huishoud_taken_log_select_lid" on huishoud_taken_log
  for select using (
    exists (select 1 from huishoud_taken t where t.id = huishoud_taken_log.taak_id and is_huishouden_lid(t.huishouden_id))
  );
drop policy if exists "huishoud_taken_log_insert_lid" on huishoud_taken_log;
create policy "huishoud_taken_log_insert_lid" on huishoud_taken_log
  for insert with check (
    exists (select 1 from huishoud_taken t where t.id = huishoud_taken_log.taak_id and is_huishouden_lid(t.huishouden_id))
  );
drop policy if exists "huishoud_taken_log_delete_lid" on huishoud_taken_log;
create policy "huishoud_taken_log_delete_lid" on huishoud_taken_log
  for delete using (
    exists (select 1 from huishoud_taken t where t.id = huishoud_taken_log.taak_id and is_huishouden_lid(t.huishouden_id))
  );

drop policy if exists "huishoud_weekschema_select_lid" on huishoud_weekschema;
create policy "huishoud_weekschema_select_lid" on huishoud_weekschema
  for select using (is_huishouden_lid(huishouden_id));
drop policy if exists "huishoud_weekschema_insert_lid" on huishoud_weekschema;
create policy "huishoud_weekschema_insert_lid" on huishoud_weekschema
  for insert with check (is_huishouden_lid(huishouden_id));
drop policy if exists "huishoud_weekschema_update_lid" on huishoud_weekschema;
create policy "huishoud_weekschema_update_lid" on huishoud_weekschema
  for update using (is_huishouden_lid(huishouden_id)) with check (is_huishouden_lid(huishouden_id));
drop policy if exists "huishoud_weekschema_delete_lid" on huishoud_weekschema;
create policy "huishoud_weekschema_delete_lid" on huishoud_weekschema
  for delete using (is_huishouden_lid(huishouden_id));

alter publication supabase_realtime add table huishoud_taken;
alter publication supabase_realtime add table huishoud_taken_log;
alter publication supabase_realtime add table huishoud_weekschema;
