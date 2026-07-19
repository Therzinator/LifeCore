-- Wat: private Storage-bucket voor foto's bij Kluslijst-klusjes.
-- Waarom: 'foto toevoegen om een klusje te verduidelijken' — privé-bucket
-- (geen publieke leestoegang zoals mindfulness-audio), pad begint met
-- user_id/ zodat RLS via storage.foldername() de eigenaar afdwingt. Metadata
-- (welke paden bij welk klusje horen) leeft in de bestaande klusje-JSON zelf
-- (lifecore_data), geen aparte tabel nodig.
-- Cross-user zichtbaarheid (voor een gedeeld huishouden) is BEWUST nog niet
-- hier — dat vereist eerst dat Kluslijst-data zelf naar huishouden-gescoopte
-- tabellen verhuist (zie 0003_huishoudens.sql-context), een latere stap.

insert into storage.buckets (id, name, public)
values ('klusje-fotos', 'klusje-fotos', false)
on conflict (id) do nothing;

drop policy if exists "klusje_fotos_eigen_lezen" on storage.objects;
create policy "klusje_fotos_eigen_lezen" on storage.objects
  for select using (bucket_id = 'klusje-fotos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "klusje_fotos_eigen_schrijven" on storage.objects;
create policy "klusje_fotos_eigen_schrijven" on storage.objects
  for insert with check (bucket_id = 'klusje-fotos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "klusje_fotos_eigen_verwijderen" on storage.objects;
create policy "klusje_fotos_eigen_verwijderen" on storage.objects
  for delete using (bucket_id = 'klusje-fotos' and (storage.foldername(name))[1] = auth.uid()::text);
