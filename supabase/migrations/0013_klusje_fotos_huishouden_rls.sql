-- Wat: klusje-fotos RLS uitbreiden zodat huishoudleden elkaars foto's ook
-- kunnen lezen/beheren, niet alleen de eigen upload.
-- Waarom: nu Kluslijst-projecten zelf gedeeld zijn (zie 0010), moet een foto
-- die bij een GEDEELD project hoort ook voor het andere huishoudlid
-- zichtbaar zijn. De client (klusjeFotos.js) uploadt zo'n foto voortaan
-- onder het huishouden_id als eerste pad-segment i.p.v. de eigen user_id
-- (zie FotosLijst.jsx's scopeId) — deze policy staat toegang toe zodra dat
-- eerste segment ofwel je eigen user_id is (solo-projecten, ongewijzigd)
-- ofwel een huishouden waar je lid van bent (is_huishouden_lid, zie 0006).
-- Bestaande solo-foto's (pad = user_id/...) blijven werken zoals voorheen.

drop policy if exists "klusje_fotos_eigen_lezen" on storage.objects;
create policy "klusje_fotos_eigen_lezen" on storage.objects
  for select using (
    bucket_id = 'klusje-fotos' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or is_huishouden_lid(((storage.foldername(name))[1])::uuid)
    )
  );

drop policy if exists "klusje_fotos_eigen_schrijven" on storage.objects;
create policy "klusje_fotos_eigen_schrijven" on storage.objects
  for insert with check (
    bucket_id = 'klusje-fotos' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or is_huishouden_lid(((storage.foldername(name))[1])::uuid)
    )
  );

drop policy if exists "klusje_fotos_eigen_verwijderen" on storage.objects;
create policy "klusje_fotos_eigen_verwijderen" on storage.objects
  for delete using (
    bucket_id = 'klusje-fotos' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or is_huishouden_lid(((storage.foldername(name))[1])::uuid)
    )
  );
