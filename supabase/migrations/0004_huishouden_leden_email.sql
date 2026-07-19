-- Wat: e-mailadres denormaliseren op huishouden_leden.
-- Waarom: de client (anon key) mag auth.users niet rechtstreeks uitlezen,
-- dus zonder dit zou een ledenlijst alleen kale user_id's kunnen tonen.
-- De client vult dit zelf bij het inserten (eigen sessie-e-mailadres, zie
-- src/lib/supabase/huishoudens.js) — geen RLS-impact, puur weergave.

alter table huishouden_leden add column if not exists lid_email text;
