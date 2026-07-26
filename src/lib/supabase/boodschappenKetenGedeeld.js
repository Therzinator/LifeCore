import { sbClient, uniekKanaalId } from './client.js';

export async function haalKetens(huishoudenId) {
  const sb = sbClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('boodschappen_ketens')
    .select('naam')
    .eq('huishouden_id', huishoudenId)
    .order('aangemaakt_op');

  if (error) {
    console.error('Kon supermarktketens niet ophalen', error);
    return [];
  }
  return data.map((r) => r.naam);
}

export async function voegKetenToe(huishoudenId, naam) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb.from('boodschappen_ketens').insert({ huishouden_id: huishoudenId, naam });
  if (error) {
    console.error('Kon supermarktketen niet toevoegen', error);
    return false;
  }
  return true;
}

export async function verwijderKeten(huishoudenId, naam) {
  const sb = sbClient();
  if (!sb) return false;

  const { error } = await sb
    .from('boodschappen_ketens')
    .delete()
    .eq('huishouden_id', huishoudenId)
    .eq('naam', naam);

  if (error) {
    console.error('Kon supermarktketen niet verwijderen', error);
    return false;
  }
  return true;
}

export function abonneerOpKetens(huishoudenId, onWijziging) {
  const sb = sbClient();
  if (!sb) return () => {};

  const channel = sb
    .channel(`boodschappen_ketens:${huishoudenId}:${uniekKanaalId()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'boodschappen_ketens', filter: `huishouden_id=eq.${huishoudenId}` },
      onWijziging,
    )
    .subscribe();

  return () => sb.removeChannel(channel);
}
