-- Wat: twee nullable maand-kolommen op tuin_taken (maand_vanaf, maand_tot,
-- 1-12) zodat een tuinklus een seizoensvenster kan krijgen naast zijn
-- frequentie — bv. "gras maaien" alleen relevant maart t/m oktober, niet
-- in de winter. Beide NULL (standaard, ook voor bestaande rijen) betekent
-- "heel jaar", dus geen migratie van bestaande data nodig.
-- Waarom: seizoensgebonden klussen laten anders het hele jaar door
-- meetellen in de week/maand-voltooiingspercentages, ook buiten het
-- seizoen waarin ze zinvol zijn.
-- RLS: geen wijziging — de kolommen vallen onder de bestaande
-- tuin_taken-policy's uit 0018 (is_huishouden_lid()), niets nieuws nodig
-- voor een kolomtoevoeging zonder eigen policy-oppervlak.

alter table tuin_taken
  add column if not exists maand_vanaf integer check (maand_vanaf between 1 and 12),
  add column if not exists maand_tot integer check (maand_tot between 1 and 12);
