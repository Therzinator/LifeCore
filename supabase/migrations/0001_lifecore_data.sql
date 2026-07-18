-- Wat: generieke key-value synctabel voor alle LifeCore-modules.
-- Waarom: elke module slaat lokaal al een JSON-record op onder een eigen
-- sleutel (dag_*, waardenprofiel, welzijn_mbi, welzijn_req, training_profiel,
-- training_geschiedenis). In plaats van per module een eigen tabel/migratie
-- te onderhouden voor wat in essentie hetzelfde key-value-patroon is,
-- gebruiken we één generieke tabel — nieuwe lokale sleutels (toekomstige
-- modules) hebben dan geen nieuwe migratie nodig.
-- RLS: fail-closed, uitsluitend de eigenaar zelf (auth.uid() = user_id).

create table if not exists lifecore_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sleutel text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, sleutel)
);

alter table lifecore_data enable row level security;

drop policy if exists "lifecore_data_select_eigen" on lifecore_data;
create policy "lifecore_data_select_eigen" on lifecore_data
  for select using (auth.uid() = user_id);

drop policy if exists "lifecore_data_insert_eigen" on lifecore_data;
create policy "lifecore_data_insert_eigen" on lifecore_data
  for insert with check (auth.uid() = user_id);

drop policy if exists "lifecore_data_update_eigen" on lifecore_data;
create policy "lifecore_data_update_eigen" on lifecore_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "lifecore_data_delete_eigen" on lifecore_data;
create policy "lifecore_data_delete_eigen" on lifecore_data
  for delete using (auth.uid() = user_id);
