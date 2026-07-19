-- Wat: EXECUTE op de nieuwe is_huishouden_lid/is_huishouden_eigenaar-
-- functies intrekken voor anon.
-- Waarom: get_advisors meldt dat deze SECURITY DEFINER-functies (nodig om
-- de RLS-recursie in 0006 op te lossen) standaard ook rechtstreeks via
-- PostgREST-RPC aanroepbaar zijn. Ze lekken geen data (alleen een boolean
-- over lidmaatschap) maar horen niet als publieke RPC-call bedoeld te zijn
-- — alleen als RLS-hulpfunctie. 'authenticated' behoudt EXECUTE: policy's
-- draaien onder die rol en hebben de aanroeprechten nodig om te evalueren.

-- PostgreSQL grant EXECUTE aan PUBLIC by default bij het aanmaken van een
-- functie — 'anon' krijgt toegang via zijn lidmaatschap van PUBLIC, dus
-- alleen van 'anon' intrekken is een no-op zolang PUBLIC nog toegang heeft.
-- Intrekken van PUBLIC + expliciet teruggeven aan 'authenticated' (nodig
-- voor de RLS-policy's die deze functie aanroepen) is de juiste manier.
revoke execute on function public.is_huishouden_lid(uuid) from public;
revoke execute on function public.is_huishouden_eigenaar(uuid) from public;
grant execute on function public.is_huishouden_lid(uuid) to authenticated;
grant execute on function public.is_huishouden_eigenaar(uuid) to authenticated;
