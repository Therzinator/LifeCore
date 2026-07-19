-- Voegt een geschatte-duur-veld toe aan huishoudtaken, zodat de Agenda-
-- suggestie (zie AgendaPagina.jsx voegHuishoudTaakAlsBlokToe) een realistische
-- blokduur kan gebruiken i.p.v. een vaste 30 minuten voor elke taak. Geen
-- RLS-wijziging nodig — bestaande policies dekken de hele rij al.
alter table huishoud_taken add column if not exists geschatte_uren numeric not null default 0.5;
