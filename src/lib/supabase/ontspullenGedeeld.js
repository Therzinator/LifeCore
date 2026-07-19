import { sbClient, uniekKanaalId } from './client.js';

// Db-rij -> hetzelfde platte object dat de lokale blob-modus gebruikte.
export function rijNaarItem(rij) {
  return { id: rij.id, tekst: rij.tekst, methode: rij.methode, afgerond: rij.afgerond, afgerondOp: rij.afgerond_op };
}

export async function haalItems(huishoudenId) {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('ontspullen_items')
    .select('*')
    .eq('huishouden_id', huishoudenId)
    .order('aangemaakt_op');

  if (error) {
    console.error('Kon Ontspullen-items niet ophalen', error);
    return [];
  }
  return data;
}

export async function voegItemToe(huishoudenId, userId, tekst, methode) {
  const sb = sbClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('ontspullen_items')
    .insert({ huishouden_id: huishoudenId, aangemaakt_door: userId, tekst, methode })
    .select()
    .single();

  if (error) {
    console.error('Kon Ontspullen-item niet toevoegen', error);
    return null;
  }
  return data;
}

// Bulk-variant, alleen voor de migratie.
export async function voegItemsToe(rijen) {
  const sb = sbClient();
  if (!sb || rijen.length === 0) return [];

  const { data, error } = await sb.from('ontspullen_items').insert(rijen).select();
  if (error) {
    console.error('Kon Ontspullen-items niet migreren', error);
    return [];
  }
  return data;
}

export async function werkItemBij(id, patch) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb.from('ontspullen_items').update(patch).eq('id', id);
  if (error) {
    console.error('Kon Ontspullen-item niet bijwerken', error);
    return false;
  }
  return true;
}

export async function verwijderItem(id) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb.from('ontspullen_items').delete().eq('id', id);
  if (error) {
    console.error('Kon Ontspullen-item niet verwijderen', error);
    return false;
  }
  return true;
}

export function abonneerOpItems(huishoudenId, onWijziging) {
  const sb = sbClient();
  if (!sb) return () => {};

  const channel = sb
    .channel(`ontspullen_items:${huishoudenId}:${uniekKanaalId()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ontspullen_items', filter: `huishouden_id=eq.${huishoudenId}` },
      onWijziging,
    )
    .subscribe();

  return () => sb.removeChannel(channel);
}
