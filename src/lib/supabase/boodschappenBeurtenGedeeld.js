import { sbClient, uniekKanaalId } from './client.js';
import { datumKey } from '../../utils/datum.js';

export async function haalBeurten(huishoudenId) {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('boodschappen_beurten')
    .select('id, datum, boodschappen_beurt_items(tekst, aantal)')
    .eq('huishouden_id', huishoudenId)
    .order('datum');

  if (error) {
    console.error('Kon boodschappen-beurten niet ophalen', error);
    return [];
  }
  return data.map((b) => ({ id: b.id, datum: b.datum, items: b.boodschappen_beurt_items ?? [] }));
}

// Zoek-of-maak de beurt van vandaag (huishouden-breed, één per dag dankzij
// de unique-constraint op (huishouden_id, datum)) en voeg er een item-
// snapshot aan toe — aangeroepen vanuit toggleGekocht in useBoodschappen.js.
export async function logBoodschappenBeurt(huishoudenId, userId, tekst, aantal) {
  const sb = sbClient();
  if (!sb) return false;

  const { data: beurt, error: upsertFout } = await sb
    .from('boodschappen_beurten')
    .upsert(
      { huishouden_id: huishoudenId, datum: datumKey(), aangemaakt_door: userId },
      { onConflict: 'huishouden_id,datum' },
    )
    .select('id')
    .single();

  if (upsertFout) {
    console.error('Kon boodschappen-beurt niet aanmaken', upsertFout);
    return false;
  }

  const { error } = await sb.from('boodschappen_beurt_items').insert({ beurt_id: beurt.id, tekst, aantal });
  if (error) {
    console.error('Kon boodschappen-beurt-item niet loggen', error);
    return false;
  }
  return true;
}

export function abonneerOpBeurten(huishoudenId, onWijziging) {
  const sb = sbClient();
  if (!sb) return () => {};

  const channel = sb
    .channel(`boodschappen_beurten:${huishoudenId}:${uniekKanaalId()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'boodschappen_beurten', filter: `huishouden_id=eq.${huishoudenId}` },
      onWijziging,
    )
    // boodschappen_beurt_items heeft geen eigen huishouden_id-kolom om op te
    // filteren — RLS (via een subquery naar boodschappen_beurten, zie
    // migratie 0014) blijft ook voor Realtime-broadcast gelden.
    .on('postgres_changes', { event: '*', schema: 'public', table: 'boodschappen_beurt_items' }, onWijziging)
    .subscribe();

  return () => sb.removeChannel(channel);
}
