-- Wat: korte kookinstructie per gerecht — een los tekstveld, getoond als
-- ingeklapt gedeelte bovenaan het gerecht (zie Gerechten.jsx).
-- Waarom: de curated bibliotheek en eigen gerechten hadden tot nu toe
-- alleen ingrediënten-categorieën, geen bereidingswijze.

alter table gerechten add column if not exists bereiding text not null default '';
