-- Wat: fix 'infinite recursion detected in policy for relation
-- huishouden_leden' (Postgres 42P17).
-- Waarom: huishoudens_select_lid deed een EXISTS-subquery op
-- huishouden_leden, en huishouden_leden_select_lid deed een EXISTS-subquery
-- op zichzelf. Elk apart werkt dat (de gebruikelijke Supabase-'team
-- members'-pattern), maar zodra PostgREST een EMBEDDED select doet
-- (huishoudens?select=...,huishouden_leden(...)) evalueert de planner beide
-- policy's binnen dezelfde gejoinde query-plan, wat hier tot echte
-- wederzijdse recursie leidt.
-- Fix: de standaard Supabase-oplossing — een SECURITY DEFINER-functie die
-- lidmaatschap checkt. Zo'n functie draait buiten RLS om (bypassed RLS op
-- zijn eigen interne query), dus de recursie stopt daar.

create or replace function public.is_huishouden_lid(_huishouden_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from huishouden_leden
    where huishouden_id = _huishouden_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_huishouden_eigenaar(_huishouden_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from huishouden_leden
    where huishouden_id = _huishouden_id and user_id = auth.uid() and rol = 'eigenaar'
  );
$$;

-- huishoudens
drop policy if exists "huishoudens_select_lid" on huishoudens;
create policy "huishoudens_select_lid" on huishoudens
  for select using (is_huishouden_lid(id));

drop policy if exists "huishoudens_update_eigenaar" on huishoudens;
create policy "huishoudens_update_eigenaar" on huishoudens
  for update using (is_huishouden_eigenaar(id));

drop policy if exists "huishoudens_delete_eigenaar" on huishoudens;
create policy "huishoudens_delete_eigenaar" on huishoudens
  for delete using (is_huishouden_eigenaar(id));

-- huishouden_leden
drop policy if exists "huishouden_leden_select_lid" on huishouden_leden;
create policy "huishouden_leden_select_lid" on huishouden_leden
  for select using (is_huishouden_lid(huishouden_id));

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
    or is_huishouden_eigenaar(huishouden_id)
  );

drop policy if exists "huishouden_leden_delete_zelf_of_eigenaar" on huishouden_leden;
create policy "huishouden_leden_delete_zelf_of_eigenaar" on huishouden_leden
  for delete using (
    user_id = auth.uid() or is_huishouden_eigenaar(huishouden_id)
  );

-- huishouden_uitnodigingen
drop policy if exists "huishouden_uitnodigingen_select_lid_of_genodigde" on huishouden_uitnodigingen;
create policy "huishouden_uitnodigingen_select_lid_of_genodigde" on huishouden_uitnodigingen
  for select using (
    is_huishouden_lid(huishouden_id) or lower(uitgenodigd_email) = lower(auth.jwt() ->> 'email')
  );

drop policy if exists "huishouden_uitnodigingen_insert_lid" on huishouden_uitnodigingen;
create policy "huishouden_uitnodigingen_insert_lid" on huishouden_uitnodigingen
  for insert with check (
    aangemaakt_door = auth.uid() and is_huishouden_lid(huishouden_id)
  );

drop policy if exists "huishouden_uitnodigingen_update_lid_of_genodigde" on huishouden_uitnodigingen;
create policy "huishouden_uitnodigingen_update_lid_of_genodigde" on huishouden_uitnodigingen
  for update using (
    is_huishouden_lid(huishouden_id) or lower(uitgenodigd_email) = lower(auth.jwt() ->> 'email')
  );
