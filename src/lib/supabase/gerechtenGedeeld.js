import { sbClient, uniekKanaalId } from './client.js';

export function rijNaarGerecht(rij) {
  return {
    id: rij.id,
    naam: rij.naam,
    bereiding: rij.bereiding ?? '',
    ingredienten: rij.ingredienten ?? [],
    optioneel: rij.optioneel ?? [],
    kruiden: rij.kruiden ?? [],
  };
}

export async function haalGerechten(huishoudenId) {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('gerechten')
    .select('*')
    .eq('huishouden_id', huishoudenId)
    .order('naam');

  if (error) {
    console.error('Kon gerechten niet ophalen', error);
    return [];
  }
  return data;
}

export async function maakGerecht(huishoudenId, userId, gerecht) {
  const sb = sbClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('gerechten')
    .insert({
      huishouden_id: huishoudenId,
      aangemaakt_door: userId,
      naam: gerecht.naam,
      bereiding: gerecht.bereiding ?? '',
      ingredienten: gerecht.ingredienten ?? [],
      optioneel: gerecht.optioneel ?? [],
      kruiden: gerecht.kruiden ?? [],
    })
    .select()
    .single();

  if (error) {
    console.error('Kon gerecht niet aanmaken', error);
    return null;
  }
  return data;
}

export async function verwijderGerecht(id) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb.from('gerechten').delete().eq('id', id);
  if (error) {
    console.error('Kon gerecht niet verwijderen', error);
    return false;
  }
  return true;
}

export function abonneerOpGerechten(huishoudenId, onWijziging) {
  const sb = sbClient();
  if (!sb) return () => {};

  const channel = sb
    .channel(`gerechten:${huishoudenId}:${uniekKanaalId()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'gerechten', filter: `huishouden_id=eq.${huishoudenId}` },
      onWijziging,
    )
    .subscribe();

  return () => sb.removeChannel(channel);
}
