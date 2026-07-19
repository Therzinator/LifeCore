-- Wat: EXECUTE op create_huishouden intrekken voor anon, zelfde reden en
-- patroon als 0007 voor de is_huishouden_*-functies.
revoke execute on function public.create_huishouden(text, text) from public;
grant execute on function public.create_huishouden(text, text) to authenticated;
