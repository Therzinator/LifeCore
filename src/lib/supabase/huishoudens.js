import { sbClient } from './client.js';

// Eén huishouden per gebruiker (v1) — 'nodig mijn partner uit voor ons
// huishouden' vraagt niet om meerdere huishoudens per account.
export async function haalMijnHuishouden() {
  const sb = sbClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('huishoudens')
    .select('id, naam, aangemaakt_door, aangemaakt_op, huishouden_leden(id, user_id, rol, lid_email, toegevoegd_op)')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Kon huishouden niet ophalen', error);
    return null;
  }
  return data;
}

// Atomaire RPC (create_huishouden, zie migratie 0008) i.p.v. twee losse
// inserts: direct na het aanmaken van het huishouden bestaat het
// lidmaatschap nog niet, dus een client-side .select() erna zou stuklopen
// op de huishoudens_select_lid-policy — de RPC omzeilt dat door de
// aangemaakte rij rechtstreeks terug te geven, niet via een herquery.
export async function maakHuishouden(email, naam) {
  const sb = sbClient();
  if (!sb) return null;

  const { data, error } = await sb.rpc('create_huishouden', { _naam: naam, _email: email });
  if (error) {
    console.error('Kon huishouden niet aanmaken', error);
    return null;
  }
  return data;
}

export async function maakUitnodiging(huishoudenId, userId, email) {
  const sb = sbClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('huishouden_uitnodigingen')
    .insert({ huishouden_id: huishoudenId, uitgenodigd_email: email, aangemaakt_door: userId })
    .select()
    .single();

  if (error) {
    console.error('Kon uitnodiging niet aanmaken', error);
    return null;
  }
  return data;
}

export async function haalUitnodigingenVoorHuishouden(huishoudenId) {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('huishouden_uitnodigingen')
    .select('id, uitgenodigd_email, status, aangemaakt_op, verlopen_op, token')
    .eq('huishouden_id', huishoudenId)
    .order('aangemaakt_op', { ascending: false });

  if (error) {
    console.error('Kon uitnodigingen niet ophalen', error);
    return [];
  }
  return data;
}

export async function haalUitnodigingViaToken(token) {
  const sb = sbClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('huishouden_uitnodigingen')
    .select('id, huishouden_id, uitgenodigd_email, status, verlopen_op, huishoudens(naam)')
    .eq('token', token)
    .maybeSingle();

  if (error) {
    console.error('Kon uitnodiging niet ophalen', error);
    return null;
  }
  return data;
}

export async function accepteerUitnodiging(uitnodiging, userId, email) {
  const sb = sbClient();
  if (!sb) return false;

  const { error: lidFout } = await sb
    .from('huishouden_leden')
    .insert({ huishouden_id: uitnodiging.huishouden_id, user_id: userId, rol: 'lid', lid_email: email });

  if (lidFout) {
    console.error('Kon uitnodiging niet accepteren', lidFout);
    return false;
  }

  const { error: statusFout } = await sb
    .from('huishouden_uitnodigingen')
    .update({ status: 'geaccepteerd' })
    .eq('id', uitnodiging.id);

  if (statusFout) {
    console.error('Kon uitnodiging niet op geaccepteerd zetten', statusFout);
  }

  return true;
}

export async function trekUitnodigingIn(id) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb.from('huishouden_uitnodigingen').update({ status: 'ingetrokken' }).eq('id', id);
  if (error) {
    console.error('Kon uitnodiging niet intrekken', error);
    return false;
  }
  return true;
}

export async function verwijderLid(id) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb.from('huishouden_leden').delete().eq('id', id);
  if (error) {
    console.error('Kon lid niet verwijderen', error);
    return false;
  }
  return true;
}
