-- Wat: atomaire RPC om een huishouden + het eigenaar-lidmaatschap in één
-- keer aan te maken.
-- Waarom: de client deed dit als twee losse inserts (huishoudens, dan
-- huishouden_leden) met een .select() direct na de eerste insert. Op dat
-- moment bestaat het lidmaatschap nog niet, dus de SELECT-terugkoppeling
-- (nodig voor .select().single() na een insert) faalt onder de
-- huishoudens_select_lid-policy — Postgres/PostgREST geven dat dezelfde
-- generieke 'new row violates row-level security policy'-foutmelding als
-- een echte WITH CHECK-schending, dus dit was verwarrend te diagnosticeren.
-- Eén atomaire SECURITY DEFINER-functie omzeilt het probleem volledig: de
-- return-waarde komt rechtstreeks uit de functie, niet via een aparte,
-- RLS-onderhevige herquery.

create or replace function public.create_huishouden(_naam text, _email text)
returns huishoudens
language plpgsql
security definer
set search_path = public
as $$
declare
  _huishouden huishoudens;
begin
  insert into huishoudens (naam, aangemaakt_door)
  values (_naam, auth.uid())
  returning * into _huishouden;

  insert into huishouden_leden (huishouden_id, user_id, rol, lid_email)
  values (_huishouden.id, auth.uid(), 'eigenaar', _email);

  return _huishouden;
end;
$$;

revoke execute on function public.create_huishouden(text, text) from public;
grant execute on function public.create_huishouden(text, text) to authenticated;
